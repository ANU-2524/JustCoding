/**
 * Security Configuration Module
 * Centralizes all security-related middleware and configurations
 */
const helmet = require('helmet');

// CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "https://just-coding-theta.vercel.app";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  FRONTEND_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
};

// Socket.IO CORS Configuration
const socketCorsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
};

// Helmet Configuration for Security Headers
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...allowedOrigins, "https://emkc.org", "https://openrouter.ai"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
};

// Request Size Limits
const requestLimits = {
  json: '50kb',
  urlencoded: '50kb'
};

// HPP (HTTP Parameter Pollution) whitelist
const hppWhitelist = [
  'limit',
  'timeframe',
  'language',
  'page'
];

/**
 * Apply all security middleware to Express app
 * @param {Object} app - Express application instance
 */
function applySecurityMiddleware(app, cors, express) {
  // Helmet for security headers
  app.use(helmet(helmetOptions));
  
  // CORS configuration
  app.use(cors(corsOptions));
  
  // Request size limiting
  app.use(express.json({ limit: requestLimits.json }));
  app.use(express.urlencoded({ extended: true, limit: requestLimits.urlencoded }));
  
  // Disable X-Powered-By header (redundant with helmet but explicit)
  app.disable('x-powered-by');
  
  // Trust proxy for proper IP detection behind reverse proxies
  app.set('trust proxy', 1);
}

module.exports = {
  corsOptions,
  socketCorsOptions,
  helmetOptions,
  requestLimits,
  hppWhitelist,
  allowedOrigins,
  applySecurityMiddleware
};
