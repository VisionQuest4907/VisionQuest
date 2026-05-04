const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Log = require('../models/logs');
const {
  validateBody,
  registerSchema,
  loginSchema,
} = require('../middleware/validation');
const { loginLimiter } = require('../middleware/rateLimiter');
const { JWT_SECRET } = require('../config/env');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
const MAX_FAILED_ATTEMPTS = 3; 
const LOCKOUT_MINUTES = 5;

function createToken(user) {
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

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { userName }]
    });
    
    if (existing) {
      return res.status(409).json({ message: "Email Already Registered" });
    }

    const user = new User({ userName, email: email.toLowerCase(), password });
    await user.save();
    await Log.create({
        userRef: user._id,
        userID: user.userID,
        action: 'user_registration_successful',
        details: { email: user.email},
    });
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
      await Log.create({
            userRef: null,
            userID: "unknown",
            action: "failed_login_attempt",
            details: { identifier: identifierLower, reason: "no_user_found" },
        });
      console.warn(`No User: ${identifier}`);
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    if (typeof user.isLocked === 'function' && user.isLocked()) {
      await Log.create({
            userRef: user._id,
            userID: user.userID,
            action: "failed_login_attempt",
            details: { identifier: identifierLower, reason: "account_locked" },
        });
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
        await user.save();
        await Log.create({
          userRef: user._id,
          userID: user.userID,
          action: "account_locked",
          details: {
            identifier: identifierLower,
            failedAttempts: user.failedLoginAttempts,
            lockedUntil: user.lockUntil,
          },
        });
        console.warn(`Account Locked: ${user.email}`);
      } else {
        await user.save();

        await Log.create({
          userRef: user._id,
          userID: user.userID,
          action: "failed_login_attempt",
          details: {
            identifier: identifierLower, reason: "incorrect_password", failedAttempts: user.failedLoginAttempts,
          },
        });
      }
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
    await Log.create({
        userRef: user._id,
        userID: user.userID,
        action: "login_successful",
        details: { identifier:  identifierLower }
    });

    console.log(`Successful Login: ${user.email}`);
    res.json({ message: "Login Successful" });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, async (req, res, next) =>{
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  await Log.create({
    userRef: req.user._id,
    userID: req.user.userID,
    action: "logout",
    details: {}
  });
  res.json({ message: 'Logged Out' });
  
});

module.exports = router;

    
