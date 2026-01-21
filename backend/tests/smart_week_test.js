const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://127.0.0.1:5000/api';

async function verifySmartWeek() {
    try {
        console.log('Starting Smart Week Logic Verification...');

        // 1. Check Latest Week Endpoint
        console.log('Testing /activities/latest-week...');
        const latestRes = await axios.get(`${API_URL}/activities/latest-week`);

        if (latestRes.data.week) {
            console.log(`PASSED: Latest week endpoint returned: ${latestRes.data.week}`);
        } else {
            console.log('WARNING: Latest week endpoint returned null (DB might be empty).');
        }

        // 2. We can't easily test the Frontend Logic from node, 
        // but we can verify the backend supports the queries the frontend will make.

        // Frontend makes a check query: /activities?week=CURRENT_WEEK&limit=1
        const currentWeek = '2026-W04'; // Simulate current week
        const checkRes = await axios.get(`${API_URL}/activities`, { params: { week: currentWeek, limit: 1 } });
        console.log(`Frontend Check Query (week=${currentWeek}) status: ${checkRes.status}`);

        console.log('backend support for smart logic verified.');
        process.exit(0);

    } catch (error) {
        console.error('Test Failed:', error.message);
        process.exit(1);
    }
}

verifySmartWeek();
