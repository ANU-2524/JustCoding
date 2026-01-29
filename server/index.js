// BACKEND: server.js (or index.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const BadgeService = require('./services/BadgeService');
const Room = require('./models/Room');
const ExecutionQueueService = require('./services/ExecutionQueueService');
const ExecutionHistory = require('./models/ExecutionHistory');

// Logging Service
const { logger, httpLogger } = require('./services/logger');

// Error Handling
const { 
  errorHandler, 
  notFoundHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler
} = require('./middleware/error');
const { asyncHandler } = require('./middleware/async');
const { BadRequestError, ExternalServiceError } = require('./utils/ErrorResponse');

// Setup uncaught exception handler early
setupUncaughtExceptionHandler();

const {
  generalLimiter,
  aiLimiter,
  codeLimiter,
  rateLimitLogger
} = require('./middleware/simpleRateLimiter');
const gptRoute = require('./routes/gptRoute');
const codeQualityRoute = require('./routes/codeQuality');
const analysisRoute = require('./routes/analysis');
const progressRoute = require('./routes/progress');
const challengesRoute = require('./routes/challenges');
const roomRoute = require('./routes/room');
const userRoute = require('./routes/user');
const executionRoute = require('./routes/execution');

// Multi-Language Visualizer Service
import visualizerServicePkg from './services/visualizer/index.js';
const visualizerService = visualizerServicePkg;

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize database connection
connectDB();

// Initialize badges on startup
BadgeService.initializeBadges().catch(err => logger.warn('Badge initialization failed', { error: err.message }));

// ============================================
// Security Middleware
// ============================================
applySecurityMiddleware(app, cors, express);

// Rate limiting middleware
app.use(rateLimitLogger);
app.use(generalLimiter);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  logger.info("User connected", { socketId: socket.id });

  socket.on("join-room", async ({ roomId, username, userId }) => {
    try {
      socket.join(roomId);

      let room = await Room.findOne({ roomId });
      if (!room) {
        room = await Room.create({
          roomId,
          code: "//Welcome to JustCoding",
          language: "javascript",
        });
      }

      logger.info(`${username} joined room ${roomId}`, { username, roomId, userId });
      userMap[socket.id] = { username, roomId, userId: userId || socket.id };

      // Send initial room state with sequence number
      const sequence = room.getNextSequence();
      await room.save();

      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        sequence,
        executionState: room.executionState
      });

      socket.to(roomId).emit("user-joined", {
        message: `${username} joined the room`,
        username,
        userId: userId || socket.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error joining room', { error: error.message, roomId });
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on("code-change", async ({ roomId, code, sequence }) => {
    try {
      socket.to(roomId).emit("code-update", { code, sequence });

      if (roomTimers[roomId]) {
        clearTimeout(roomTimers[roomId]);
      }

      roomTimers[roomId] = setTimeout(async () => {
        try {
          const room = await Room.findOne({ roomId });
          if (room) {
            room.code = code;
            await room.save();
          }
          delete roomTimers[roomId];
        } catch (error) {
          logger.error('Error updating room code', { error: error.message, roomId });
        }
      }, 2000);
    } catch (error) {
      logger.error('Error broadcasting code change', { error: error.message, roomId });
    }
  });

  socket.on("execute-code", async ({ roomId, code, language, stdin, userId, username }) => {
    try {
      const user = userMap[socket.id];
      const execUserId = userId || user?.userId || socket.id;
      const execUsername = username || user?.username || 'Anonymous';
      const correlationId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      logger.info('WebSocket execution request', {
        roomId,
        userId: execUserId,
        language,
        correlationId
      });

      // Emit execution started event
      io.to(roomId).emit("execution-started", {
        userId: execUserId,
        username: execUsername,
        correlationId,
        timestamp: new Date().toISOString()
      });

      // Execute code through queue service
      const result = await ExecutionQueueService.executeCode({
        roomId,
        userId: execUserId,
        username: execUsername,
        code,
        language,
        stdin: stdin || '',
        correlationId,
        priority: 0
      });

      // Record execution
      await ExecutionHistory.recordExecution({
        executionId: result.executionId,
        correlationId,
        roomId,
        userId: execUserId,
        username: execUsername,
        language,
        code,
        stdin: stdin || '',
        output: result.output || '',
        error: result.error,
        success: result.success,
        executionTime: result.executionTime,
        completedAt: new Date(result.timestamp),
        status: result.success ? 'completed' : 'failed'
      });

      // Emit result to all users in room with correlation ID
      io.to(roomId).emit("execution-result", {
        ...result,
        correlationId
      });

      logger.info('WebSocket execution completed', {
        roomId,
        userId: execUserId,
        success: result.success,
        correlationId
      });
    } catch (error) {
      logger.error('WebSocket execution error', {
        error: error.message,
        roomId,
        userId
      });

      socket.emit("execution-result", {
        success: false,
        error: error.message,
        userId,
        username,
        roomId,
        timestamp: new Date().toISOString()
      });
    }
  });

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
app.use("/api/analysis", analysisRoute); // New pluggable code quality analysis system
app.use("/api/progress", progressRoute);

// Challenges routes
app.use("/api/challenges", challengesRoute);
app.use("/api/community", communityRoute);

// Room routes
app.use("/api/room", roomRoute);

// User data sync routes (profil

// Execution history and queue management routes
app.use("/api/execution", executionRoute);e + snippets)
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

  const result = visualizerService.visualize(code, language);
  res.json({ success: true, ...result });
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

// Code execution endpoint with race condition prevention
app.post('/compile', codeLimiter, asyncHandler(async (req, res) => {
  const { language, code, stdin, roomId, userId, username, correlationId } = req.body;

  const langInfo = languageMap[language];
  if (!langInfo) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported language',
      supportedLanguages: Object.keys(languageMap)
    });
  }

  // Generate correlation ID if not provided
  const execCorrelationId = correlationId || `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Use ExecutionQueueService for proper locking and queuing
    const result = await ExecutionQueueService.executeCode({
      roomId: roomId || 'standalone',
      userId: userId || 'anonymous',
      username: username || 'Anonymous',
      code,
      language,
      stdin: stdin || '',
      correlationId: execCorrelationId,
      priority: 0
    });

    // Record execution in history
    await ExecutionHistory.recordExecution({
      executionId: result.executionId,
      correlationId: execCorrelationId,
      roomId: result.roomId,
      userId: result.userId,
      username: result.username,
      language,
      code,
      stdin: stdin || '',
      output: result.output || '',
      error: result.error,
      success: result.success,
      executionTime: result.executionTime,
      completedAt: new Date(result.timestamp),
      status: result.success ? 'completed' : 'failed'
    });

    res.json(result);
  } catch (error) {
    logger.error('Execution error', { error: error.message, correlationId: execCorrelationId });
    throw new ExternalServiceError(error.message || 'Code execution failed');
  }
}));

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

export { app, server, io };
