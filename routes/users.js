const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next (err);
  }
});

module.exports = router;
