import jwt from 'jsonwebtoken';
import { JWT_SECRET } from 'env.js';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  //token a cookie or an authorization header 
  try{
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith('Bearer ')
       ? authHeader.split(' ')[1]
       : null);

    if (!token) {
      return res.status(401).json({ message: 'Authentication Required' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User Not Found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication Required' });
  }

  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
