/**
 * Collaboration Session Manager
 * Manages real-time collaboration sessions with recording/playback
 */

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.recordings = new Map();
  }

  /**
   * Create a new collaboration session
   */
  createSession(sessionId, hostId, options = {}) {
    const session = {
      id: sessionId,
      hostId,
      participants: new Map(),
      createdAt: Date.now(),
      language: options.language || 'javascript',
      title: options.title || 'Untitled Session',
      isRecording: false,
      recording: [],
      debugState: null,
      settings: {
        maxParticipants: options.maxParticipants || 10,
        allowAnonymous: options.allowAnonymous || false,
        readOnly: options.readOnly || false
      }
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Join a session
   */
  joinSession(sessionId, userId, userInfo) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.participants.size >= session.settings.maxParticipants) {
      throw new Error('Session is full');
    }

    const participant = {
      id: userId,
      username: userInfo.username || `User-${userId.slice(0, 6)}`,
      color: this.generateUserColor(session.participants.size),
      joinedAt: Date.now(),
      cursor: { position: 0, selection: null },
      isActive: true
    };

    session.participants.set(userId, participant);

    // Record join event if recording
    if (session.isRecording) {
      this.recordEvent(sessionId, 'user_join', { userId, userInfo });
    }

    return {
      session: this.getSessionInfo(sessionId),
      participant
    };
  }

  /**
   * Leave a session
   */
  leaveSession(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.participants.delete(userId);

    // Record leave event
    if (session.isRecording) {
      this.recordEvent(sessionId, 'user_leave', { userId });
    }

    // Clean up empty sessions (except host)
    if (session.participants.size === 0) {
      setTimeout(() => {
        const s = this.sessions.get(sessionId);
        if (s && s.participants.size === 0) {
          this.endSession(sessionId);
        }
      }, 30000); // 30 second grace period
    }

    return session.participants.size;
  }

  /**
   * Get session info (safe for clients)
   */
  getSessionInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      id: session.id,
      hostId: session.hostId,
      title: session.title,
      language: session.language,
      participantCount: session.participants.size,
      participants: Array.from(session.participants.values()).map(p => ({
        id: p.id,
        username: p.username,
        color: p.color,
        isActive: p.isActive
      })),
      isRecording: session.isRecording,
      createdAt: session.createdAt,
      settings: session.settings
    };
  }

  /**
   * Start recording session
   */
  startRecording(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.hostId !== userId) throw new Error('Only host can start recording');

    session.isRecording = true;
    session.recording = [];
    session.recordingStartedAt = Date.now();

    this.recordEvent(sessionId, 'recording_start', {});
    return true;
  }

  /**
   * Stop recording and save
   */
  stopRecording(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    if (session.hostId !== userId) throw new Error('Only host can stop recording');

    session.isRecording = false;
    this.recordEvent(sessionId, 'recording_stop', {});

    // Save recording
    const recordingId = `rec-${sessionId}-${Date.now()}`;
    this.recordings.set(recordingId, {
      id: recordingId,
      sessionId,
      events: [...session.recording],
      duration: Date.now() - session.recordingStartedAt,
      createdAt: Date.now()
    });

    session.recording = [];
    return recordingId;
  }

  /**
   * Record an event
   */
  recordEvent(sessionId, eventType, data) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isRecording) return;

    session.recording.push({
      type: eventType,
      data,
      timestamp: Date.now() - session.recordingStartedAt
    });
  }

  /**
   * Get recording for playback
   */
  getRecording(recordingId) {
    return this.recordings.get(recordingId);
  }

  /**
   * Update collaborative debug state
   */
  updateDebugState(sessionId, debugState) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.debugState = {
      ...debugState,
      updatedAt: Date.now()
    };

    if (session.isRecording) {
      this.recordEvent(sessionId, 'debug_state', debugState);
    }

    return session.debugState;
  }

  /**
   * End session
   */
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Stop recording if active
    if (session.isRecording) {
      this.stopRecording(sessionId, session.hostId);
    }

    this.sessions.delete(sessionId);
    return true;
  }

  /**
   * Generate unique color for user
   */
  generateUserColor(index) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
    ];
    return colors[index % colors.length];
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount() {
    return this.sessions.size;
  }

  /**
   * List all active sessions (for admin)
   */
  listSessions() {
    return Array.from(this.sessions.values()).map(s => this.getSessionInfo(s.id));
  }
}

module.exports = SessionManager;
