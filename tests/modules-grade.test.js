const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/users');
const Module = require('../models/training_modules');
const Log = require('../models/logs');
const { BASE_URL, startServer, stopServer } = require('./helpers/serverProcess');

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
const testIp = () => `10.3.0.${Math.floor(Math.random() * 200) + 1}`;

const extractToken = (res) => {
  if (res.body?.token) return res.body.token;
  const cookies = res.headers['set-cookie'] || [];
  const tokenCookie = cookies.find((c) => c.startsWith('token='));
  if (!tokenCookie) return null;
  return tokenCookie.split(';')[0].replace('token=', '');
};

const extractCookie = (res) => {
  const cookies = res.headers['set-cookie'] || [];
  return cookies.find((c) => c.startsWith('token=')) || null;
};

const withAuth = (req, auth) => {
  if (auth.token) req.set('Authorization', `Bearer ${auth.token}`);
  if (auth.cookie) req.set('Cookie', auth.cookie);
  return req;
};

async function createModuleWithQuiz(moduleID = 'mod_test_001') {
  await Module.create({
    moduleID,
    title: 'Test module',
    description: 'For automated tests',
    order: 1,
    tags: ['test'],
    estTime: 10,
    moduleQuestions: [
      { question: 'Q1?', multipleAnswers: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { question: 'Q2?', multipleAnswers: ['A', 'B', 'C', 'D'], correctAnswerIndex: 1 },
    ],
  });
}

const registerAndLogin = async () => {
  const id = makeId();
  const email = `mod_${id}@example.com`;
  const userName = `mod_${id}`;
  const password = 'ValidPassword12';

  await request(BASE_URL)
    .post('/api/auth/register')
    .set('X-Forwarded-For', testIp())
    .send({ userName, email, password })
    .expect(201);

  const login = await request(BASE_URL)
    .post('/api/auth/login')
    .set('X-Forwarded-For', testIp())
    .send({ identifier: email, password })
    .expect(200);

  const token = extractToken(login);
  const cookie = extractCookie(login);
  if (!token && !cookie) throw new Error('No token or auth cookie from login response');

  return { token, cookie };
};

describe('Modules — auth + quiz scoring', () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URI || process.env.DB_URI;
    if (!uri) throw new Error('MONGO_URI or DB_URI is required');
    if (mongoose.connection.readyState === 0) await mongoose.connect(uri);
    await startServer();
  });

  afterAll(async () => {
    await stopServer();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Module.deleteMany({}), Log.deleteMany({})]);
  });

  test('GET /api/modules without token returns 401', async () => {
    await createModuleWithQuiz();
    await request(BASE_URL).get('/api/modules').expect(401);
  });

  test('GET /api/modules with Bearer token returns module list', async () => {
    await createModuleWithQuiz();
    const auth = await registerAndLogin();

    const res = await withAuth(request(BASE_URL).get('/api/modules'), auth).expect(200);
    expect(res.body.modules).toBeInstanceOf(Array);
    expect(res.body.modules.length).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/modules/:moduleID/grade — wrong answers → score < 80, passed false', async () => {
    await createModuleWithQuiz();
    const auth = await registerAndLogin();

    const res = await withAuth(
      request(BASE_URL).post('/api/modules/mod_test_001/grade'),
      auth
    )
      .send({ answers: [0, 0] })
      .expect(200);

    expect(res.body.quizScore).toBe(50);
    expect(res.body.passed).toBe(false);
  });

  test('POST /api/modules/:moduleID/grade — all correct → score 100, passed true', async () => {
    await createModuleWithQuiz();
    const auth = await registerAndLogin();

    const res = await withAuth(
      request(BASE_URL).post('/api/modules/mod_test_001/grade'),
      auth
    )
      .send({ answers: [0, 1] })
      .expect(200);

    expect(res.body.quizScore).toBe(100);
    expect(res.body.passed).toBe(true);
  });
});