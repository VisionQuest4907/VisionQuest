/**
 * Health / readiness checks (FRDM-style endpoints).
 *
 * What we check:
 * - GET / — API banner (simple smoke).
 * - GET /health — returns ok + uptime (liveness).
 * - GET /ready — 200 when Mongo is connected (readiness).
 * - GET /api/health — JSON ok (often used behind reverse proxy).
 */
const request = require('supertest');
const { connectDb, disconnectDb } = require('./helpers');

/** Load app after MONGO_URI is set (see tests/helpers.js). */
let app;

describe('Health & readiness', () => {
  beforeAll(async () => {
    await connectDb();
    app = require('../app');
  });

  afterAll(async () => {
    await disconnectDb();
  });

  test('GET / returns API running message', async () => {
    const res = await request(app).get('/').expect(200);
    expect(res.body.message).toMatch(/VisionQuest API is running/i);
  });

  test('GET /health returns status ok and timestamp', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /ready returns 200 when database is connected', async () => {
    const res = await request(app).get('/ready').expect(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.dbConnected).toBe(true);
  });

  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
