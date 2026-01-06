
const rateLimit = require('express-rate-limit');

// Simple rate limiters without external dependencies
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: '⚠️ Too many requests. Please slow down.',
    retryAfter: 'Try again in 15 minutes',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 5,
  message: {
    error: '🤖 AI usage limit exceeded.',
    retryAfter: 'Try again in 15 minutes',
    code: 'AI_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const codeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message: {
    error: '💻 Code execution limit exceeded.',
    retryAfter: 'Try again in 5 minutes',
    code: 'CODE_EXEC_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const rateLimitLogger = (req, res, next) => {
  next();
};

module.exports = {
  generalLimiter,
  aiLimiter,
  codeLimiter,
  rateLimitLogger
};