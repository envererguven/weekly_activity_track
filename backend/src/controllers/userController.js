const db = require('../db');

exports.getUsers = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM users ORDER BY full_name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { full_name } = req.body;
        const { rows } = await db.query('INSERT INTO users (full_name) VALUES ($1) RETURNING *', [full_name]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, is_active } = req.body;
        const { rows } = await db.query(
            'UPDATE users SET full_name = COALESCE($1, full_name), is_active = COALESCE($2, is_active) WHERE id = $3 RETURNING *',
            [full_name, is_active, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        const { rows } = await db.query('UPDATE users SET is_active = false WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deactivated successfully', user: rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
