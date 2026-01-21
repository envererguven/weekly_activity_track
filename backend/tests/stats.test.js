const request = require('supertest');
const app = require('../src/app'); // Assuming app.js exports the express app

describe('Stats API', () => {
    it('should return dashboard stats structure', async () => {
        const res = await request(app).get('/api/dashboard-stats');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('total_effort');
        expect(res.body).toHaveProperty('effort_by_person');
        expect(res.body).toHaveProperty('status_distribution');
    });

    it('should fail gracefully if LLM is unreachable during summary generation', async () => {
        // We expect a 500 or error message if LLM url is bogus
        const res = await request(app).post('/api/stats/summary').send({
            llmUrl: 'http://invalid-url:1234',
            model: 'test'
        });
        // Depending on impl, might be 500
        expect(res.statusCode).toBeGreaterThanOrEqual(500);
    }, 10000);
});
