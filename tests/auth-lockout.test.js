const request = require('supertest');
const mongoose = require('mongoose');
const { BASE_URL, startServer, stopServer } = require('./helpers/serverProcess');

describe('auth lockout (PRDM4)', () => {
  const validPassword = 'ValidPassw0rd!';
  let email;
  let userName;

  const testIp = () => `10.0.0.${Math.floor(Math.random() * 200) + 1}`;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || process.env.DB_URI;
    if (!uri) throw new Error('MONGO_URI or DB_URI is required');
    if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
    await startServer();
  });

  beforeEach(() => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    email = `lock_${id}@user.authtest.com`;
    userName = `lock_${id}`;
  });

  afterAll(async () => {
    const User = require('../models/users');
    await User.deleteMany({ email: /@user\.authtest\.com$/i });
    await stopServer();
    await mongoose.disconnect();
  });

  test('locks account after repeated wrong password attempts', async () => {
    await request(BASE_URL)
      .post('/api/auth/register')
      .set('X-Forwarded-For', testIp())
      .send({
        userName,
        email,
        password: validPassword,
      });

    for (let i = 0; i < 3; i += 1) {
      const res = await request(BASE_URL)
        .post('/api/auth/login')
        .set('X-Forwarded-For', testIp())
        .send({
          identifier: email,
          password: 'WrongPassw0rd!!',
        });

      expect(res.status).toBe(401);
    }

    const locked = await request(BASE_URL)
      .post('/api/auth/login')
      .set('X-Forwarded-For', testIp())
      .send({
        identifier: email,
        password: validPassword,
      });

    expect(locked.status).toBe(423);
    expect(String(locked.body.message).toLowerCase()).toContain('locked');
  });
});