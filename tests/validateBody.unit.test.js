const {
  validateBody,
  registerSchema,
  loginSchema,
  userQuizSubmitSchema,
  moduleGradeSchema,
  updateProfileSchema,
} = require('../middleware/validation');

function mockRes() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status }, json };
}

describe('validateBody middleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  describe('registerSchema', () => {
    test('calls next and assigns validated body on success', () => {
      const { res, json } = mockRes();
      const req = {
        body: {
          userName: 'ab',
          email: 'a@b.co',
          password: '123456789012',
          extraUnknown: 1,
        },
      };
      validateBody(registerSchema)(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.body).toMatchObject({
        userName: 'ab',
        email: 'a@b.co',
        password: '123456789012',
      });
      expect(json).not.toHaveBeenCalled();
    });

    test.each([
      ['bad email', { userName: 'ab', email: 'bad', password: '123456789012' }],
      ['short userName', { userName: 'a', email: 'a@b.co', password: '123456789012' }],
      ['short password', { userName: 'ab', email: 'a@b.co', password: 'short' }],
    ])('returns 400 for %s', (_label, body) => {
      const { res, json } = mockRes();
      const req = { body };
      validateBody(registerSchema)(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid Request',
          details: expect.any(Array),
        }),
      );
    });
  });

  describe('loginSchema', () => {
    test('calls next on valid login body', () => {
      const { res } = mockRes();
      const req = { body: { identifier: 'ab', password: '123456789012' } };
      validateBody(loginSchema)(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('returns 400 when identifier missing', () => {
      const { res, json } = mockRes();
      const req = { body: { password: '123456789012' } };
      validateBody(loginSchema)(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(json.mock.calls[0][0].details.length).toBeGreaterThan(0);
    });
  });

  describe('userQuizSubmitSchema', () => {
    test('calls next on valid quiz payload', () => {
      const { res } = mockRes();
      const req = { body: { moduleID: 'M1', quizScore: 0 } };
      validateBody(userQuizSubmitSchema)(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test.each([
      ['missing moduleID', { quizScore: 50 }],
      ['negative score', { moduleID: 'M1', quizScore: -0.01 }],
      ['score over 100', { moduleID: 'M1', quizScore: 100.01 }],
    ])('returns 400 for %s', (_label, body) => {
      const { res } = mockRes();
      validateBody(userQuizSubmitSchema)({ body }, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('moduleGradeSchema', () => {
    test('calls next on valid answers', () => {
      const { res } = mockRes();
      const req = { body: { answers: [0, 1, 2, 3] } };
      validateBody(moduleGradeSchema)(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test.each([
      ['missing answers', {}],
      ['answers not array', { answers: '0,1' }],
    ])('returns 400 for %s', (_label, body) => {
      const { res } = mockRes();
      validateBody(moduleGradeSchema)({ body }, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateProfileSchema', () => {
    test('calls next on single valid field', () => {
      const { res } = mockRes();
      const req = { body: { firstName: 'Ada' } };
      validateBody(updateProfileSchema)(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test('returns 400 for empty object', () => {
      const { res } = mockRes();
      validateBody(updateProfileSchema)({ body: {} }, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});