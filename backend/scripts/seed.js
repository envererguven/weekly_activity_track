const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/activity_db',
});

const CATEGORY_OPTIONS = [
    'Proje ID (Zorunlu)', 'Talep ID (Zorunlu)', 'Defect ID (Zorunlu)',
    'Güvenlik Açığı', 'Diğer'
];

const STATUS_OPTIONS = ['Tamamlandı', 'Devam Eden', 'Yeni Konu'];
const CRITICALITY_OPTIONS = [
    'Çok Kritik - Hemen aksiyon alınmalı', 'Kritik - Mutlaka Aksiyon alınmalı',
    'Normal - İş planımızda olmalı', 'Standart-Rutin işlerimiz eforumuzu çok almamalı.',
    'Hiç Kritik Değil - İş planımızda bile yok'
];

const PRODUCTS = ['PIMS', 'DDP', 'CRM', 'Billing', 'Mediation', 'Otoyol', 'E-Devlet', 'Reporting', 'Gateway'];

const SUBJECTS = [
    'API Optimizasyonu', 'Login Hatası Düzeltme', 'Yeni Rapor Ekranı',
    'Güvenlik Taraması Sonuçları', 'Veritabanı Bakımı', 'CI/CD Pipeline İyileştirme',
    'Müşteri Talebi - Filtreleme', 'Excel Export Hatası', 'Performans Testleri',
    'Redis Cache Entegrasyonu', 'Loglama Altyapısı', 'Bildirim Sistemi',
    'Kullanıcı Yetkilendirme', 'Mobil Uygulama API', 'Fatura Entegrasyonu'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
    try {
        console.log('Seeding data...');

        // 0. Clear existing data
        await pool.query('TRUNCATE TABLE activities RESTART IDENTITY CASCADE');
        console.log('Cleared existing activities.');

        // 1. Get Users
        const usersRes = await pool.query('SELECT id FROM users');
        const users = usersRes.rows;
        if (users.length === 0) {
            console.error('No users found. Run init.sql first.');
            process.exit(1);
        }

        // 2. Generate Activities for 2024, 2025, and 2026
        const years = [2024, 2025, 2026];

        for (const year of years) {
            console.log(`Generating data for ${year}...`);
            const count = year === 2026 ? 20 : 50; // 50 for past years, 20 for current year

            for (let i = 0; i < count; i++) {
                const user = getRandom(users);
                const productName = getRandom(PRODUCTS);
                const category = getRandom(CATEGORY_OPTIONS);
                const status = getRandom(STATUS_OPTIONS);
                const criticality = getRandom(CRITICALITY_OPTIONS);
                const subject = `${year} - ${getRandom(SUBJECTS)} - ${i + 1}`;
                const description = `Auto-generated activity for ${year}. Item ${i + 1}.`;

                // Resolve Product ID
                let productId;
                const productRes = await pool.query('SELECT id FROM products WHERE name = $1', [productName]);
                if (productRes.rows.length > 0) {
                    productId = productRes.rows[0].id;
                } else {
                    const newProduct = await pool.query('INSERT INTO products (name) VALUES ($1) RETURNING id', [productName]);
                    productId = newProduct.rows[0].id;
                }

                // Prepare Weekly Data
                const weeklyData = {};

                // For 2026, ensure we have some "Current Week" (e.g., W04) data
                let weekKey;
                if (year === 2026) {
                    // Random week between 1 and 4 for 2026
                    const simpleWeek = Math.floor(Math.random() * 4) + 1;
                    weekKey = `2026-W${simpleWeek.toString().padStart(2, '0')}`;
                } else {
                    // Random week 1-52 for other years
                    const weekNum = Math.floor(Math.random() * 52) + 1;
                    weekKey = `${year}-W${weekNum.toString().padStart(2, '0')}`;
                }

                weeklyData[weekKey] = {
                    progress: `Progress report for ${weekKey}`,
                    effort: Math.floor(Math.random() * 8) + 1
                };

                // Ref ID
                const refId = category.includes('(Zorunlu)') ? `REF-${year}-${1000 + i}` : null;

                // Random date within that year
                const createdAt = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

                await pool.query(
                    `INSERT INTO activities 
                    (user_id, product_id, category, status, ref_id, criticality, subject, description, weekly_data, created_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [user.id, productId, category, status, refId, criticality, subject, description, weeklyData, createdAt]
                );
            }
        }

        console.log('Successfully seeded activities.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seed();
