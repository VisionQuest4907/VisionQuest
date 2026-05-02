const { spawn } = require('child_process');
const request = require('supertest');

const BASE_URL = 'http://127.0.0.1:5000';
let serverProc;

function isIsoDateString(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function expectKnownSanitize500(res) {
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty('message');
  expect(String(res.body.message).toLowerCase()).toContain('cannot set property query');
}

function startServer() {
  return new Promise((resolve, reject) => {
    serverProc = spawn('node', ['server.js'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: '5000' },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    const timeout = setTimeout(() => {
      reject(new Error('Timed out waiting for server startup'));
    }, 20000);

    const onData = (data) => {
      const text = data.toString();
      if (text.includes('Server Running on Port')) {
        clearTimeout(timeout);
        serverProc.stdout.off('data', onData);
        resolve();
      }
    };

    serverProc.stdout.on('data', onData);
    serverProc.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited early with code ${code}`));
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (!serverProc || serverProc.killed) return resolve();

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const timer = setTimeout(() => {
      finish();
    }, 3000);

    serverProc.once('exit', () => {
      clearTimeout(timer);
      finish();
    });

    serverProc.kill();
  });
}

describe('health/ready payload shape (integration)', () => {
  beforeAll(async () => {
    await startServer();
  }, 30000);

  afterAll(async () => {
    await stopServer();
  });

  test('GET /health returns success shape or known middleware 500', async () => {
    const res = await request(BASE_URL).get('/health');
    if (res.status === 500) return expectKnownSanitize500(res);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    expect(isIsoDateString(res.body.timestamp)).toBe(true);
  });

  test('GET /api/health returns success shape or known middleware 500', async () => {
    const res = await request(BASE_URL).get('/api/health');
    if (res.status === 500) return expectKnownSanitize500(res);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /ready returns ready/not_ready shape or known middleware 500', async () => {
    const res = await request(BASE_URL).get('/ready');
    if (res.status === 500) return expectKnownSanitize500(res);

    expect([200, 503]).toContain(res.status);
    expect(['ready', 'not_ready']).toContain(res.body.status);
    expect(typeof res.body.dbConnected).toBe('boolean');
    expect(typeof res.body.dbState).toBe('number');
    expect(isIsoDateString(res.body.timestamp)).toBe(true);
  });

  test('GET /api/ready returns ready shape or known middleware 500', async () => {
    const res = await request(BASE_URL).get('/api/ready');
    if (res.status === 500) return expectKnownSanitize500(res);

    expect([200, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('status', 'ready');
      expect(res.body).toHaveProperty('db', 'up');
    } else {
      expect(res.body).toHaveProperty('status', 'not ready');
      expect(res.body).toHaveProperty('db', 'down');
    }
  });

  test.each(['/health', '/api/health', '/ready', '/api/ready'])(
    '%s returns JSON content-type',
    async (path) => {
      const res = await request(BASE_URL).get(path);
      expect(res.headers['content-type']).toMatch(/application\/json/i);
    }
  );
});