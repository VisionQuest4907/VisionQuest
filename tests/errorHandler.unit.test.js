jest.mock('../config/env', () => ({
  NODE_ENV: 'test',
  MONGO_URI: 'mongodb://127.0.0.1:27017/test',
  JWT_SECRET: 'testsecret',
  PORT: 5000,
}));

jest.mock('../middleware/logging', () => ({
  logger: { error: jest.fn() },
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');
function mockRes() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status, json }, json, status };
}

function mockReq(overrides = {}) {
  return { originalUrl: '/test', method: 'GET', ip: '127.0.0.1', ...overrides };
}

describe('notFoundHandler', () => {
  test('responds 404 with message', () => {
    const { res, json, status } = mockRes();
    const req = mockReq();
    const next = jest.fn();
    notFoundHandler(req, res, next);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Not Found' });
  });
});

describe('errorHandler', () => {
  const next = jest.fn();

  test('uses err.statusCode when set', () => {
    const { res, json, status } = mockRes();
    const err = Object.assign(new Error('gone'), { statusCode: 410 });
    errorHandler(err, mockReq(), res, next);
    expect(status).toHaveBeenCalledWith(410);
    expect(json.mock.calls[0][0]).toMatchObject({ message: 'gone' });
  });

  test('uses err.status when statusCode missing', () => {
    const { res, status } = mockRes();
    const err = Object.assign(new Error('bad'), { status: 418 });
    errorHandler(err, mockReq(), res, next);
    expect(status).toHaveBeenCalledWith(418);
  });

  test('defaults to 500 when no status', () => {
    const { res, status } = mockRes();
    errorHandler(new Error('oops'), mockReq(), res, next);
    expect(status).toHaveBeenCalledWith(500);
  });

  test('SyntaxError invalid JSON body -> 400', () => {
    const { res, status } = mockRes();
    const err = new SyntaxError('Unexpected token');
    err.status = 400;
    err.body = {};
    errorHandler(err, mockReq(), res, next);
    expect(status).toHaveBeenCalledWith(400);
  });

  test('CastError -> 400 Invalid identifier format', () => {
    const { res, json } = mockRes();
    const err = new Error('cast');
    err.name = 'CastError';
    errorHandler(err, mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(json.mock.calls[0][0].message).toBe('Invalid identifier format');
  });

  test('ValidationError -> 400 Validation failed', () => {
    const { res, json } = mockRes();
    const err = new Error('schema');
    err.name = 'ValidationError';
    errorHandler(err, mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(json.mock.calls[0][0].message).toBe('Validation failed');
  });

  test.each([
    [
      'duplicate with keyValue',
      { code: 11000, keyValue: { email: 'dup@example.com' } },
      409,
      'Duplicate value for: email',
    ],
    ['duplicate no keyValue', { code: 11000 }, 409, 'Duplicate key error'],
  ])('%s', (_label, errProps, expectedStatus, expectedMsg) => {
    const { res, json } = mockRes();
    const err = Object.assign(new Error('dup'), errProps);
    errorHandler(err, mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(expectedStatus);
    expect(json.mock.calls[0][0].message).toBe(expectedMsg);
  });

  test('JsonWebTokenError -> 401 Invalid token', () => {
    const { res, json } = mockRes();
    const err = new Error('jwt');
    err.name = 'JsonWebTokenError';
    errorHandler(err, mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(json.mock.calls[0][0].message).toBe('Invalid token');
  });

  test('TokenExpiredError -> 401 Token expired', () => {
    const { res, json } = mockRes();
    const err = new Error('exp');
    err.name = 'TokenExpiredError';
    errorHandler(err, mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(json.mock.calls[0][0].message).toBe('Token expired');
  });

  test('in test NODE_ENV non-500 returns err.message', () => {
    const { res, json } = mockRes();
    const err = Object.assign(new Error('visible'), { statusCode: 422 });
    errorHandler(err, mockReq(), res, next);
    expect(json.mock.calls[0][0].message).toBe('visible');
  });
});