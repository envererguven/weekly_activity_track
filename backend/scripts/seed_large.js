const db = require('../src/db');

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CATEGORIES = [
    'Proje ID (Zorunlu)', 'Talep ID (Zorunlu)', 'Defect ID (Zorunlu)',
    'Güvenlik Açığı', 'Diğer'
];

const STATUSES = ['Tamamlandı', 'Devam Eden', 'Yeni Konu'];
const CRITICALITIES = [
    'Çok Kritik - Hemen aksiyon alınmalı',
    'Kritik - Mutlaka Aksiyon alınmalı',
    'Normal - İş planımızda olmalı',
    'Standart-Rutin işlerimiz eforumuzu çok almamalı.',
    'Hiç Kritik Değil - İş planımızda bile yok'
];

const SUBJECTS = [
    'API Geliştirme', 'Unit Test Yazımı', 'Bug Fix', 'Müşteri Toplantısı',
    'Dökümantasyon', 'Deploy Süreci', 'Code Review', 'DB Optimizasyonu'
];

const generateActivities = async () => {
    try {
        console.log('Fetching users and products...');
        const users = (await db.query('SELECT id FROM users')).rows;
        const products = (await db.query('SELECT id FROM products')).rows;

        if (users.length === 0 || products.length === 0) {
            console.error('Please run initial seed first (need users and products).');
            process.exit(1);
        }

        const activities = [];
        const years = [2024, 2025];

        for (const year of years) {
            console.log(`Generating data for ${year}...`);
            for (let i = 0; i < 50; i++) {
                const weekNum = getRandomInt(1, 52);
                const weekStr = `${year}-W${weekNum.toString().padStart(2, '0')}`;

                const user = getRandomItem(users).id;
                const product = getRandomItem(products).id;
                const category = getRandomItem(CATEGORIES);
                const status = getRandomItem(STATUSES);
                const criticality = getRandomItem(CRITICALITIES);
                const subject = `${getRandomItem(SUBJECTS)} - ${i}`;

                const weeklyData = {
                    [weekStr]: {
                        progress: `Haftalık ilerleme raporu satırı ${i}`,
                        effort: getRandomInt(1, 40)
                    }
                };

                activities.push({
                    user_id: user,
                    product_id: product,
                    category,
                    status,
                    ref_id: category.includes('ID') ? `REF-${year}-${i}` : '',
                    criticality,
                    subject,
                    description: 'Otomatik oluşturulan test kaydı.',
                    weekly_data: JSON.stringify(weeklyData),
                    created_at: new Date(`${year}-01-01`), // simplified date
                    updated_at: new Date()
                });
            }
        }

        console.log(`Inserting ${activities.length} activities...`);

        for (const act of activities) {
            await db.query(
                `INSERT INTO activities 
                 (user_id, product_id, category, status, ref_id, criticality, subject, description, weekly_data, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    act.user_id, act.product_id, act.category, act.status,
                    act.ref_id, act.criticality, act.subject, act.description,
                    act.weekly_data, act.created_at, act.updated_at
                ]
            );
        }

        console.log('Done!');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

generateActivities();
