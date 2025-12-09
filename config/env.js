// use environmental variables for secrets to avoid hardcoding
require('dotenv').config();

const {
  PORT = 5000,
  MONGO_URI,
  JWT_SECRET,
  NODE_ENV = 'development',
} = process.env;

if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('JWT_SECRET not set in .env');
  process.exit(1);
}

module.exports = {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  NODE_ENV,
};
