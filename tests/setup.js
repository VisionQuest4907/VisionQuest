require('dotenv').config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
jest.setTimeout(60000);