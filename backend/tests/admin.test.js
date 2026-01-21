const request = require('supertest');
const app = require('../src/app');

describe('Admin API', () => {
    let newUserId;
    let newProductId;

    // User Tests
    it('should create a new user', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ full_name: `Test User ${Date.now()}` });
        expect(res.statusCode).toEqual(201);
        expect(res.body.full_name).toContain('Test User');
        newUserId = res.body.id;
    });

    it('should soft delete user', async () => {
        const res = await request(app).delete(`/api/users/${newUserId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.user.is_active).toEqual(false);
    });

    // Product Tests
    it('should create a new product', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({ name: `Test Product ${Date.now()}`, description: 'Desc' });
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toContain('Test Product');
        newProductId = res.body.id;
    });

    it('should soft delete product', async () => {
        const res = await request(app).delete(`/api/products/${newProductId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.product.is_active).toEqual(false);
    });
});
