/**
 * Socket.IO Configuration and Event Handlers
 * Extracted from main index.js for better modularity
 */
const { Server } = require('socket.io');
const Room = require('../models/Room');
const { socketCorsOptions } = require('../config/security');

// In-memory user tracking
const userMap = {};
const roomTimers = {};

/**
 * Initialize Socket.IO server with event handlers
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: socketCorsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    // Handle room joining
    socket.on("join-room", async ({ roomId, username }) => {
      try {
        await handleJoinRoom(socket, roomId, username);
      } catch (error) {
        console.error('Error in join-room handler:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle code changes with debounced persistence
    socket.on("code-change", ({ roomId, code }) => {
      handleCodeChange(socket, roomId, code);
    });

    // Handle chat messages
    socket.on("send-chat", ({ roomId, username, message }) => {
      handleChatMessage(socket, roomId, username, message);
    });

    // Handle typing indicators
    socket.on("typing", ({ roomId, username }) => {
      socket.to(roomId).emit("show-typing", `${username} is typing...`);
    });

    // Handle cursor position updates for collaborative editing
    socket.on("cursor-update", ({ roomId, username, position }) => {
      socket.to(roomId).emit("cursor-move", { username, position, odId: socket.id });
    });

    // Handle language change in room
    socket.on("language-change", async ({ roomId, language }) => {
      try {
        await Room.updateOne({ roomId }, { language });
        socket.to(roomId).emit("language-update", language);
      } catch (error) {
        console.error('Error updating language:', error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      handleDisconnect(socket);
    });
  });

  return io;
}

/**
 * Handle user joining a room
 */
async function handleJoinRoom(socket, roomId, username) {
  socket.join(roomId);

  let room = await Room.findOne({ roomId });
  if (!room) {
    room = await Room.create({
      roomId,
      code: "// Welcome to JustCoding\n// Start coding here...",
      language: "javascript",
    });
  }

  console.log(`${username} joined room ${roomId}`);
  userMap[socket.id] = { username, roomId };

  // Send current room state to the joining user
  socket.emit('code-update', room.code);
  socket.emit('language-update', room.language);

  // Notify other users in the room
  socket.to(roomId).emit("user-joined", `${username} joined the room`);

  // Send list of current users in room
  const usersInRoom = Object.entries(userMap)
    .filter(([_, data]) => data.roomId === roomId)
    .map(([id, data]) => ({ odId: id, username: data.username }));
  
  socket.emit('room-users', usersInRoom);
  socket.to(roomId).emit('user-list-update', usersInRoom);
}

/**
 * Handle code changes with debounced database persistence
 */
function handleCodeChange(socket, roomId, code) {
  // Broadcast to other users immediately
  socket.to(roomId).emit("code-update", code);

  // Debounce database saves
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
  }

  roomTimers[roomId] = setTimeout(async () => {
    try {
      await Room.updateOne({ roomId }, { code, updatedAt: new Date() });
      delete roomTimers[roomId];
    } catch (error) {
      console.error('Error updating room code:', error);
    }
  }, 2000);
}

/**
 * Handle chat messages with basic sanitization
 */
function handleChatMessage(socket, roomId, username, message) {
  // Basic message sanitization
  const sanitizedMessage = message
    .substring(0, 1000) // Limit message length
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  socket.to(roomId).emit("receive-chat", {
    username,
    message: sanitizedMessage,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle user disconnection
 */
function handleDisconnect(socket) {
  const user = userMap[socket.id];
  if (user) {
    const { username, roomId } = user;
    socket.to(roomId).emit("user-left", `${username} left the room`);
    
    // Update user list for remaining users
    delete userMap[socket.id];
    const usersInRoom = Object.entries(userMap)
      .filter(([_, data]) => data.roomId === roomId)
      .map(([id, data]) => ({ odId: id, username: data.username }));
    
    socket.to(roomId).emit('user-list-update', usersInRoom);
  }
  console.log("User disconnected", socket.id);
}

/**
 * Get users currently in a room
 */
function getRoomUsers(roomId) {
  return Object.entries(userMap)
    .filter(([_, data]) => data.roomId === roomId)
    .map(([id, data]) => ({ odId: id, username: data.username }));
}

/**
 * Cleanup function for graceful shutdown
 */
function cleanup() {
  // Clear all pending room timers
  Object.keys(roomTimers).forEach(roomId => {
    clearTimeout(roomTimers[roomId]);
    delete roomTimers[roomId];
  });
}

module.exports = {
  initializeSocket,
  getRoomUsers,
  cleanup
};
