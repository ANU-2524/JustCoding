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
const progressRoute = require('./routes/progress');
const challengesRoute = require('./routes/challenges');
const roomRoute = require('./routes/room');
const userRoute = require('./routes/user');
const executionRoute = require('./routes/execution');

// Multi-Language Visualizer Service
const visualizerService = require('./services/visualizer');

const app = express();
const server = http.createServer(app);

// Initialize database connection
connectDB();

// Initialize badges on startup
BadgeService.initializeBadges().catch(err => logger.warn('Badge initialization failed', { error: err.message }));

const userMap = {};
const roomTimers = {};

const FRONTEND_URL = process.env.FRONTEND_URL || "https://just-coding-theta.vercel.app";
const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Security: Request size limiting - increased for code submissions
app.use(express.json({ limit: '50kb' }));

// HTTP Request Logging
app.use(httpLogger);

// Security: Rate limiting
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

  socket.on("send-chat", ({ roomId, username, message }) => {
    socket.to(roomId).emit("receive-chat", { username, message });
  });

  socket.on("typing", ({ roomId, username }) => {
    socket.to(roomId).emit("show-typing", `${username} is typing...`);
  });

  socket.on("disconnect", () => {
    const user = userMap[socket.id];
    if (user) {
      const { username, roomId } = user;
      socket.to(roomId).emit("user-left", `${username} left the room`);
      delete userMap[socket.id];
    }
    logger.info("User disconnected", { odId: socket.id });
  });
});

// Language map for code execution - ALL LANGUAGES
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

// AI routes with security
app.use("/api/gpt", aiLimiter, gptRoute);
app.use("/api/code-quality", codeQualityRoute);
app.use("/api/progress", progressRoute);
app.use("/api/challenges", challengesRoute);

// Room routes 
app.use("/api/room", roomRoute);

// User data sync routes (profil

// Execution history and queue management routes
app.use("/api/execution", executionRoute);e + snippets)
app.use("/api/user", userRoute);

// Multi-Language Visualizer Endpoint - supports JS, Python, Java, C++, Go
app.post('/api/visualizer/visualize', codeLimiter, asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    throw new BadRequestError('Missing required fields: code and language');
  }

  const result = visualizerService.visualize(code, language);
  res.json({ success: true, ...result });
}));

// Get supported languages for visualizer
app.get('/api/visualizer/languages', (req, res) => {
  res.json({
    success: true,
    languages: visualizerService.getSupportedLanguages()
  });
});

// Code execution endpoint with race condition prevention
app.post('/compile', codeLimiter, asyncHandler(async (req, res) => {
  const { language, code, stdin, roomId, userId, username, correlationId } = req.body;

  if (!language || !code) {
    throw new BadRequestError('Missing required fields: language and code');
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
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Server is working!', port: process.env.PORT || 4334 });
});

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4334;
server.listen(PORT, () => {
  logger.info(`🚀 JustCoding Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Setup unhandled rejection handler
setupUnhandledRejectionHandler(server);

module.exports = { app, server };
