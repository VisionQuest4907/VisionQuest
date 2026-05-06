const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/users');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await User.init();
});

afterEach(async () => { await User.deleteMany({}); });

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

//Password hashing hook tests
describe('pre(save) password hashing hook', () => {
  test('password is hashed automatically on save before storage', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    //password should not be stored in plaintext, should be hashed starting with bycrypt prefix
    expect(user.password).not.toBe('TestPassw0rdPRSJ#4');
    expect(user.password).toMatch(/^\$2b\$/);
  });
  //make sure password is only rehashed if changed not on every save
  test('password not re-hashed if unchanged on save', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    const firstHash = user.password;
    user.userName = 'updatedname';
    await user.save();
    expect(user.password).toBe(firstHash);
  });
});
// Compare password test
describe('comparePassword()', () => {
  test('returns true for correct password', async () => {
    //create user with username, email, and password
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    //expect comparePassword to return true for the correct password that matches the user PRSJ4TestUser's password
    expect(user.comparePassword('TestPassw0rdPRSJ#4')).toBe(true);
  });
  test('returns false for wrong password', async () => {
    //create user with username, email, and password
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    //expect comparePassword to return false for the wrong password that does not match the user PRSJ4TestUser's password
    expect(user.comparePassword('WrongPassword956!')).toBe(false);
  });
});
//Account lockout tests
describe('isLocked()', () => {
  test('returns true when lockUntil is in the future', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4',
      lockUntil: new Date(Date.now() + 5 * 60 * 1000) });
    await user.save();
    expect(user.isLocked()).toBe(true);
  });
  test('returns false when lockUntil is in the past', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4',
      lockUntil: new Date(Date.now() - 5 * 60 * 1000) });
    await user.save();
    expect(user.isLocked()).toBeFalsy();
  });
  test('returns false when lockUntil is null and account is not locked', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4', lockUntil:null });
    await user.save();
    expect(user.isLocked()).toBeFalsy();
  });
});

//Schema required fieds and required fields (email, userName, password, role enum, duplicate email) tests
describe('Schema required field constraints', () => {
  test('throws when email missing', async () => {
    await expect(new User({ userName:'PRSJ4TestUser', password:'TestPassw0rdPRSJ#4' }).save()).rejects.toThrow();
  });
  test('throws when userName missing', async () => {
    await expect(new User({ email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' }).save()).rejects.toThrow();
  });
  test('throws on duplicate email', async () => {
    await new User({ userName:'u1', email:'same@example.com', password:'TestPassw0rdPRSJ#4' }).save();
    await expect(new User({ userName:'u2', email:'same@example.com', password:'TestPassw0rdPRSJ#4' }).save()).rejects.toThrow();
  });
  test('throws on invalid role', async () => {
    await expect(new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4', role:'superuser' }).save()).rejects.toThrow();
  });
});

// Streaks and last active date defaults
describe('Streak defaults', () => {
  test('currentStreak and longestStreak default to 0', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    expect(user.currentStreak).toBe(0);
    expect(user.longestStreak).toBe(0);
  });
  test('lastActiveDate defaults to null', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    expect(user.lastActiveDate).toBeNull();
  });
});

//Quiz scores array (schema requires moduleID, quizScore, and attemptNum for each entry)
describe('quizScores array', () => {
  test('quiz score pushed and saved correctly', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    user.quizScores.push({ moduleID:'mod0001', quizScore:85, attemptNum:1 });
    await user.save();
    const found = await User.findOne({ email:'PRSJ4testu@example.com' });
    expect(found.quizScores[0].quizScore).toBe(85);
  });
  test('attempt number increments correctly', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    user.quizScores.push({ moduleID:'mod0001', quizScore:55, attemptNum:1 });
    user.quizScores.push({ moduleID:'mod0001', quizScore:90, attemptNum:2 });
    await user.save();
    const attempts = user.quizScores.filter(q => q.moduleID === 'mod0001');
    expect(attempts[1].attemptNum).toBe(2);
  });
});

// Certificates array (schema requires userID and moduleID)
describe('certificates array', () => {
  test('certificate added with required userID and moduleID', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    user.certificates.push({ moduleID:'mod0001', userID: user.userID });
    await user.save();
    const found = await User.findOne({ email:'PRSJ4testu@example.com' });
    expect(found.certificates[0].moduleID).toBe('mod0001');
    expect(found.certificates[0].userID).toBe(user.userID);
  });
  test('duplicate cert check correctly identifies existing cert', async () => {
    const user = new User({ userName:'PRSJ4TestUser', email:'PRSJ4testu@example.com', password:'TestPassw0rdPRSJ#4' });
    await user.save();
    user.certificates.push({ moduleID:'mod0001', userID: user.userID });
    await user.save();
    const alreadyHas = user.certificates.find(c => c.moduleID === 'mod0001');
    expect(alreadyHas).toBeDefined();
  });
});
