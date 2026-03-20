const jwt = require('jsonwebtoken');
const User = require('../models/users');
const { JWT_SECRET } = require('../config/env');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (req.cookies && req.cookies.token) ||
      (authHeader && authHeader.startsWith('Bearer ') 
       ? authHeader.split(' ')[1]
       : null);
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ userID: payload.sub }).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User Not Found'});
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:' , err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication Required" });
  }

  if (req.user.role !== role) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

//checks ownership 
const requireOwnership = (param = 'userID') => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.userID !== req.params[param]) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requireOwnership
};
