/**
 * React Hook for Real-Time Collaboration
 * Handles OT-based collaborative editing with cursor sharing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4334';

export const useCollaboration = (options = {}) => {
  const [socket, setSocket] = useState(null);
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [cursors, setCursors] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  
  const documentRef = useRef({ content: '', version: 0 });
  const pendingOps = useRef([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(API_BASE, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setError(`Connection failed: ${err.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up collaboration event handlers
  useEffect(() => {
    if (!socket) return;

    // User joined
    socket.on('collab:user-joined', (participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    // User left
    socket.on('collab:user-left', ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });

    // Receive operation from others
    socket.on('collab:operation', ({ operation, version, userId }) => {
      // Transform and apply operation
      documentRef.current.version = version;
      
      // Notify parent component
      if (options.onRemoteOperation) {
        options.onRemoteOperation(operation, userId);
      }
    });

    // Cursor updates
    socket.on('collab:cursor', ({ userId, position, selection }) => {
      setCursors(prev => ({
        ...prev,
        [userId]: { position, selection }
      }));
    });

    // Operation acknowledged
    socket.on('collab:ack', ({ operationId, version }) => {
      pendingOps.current = pendingOps.current.filter(op => op.id !== operationId);
      documentRef.current.version = version;
    });

    // Recording events
    socket.on('collab:recording-started', () => {
      setIsRecording(true);
    });

    socket.on('collab:recording-stopped', ({ recordingId }) => {
      setIsRecording(false);
      if (options.onRecordingStopped) {
        options.onRecordingStopped(recordingId);
      }
    });

    // Debug state sync
    socket.on('collab:debug-state', (debugState) => {
      if (options.onDebugStateChange) {
        options.onDebugStateChange(debugState);
      }
    });

    // Error handling
    socket.on('collab:error', ({ error }) => {
      setError(error);
    });

    return () => {
      socket.off('collab:user-joined');
      socket.off('collab:user-left');
      socket.off('collab:operation');
      socket.off('collab:cursor');
      socket.off('collab:ack');
      socket.off('collab:recording-started');
      socket.off('collab:recording-stopped');
      socket.off('collab:debug-state');
      socket.off('collab:error');
    };
  }, [socket, options]);

  // Create a new session
  const createSession = useCallback((sessionOptions = {}) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));

      socket.emit('collab:create', sessionOptions, (response) => {
        if (response.success) {
          setSession(response.session);
          documentRef.current = { content: sessionOptions.initialCode || '', version: 0 };
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Join existing session
  const joinSession = useCallback((sessionId, userInfo = {}) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));

      socket.emit('collab:join', { sessionId, userInfo }, (response) => {
        if (response.success) {
          setSession(response.session);
          setParticipants(response.session.participants);
          setCursors(response.cursors);
          documentRef.current = response.document;
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Send operation
  const sendOperation = useCallback((type, position, data) => {
    if (!socket || !session) return;

    const operation = { type, position, data };
    pendingOps.current.push(operation);

    socket.emit('collab:operation', {
      operation,
      version: documentRef.current.version
    });
  }, [socket, session]);

  // Send cursor position
  const sendCursor = useCallback((position, selection = null) => {
    if (!socket || !session) return;

    socket.emit('collab:cursor', { position, selection });
  }, [socket, session]);

  // Start recording
  const startRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));

      socket.emit('collab:start-recording', (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Stop recording
  const stopRecording = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Not connected'));

      socket.emit('collab:stop-recording', (response) => {
        if (response.success) {
          resolve(response.recordingId);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket]);

  // Send debug state
  const sendDebugState = useCallback((debugState) => {
    if (!socket || !session) return;
    socket.emit('collab:debug-state', debugState);
  }, [socket, session]);

  // Leave session
  const leaveSession = useCallback(() => {
    if (!socket) return;
    
    socket.emit('collab:leave');
    setSession(null);
    setParticipants([]);
    setCursors({});
  }, [socket]);

  return {
    // State
    isConnected,
    session,
    participants,
    cursors,
    isRecording,
    error,
    
    // Actions
    createSession,
    joinSession,
    leaveSession,
    sendOperation,
    sendCursor,
    startRecording,
    stopRecording,
    sendDebugState,
    
    // Refs
    documentVersion: documentRef.current.version
  };
};

export default useCollaboration;
