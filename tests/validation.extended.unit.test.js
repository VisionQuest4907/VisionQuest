const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  moduleGradeSchema,
  userQuizSubmitSchema,
} = require('../middleware/validation');

describe('registerSchema extended (userName / email / password)', () => {
  const validBase = () => ({
    userName: 'validUser',
    email: 'user@example.com',
    password: '123456789012',
  });

  describe('userName bounds', () => {
    test.each([
      ['empty string', ''],
      ['single char', 'a'],
      ['one char unicode', 'π'],
      ['101 chars', 'a'.repeat(101)],
    ])('rejects %s', (_label, userName) => {
      const { error } = registerSchema.validate({
        ...validBase(),
        userName,
      });
      expect(error).toBeDefined();
    });

    test.each([
      ['min length 2', 'ab'],
      ['exactly 100 chars', 'b'.repeat(100)],
      ['with numbers', 'user123'],
    ])('accepts %s', (_label, userName) => {
      const { error } = registerSchema.validate({
        ...validBase(),
        userName,
      });
      expect(error).toBeUndefined();
    });

    test('rejects missing userName', () => {
      const { email, password } = validBase();
      const { error } = registerSchema.validate({ email, password });
      expect(error).toBeDefined();
    });
  });

  describe('email required & shape', () => {
    test.each([
      ['missing', undefined],
      ['null', null],
      ['empty string', ''],
      ['spaces only', '   '],
    ])('rejects email: %s', (_label, email) => {
      const { error } = registerSchema.validate({
        ...validBase(),
        email,
      });
      expect(error).toBeDefined();
    });
  });

  describe('password required on register', () => {
    test.each([
      ['missing', undefined],
      ['null', null],
      ['empty', ''],
      ['11 chars', '12345678901'],
    ])('rejects password: %s', (_label, password) => {
      const { error } = registerSchema.validate({
        ...validBase(),
        password,
      });
      expect(error).toBeDefined();
    });

    test('accepts exactly 12 char password', () => {
      const { error } = registerSchema.validate({
        ...validBase(),
        password: 'a'.repeat(12),
      });
      expect(error).toBeUndefined();
    });

    test('rejects 129 char password', () => {
      const { error } = registerSchema.validate({
        ...validBase(),
        password: 'a'.repeat(129),
      });
      expect(error).toBeDefined();
    });
  });
});

describe('loginSchema extended (identifier / password)', () => {
  test.each([
    ['empty identifier', { identifier: '', password: '123456789012' }],
    ['1-char identifier', { identifier: 'x', password: '123456789012' }],
    ['missing identifier', { password: '123456789012' }],
    ['null identifier', { identifier: null, password: '123456789012' }],
  ])('rejects %s', (_label, body) => {
    const { error } = loginSchema.validate(body);
    expect(error).toBeDefined();
  });

  test.each([
    ['2-char identifier', { identifier: 'ab', password: '123456789012' }],
    ['email as identifier', { identifier: 'u@example.com', password: '123456789012' }],
    ['254-char identifier', { identifier: 'i'.repeat(254), password: '123456789012' }],
  ])('accepts %s', (_label, body) => {
    const { error } = loginSchema.validate(body);
    expect(error).toBeUndefined();
  });

  test('rejects 255-char identifier', () => {
    const { error } = loginSchema.validate({
      identifier: 'i'.repeat(255),
      password: '123456789012',
    });
    expect(error).toBeDefined();
  });

  test.each([
    ['missing password', { identifier: 'ab' }],
    ['empty password', { identifier: 'ab', password: '' }],
    ['11-char password', { identifier: 'ab', password: '12345678901' }],
  ])('rejects %s', (_label, body) => {
    const { error } = loginSchema.validate(body);
    expect(error).toBeDefined();
  });
});

describe('updateProfileSchema extended (optional fields)', () => {
  test.each([
    ['firstName only', { firstName: 'Ada' }],
    ['lastName only', { lastName: 'Lovelace' }],
    ['phoneNumber only', { phoneNumber: '555-0100' }],
    ['userName min', { userName: 'ab' }],
    ['userName 50 chars', { userName: 'u'.repeat(50) }],
    ['email change', { email: 'new@example.com' }],
    ['password 12 chars', { password: 'a'.repeat(12) }],
    ['firstName empty allowed', { firstName: '' }],
    ['lastName empty allowed', { lastName: '' }],
    ['phone empty allowed', { phoneNumber: '' }],
  ])('accepts %s', (_label, body) => {
    const { error } = updateProfileSchema.validate(body);
    expect(error).toBeUndefined();
  });

  test.each([
    ['userName one char', { userName: 'a' }],
    ['userName 51 chars', { userName: 'u'.repeat(51) }],
    ['invalid email', { email: 'not-an-email' }],
    ['short password when set', { password: 'short' }],
    ['firstName too long', { firstName: 'x'.repeat(51) }],
    ['lastName too long', { lastName: 'x'.repeat(51) }],
    ['phone too long', { phoneNumber: '9'.repeat(21) }],
  ])('rejects %s', (_label, body) => {
    const { error } = updateProfileSchema.validate(body);
    expect(error).toBeDefined();
  });

  test.each([
    ['first + last', { firstName: 'A', lastName: 'B' }],
    ['userName + email', { userName: 'ab', email: 'ok@example.com' }],
    ['all text fields', {
      userName: 'ab',
      firstName: 'A',
      lastName: 'B',
      phoneNumber: '1',
      email: 'e@example.com',
    }],
  ])('accepts combined patch: %s', (_label, body) => {
    const { error } = updateProfileSchema.validate(body);
    expect(error).toBeUndefined();
  });

  test('rejects completely empty object (.min(1))', () => {
    const { error } = updateProfileSchema.validate({});
    expect(error).toBeDefined();
  });
});

