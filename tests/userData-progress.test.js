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

describe('user progress updates (PRDM4)', () => {
  const validPassword = 'ValidPassw0rd!';
  const MODULE_PREFIX = 'prdm4_progress_test_';

  let token;
  let userID;
  let moduleID;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || process.env.DB_URI;
    if (!uri) throw new Error('MONGO_URI or DB_URI is required');
    if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
    await startServer();

    const id = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    moduleID = `${MODULE_PREFIX}${id}`;

    const Module = require('../models/training_modules');
    await Module.create({
      moduleID,
      title: `Progress Module ${id}`,
      description: 'Progress test module',
      order: 920000,
      moduleQuestions: [],
    });

    const email = `progress_${id}@user.authtest.com`;
    const userName = `progress_${id}`;

    await request(BASE_URL).post('/api/auth/register').send({
      userName,
      email,
      password: validPassword,
    });

    const login = await request(BASE_URL).post('/api/auth/login').send({
      identifier: email,
      password: validPassword,
    });
    token = tokenFromSetCookie(login);

    const me = await request(BASE_URL)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    userID = me.body.userID;
  });

  afterAll(async () => {
    const Module = require('../models/training_modules');
    const User = require('../models/users');

    await Module.deleteMany({ moduleID: { $regex: `^${MODULE_PREFIX}` } });
    await User.deleteMany({ email: /@user\.authtest\.com$/i });

    await stopServer();
    await mongoose.disconnect();
  });

  test('failing quiz sets in_progress and no certificate', async () => {
    const res = await request(BASE_URL)
      .post(`/api/user-data/${userID}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleID, quizScore: 60 });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.certificateIssued).toBe(false);

    const p = res.body.progress.find((x) => x.moduleID === moduleID);
    expect(p).toBeDefined();
    expect(p.completionStatus).toBe('in_progress');
    expect(p.attempts).toBe(1);
    expect(p.lastQuizScore).toBe(60);
  });

  test('passing quiz sets completed and issues certificate', async () => {
    const res = await request(BASE_URL)
      .post(`/api/user-data/${userID}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleID, quizScore: 85 });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.certificateIssued).toBe(true);

    const p = res.body.progress.find((x) => x.moduleID === moduleID);
    expect(p).toBeDefined();
    expect(p.completionStatus).toBe('completed');
    expect(p.attempts).toBe(2);
    expect(p.lastQuizScore).toBe(85);

    const cert = (res.body.certificates || []).find((c) => c.moduleID === moduleID);
    expect(cert).toBeDefined();
  });

  test('second passing attempt does not issue duplicate certificate', async () => {
    const res = await request(BASE_URL)
      .post(`/api/user-data/${userID}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleID, quizScore: 90 });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.certificateIssued).toBe(false);

    const certs = (res.body.certificates || []).filter((c) => c.moduleID === moduleID);
    expect(certs.length).toBe(1);
  });
});