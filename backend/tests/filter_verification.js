const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api';

async function verifyFilters() {
    try {
        console.log('Starting Filter Verification...');

        // 1. Get List of Users and Products
        const users = await axios.get(`${API_URL}/users`);
        const products = await axios.get(`${API_URL}/products`);

        if (users.data.length === 0 || products.data.length === 0) {
            console.error('No users or products found. Seed data might be missing.');
            process.exit(1);
        }

        const testUser = users.data[0];
        const testProduct = products.data[0];

        console.log(`Testing filtering for User: ${testUser.full_name} (ID: ${testUser.id})`);
        console.log(`Testing filtering for Product: ${testProduct.name} (ID: ${testProduct.id})`);

        // 2. Test User Filter
        const userRes = await axios.get(`${API_URL}/activities`, {
            params: { userId: testUser.id, limit: 100 }
        });

        const userActivities = userRes.data.data;
        console.log(`Found ${userActivities.length} activities for user.`);

        const invalidUserActivities = userActivities.filter(a => a.user_id !== testUser.id);
        if (invalidUserActivities.length > 0) {
            console.error('FAILED: User filter returned activities for other users:', invalidUserActivities);
            process.exit(1);
        } else {
            console.log('PASSED: User filter.');
        }

        // 3. Test Product Filter
        const productRes = await axios.get(`${API_URL}/activities`, {
            params: { productId: testProduct.id, limit: 100 }
        });

        const productActivities = productRes.data.data;
        console.log(`Found ${productActivities.length} activities for product.`);

        const invalidProductActivities = productActivities.filter(a => a.product_id !== testProduct.id);
        if (invalidProductActivities.length > 0) {
            console.error('FAILED: Product filter returned activities for other products:', invalidProductActivities);
            process.exit(1);
        } else {
            console.log('PASSED: Product filter.');
        }

        // 4. Test Week Filter (find a week that has data first)
        // Let's use one of the activities we found to get a valid week
        if (userActivities.length > 0) {
            const sampleActivity = userActivities[0];
            // dependent on seed data structure, let's assume one key in weekly_data
            const weekKeys = Object.keys(sampleActivity.weekly_data || {});
            if (weekKeys.length > 0) {
                const testWeek = weekKeys[0];
                console.log(`Testing filtering for Week: ${testWeek}`);

                const weekRes = await axios.get(`${API_URL}/activities`, {
                    params: { week: testWeek, limit: 100 }
                });

                const weekActivities = weekRes.data.data;
                console.log(`Found ${weekActivities.length} activities for week.`);

                // Verify each returned activity has that week key in its weekly_data
                const invalidWeekActivities = weekActivities.filter(a => !a.weekly_data || !a.weekly_data[testWeek]);
                if (invalidWeekActivities.length > 0) {
                    console.error('FAILED: Week filter returned activities without data for that week:', invalidWeekActivities[0]);
                    process.exit(1);
                } else {
                    console.log('PASSED: Week filter.');
                }
            } else {
                console.log('SKIPPED: Week filter (no weekly data found on sample activity).');
            }
        }

        console.log('ALL TESTS PASSED.');
        process.exit(0);

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

verifyFilters();
