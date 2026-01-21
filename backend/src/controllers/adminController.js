const db = require('../db');
const xlsx = require('xlsx');

exports.bulkImport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`Processing ${data.length} records from upload...`);

        let successCount = 0;
        let errors = [];

        // Pre-fetch all users and products for matching
        const usersRes = await db.query('SELECT * FROM users');
        const productsRes = await db.query('SELECT * FROM products');

        const usersMap = new Map(usersRes.rows.map(u => [u.full_name.toLowerCase(), u.id]));
        const productsMap = new Map(productsRes.rows.map(p => [p.name.toLowerCase(), p.id]));

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Expected Columns: Kategori, Konu, Ürün, Sorumlu, Statü, Kritiklik, Efor, Haftalık Durum, Hafta(Optional)
                // Normalize keys just in case

                const category = row['Kategori'];
                const subject = row['Konu'];
                const productName = row['Ürün'];
                const userName = row['Sorumlu'];
                const status = row['Statü'];
                const criticality = row['Kritiklik'];
                const effort = row['Efor'] || 0;
                const progress = row['Haftalık Durum'];
                // Default to current week or provided week
                let week = row['Hafta'];

                if (!week) {
                    // Calculate current week if not provided
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
                    const week1 = new Date(d.getFullYear(), 0, 4);
                    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
                    week = `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
                }

                if (!userName || !productName || !subject) {
                    throw new Error(`Row ${i + 1}: Missing required fields`);
                }

                // Resolve User
                let userId = usersMap.get(userName.toLowerCase());
                if (!userId) {
                    // Create User if not exists? For now, maybe just skip or default? 
                    // Let's create strict logic: Must match existing user or error.
                    // Or auto-create for ease of use? Let's auto-create.
                    const newUser = await db.query('INSERT INTO users (username, full_name, role) VALUES ($1, $1, $2) RETURNING id', [userName, 'user']);
                    userId = newUser.rows[0].id;
                    usersMap.set(userName.toLowerCase(), userId);
                }

                // Resolve Product
                let productId = productsMap.get(productName.toLowerCase());
                if (!productId) {
                    const newProduct = await db.query('INSERT INTO products (name) VALUES ($1) RETURNING id', [productName]);
                    productId = newProduct.rows[0].id;
                    productsMap.set(productName.toLowerCase(), productId);
                }

                // Check for existing activity to merge? Or just insert new?
                // Requirement says "Insert new records directly".

                const weeklyData = {
                    [week]: {
                        progress: progress,
                        effort: effort
                    }
                };

                await db.query(
                    `INSERT INTO activities 
                    (user_id, product_id, category, status, criticality, subject, description, weekly_data) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `,
                    [userId, productId, category, status, criticality, subject, 'Imported via Excel', weeklyData]
                );

                successCount++;

            } catch (err) {
                console.error(err);
                errors.push(`Row ${i + 1}: ${err.message}`);
            }
        }

        res.json({
            message: 'Import completed',
            successCount,
            totalProcessed: data.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during import' });
    }
};
