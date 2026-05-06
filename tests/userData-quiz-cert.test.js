/**
 * User progress: quiz submission on user-data route, certificates list, single certificate check.
 *
 * What we check:
 * - Without token → 401.
 * - Token for user A but URL user B → 403 (self-only).
 * - Score >= 80 → certificateIssued true and certificate appears in list.
 * - GET certificate detail when earned vs 403 when not earned.
 */
const request = require('supertest');
const {
  connectDb,
  disconnectDb,
  clearCollections,
  createUser,
  bearerToken,
  createModuleWithQuiz,
} = require('./helpers');

let app;

describe('User data — quiz progress & certificates', () => {
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

  test('POST /api/user-data/:userID/quiz without auth returns 401', async () => {
    const user = await createUser();
    await createModuleWithQuiz();
    await request(app)
      .post(`/api/user-data/${user.userID}/quiz`)
      .send({ moduleID: 'mod_test_001', quizScore: 90 })
      .expect(401);
  });

  test('POST /api/user-data/:userID/quiz wrong userID in URL returns 403', async () => {
    const user = await createUser();
    const other = await createUser({
      userName: 'other',
      email: 'other@example.com',
    });
    await createModuleWithQuiz();
    const token = bearerToken(user);
    await request(app)
      .post(`/api/user-data/${other.userID}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleID: 'mod_test_001', quizScore: 90 })
      .expect(403);
  });

  test('POST quiz with score 85 issues certificate and updates progress', async () => {
    const user = await createUser();
    await createModuleWithQuiz();
    const token = bearerToken(user);
    const res = await request(app)
      .post(`/api/user-data/${user.userID}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleID: 'mod_test_001', quizScore: 85 })
      .expect(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.certificateIssued).toBe(true);
    expect(res.body.score).toBe(85);
    expect(Array.isArray(res.body.certificates)).toBe(true);
    expect(res.body.certificates.some((c) => c.moduleID === 'mod_test_001')).toBe(true);
  });

  test('GET /api/user-data/:userID/certificates lists certificates', async () => {
    const user = await createUser();
    await createModuleWithQuiz();
    const token = bearerToken(user);
    await request(app)
      .post(`/api/user-data/${user.userID}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleID: 'mod_test_001', quizScore: 85 })
      .expect(200);

    const res = await request(app)
      .get(`/api/user-data/${user.userID}/certificates`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.certificates.length).toBeGreaterThanOrEqual(1);
  });

  test('GET certificate by module returns earned when user has certificate', async () => {
    const user = await createUser();
    await createModuleWithQuiz();
    const token = bearerToken(user);
    await request(app)
      .post(`/api/user-data/${user.userID}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .send({ moduleID: 'mod_test_001', quizScore: 85 })
      .expect(200);

    const res = await request(app)
      .get(`/api/user-data/${user.userID}/certificates/mod_test_001`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.earned).toBe(true);
    expect(res.body.moduleID).toBe('mod_test_001');
  });

  test('GET certificate by module returns 403 when not earned', async () => {
    const user = await createUser();
    await createModuleWithQuiz();
    const token = bearerToken(user);
    await request(app)
      .get(`/api/user-data/${user.userID}/certificates/mod_test_001`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
