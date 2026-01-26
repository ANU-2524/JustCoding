/**
 * JustCoding Backend Server
 * Modular, secure Express.js application
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const helmet = require('helmet');

// Database and Services
const connectDB = require('./config/database');
const BadgeService = require('./services/BadgeService');

// Security and Middleware
const { applySecurityMiddleware } = require('./config/security');
const {
  generalLimiter,
  aiLimiter,
  codeLimiter,
  rateLimitLogger
} = require('./middleware/simpleRateLimiter');
const { validate } = require('./middleware/validation');

// Routes
const gptRoute = require('./routes/gptRoute');
const codeQualityRoute = require('./routes/codeQuality');
const progressRoute = require('./routes/progress');
const challengesRoute = require('./routes/challenges');
const roomRoute = require('./routes/room');
const userRoute = require('./routes/user');
const tutorialsRoute = require('./routes/tutorials');

// Socket.IO (modularized)
const { initializeSocket, cleanup: socketCleanup } = require('./socket');

// Multi-Language Visualizer Service
const visualizerService = require('./services/visualizer');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize database connection
connectDB();

// Initialize badges on startup
BadgeService.initializeBadges().catch(console.error);

// ============================================
// Security Middleware
// ============================================
applySecurityMiddleware(app, cors, express);

// Rate limiting middleware
app.use(rateLimitLogger);
app.use(generalLimiter);

// ============================================
// Socket.IO Initialization
// ============================================
const io = initializeSocket(server);

// Make io accessible to routes if needed
app.set('io', io);

// ============================================
// Language Configuration for Code Execution
// ============================================
const languageMap = {
  javascript: { ext: 'js', version: '18.15.0' },
  python: { ext: 'py', version: '3.10.0' },
  java: { ext: 'java', version: '15.0.2' },
  cpp: { ext: 'cpp', version: '10.2.0' },
  c: { ext: 'c', version: '10.2.0' },
  go: { ext: 'go', version: '1.16.2' },
  ruby: { ext: 'rb', version: '3.0.1' },
  php: { ext: 'php', version: '8.2.3' },
  swift: { ext: 'swift', version: '5.3.3' },
  rust: { ext: 'rs', version: '1.68.2' },
};

// ============================================
// API Routes
// ============================================

// AI routes with security and rate limiting
app.use("/api/gpt", aiLimiter, gptRoute);

// Code quality route
app.use("/api/code-quality", codeQualityRoute);

// Progress and analytics routes
app.use("/api/progress", progressRoute);

// Challenges routes
app.use("/api/challenges", challengesRoute);
app.use("/api/tutorials", tutorialsRoute);

// Room routes
app.use("/api/room", roomRoute);

// User data sync routes (profile + snippets)
app.use("/api/user", userRoute);

// ============================================
// Visualizer Endpoints
// ============================================

/**
 * POST /api/visualizer/visualize
 * Visualize code execution step-by-step
 */
app.post('/api/visualizer/visualize', codeLimiter, validate('visualizer'), (req, res) => {
  const { code, language } = req.body;

  try {
    const result = visualizerService.visualize(code, language);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/visualizer/languages
 * Get supported languages for visualizer
 */
app.get('/api/visualizer/languages', (req, res) => {
  res.json({
    success: true,
    languages: visualizerService.getSupportedLanguages()
  });
});

// ============================================
// Code Execution Endpoint
// ============================================

/**
 * POST /api/compile
 * Execute code using Piston API
 */
app.post('/api/compile', codeLimiter, validate('compile'), async (req, res) => {
  const { language, code, stdin } = req.body;

  const langInfo = languageMap[language];
  if (!langInfo) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported language',
      supportedLanguages: Object.keys(languageMap)
    });
  }

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version: langInfo.version,
      stdin: stdin || '',
      files: [{ name: `main.${langInfo.ext}`, content: code }],
    });

    const output = response.data.run.stdout || response.data.run.stderr || "No output";
    const sanitizedOutput = output.substring(0, 5000);

    res.json({ 
      success: true,
      output: sanitizedOutput 
    });
  } catch (error) {
    console.error("Compile Error:", error.message);
    res.status(500).json({
      success: false,
      error: 'Code execution failed. Please try again.',
      tip: 'Check your code for syntax errors.'
    });
  }
});

/**
 * POST /compile (Legacy endpoint for backward compatibility)
 */
app.post('/compile', codeLimiter, validate('compile'), async (req, res) => {
  const { language, code, stdin } = req.body;

  const langInfo = languageMap[language];
  if (!langInfo) {
    return res.status(400).json({
      error: 'Unsupported language',
      supportedLanguages: Object.keys(languageMap)
    });
  }

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version: langInfo.version,
      stdin: stdin || '',
      files: [{ name: `main.${langInfo.ext}`, content: code }],
    });

    const output = response.data.run.stdout || response.data.run.stderr || "No output";
    const sanitizedOutput = output.substring(0, 5000);

    res.json({ output: sanitizedOutput });
  } catch (error) {
    console.error("Compile Error:", error.message);
    res.status(500).json({
      error: 'Code execution failed. Please try again.',
      tip: 'Check your code for syntax errors.'
    });
  }
});

// ============================================
// Health Check & Info Endpoints
// ============================================

app.get('/', (req, res) => {
  res.json({ 
    name: 'JustCoding API',
    version: '1.0.0',
    status: 'running',
    features: ['Multi-Language Code Execution', 'Code Visualizer', 'AI Assistance', 'Real-time Collaboration']
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    port: process.env.PORT || 4334 
  });
});

// ============================================
// Error Handling Middleware
// ============================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  });
});

// ============================================
// Graceful Shutdown
// ============================================

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    socketCleanup();
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 4334;
server.listen(PORT, () => {
  console.log(`🚀 JustCoding Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
