const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const {
  validateBody,
  registerSchema,
  loginSchema,
} = require('../middleware/validation');
const { loginLimiter } = require('../middleware/rateLimiter');
const { JWT_SECRET } = require('../config/env');
const router = express.Router();
const MAX_FAILED_ATTEMPTS = 3; 
const LOCKOUT_MINUTES = 5;

function createToken(user) {
  return jwt.sign(
    {
      sub: user.userID,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
    );
}

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    const existing = await User.findOne({ email });
    
    if (existing) {
      return res.status(409).json({ message: "Email Already Registered" });
    }

    const user = new User({ userName, email, password });
    await user.save();
    console.log(`New User Registered: ${email}`);
    res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    next(err);
  }
});

router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const identifierLower = identifier.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: identifierLower }, { userName: identifier }],
    });

    if (!user) {
      console.warn(`No User: ${identifier}`);
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (user.isLocked()) {
      console.warn(`Locked Account Login Attempt: ${user.email}`);
      return res.status(423).json({ message: "Account locked. Try again later." });
    }

    const valid = user.comparePassword(password);
    if (!valid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(
          Date.now() + LOCKOUT_MINUTES * 60 * 1000
          );
        console.warn(`Account Locked: ${user.email}`);
      }
      await user.save();
      console.warn(`Failed Login: ${user.email} (attempts: ${user.failedLoginAttempts})`);
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    const token = createToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    console.log(`Successful Login: ${user.email}`);
    res.json({ message: "Login Successful", token });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged Out' });
});

module.exports = router;

    
