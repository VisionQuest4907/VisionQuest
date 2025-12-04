import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PORT, MONGO_URI, NODE_ENV } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express(); 
app.use(express.json());
app.use(cookieParser());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('api/users', userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

mongoose.connect(MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
  });
}).catch((err) => {
  console.error('Mongo Connection Error:', err);
  process.exit(1);
});
  
