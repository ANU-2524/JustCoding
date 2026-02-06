import initCollabSocket from './socket/collab.js';
import forumRoutes from './routes/forum.js';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import connectDB from './config/database.js';
import BadgeService from './services/BadgeService.js';
import Room from './models/Room.js';
import ExecutionQueueService from './services/ExecutionQueueService.js';
import ExecutionHistory from './models/ExecutionHistory.js';
import MessageOrderingService from './services/MessageOrderingService.js';
import MessageHistoryModel from './models/MessageHistory.js';


import { logger, httpLogger } from './services/logger.js';

import {
  errorHandler,
  notFoundHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler
} from './middleware/error.js';

import { asyncHandler } from './middleware/async.js';
import { BadRequestError, ExternalServiceError } from './utils/ErrorResponse.js';

// Setup uncaught exception handler early
setupUncaughtExceptionHandler();

import {
  generalLimiter,
  aiLimiter,
  codeLimiter,
  rateLimitLogger
} from './middleware/simpleRateLimiter.js';

import codeQualityRoute from './routes/codeQuality.js';
import analysisRoute from './routes/analysis.js';
import progressRoute from './routes/progress.js';
import challengesRoute from './routes/challenges.js';
import roomRoute from './routes/room.js';
import userRoute from './routes/user.js';
import executionRoute from './routes/execution.js';
import collabRoutes from './routes/collab.js';
import diagnosticsRoute from './routes/diagnostics.js';
import imagesRoute from './routes/images.js';

import { validate } from './middleware/validation.js';
import gptRoute from './routes/gptRoute.js';
import communityRoute from './routes/community.js';
import tutorialsRoute from './routes/tutorials.js';
import authRoute from './routes/auth.routes.js';
import { applySecurityMiddleware } from './config/security.js';

// Socket.IO (modularized)
import socketModule from './socket/index.js';
const { initializeSocket, cleanup: socketCleanup } = socketModule;

