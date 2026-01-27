// BACKEND: server.js (or index.js)
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

import {
  generalLimiter,
  aiLimiter,
  codeLimiter,
  rateLimitLogger
} from './middleware/simpleRateLimiter.js';
import gptRoute from './routes/gptRoute.js';
import codeQualityRoute from './routes/codeQuality.js';
import progressRoute from './routes/progress.js';
import challengesRoute from './routes/challenges.js';
import roomRoute from './routes/room.js';
import userRoute from './routes/user.js';
import communityRoute from './routes/community.js';

// Multi-Language Visualizer Service
import visualizerServicePkg from './services/visualizer/index.js';
const visualizerService = visualizerServicePkg;

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

  socket.on("join-room", async ({ roomId, username }) => {
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

      logger.info(`${username} joined room ${roomId}`, { username, roomId });
      userMap[socket.id] = { username, roomId };

      socket.emit('code-update', room.code);

      socket.to(roomId).emit("user-joined", `${username} joined the room`);
    } catch (error) {
      logger.error('Error joining room', { error: error.message, roomId });
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);

    if (roomTimers[roomId]) {
      clearTimeout(roomTimers[roomId]);
    }

    roomTimers[roomId] = setTimeout(async () => {
      try {
        await Room.updateOne({ roomId }, { code });
        delete roomTimers[roomId];
      } catch (error) {
        logger.error('Error updating room code', { error: error.message, roomId });
      }
    }, 2000);
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
app.use("/api/community", communityRoute);

// Room routes 
app.use("/api/room", roomRoute);

// User data sync routes (profile + snippets)
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

// Code execution endpoint with security
app.post('/compile', codeLimiter, asyncHandler(async (req, res) => {
  const { language, code, stdin } = req.body;

  if (!language || !code) {
    throw new BadRequestError('Missing required fields: language and code');
  }

  if (code.length > 10000) {
    throw new BadRequestError('Code too long. Maximum 10,000 characters allowed.');
  }

  if (stdin && stdin.length > 1000) {
    throw new BadRequestError('Input too long. Maximum 1,000 characters allowed.');
  }

  const langInfo = languageMap[language];
  if (!langInfo) {
    throw new BadRequestError(`Unsupported language. Supported: ${Object.keys(languageMap).join(', ')}`);
  }

  const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
    language,
    version: langInfo.version,
    stdin: stdin || '',
    files: [{ name: `main.${langInfo.ext}`, content: code }],
  }).catch(err => {
    throw new ExternalServiceError('Code execution service unavailable. Please try again.');
  });

  const output = response.data.run.stdout || response.data.run.stderr || "No output";
  const sanitizedOutput = output.substring(0, 5000);

  res.json({ success: true, output: sanitizedOutput });
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
