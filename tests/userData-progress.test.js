const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/users');
const Module = require('../models/training_modules');
const Log = require('../models/logs');
const { BASE_URL, startServer, stopServer } = require('./helpers/serverProcess');

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
const testIp = () => `10.3.2.${Math.floor(Math.random() * 200) + 1}`;
const moduleID = 'mod_test_001';

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
  const email = `progress_${id}@example.com`;
  const userName = `progress_${id}`;
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

  const meReq = request(BASE_URL).get('/api/users/me');
  if (token) meReq.set('Authorization', `Bearer ${token}`);
  if (cookie) meReq.set('Cookie', cookie);
  const me = await meReq.expect(200);

  return { token, cookie, userID: me.body.userID };
};

describe('user progress updates (PRDM4)', () => {
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

  test('failing quiz sets in_progress and no certificate', async () => {
    await createModuleWithQuiz();
    const auth = await registerAndLogin();

    const res = await withAuth(
      request(BASE_URL).post(`/api/user-data/${auth.userID}/quiz`),
      auth
    ).send({ moduleID, quizScore: 60 });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.certificateIssued).toBe(false);
  });

  test('passing quiz sets completed and issues certificate', async () => {
    await createModuleWithQuiz();
    const auth = await registerAndLogin();

    const res = await withAuth(
      request(BASE_URL).post(`/api/user-data/${auth.userID}/quiz`),
      auth
    ).send({ moduleID, quizScore: 85 });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.certificateIssued).toBe(true);
  });

  test('second passing attempt does not issue duplicate certificate', async () => {
    await createModuleWithQuiz();
    const auth = await registerAndLogin();

    await withAuth(
      request(BASE_URL).post(`/api/user-data/${auth.userID}/quiz`),
      auth
    )
      .send({ moduleID, quizScore: 85 })
      .expect(200);

    const res = await withAuth(
      request(BASE_URL).post(`/api/user-data/${auth.userID}/quiz`),
      auth
    ).send({ moduleID, quizScore: 90 });

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.certificateIssued).toBe(false);
  });
});