// Multi-Language Visualizer Service
import visualizerServicePkg from './services/visualizer/index.js';
const visualizerService = visualizerServicePkg;

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Global variables for WebSocket management
const userMap = {};
const roomTimers = {};
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

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

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

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

      // Initialize message ordering for this room
      const nextSequence = room.messageSequence + 1;
      MessageOrderingService.initializeRoom(roomId, room.messageSequence);

      // Send initial room state with sequence number
      const sequence = room.getNextSequence();
      await room.save();

      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        sequence,
        executionState: room.executionState,
        nextExpectedSequence: MessageOrderingService.getExpectedSequence(roomId)
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
      const user = userMap[socket.id] || {};
      
      // Process message through ordering service
      const result = MessageOrderingService.processMessage(roomId, {
        type: 'code-change',
        code,
        username: user.username,
        userId: user.userId
      }, sequence);

      if (!result.isValid && !result.buffered) {
        logger.warn('Invalid code-change message', {
          roomId,
          sequence,
          error: result.error
        });
        return;
      }

      if (result.buffered) {
        logger.debug('Code-change message buffered (out of order)', {
          roomId,
          sequence,
          missingSince: result.missingSince
        });

        // Notify client about missing messages
        socket.emit('sequence-gap-detected', {
          expectedSequence: result.missingSince,
          receivedSequence: sequence
        });
        return;
      }

      // Process all ordered messages
      for (const orderedMsg of result.orderedMessages) {
        if (orderedMsg.type === 'code-change') {
          // Broadcast to other users immediately
          socket.to(roomId).emit("code-update", {
            code: orderedMsg.code,
            sequence: orderedMsg.sequence,
            username: orderedMsg.username
          });

          // Debounce database save
          if (roomTimers[roomId]) {
            clearTimeout(roomTimers[roomId]);
          }

          roomTimers[roomId] = setTimeout(async () => {
            try {
              const room = await Room.findOne({ roomId });
              if (room) {
                // Record code change with causality tracking
                await room.recordCodeChange(orderedMsg.code, orderedMsg.sequence);
              }

              // Record in message history
              await MessageHistoryModel.recordMessage({
                roomId,
                sequence: orderedMsg.sequence,
                messageType: 'code-change',
                userId: orderedMsg.userId,
                username: orderedMsg.username,
                payload: { code: orderedMsg.code },
                socketId: socket.id
              });

              delete roomTimers[roomId];
            } catch (error) {
              logger.error('Error saving code change', { error: error.message, roomId });
              delete roomTimers[roomId];
            }
          }, 2000);
        }
      }
    } catch (error) {
      logger.error('Error processing code change', { error: error.message, roomId });
      socket.emit('error', { message: 'Failed to process code change' });
    }
  });

  socket.on("disconnect", () => {
    logger.info("User disconnected", { socketId: socket.id });
    
    const user = userMap[socket.id];
    if (user) {
      const { roomId } = user;
      // Check if room is now empty and clean up
      const io_adapter = io.sockets.adapter;
      const room_sockets = io_adapter.rooms.get(roomId);
      
      if (!room_sockets || room_sockets.size === 0) {
        logger.info('Room is now empty, cleaning up message ordering', { roomId });
        MessageOrderingService.cleanupRoom(roomId);
      }
    }
    
    delete userMap[socket.id];
  });

  socket.on("execute-code", async ({ roomId, code, language, stdin, userId, username, sequence, codeChangeSequence }) => {
    try {
      const user = userMap[socket.id];
      const execUserId = userId || user?.userId || socket.id;
      const execUsername = username || user?.username || 'Anonymous';
      const correlationId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      logger.info('WebSocket execution request', {
        roomId,
        userId: execUserId,
        language,
        sequence,
        codeChangeSequence,
        correlationId
      });

      // Process message through ordering service
      const result = MessageOrderingService.processMessage(roomId, {
        type: 'code-execute',
        code,
        language,
        stdin: stdin || '',
        username: execUsername,
        userId: execUserId
      }, sequence);

      if (!result.isValid && !result.buffered) {
        logger.warn('Invalid execute-code message', {
          roomId,
          sequence,
          error: result.error
        });
        
        socket.emit("execution-result", {
          success: false,
          error: result.error,
          correlationId,
          roomId
        });
        return;
      }

      if (result.buffered) {
        logger.debug('Execute-code message buffered (waiting for ordering)', {
          roomId,
          sequence,
          missingSince: result.missingSince
        });

        socket.emit('sequence-gap-detected', {
          expectedSequence: result.missingSince,
          receivedSequence: sequence,
          type: 'execution'
        });
        return;
      }

      // Process all ordered messages
      for (const orderedMsg of result.orderedMessages) {
        if (orderedMsg.type === 'code-execute') {
          // Get room to verify code state
          const room = await Room.findOne({ roomId });
          if (!room) {
            throw new Error('Room not found');
          }

          // Validate execution can proceed
          const validation = room.validateMessageSequence('code-execute', orderedMsg.sequence, {
            codeChangeSequence: codeChangeSequence || 0
          });

          if (!validation.executionAllowed) {
            logger.warn('Execution blocked due to sequence validation', {
              roomId,
              sequence: orderedMsg.sequence,
              issues: validation.issues
            });

            socket.emit("execution-result", {
              success: false,
              error: 'Cannot execute: code state not ready',
              correlationId,
              roomId
            });
            continue;
          }

          // Emit execution started event
          io.to(roomId).emit("execution-started", {
            userId: orderedMsg.userId,
            username: orderedMsg.username,
            correlationId,
            sequence: orderedMsg.sequence,
            timestamp: new Date().toISOString()
          });

          // Execute code through queue service
          const execResult = await ExecutionQueueService.executeCode({
            roomId,
            userId: orderedMsg.userId,
            username: orderedMsg.username,
            code: orderedMsg.code,
            language: orderedMsg.language,
            stdin: orderedMsg.stdin,
            correlationId,
            priority: 0,
            sequence: orderedMsg.sequence
          });

          // Record execution with causality
          const codeHash = room._hashCode(orderedMsg.code);
          await room.recordExecution(execResult.executionId, orderedMsg.sequence, codeHash);

          // Record execution in history
          await ExecutionHistory.recordExecution({
            executionId: execResult.executionId,
            correlationId,
            roomId,
            userId: orderedMsg.userId,
            username: orderedMsg.username,
            language: orderedMsg.language,
            code: orderedMsg.code,
            stdin: orderedMsg.stdin || '',
            output: execResult.output || '',
            error: execResult.error,
            success: execResult.success,
            executionTime: execResult.executionTime,
            completedAt: new Date(execResult.timestamp),
            status: execResult.success ? 'completed' : 'failed',
            sequence: orderedMsg.sequence
          });

          // Record in message history
          await MessageHistoryModel.recordMessage({
            roomId,
            sequence: orderedMsg.sequence,
            messageType: 'code-execute',
            userId: orderedMsg.userId,
            username: orderedMsg.username,
            payload: { language: orderedMsg.language, codeLength: orderedMsg.code?.length || 0 },
            correlationId,
            socketId: socket.id
          });

          // Emit result to all users in room
          io.to(roomId).emit("execution-result", {
            ...execResult,
            correlationId,
            sequence: orderedMsg.sequence
          });

          logger.info('WebSocket execution completed', {
            roomId,
            userId: orderedMsg.userId,
            success: execResult.success,
            correlationId,
            sequence: orderedMsg.sequence
          });
        }
      }
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

// Auth routes
app.use("/api/auth", authRoute);

// AI routes with security and rate limiting
app.use("/api/gpt", aiLimiter, gptRoute);

// Code quality route
app.use("/api/code-quality", codeQualityRoute);
app.use("/api/analysis", analysisRoute); // New pluggable code quality analysis system
app.use("/api/progress", progressRoute);

// Challenges routes
app.use("/api/challenges", challengesRoute);
app.use("/api/community", communityRoute);

// Tutorials routes
app.use("/api/tutorials", tutorialsRoute);

// Room routes
app.use("/api/room", roomRoute);

// User data sync routes (profile + snippets)
app.use("/api/user", userRoute);

// Execution history and queue management routes
app.use("/api/execution", executionRoute);
app.use('/api/forum', forumRoutes);

// After forumRoutes registration:
app.use('/api/collab', collabRoutes);

// Diagnostics and monitoring routes
app.use('/api/diagnostics', diagnosticsRoute);

// Image gallery and upload routes
app.use('/api/images', imagesRoute);

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

// After io is created:
initCollabSocket(io);
