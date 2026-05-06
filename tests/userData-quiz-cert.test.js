const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/users');
const Module = require('../models/training_modules');
const Log = require('../models/logs');
const { BASE_URL, startServer, stopServer } = require('./helpers/serverProcess');

const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
const testIp = () => `10.3.3.${Math.floor(Math.random() * 200) + 1}`;

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

const registerAndLogin = async (prefix = 'user') => {
  const id = makeId();
  const email = `${prefix}_${id}@example.com`;
  const userName = `${prefix}_${id}`;
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

describe('User data — quiz progress & certificates', () => {
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

  test('POST /api/user-data/:userID/quiz without auth returns 401', async () => {
    const user = await registerAndLogin('unauth');
    await createModuleWithQuiz();

    await request(BASE_URL)
      .post(`/api/user-data/${user.userID}/quiz`)
      .send({ moduleID: 'mod_test_001', quizScore: 90 })
      .expect(401);
  });

  test('POST /api/user-data/:userID/quiz wrong userID in URL returns 403', async () => {
    const user = await registerAndLogin('owner');
    const other = await registerAndLogin('other');
    await createModuleWithQuiz();

    await withAuth(
      request(BASE_URL).post(`/api/user-data/${other.userID}/quiz`),
      user
    )
      .send({ moduleID: 'mod_test_001', quizScore: 90 })
      .expect(403);
  });

  test('POST quiz with score 85 issues certificate and updates progress', async () => {
    const user = await registerAndLogin('progress');
    await createModuleWithQuiz();

    const res = await withAuth(
      request(BASE_URL).post(`/api/user-data/${user.userID}/quiz`),
      user
    )
      .send({ moduleID: 'mod_test_001', quizScore: 85 })
      .expect(200);

    expect(res.body.passed).toBe(true);
    expect(res.body.certificateIssued).toBe(true);
    expect(res.body.score).toBe(85);
  });

  test('GET /api/user-data/:userID/certificates lists certificates', async () => {
    const user = await registerAndLogin('list');
    await createModuleWithQuiz();

    await withAuth(
      request(BASE_URL).post(`/api/user-data/${user.userID}/quiz`),
      user
    )
      .send({ moduleID: 'mod_test_001', quizScore: 85 })
      .expect(200);

    const res = await withAuth(
      request(BASE_URL).get(`/api/user-data/${user.userID}/certificates`),
      user
    ).expect(200);

    expect(Array.isArray(res.body.certificates)).toBe(true);
  });

  test('GET certificate by module returns earned when user has certificate', async () => {
    const user = await registerAndLogin('earned');
    await createModuleWithQuiz();

    await withAuth(
      request(BASE_URL).post(`/api/user-data/${user.userID}/quiz`),
      user
    )
      .send({ moduleID: 'mod_test_001', quizScore: 85 })
      .expect(200);

    const res = await withAuth(
      request(BASE_URL).get(`/api/user-data/${user.userID}/certificates/mod_test_001`),
      user
    ).expect(200);

    expect(res.body.earned).toBe(true);
  });

  test('GET certificate by module returns 403 when not earned', async () => {
    const user = await registerAndLogin('notearned');
    await createModuleWithQuiz();

    await withAuth(
      request(BASE_URL).get(`/api/user-data/${user.userID}/certificates/mod_test_001`),
      user
    ).expect(403);
  });
});