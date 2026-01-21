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

        // 1. Get Users
        const usersRes = await pool.query('SELECT id FROM users');
        const users = usersRes.rows;
        if (users.length === 0) {
            console.error('No users found. Run init.sql first.');
            process.exit(1);
        }

        // 2. Generate 100 Activities
        for (let i = 0; i < 100; i++) {
            const user = getRandom(users);
            const productName = getRandom(PRODUCTS);
            const category = getRandom(CATEGORY_OPTIONS);
            const status = getRandom(STATUS_OPTIONS);
            const criticality = getRandom(CRITICALITY_OPTIONS);
            const subject = getRandom(SUBJECTS) + ` - ${i + 1}`; // Ensure variety
            const description = `This is a sample description for activity ${i + 1}. Generated automatically.`;

            // Resolve Product ID
            let productId;
            const productRes = await pool.query('SELECT id FROM products WHERE name = $1', [productName]);
            if (productRes.rows.length > 0) {
                productId = productRes.rows[0].id;
            } else {
                const newProduct = await pool.query('INSERT INTO products (name) VALUES ($1) RETURNING id', [productName]);
                productId = newProduct.rows[0].id;
            }

            // Prepare Weekly Data (Mocking last 4 weeks)
            const weeklyData = {};
            const recentWeeks = ['2026-W01', '2026-W02', '2026-W03', '2026-W04'];
            // Fill 1 or 2 weeks randomly
            const weeksToFill = recentWeeks.filter(() => Math.random() > 0.5);
            if (weeksToFill.length === 0) weeksToFill.push('2026-W04');

            weeksToFill.forEach(week => {
                weeklyData[week] = {
                    progress: 'Working on it...',
                    effort: Math.floor(Math.random() * 8) + 1
                };
            });

            // Ref ID if needed
            const refId = category.includes('(Zorunlu)') ? `REF-${1000 + i}` : null;

            await pool.query(
                `INSERT INTO activities 
                (user_id, product_id, category, status, ref_id, criticality, subject, description, weekly_data, created_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - (random() * interval '30 days'))`,
                [user.id, productId, category, status, refId, criticality, subject, description, weeklyData]
            );
        }

        console.log('Successfully seeded 100 activities.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seed();
