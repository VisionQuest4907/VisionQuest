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

describe('module grading validation (PRDM4)', () => {
  const validPassword = 'ValidPassw0rd!';
  const MODULE_PREFIX = 'prdm4_grade_valid_';

  let moduleID;
  let authHeader;

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
      title: `Grade Validation ${id}`,
      description: 'Validation test module',
      order: 910000,
      moduleQuestions: [
        { question: 'Q1', multipleAnswers: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
        { question: 'Q2', multipleAnswers: ['A', 'B', 'C', 'D'], correctAnswerIndex: 2 },
      ],
    });

    const email = `gradeval_${id}@user.authtest.com`;
    const userName = `gradeval_${id}`;

    await request(BASE_URL).post('/api/auth/register').send({
      userName,
      email,
      password: validPassword,
    });

    const login = await request(BASE_URL).post('/api/auth/login').send({
      identifier: email,
      password: validPassword,
    });

    const token = tokenFromSetCookie(login);
    authHeader = `Bearer ${token}`;
  });

  afterAll(async () => {
    const Module = require('../models/training_modules');
    const User = require('../models/users');

    await Module.deleteMany({ moduleID: { $regex: `^${MODULE_PREFIX}` } });
    await User.deleteMany({ email: /@user\.authtest\.com$/i });

    await stopServer();
    await mongoose.disconnect();
  });

  test('rejects missing answers payload', async () => {
    const res = await request(BASE_URL)
      .post(`/api/modules/${moduleID}/grade`)
      .set('Authorization', authHeader)
      .send({});
    expect(res.status).toBe(400);
  });

  test('rejects answers length mismatch', async () => {
    const res = await request(BASE_URL)
      .post(`/api/modules/${moduleID}/grade`)
      .set('Authorization', authHeader)
      .send({ answers: [0] });
    expect(res.status).toBe(400);
  });

  test('rejects out-of-range answer index', async () => {
    const res = await request(BASE_URL)
      .post(`/api/modules/${moduleID}/grade`)
      .set('Authorization', authHeader)
      .send({ answers: [0, 4] });
    expect(res.status).toBe(400);
  });

  test('returns 404 for missing module', async () => {
    const res = await request(BASE_URL)
      .post('/api/modules/DOES_NOT_EXIST/grade')
      .set('Authorization', authHeader)
      .send({ answers: [0, 2] });
    expect(res.status).toBe(404);
  });
});