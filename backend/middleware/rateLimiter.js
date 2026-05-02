const rateLimit = require('express-rate-limit');

// General rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth routes - 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiter for API routes - 50 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: {
    success: false,
    message: 'Too many requests, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter - 10 uploads per minute
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter
};