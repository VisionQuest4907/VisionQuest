const request = require('supertest');
const mongoose = require('mongoose');
const { BASE_URL, startServer, stopServer } = require('./helpers/serverProcess');

describe('auth logout (PRDM4)', () => {
  const validPassword = 'ValidPassw0rd!';
  let email;
  let userName;

  const testIp = () => `10.0.1.${Math.floor(Math.random() * 200) + 1}`;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || process.env.DB_URI;
    if (!uri) throw new Error('MONGO_URI or DB_URI is required');
    if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
    await startServer();
  });

  beforeEach(() => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    email = `logout_${id}@user.authtest.com`;
    userName = `logout_${id}`;
  });

  afterAll(async () => {
    const User = require('../models/users');
    await User.deleteMany({ email: /@user\.authtest\.com$/i });
    await stopServer();
    await mongoose.disconnect();
  });

  test('logout returns success and clear-cookie header', async () => {
    await request(BASE_URL)
      .post('/api/auth/register')
      .set('X-Forwarded-For', testIp())
      .send({
        userName,
        email,
        password: validPassword,
      });

    const login = await request(BASE_URL)
      .post('/api/auth/login')
      .set('X-Forwarded-For', testIp())
      .send({
        identifier: email,
        password: validPassword,
      });

    expect(login.status).toBe(200);

    const loginCookie = login.headers['set-cookie'] || [];
    expect(loginCookie.length).toBeGreaterThan(0);

    const out = await request(BASE_URL)
      .post('/api/auth/logout')
      .set('X-Forwarded-For', testIp())
      .set('Cookie', loginCookie);

    expect(out.status).toBe(200);
    expect(String(out.body.message).toLowerCase()).toContain('logged out');

    const setCookie = out.headers['set-cookie'] || [];
    const cookieText = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie);
    expect(cookieText.toLowerCase()).toContain('token=');
  });
});