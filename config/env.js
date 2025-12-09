//use environmental variables for secrets to avoid hardcoding 

import dotenv from 'dotenv';
dotenv.config();

export const {
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
  console.error('JWT_SECRET not sete in .env');
  process.exit(1);
}
