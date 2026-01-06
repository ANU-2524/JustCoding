// ✅ BACKEND: server.js (or index.js)
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require("http");
const { Server } = require("socket.io");
const { 
  generalLimiter, 
  aiLimiter, 
  codeLimiter, 
  rateLimitLogger 
} = require('./middleware/simpleRateLimiter');
// const usageTracker = require('./middleware/usageTracker');
const gptRoute = require("./routes/gptRoute.js");
const codeQualityRoute = require("./routes/codeQuality.js");

const app = express();
const server = http.createServer(app);

const userMap = {}; // ✅ Store { socketId: { username, roomId } }

// Allow frontend origin from env (set FRONTEND_URL in your hosting),
// fallback to the previously used Vercel domain. Keep localhost for local dev.
const FRONTEND_URL = process.env.FRONTEND_URL || "https://just-coding-theta.vercel.app";
const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Security: Request size limiting
app.use(express.json({ limit: '2kb' }));

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

// Optional GPT and Compiler routes
const languageMap = {
  javascript: { ext: 'js', version: '18.15.0' },
  python:     { ext: 'py', version: '3.10.0' },
  java:       { ext: 'java', version: '15.0.2' },
  cpp:        { ext: 'cpp', version: '10.2.0' },
};

// AI routes with security
app.use("/api/gpt", aiLimiter, gptRoute);
app.use("/api/code-quality", codeQualityRoute);

// ✅ Enhanced visualizer endpoint with rate limiting
app.post('/api/visualizer/visualize', codeLimiter, (req, res) => {
  const { code, language } = req.body;
  
  if (language !== 'javascript') {
    return res.status(400).json({ error: 'Only JavaScript supported currently' });
  }
  
  try {
    const execution = parseJavaScriptCode(code);
    res.json({
      success: true,
      totalSteps: execution.length,
      execution
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: 'Code parsing failed: ' + error.message 
    });
  }
});

function parseJavaScriptCode(code) {
  const lines = code.split('\n');
  const execution = [];
  const variables = {};
  const callStack = [];
  let stepId = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;
    
    const step = {
      stepId: stepId++,
      lineNumber: i + 1,
      code: line,
      type: getStatementType(line),
      variables: JSON.parse(JSON.stringify(variables)),
      callStack: [...callStack],
      output: null
    };
    
    // Variable declarations
    const varDecl = line.match(/(let|const|var)\s+(\w+)\s*=\s*(.+);?/);
    if (varDecl) {
      const [, , varName, valueExpr] = varDecl;
      const value = evaluateExpression(valueExpr.replace(/;$/, ''), variables);
      variables[varName] = {
        value: value.value,
        type: value.type,
        memory: `0x${Math.random().toString(16).substr(2, 6)}`
      };
    }
    
    // Assignments
    const assignment = line.match(/(\w+)\s*=\s*(.+);?/);
    if (assignment && !varDecl) {
      const [, varName, valueExpr] = assignment;
      if (variables[varName]) {
        const value = evaluateExpression(valueExpr.replace(/;$/, ''), variables);
        variables[varName].value = value.value;
        variables[varName].type = value.type;
      }
    }
    
    // Console.log statements
    const consoleLog = line.match(/console\.log\((.+)\);?/);
    if (consoleLog) {
      const expr = consoleLog[1];
      const result = evaluateExpression(expr, variables);
      step.output = result.value;
    }
    
    // If statements
    if (line.includes('if')) {
      const condition = line.match(/if\s*\((.+)\)/);
      if (condition) {
        const result = evaluateExpression(condition[1], variables);
        step.conditionResult = result.value;
      }
    }
    
    execution.push(step);
  }
  
  return execution;
}

