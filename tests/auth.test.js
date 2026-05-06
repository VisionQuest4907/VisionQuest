/**
 * Auth: register, login, validation.
 *
 * What we check:
 * - Happy path: register then login succeeds.
 * - Duplicate email returns 409.
 * - Bad body (weak password) returns 400 from Joi.
 * - Wrong password returns 401 (invalid credentials).
 */
const request = require('supertest');
const { connectDb, disconnectDb, clearCollections, createUser, bearerToken } = require('./helpers');

let app;

describe('Auth — register & login', () => {
  beforeAll(async () => {
    await connectDb();
    app = require('../app');
  });

  afterAll(async () => {
    await disconnectDb();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  test('POST /api/auth/register creates user (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        userName: 'alice',
        email: 'alice@example.com',
        password: 'ValidPassword12',
      })
      .expect(201);
    expect(res.body.message).toMatch(/registered successfully/i);
  });

  test('POST /api/auth/register duplicate email returns 409', async () => {
    await request(app).post('/api/auth/register').send({
      userName: 'u1',
      email: 'dup@example.com',
      password: 'ValidPassword12',
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        userName: 'u2',
        email: 'dup@example.com',
        password: 'ValidPassword12',
      })
      .expect(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('POST /api/auth/register invalid password length returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        userName: 'bob',
        email: 'bob@example.com',
        password: 'short',
      })
      .expect(400);
    expect(res.body.message).toBe('Invalid Request');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('POST /api/auth/login wrong password returns 401', async () => {
    await request(app).post('/api/auth/register').send({
      userName: 'carl',
      email: 'carl@example.com',
      password: 'ValidPassword12',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'carl@example.com',
        password: 'WrongPassword12',
      })
      .expect(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('POST /api/auth/login success returns 200', async () => {
    await request(app).post('/api/auth/register').send({
      userName: 'dina',
      email: 'dina@example.com',
      password: 'ValidPassword12',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'dina@example.com',
        password: 'ValidPassword12',
      })
      .expect(200);
    expect(res.body.message).toMatch(/login successful/i);
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=')])
    );
  });

  test('GET /api/users/me with Bearer token returns current user (no password)', async () => {
    const user = await createUser({ userName: 'meuser', email: 'meuser@example.com' });
    const token = bearerToken(user);
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.userID).toBe(user.userID);
    expect(res.body.password).toBeUndefined();
  });

  test('GET /api/users/me without token returns 401', async () => {
    await request(app).get('/api/users/me').expect(401);
  });
});
