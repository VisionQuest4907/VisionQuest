/**
 * PRDM4 — Health and readiness endpoint tests.
 * No DB required when app is required (server not started).
 */
const request = require('supertest');

// Load app without starting server (require.main !== module)
const app = require('../server');

describe('Health endpoints', () => {
  test('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /api/health returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /ready returns 200 or 503 and has expected shape', async () => {
    const res = await request(app).get('/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('dbConnected');
    expect(res.body).toHaveProperty('dbState');
    expect(res.body).toHaveProperty('timestamp');
    if (res.status === 200) {
      expect(res.body.status).toBe('ready');
      expect(res.body.dbConnected).toBe(true);
    } else {
      expect(res.body.status).toBe('not_ready');
      expect(res.body.dbConnected).toBe(false);
    }
  });
});
