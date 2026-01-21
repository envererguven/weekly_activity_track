const db = require('../db');

exports.getAllActivities = async (req, res) => {
    try {
        const { week, page = 1, limit = 10, sort = 'updated_at' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT a.*, u.full_name as user_name, p.name as product_name 
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN products p ON a.product_id = p.id
    `;
        const params = [];

        // Filter by week logic is tricky because week data is in JSONB or implicit in 'updated_at' 
        // BUT requirements say "Dynamic columns for each week".
        // For listing, we usually list the *Activity* (Task) itself.
        // However, if we filter by week, maybe we only show activities active in that week?
        // For MVP, simple listing:

        // Simplification: We just list all tasks
        query += ` ORDER BY a.${sort} DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await db.query(query, params);

        // Get total count
        const countResult = await db.query('SELECT COUNT(*) FROM activities');

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
