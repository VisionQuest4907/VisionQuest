/**
 * PRDM4 — Auth validation tests (no DB required).
 * Tests that invalid request bodies return 400 with validation messages.
 */
const request = require('supertest');

const app = require('../server');

describe('Auth validation', () => {
  test('POST /api/auth/login with missing body returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('details');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('POST /api/auth/login with short password returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'user@example.com', password: 'short' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid Request');
    expect(res.body.details).toBeDefined();
  });

  test('POST /api/auth/register with invalid email returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        userName: 'testuser',
        email: 'not-an-email',
        password: 'longpassword123',
      })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid Request');
    expect(res.body.details).toBeDefined();
  });

  test('POST /api/auth/register with short password returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        userName: 'testuser',
        email: 'test@example.com',
        password: 'short',
      })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid Request');
  });

  test('POST /api/auth/logout returns 200', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged Out');
  });
});