describe('moduleGradeSchema extended (answer arrays)', () => {
  test.each([
    ['single 0', { answers: [0] }],
    ['single 3', { answers: [3] }],
    ['four zeros', { answers: [0, 0, 0, 0] }],
    ['four threes', { answers: [3, 3, 3, 3] }],
    ['ascending', { answers: [0, 1, 2, 3] }],
    ['descending', { answers: [3, 2, 1, 0] }],
    ['ten answers', { answers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1] }],
    ['twenty answers', { answers: Array(20).fill(0) }],
  ])('accepts %s', (_label, body) => {
    const { error } = moduleGradeSchema.validate(body);
    expect(error).toBeUndefined();
  });

  test.each([
    ['max+1 index', { answers: [4] }],
    ['mixed invalid last', { answers: [0, 1, 2, 99] }],
    ['non-integer float', { answers: [0, 1.5, 2, 3] }],
    ['NaN element', { answers: [NaN] }],
    ['Infinity', { answers: [Infinity] }],
    ['boolean', { answers: [true] }],
    ['object element', { answers: [{}] }],
    ['array nested', { answers: [[0]] }],
    ['two invalid', { answers: [-1, 10] }],
  ])('rejects %s', (_label, body) => {
    const { error } = moduleGradeSchema.validate(body);
    expect(error).toBeDefined();
  });
});

describe('registerSchema extra invalid emails', () => {
  const base = {
    userName: 'ab',
    password: '123456789012',
  };

  test.each([
    ['no domain', 'user@'],
    ['no local', '@example.com'],
    ['double @@', 'a@@b.com'],
    ['missing tld', 'a@b'],
    ['space inside', 'a @b.com'],
    ['brackets', '<user>@example.com'],
    ['only at', '@'],
    ['domain with space', 'a@exam ple.com'],
  ])('rejects email: %s', (_label, email) => {
    const { error } = registerSchema.validate({ ...base, email });
    expect(error).toBeDefined();
  });
});

describe('loginSchema identifier shape (username-like)', () => {
  test.each([
    ['alnum', { identifier: 'user01', password: '123456789012' }],
    ['with dot', { identifier: 'first.last', password: '123456789012' }],
    ['with underscore', { identifier: 'under_score', password: '123456789012' }],
    ['with hyphen', { identifier: 'dash-name', password: '123456789012' }],
    ['253 chars', { identifier: 'n'.repeat(253), password: '123456789012' }],
  ])('accepts %s', (_label, body) => {
    const { error } = loginSchema.validate(body);
    expect(error).toBeUndefined();
  });
});

describe('userQuizSubmitSchema extended', () => {
  test.each([
    ['score 0', { moduleID: 'M1', quizScore: 0 }],
    ['score 100', { moduleID: 'M1', quizScore: 100 }],
    ['score 50', { moduleID: 'M1', quizScore: 50 }],
    ['moduleID one char', { moduleID: 'a', quizScore: 1 }],
    ['long moduleID', { moduleID: 'mod-'.repeat(20), quizScore: 10 }],
  ])('accepts %s', (_label, body) => {
    const { error } = userQuizSubmitSchema.validate(body);
    expect(error).toBeUndefined();
  });

  test.each([
    ['missing quizScore', { moduleID: 'M1' }],
    ['null quizScore', { moduleID: 'M1', quizScore: null }],
    ['non-numeric score', { moduleID: 'M1', quizScore: 'eighty' }],
    ['empty moduleID', { moduleID: '', quizScore: 80 }],
    ['missing moduleID key', { quizScore: 80 }],
    ['score boolean', { moduleID: 'M1', quizScore: true }],
    ['score array', { moduleID: 'M1', quizScore: [80] }],
  ])('rejects %s', (_label, body) => {
    const { error } = userQuizSubmitSchema.validate(body);
    expect(error).toBeDefined();
  });
});