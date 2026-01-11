// BACKEND: server.js (or index.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require('./config/database');
const BadgeService = require('./services/BadgeService');
const {
  generalLimiter, 
  aiLimiter, 
  codeLimiter, 
  rateLimitLogger 
} = require('./middleware/simpleRateLimiter');
const gptRoute = require("./routes/gptRoute.js");
const codeQualityRoute = require("./routes/codeQuality.js");
const progressRoute = require("./routes/progress.js");

// Multi-Language Visualizer Service
const visualizerService = require('./services/visualizer');

const app = express();
const server = http.createServer(app);

// Initialize database connection
connectDB();

// Initialize badges on startup
BadgeService.initializeBadges().catch(console.error);

const userMap = {};

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
  console.log("User connected", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`${username} joined room ${roomId}`);
    userMap[socket.id] = { username, roomId };
    socket.to(roomId).emit("user-joined", `${username} joined the room`);
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
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
    console.log("User disconnected", socket.id);
  });
});

// Language map for code execution - ALL LANGUAGES
const languageMap = {
  javascript: { ext: 'js', version: '18.15.0' },
  python:     { ext: 'py', version: '3.10.0' },
  java:       { ext: 'java', version: '15.0.2' },
  cpp:        { ext: 'cpp', version: '10.2.0' },
  c:          { ext: 'c', version: '10.2.0' },
  go:         { ext: 'go', version: '1.16.2' },
  ruby:       { ext: 'rb', version: '3.0.1' },
  php:        { ext: 'php', version: '8.2.3' },
  swift:      { ext: 'swift', version: '5.3.3' },
  rust:       { ext: 'rs', version: '1.68.2' },
  typescript: { ext: 'ts', version: '5.0.3' },
};

// AI routes with security
app.use("/api/gpt", aiLimiter, gptRoute);
app.use("/api/code-quality", codeQualityRoute);
app.use("/api/progress", progressRoute);

// Multi-Language Visualizer Endpoint - supports JS, Python, Java, C++, Go
app.post('/api/visualizer/visualize', codeLimiter, (req, res) => {
  const { code, language } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: code and language' 
    });
  }
  
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

// Get supported languages for visualizer
app.get('/api/visualizer/languages', (req, res) => {
  res.json({
    success: true,
    languages: visualizerService.getSupportedLanguages()
  });
});

// Code execution endpoint with security
app.post('/compile', codeLimiter, async (req, res) => {
  const { language, code, stdin } = req.body;
  
  if (!language || !code) {
    return res.status(400).json({ 
      error: 'Missing required fields: language and code' 
    });
  }
  
  if (code.length > 10000) {
    return res.status(400).json({ 
      error: 'Code too long. Maximum 10,000 characters allowed.' 
    });
  }
  
  if (stdin && stdin.length > 1000) {
    return res.status(400).json({ 
      error: 'Input too long. Maximum 1,000 characters allowed.' 
    });
  }
  
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

app.get('/', (req, res) => res.send('JustCode backend with Multi-Language Visualizer'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', port: process.env.PORT || 4334 });
});

server.listen(process.env.PORT || 4334, () => console.log(`JustCode Server running on port ${process.env.PORT || 4334}`));
