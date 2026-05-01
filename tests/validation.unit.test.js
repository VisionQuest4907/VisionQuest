const {
  registerSchema,
  loginSchema,
  userQuizSubmitSchema,
  moduleGradeSchema,
  updateProfileSchema,
} = require('../middleware/validation');

describe('validation schemas (unit, deterministic)', () => {
  describe('registerSchema invalid email', () => {
    test.each([
      ['missing at-sign', 'user.example.com'],
      ['missing domain', 'user@'],
      ['missing local-part', '@example.com'],
      ['plain text', 'notanemail'],
      ['space in address', 'bad email@example.com'],
      ['double at-sign', 'a@@example.com'],
      ['invalid domain label', 'a@-example.com'],
      ['invalid tld-like', 'a@example'],
    ])('rejects %s', (_name, email) => {
      const { error } = registerSchema.validate({
        userName: 'validUser',
        email,
        password: 'ValidPassw0rd!',
      });
      expect(error).toBeDefined();
    });
  });

  describe('registerSchema password bounds', () => {
    test.each([
      ['too short 1', 'a'],
      ['too short 5', 'short'],
      ['too short 11', '12345678901'],
      ['empty', ''],
    ])('rejects %s', (_name, password) => {
      const { error } = registerSchema.validate({
        userName: 'validUser',
        email: 'user@example.com',
        password,
      });
      expect(error).toBeDefined();
    });

    test.each([
      ['minimum valid length', '123456789012'],
      ['common valid strong password', 'ValidPassw0rd!'],
      ['max valid length 128', 'a'.repeat(128)],
    ])('accepts %s', (_name, password) => {
      const { error } = registerSchema.validate({
        userName: 'validUser',
        email: 'user@example.com',
        password,
      });
      expect(error).toBeUndefined();
    });

    test('rejects length > 128', () => {
      const { error } = registerSchema.validate({
        userName: 'validUser',
        email: 'user@example.com',
        password: 'a'.repeat(129),
      });
      expect(error).toBeDefined();
    });
  });

  describe('loginSchema', () => {
    test('rejects missing identifier', () => {
      const { error } = loginSchema.validate({ password: 'ValidPassw0rd!' });
      expect(error).toBeDefined();
    });

    test('rejects short password', () => {
      const { error } = loginSchema.validate({
        identifier: 'user@example.com',
        password: 'short',
      });
      expect(error).toBeDefined();
    });

    test('accepts valid email identifier and password', () => {
      const { error } = loginSchema.validate({
        identifier: 'user@example.com',
        password: 'ValidPassw0rd!',
      });
      expect(error).toBeUndefined();
    });
  });

  describe('moduleGradeSchema answers validation', () => {
    test.each([
      ['missing answers', {}],
      ['null answers', { answers: null }],
      ['string answers', { answers: '0,1' }],
      ['empty array', { answers: [] }],
      ['negative index', { answers: [-1] }],
      ['out of range index', { answers: [4] }],
      ['decimal index', { answers: [1.5] }],
      ['non-number element', { answers: ['abc'] }],
    ])('rejects %s', (_name, payload) => {
      const { error } = moduleGradeSchema.validate(payload);
      expect(error).toBeDefined();
    });

    test.each([
      ['single valid answer', { answers: [0] }],
      ['multiple valid answers', { answers: [0, 1, 2, 3] }],
      ['boundary valid values', { answers: [0, 3, 0, 3] }],
    ])('accepts %s', (_name, payload) => {
      const { error } = moduleGradeSchema.validate(payload);
      expect(error).toBeUndefined();
    });
  });

  describe('userQuizSubmitSchema', () => {
    test('rejects missing moduleID', () => {
      const { error } = userQuizSubmitSchema.validate({ quizScore: 80 });
      expect(error).toBeDefined();
    });

    test('rejects quizScore below 0', () => {
      const { error } = userQuizSubmitSchema.validate({
        moduleID: 'M1',
        quizScore: -1,
      });
      expect(error).toBeDefined();
    });

    test('rejects quizScore above 100', () => {
      const { error } = userQuizSubmitSchema.validate({
        moduleID: 'M1',
        quizScore: 101,
      });
      expect(error).toBeDefined();
    });

    test('accepts valid payload', () => {
      const { error } = userQuizSubmitSchema.validate({
        moduleID: 'M1',
        quizScore: 80,
      });
      expect(error).toBeUndefined();
    });
  });

  describe('updateProfileSchema', () => {
    test('rejects empty body due to .min(1)', () => {
      const { error } = updateProfileSchema.validate({});
      expect(error).toBeDefined();
    });

    test('accepts one valid field', () => {
      const { error } = updateProfileSchema.validate({ firstName: 'Ada' });
      expect(error).toBeUndefined();
    });
  });
});