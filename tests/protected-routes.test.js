const request = require('supertest');
const mongoose = require('mongoose');
const { BASE_URL, startServer, stopServer } = require('./helpers/serverProcess');

function tokenFromSetCookie(res) {
  const raw = res.headers['set-cookie'];
  if (!raw) return null;
  const joined = Array.isArray(raw) ? raw.join(';') : String(raw);
  const m = joined.match(/token=([^;]+)/);
  return m ? decodeURIComponent(m[1].trim()) : null;
}

describe('protected routes (PRDM4)', () => {
  const validPassword = 'ValidPassw0rd!';
  const testIp = () =>
    `10.20.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 200) + 1}`;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || process.env.DB_URI;
    if (!uri) throw new Error('MONGO_URI or DB_URI is required');
    if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
    await startServer();

    const id = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

    const userEmail = `puser_${id}@user.authtest.com`;
    const userName = `puser_${id}`;

    await request(BASE_URL).post('/api/auth/register').set('X-Forwarded-For', testIp()).send({
      userName,
      email: userEmail,
      password: validPassword,
    });

    let login = await request(BASE_URL).post('/api/auth/login').set('X-Forwarded-For', testIp()).send({
      identifier: userEmail,
      password: validPassword,
    });
    userToken = tokenFromSetCookie(login);

    const adminEmail = `padmin_${id}@user.authtest.com`;
    const adminName = `padmin_${id}`;

    await request(BASE_URL).post('/api/auth/register').set('X-Forwarded-For', testIp()).send({
      userName: adminName,
      email: adminEmail,
      password: validPassword,
    });

    const User = require('../models/users');
    await User.updateOne({ email: adminEmail.toLowerCase() }, { $set: { role: 'admin' } });

    login = await request(BASE_URL).post('/api/auth/login').set('X-Forwarded-For', testIp()).send({
      identifier: adminEmail,
      password: validPassword,
    });
    adminToken = tokenFromSetCookie(login);
  });

  afterAll(async () => {
    const User = require('../models/users');
    await User.deleteMany({ email: /@user\.authtest\.com$/i });
    await stopServer();
    await mongoose.disconnect();
  });

  test('GET /api/users/me without token => 401', async () => {
    const res = await request(BASE_URL).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/users with non-admin token => 403', async () => {
    const res = await request(BASE_URL)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('GET /api/users with admin token => 200', async () => {
    const res = await request(BASE_URL)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});