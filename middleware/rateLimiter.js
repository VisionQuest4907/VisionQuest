//max 3 login attempts per IP every 5 minutes
import rateLimit from 'express-rate-limit';
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: "Too many login attempts. Please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: "Too many requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
