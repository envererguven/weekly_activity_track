const db = require('../db');

exports.getAllActivities = async (req, res) => {
    try {
        const { week, page = 1, limit = 10, sort = 'updated_at', order = 'DESC', userId, productId } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT a.*, u.full_name as user_name, p.name as product_name 
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN products p ON a.product_id = p.id
      WHERE 1=1
    `;
        const params = [];
        let paramIdx = 1;

        if (userId) {
            query += ` AND a.user_id = $${paramIdx++}`;
            params.push(userId);
        }

        if (productId) {
            query += ` AND a.product_id = $${paramIdx++}`;
            params.push(productId);
        }

        if (week) {
            // Partial Match using EXISTS subquery on keys
            // Logic: Is there ANY key in weekly_data that matches the pattern?
            query += ` AND EXISTS (
                SELECT 1 FROM jsonb_object_keys(a.weekly_data) k 
                WHERE k ILIKE $${paramIdx++}
            )`;
            params.push(`%${week}%`);
        }

        // Sorting Logic
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        let sortColumn = 'a.updated_at';

        switch (sort) {
            case 'user': sortColumn = 'user_name'; break;
            case 'product': sortColumn = 'product_name'; break;
            case 'category': sortColumn = 'a.category'; break;
            case 'status': sortColumn = 'a.status'; break;
            case 'subject': sortColumn = 'a.subject'; break;
            case 'criticality': sortColumn = 'a.criticality'; break;
            case 'effort':
                // Extract effort from JSONB. Logic: 
                // If filtering by week, use that week's effort.
                // If not, use '0' or maybe sum? For listing, let's use the first key's effort or 0 if week not specified.
                // But typically UI passes a week.
                // Cast to numeric for correct sorting.
                if (week) {
                    sortColumn = `(a.weekly_data->'${week}'->>'effort')::numeric`;
                } else {
                    sortColumn = 'a.updated_at'; // Fallback if no week context for effort sort
                }
                break;
            default: sortColumn = 'a.updated_at';
        }

        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
        params.push(limit, offset);

        const { rows } = await db.query(query, params);

        // Get total count with same filters
        let countQuery = 'SELECT COUNT(*) FROM activities a WHERE 1=1';
        const countParams = [];
        let countParamIdx = 1;

        if (userId) {
            countQuery += ` AND a.user_id = $${countParamIdx++}`;
            countParams.push(userId);
        }
        if (productId) {
            countQuery += ` AND a.product_id = $${countParamIdx++}`;
            countParams.push(productId);
        }
        if (week) {
            countQuery += ` AND EXISTS (
                SELECT 1 FROM jsonb_object_keys(a.weekly_data) k 
                WHERE k ILIKE $${countParamIdx++}
            )`;
            countParams.push(`%${week}%`);
        }

        const countResult = await db.query(countQuery, countParams);

        res.json({
            data: rows,
            meta: {
                total: parseInt(countResult.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createActivity = async (req, res) => {
    try {
        const {
            category, status, ref_id, criticality, subject, description,
            user_id, product_name, week, progress, effort
        } = req.body;

        // Resolve Product ID (find or create)
        let product_id;
        if (product_name) {
            let productRes = await db.query('SELECT id FROM products WHERE name = $1', [product_name]);
            if (productRes.rows.length > 0) {
                product_id = productRes.rows[0].id;
            } else {
                const newProduct = await db.query('INSERT INTO products (name) VALUES ($1) RETURNING id', [product_name]);
                product_id = newProduct.rows[0].id;
            }
        }

        // Prepare Weekly Data
        const weeklyData = {};
        if (week) {
            weeklyData[week] = { progress, effort };
        }

        const result = await db.query(
            `INSERT INTO activities 
       (user_id, product_id, category, status, ref_id, criticality, subject, description, weekly_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
            [user_id, product_id, category, status, ref_id, criticality, subject, description, weeklyData]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { week, status, progress, effort, ...otherFields } = req.body;

        // First get existing
        const existing = await db.query('SELECT * FROM activities WHERE id = $1', [id]);
        if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const activity = existing.rows[0];
        let weeklyData = activity.weekly_data || {};

        if (week) {
            weeklyData[week] = {
                progress: progress !== undefined ? progress : (weeklyData[week]?.progress || ''),
                effort: effort !== undefined ? effort : (weeklyData[week]?.effort || 0)
            };
        }

        // Update basic fields + weekly_data
        // Note: For a real app we'd construct dynamic update query. 
        // MVP: assuming status is always passed or handled carefully.

        // Simplified dynamic update:
        const fields = [];
        const values = [];
        let idx = 1;

        if (status) { fields.push(`status = $${idx++}`); values.push(status); }
        if (otherFields.category) { fields.push(`category = $${idx++}`); values.push(otherFields.category); }

        fields.push(`weekly_data = $${idx++}`); values.push(weeklyData);
        fields.push(`updated_at = NOW()`);

        values.push(id);
        const query = `UPDATE activities SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

        const result = await db.query(query, values);
        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getLatestWeek = async (req, res) => {
    try {
        const query = `
            SELECT key as week 
            FROM activities, jsonb_each(weekly_data) 
            ORDER BY key DESC 
            LIMIT 1
        `;
        const result = await db.query(query);

        if (result.rows.length > 0) {
            res.json({ week: result.rows[0].week });
        } else {
            res.json({ week: null });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching latest week' });
    }
};
