/**
 * Module list + server-side quiz grading (answers array → score).
 *
 * What we check:
 * - Protected route: /api/modules needs a valid JWT.
 * - POST /api/modules/:moduleID/grade scores answers and sets passed when >= 80.
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

describe('Modules — auth + quiz scoring', () => {
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

  test('GET /api/modules without token returns 401', async () => {
    await createModuleWithQuiz();
    await request(app).get('/api/modules').expect(401);
  });

  test('GET /api/modules with Bearer token returns module list', async () => {
    const user = await createUser({ userName: 'moduser', email: 'moduser@example.com' });
    await createModuleWithQuiz();
    const token = bearerToken(user);
    const res = await request(app)
      .get('/api/modules')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.modules).toBeInstanceOf(Array);
    expect(res.body.modules.length).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/modules/:moduleID/grade — wrong answers → score < 80, passed false', async () => {
    const user = await createUser();
    await createModuleWithQuiz();
    const token = bearerToken(user);
    const res = await request(app)
      .post('/api/modules/mod_test_001/grade')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0, 0] })
      .expect(200);
    expect(res.body.quizScore).toBe(50);
    expect(res.body.passed).toBe(false);
  });

  test('POST /api/modules/:moduleID/grade — all correct → score 100, passed true', async () => {
    const user = await createUser();
    await createModuleWithQuiz();
    const token = bearerToken(user);
    const res = await request(app)
      .post('/api/modules/mod_test_001/grade')
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [0, 1] })
      .expect(200);
    expect(res.body.quizScore).toBe(100);
    expect(res.body.passed).toBe(true);
  });
});
