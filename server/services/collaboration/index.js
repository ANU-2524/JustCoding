/**
 * Collaboration Service
 * Combines OT engine with session management for real-time collaboration
 */

const { OperationalTransform, Operation } = require('./OperationalTransform');
const SessionManager = require('./SessionManager');

class CollaborationService {
  constructor(io) {
    this.io = io;
    this.ot = new OperationalTransform();
    this.sessions = new SessionManager();
    this.userSockets = new Map(); // socketId -> { sessionId, userId }
  }

  /**
   * Initialize socket handlers for collaboration
   */
  initializeSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[Collab] User connected: ${socket.id}`);

      // Create session
      socket.on('collab:create', (data, callback) => {
        try {
          const sessionId = this.generateSessionId();
          const session = this.sessions.createSession(sessionId, socket.id, data);
          this.ot.initDocument(sessionId, data.initialCode || '');
          
          socket.join(sessionId);
          this.userSockets.set(socket.id, { sessionId, userId: socket.id });

          callback({ success: true, sessionId, session: this.sessions.getSessionInfo(sessionId) });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });

      // Join session
      socket.on('collab:join', (data, callback) => {
        try {
          const { sessionId, userInfo } = data;
          const result = this.sessions.joinSession(sessionId, socket.id, userInfo || {});
          const doc = this.ot.getDocument(sessionId);

          socket.join(sessionId);
          this.userSockets.set(socket.id, { sessionId, userId: socket.id });

          // Notify others
          socket.to(sessionId).emit('collab:user-joined', result.participant);

          callback({
            success: true,
            session: result.session,
            document: {
              content: doc.content,
              version: doc.version
            },
            cursors: this.ot.getCursors(sessionId)
          });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });

      // Handle code operation (insert/delete)
      socket.on('collab:operation', (data) => {
        const userSession = this.userSockets.get(socket.id);
        if (!userSession) return;

        const { sessionId } = userSession;
        const { operation, version } = data;

        try {
          const op = new Operation(
            operation.type,
            operation.position,
            operation.data,
            socket.id
          );

          const result = this.ot.applyOperation(sessionId, op, version);

          // Record if session is recording
          this.sessions.recordEvent(sessionId, 'operation', {
            operation: result.operation,
            userId: socket.id
          });

          // Broadcast to others
          socket.to(sessionId).emit('collab:operation', {
            operation: result.operation,
            version: result.version,
            userId: socket.id
          });

          // Acknowledge to sender
          socket.emit('collab:ack', {
            operationId: op.id,
            version: result.version
          });
        } catch (error) {
          socket.emit('collab:error', { error: error.message });
        }
      });

      // Handle cursor update
      socket.on('collab:cursor', (data) => {
        const userSession = this.userSockets.get(socket.id);
        if (!userSession) return;

        const { sessionId } = userSession;
        const { position, selection } = data;

        const result = this.ot.updateCursor(sessionId, socket.id, position, selection);
        
        if (result) {
          socket.to(sessionId).emit('collab:cursor', {
            userId: socket.id,
            position,
            selection
          });
        }
      });

      // Start recording
      socket.on('collab:start-recording', (callback) => {
        const userSession = this.userSockets.get(socket.id);
        if (!userSession) return callback({ success: false, error: 'Not in session' });

        try {
          this.sessions.startRecording(userSession.sessionId, socket.id);
          this.io.to(userSession.sessionId).emit('collab:recording-started');
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });

      // Stop recording
      socket.on('collab:stop-recording', (callback) => {
        const userSession = this.userSockets.get(socket.id);
        if (!userSession) return callback({ success: false, error: 'Not in session' });

        try {
          const recordingId = this.sessions.stopRecording(userSession.sessionId, socket.id);
          this.io.to(userSession.sessionId).emit('collab:recording-stopped', { recordingId });
          callback({ success: true, recordingId });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });

      // Collaborative debug
      socket.on('collab:debug-state', (data) => {
        const userSession = this.userSockets.get(socket.id);
        if (!userSession) return;

        const debugState = this.sessions.updateDebugState(userSession.sessionId, data);
        socket.to(userSession.sessionId).emit('collab:debug-state', debugState);
      });

      // Leave session
      socket.on('collab:leave', () => {
        this.handleUserLeave(socket);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleUserLeave(socket);
        console.log(`[Collab] User disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Handle user leaving
   */
  handleUserLeave(socket) {
    const userSession = this.userSockets.get(socket.id);
    if (!userSession) return;

    const { sessionId } = userSession;
    
    this.ot.removeCursor(sessionId, socket.id);
    const remaining = this.sessions.leaveSession(sessionId, socket.id);
    
    socket.to(sessionId).emit('collab:user-left', { userId: socket.id });
    socket.leave(sessionId);
    
    this.userSockets.delete(socket.id);

    // Clean up empty sessions
    if (remaining === 0) {
      setTimeout(() => {
        const session = this.sessions.sessions.get(sessionId);
        if (session && session.participants.size === 0) {
          this.ot.deleteDocument(sessionId);
          this.sessions.endSession(sessionId);
        }
      }, 60000);
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get playback data for a recording
   */
  getRecordingPlayback(recordingId) {
    return this.sessions.getRecording(recordingId);
  }
}

module.exports = CollaborationService;
