/**
 * Auth: register, login, validation.
 *
 * What we check:
 * - Happy path: register then login succeeds.
 * - Duplicate email returns 409.
 * - Bad body (weak password) returns 400 from Joi Wrong password returns 401 (invalid credentials).
 */

const request = require('supertest');
const { connectDb, disconnectDb, clearCollections } = require('./helpers');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5000';

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

const extractToken = (res) => {
  if (res.body && res.body.token) return res.body.token;
  const cookies = res.headers['set-cookie'] || [];
  const raw = Array.isArray(cookies) ? cookies.find((c) => c.startsWith('token=')) : null;
  if (!raw) return null;
  return raw.split(';')[0].replace(/^token=/, '');
};

describe('Auth — register & login', () => {
  beforeAll(async () => {
    await connectDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  test('POST /api/auth/register creates user (201)', async () => {
    const id = makeId();
    const res = await request(BASE_URL)
      .post('/api/auth/register')
      .send({
        userName: `alice_${id}`,
        email: `alice_${id}@example.com`,
        password: 'ValidPassword12',
      })
      .expect(201);

    expect(res.body.message).toMatch(/registered successfully/i);
  });

  test('POST /api/auth/register duplicate email returns 409', async () => {
    const id = makeId();
    const email = `dup_${id}@example.com`;

    await request(BASE_URL).post('/api/auth/register').send({
      userName: `u1_${id}`,
      email,
      password: 'ValidPassword12',
    });

    const res = await request(BASE_URL)
      .post('/api/auth/register')
      .send({
        userName: `u2_${id}`,
        email,
        password: 'ValidPassword12',
      })
      .expect(409);

    expect(res.body.message).toMatch(/already registered/i);
  });

  test('POST /api/auth/register invalid password length returns 400', async () => {
    const id = makeId();
    const res = await request(BASE_URL)
      .post('/api/auth/register')
      .send({
        userName: `bob_${id}`,
        email: `bob_${id}@example.com`,
        password: 'short',
      })
      .expect(400);

    expect(res.body.message).toBe('Invalid Request');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('POST /api/auth/login wrong password returns 401', async () => {
    const id = makeId();
    const email = `carl_${id}@example.com`;

    await request(BASE_URL).post('/api/auth/register').send({
      userName: `carl_${id}`,
      email,
      password: 'ValidPassword12',
    });

    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        identifier: email,
        password: 'WrongPassword12',
      })
      .expect(401);

    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('POST /api/auth/login success returns 200', async () => {
    const id = makeId();
    const email = `dina_${id}@example.com`;

    await request(BASE_URL).post('/api/auth/register').send({
      userName: `dina_${id}`,
      email,
      password: 'ValidPassword12',
    });

    const res = await request(BASE_URL)
      .post('/api/auth/login')
      .send({
        identifier: email,
        password: 'ValidPassword12',
      })
      .expect(200);

    expect(res.body.message).toMatch(/login successful/i);
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('token=')])
    );
  });

  test('GET /api/users/me with Bearer token returns current user (no password)', async () => {
    const id = makeId();
    const email = `meuser_${id}@example.com`;

    await request(BASE_URL).post('/api/auth/register').send({
      userName: `meuser_${id}`,
      email,
      password: 'ValidPassword12',
    });

    const login = await request(BASE_URL).post('/api/auth/login').send({
      identifier: email,
      password: 'ValidPassword12',
    });

    const token = extractToken(login);
    expect(token).toBeTruthy();

    const res = await request(BASE_URL)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe(email);
    expect(res.body.password).toBeUndefined();
  });

  test('GET /api/users/me without token returns 401', async () => {
    await request(BASE_URL).get('/api/users/me').expect(401);
  });
});