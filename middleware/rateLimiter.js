const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  apiLimiter,
};
