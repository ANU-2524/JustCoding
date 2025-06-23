// ✅ BACKEND: server.js (or index.js)
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require("http");
const { Server } = require("socket.io");
const gptRoute = require("./routes/gptRoute.js");

const app = express();
const server = http.createServer(app);

const userMap = {}; // ✅ Store { socketId: { username, roomId } }

const allowedOrigins = [
  "http://localhost:5173",
  "https://just-coding-theta.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

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

// Optional GPT and Compiler routes
const languageMap = {
  javascript: { ext: 'js', version: '18.15.0' },
  python:     { ext: 'py', version: '3.10.0' },
  java:       { ext: 'java', version: '15.0.2' },
  cpp:        { ext: 'cpp', version: '10.2.0' },
};

app.use("/api/gpt", gptRoute);

app.post('/compile', async (req, res) => {
  const { language, code, stdin } = req.body;
  const langInfo = languageMap[language];
  if (!langInfo) return res.status(400).json({ error: 'Unsupported language' });

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version: langInfo.version,
      stdin,
      files: [{ name: `main.${langInfo.ext}`, content: code }],
    });

    res.json({ output: response.data.run.stdout || response.data.run.stderr || "No output" });
  } catch (error) {
    console.error("Compile Error:", error);
    res.status(500).json({ error: 'Execution failed', details: error.message });
  }
});

app.get('/', (req, res) => res.send('🔥 JustCode backend running'));

server.listen(4334, () => console.log("✅ Server running on https://justcoding.onrender.com"));