function evaluateExpression(expr, variables) {
  expr = expr.trim();
  
  // String literals
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return { value: expr.slice(1, -1), type: 'string' };
  }
  if (expr.startsWith("'") && expr.endsWith("'")) {
    return { value: expr.slice(1, -1), type: 'string' };
  }
  
  // Numbers
  if (/^\d+(\.\d+)?$/.test(expr)) {
    return { value: parseFloat(expr), type: 'number' };
  }
  
  // Booleans
  if (expr === 'true' || expr === 'false') {
    return { value: expr === 'true', type: 'boolean' };
  }
  
  // Variables
  if (variables[expr]) {
    return { value: variables[expr].value, type: variables[expr].type };
  }
  
  // Simple arithmetic
  const arithmetic = expr.match(/(\w+)\s*([+\-*/])\s*(\w+|\d+)/);
  if (arithmetic) {
    const [, left, op, right] = arithmetic;
    const leftVal = variables[left] ? variables[left].value : parseFloat(left);
    const rightVal = variables[right] ? variables[right].value : parseFloat(right);
    
    let result;
    switch (op) {
      case '+': result = leftVal + rightVal; break;
      case '-': result = leftVal - rightVal; break;
      case '*': result = leftVal * rightVal; break;
      case '/': result = leftVal / rightVal; break;
      default: result = leftVal;
    }
    return { value: result, type: 'number' };
  }
  
  // Comparisons
  const comparison = expr.match(/(\w+|\d+)\s*(>=|<=|==|!=|>|<)\s*(\w+|\d+)/);
  if (comparison) {
    const [, left, op, right] = comparison;
    const leftVal = variables[left] ? variables[left].value : parseFloat(left);
    const rightVal = variables[right] ? variables[right].value : parseFloat(right);
    
    let result;
    switch (op) {
      case '>=': result = leftVal >= rightVal; break;
      case '<=': result = leftVal <= rightVal; break;
      case '==': result = leftVal == rightVal; break;
      case '!=': result = leftVal != rightVal; break;
      case '>': result = leftVal > rightVal; break;
      case '<': result = leftVal < rightVal; break;
      default: result = false;
    }
    return { value: result, type: 'boolean' };
  }
  
  // String concatenation
  if (expr.includes('+') && expr.includes('"')) {
    const parts = expr.split('+').map(p => p.trim());
    let result = '';
    for (const part of parts) {
      if (part.startsWith('"') && part.endsWith('"')) {
        result += part.slice(1, -1);
      } else if (variables[part]) {
        result += variables[part].value;
      } else {
        result += part;
      }
    }
    return { value: result, type: 'string' };
  }
  
  return { value: expr, type: 'unknown' };
}

function getStatementType(line) {
  if (line.includes('let') || line.includes('const') || line.includes('var')) return 'declaration';
  if (line.includes('if') || line.includes('else')) return 'conditional';
  if (line.includes('for') || line.includes('while')) return 'loop';
  if (line.includes('function')) return 'function';
  if (line.includes('console.log')) return 'output';
  if (line.includes('=') && !line.includes('==') && !line.includes('>=') && !line.includes('<=')) return 'assignment';
  return 'expression';
}

// Code execution endpoint with security
app.post('/compile', codeLimiter, async (req, res) => {
  const { language, code, stdin } = req.body;
  
  // Input validation
  if (!language || !code) {
    return res.status(400).json({ 
      error: 'Missing required fields: language and code' 
    });
  }
  
  // Code length validation
  if (code.length > 10000) {
    return res.status(400).json({ 
      error: 'Code too long. Maximum 10,000 characters allowed.' 
    });
  }
  
  // Input validation
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

    // ✅ Sanitize output
    const output = response.data.run.stdout || response.data.run.stderr || "No output";
    const sanitizedOutput = output.substring(0, 5000); // Limit output size
    
    res.json({ output: sanitizedOutput });
  } catch (error) {
    console.error("Compile Error:", error.message);
    res.status(500).json({ 
      error: 'Code execution failed. Please try again.',
      tip: 'Check your code for syntax errors.'
    });
  }
});

app.get('/', (req, res) => res.send('🔥 JustCode backend running with enhanced visualizer'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', port: process.env.PORT || 4334 });
});

server.listen(process.env.PORT || 4334, () => console.log(`✅ JustCode Server with Enhanced Visualizer running on port ${process.env.PORT || 4334}`));
