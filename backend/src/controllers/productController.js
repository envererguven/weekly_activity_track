const db = require('../db');

exports.getProducts = async (req, res) => {
    try {
        const { q, all } = req.query;
        let query = 'SELECT * FROM products';
        const params = [];
        let whereClauses = [];

        if (!all) {
            whereClauses.push('is_active = true');
        }

        if (q) {
            whereClauses.push(`name ILIKE $${params.length + 1}`);
            params.push(`%${q}%`);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY name LIMIT 50';
        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description } = req.body;
        const { rows } = await db.query(
            'INSERT INTO products (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Product name already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, is_active } = req.body;
        const { rows } = await db.query(
            'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active) WHERE id = $4 RETURNING *',
            [name, description, is_active, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        const { rows } = await db.query('UPDATE products SET is_active = false WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deactivated successfully', product: rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
