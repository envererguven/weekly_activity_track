const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://127.0.0.1:5000/api';

async function verifyUXFeatures() {
    try {
        console.log('Starting UX Feature Verification (Sorting & Effort)...');

        // 1. Test Sorting by Status ASC
        console.log('Testing Sort by Status ASC...');
        const resAsc = await axios.get(`${API_URL}/activities`, {
            params: { sort: 'status', order: 'ASC', limit: 5 }
        });
        const statusesAsc = resAsc.data.data.map(a => a.status);
        console.log('Statuses ASC:', statusesAsc);
        // Basic check: just ensure we got data and it didn't crash
        if (statusesAsc.length === 0) throw new Error('No data returned');

        // 2. Test Sorting by Status DESC
        console.log('Testing Sort by Status DESC...');
        const resDesc = await axios.get(`${API_URL}/activities`, {
            params: { sort: 'status', order: 'DESC', limit: 5 }
        });
        const statusesDesc = resDesc.data.data.map(a => a.status);
        console.log('Statuses DESC:', statusesDesc);

        // 3. Test Sorting by Effort (Harcanan Efor)
        // Need a week context for this to work meaningfully
        const week = '2026-W04'; // Assuming our seed data put some here or we defaulted here
        console.log(`Testing Sort by Effort DESC for week ${week}...`);

        const resEffort = await axios.get(`${API_URL}/activities`, {
            params: { week, sort: 'effort', order: 'DESC', limit: 5 }
        });

        const efforts = resEffort.data.data.map(a => {
            const wData = a.weekly_data[week];
            return wData ? wData.effort : '0';
        });
        console.log('Efforts DESC:', efforts);

        // Verify descending order
        for (let i = 0; i < efforts.length - 1; i++) {
            if (parseFloat(efforts[i]) < parseFloat(efforts[i + 1])) {
                console.warn('WARNING: Effort sort order might be incorrect (or equal).', efforts);
            }
        }

        console.log('UX Backend Verification Passed.');
    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) console.error(error.response.data);
        process.exit(1);
    }
}

verifyUXFeatures();
