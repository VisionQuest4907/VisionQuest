/**
 * Shared helpers for integration tests (Mongo + JWT).
 * Uses mongodb-memory-server so tests run without installing MongoDB locally.
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Module = require('../models/training_modules');
const Log = require('../models/logs');

let mongoMemory;

async function connectDb() {
  if (mongoose.connection.readyState !== 0) return;
  mongoMemory = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoMemory.getUri();
  await mongoose.connect(process.env.MONGO_URI);
}

async function clearCollections() {
  await Promise.all([User.deleteMany({}), Module.deleteMany({}), Log.deleteMany({})]);
}

async function disconnectDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongoMemory) {
    await mongoMemory.stop();
    mongoMemory = undefined;
  }
}

/** Create a user directly in Mongo (password hashed by model pre-save). */
async function createUser(overrides = {}) {
  const defaults = {
    userName: 'testuser',
    email: 'testuser@example.com',
    password: 'TestPassword12',
    role: 'user',
  };
  const user = new User({ ...defaults, ...overrides });
  await user.save();
  return user;
}

function bearerToken(user) {
  const { JWT_SECRET } = require('../config/env');
  return jwt.sign(
    {
      sub: user.userID,
      userID: user.userID,
      role: user.role || 'user',
      email: user.email,
      userName: user.userName,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/** Two-question quiz: correct answers index [0, 1]. */
async function createModuleWithQuiz(moduleID = 'mod_test_001') {
  await Module.create({
    moduleID,
    title: 'Test module',
    description: 'For automated tests',
    order: 1,
    tags: ['test'],
    estTime: 10,
    moduleQuestions: [
      { question: 'Q1?', multipleAnswers: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { question: 'Q2?', multipleAnswers: ['A', 'B', 'C', 'D'], correctAnswerIndex: 1 },
    ],
  });
}

module.exports = {
  connectDb,
  clearCollections,
  disconnectDb,
  createUser,
  bearerToken,
  createModuleWithQuiz,
};
