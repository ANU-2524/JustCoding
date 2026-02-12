/**
 * MessageOrderingService - Ensures ordered delivery of collaborative messages
 * Prevents race conditions in collaborative editing by maintaining message sequences per room
 * 
 * Features:
 * - Server-side sequence tracking for each room
 * - Out-of-order message buffering and replay
 * - Timeout handling for missing messages
 * - Causality preservation for code changes and executions
 */

import { logger } from './logger.js';

class MessageOrderingService {
  constructor() {
    // roomId -> { expectedSequence, pendingMessages, lastReceivedAt }
    this.roomStates = new Map();
    
    // roomId -> timeoutId (for cleaning up stale buffers)
    this.cleanupTimeouts = new Map();
    
    // Configuration
    this.MESSAGE_BUFFER_TIMEOUT = 30000; // 30 seconds to wait for missing messages
    this.MAX_BUFFER_SIZE = 1000; // Max buffered messages per room
  }

  /**
   * Initialize room tracking
   */
  initializeRoom(roomId, startSequence = 0) {
    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {
        expectedSequence: startSequence + 1,
        pendingMessages: new Map(), // sequence -> message
        lastReceivedAt: Date.now(),
        isVirgin: true // First message sets baseline
      });
      
      logger.debug('Room initialized for message ordering', { roomId, startSequence });
    }
  }

  /**
   * Process incoming message with sequence validation
   * Returns: { isValid, orderedMessages, missingSince }
   * - isValid: Whether the message was in sequence
   * - orderedMessages: Array of messages ready to process (in order)
   * - missingSince: Sequence number of first missing message (if any)
   */
  processMessage(roomId, message, sequence) {
    if (!sequence && sequence !== 0) {
      logger.warn('Message received without sequence number', { roomId, messageType: message.type });
      return { isValid: false, orderedMessages: [], error: 'Missing sequence number' };
    }

    // Initialize room if needed
    if (!this.roomStates.has(roomId)) {
      this.initializeRoom(roomId, sequence - 1);
    }

    const roomState = this.roomStates.get(roomId);
    const { expectedSequence, pendingMessages } = roomState;

    logger.debug('Processing message with sequence', {
      roomId,
      sequence,
      expectedSequence,
      messageType: message.type
    });

    // Message is in order
    if (sequence === expectedSequence) {
      const orderedMessages = [{ ...message, sequence }];
      roomState.expectedSequence = sequence + 1;
      roomState.lastReceivedAt = Date.now();

      // Check if we can now process any pending messages
      while (pendingMessages.has(roomState.expectedSequence)) {
        const pendingMsg = pendingMessages.get(roomState.expectedSequence);
        orderedMessages.push(pendingMsg);
        pendingMessages.delete(roomState.expectedSequence);
        roomState.expectedSequence += 1;
      }

      // Reset cleanup timeout since we successfully processed a message
      this.scheduleCleanup(roomId);

      return {
        isValid: true,
        orderedMessages,
        missingSince: null
      };
    }

    // Message is out of order
    if (sequence > expectedSequence) {
      logger.debug('Out-of-order message received, buffering', {
        roomId,
        sequence,
        expectedSequence,
        gap: sequence - expectedSequence
      });

      // Check buffer size
      if (pendingMessages.size >= this.MAX_BUFFER_SIZE) {
        logger.warn('Message buffer overflow, discarding old message', { roomId });
        // Remove oldest message
        const oldestSeq = Math.min(...pendingMessages.keys());
        pendingMessages.delete(oldestSeq);
      }

      // Buffer the message
      pendingMessages.set(sequence, { ...message, sequence, bufferedAt: Date.now() });

      // Schedule cleanup if not already scheduled
      this.scheduleCleanup(roomId);

      return {
        isValid: false,
        orderedMessages: [],
        missingSince: expectedSequence,
        buffered: true
      };
    }

    // Message is old (already processed)
    if (sequence < expectedSequence) {
      logger.warn('Duplicate or late message received, ignoring', {
        roomId,
        sequence,
        expectedSequence,
        delay: expectedSequence - sequence
      });

      return {
        isValid: false,
        orderedMessages: [],
        error: 'Message already processed',
        isDuplicate: true
      };
    }
  }

  /**
   * Get room's current expected sequence
   */
  getExpectedSequence(roomId) {
    if (!this.roomStates.has(roomId)) {
      return 0;
    }
    return this.roomStates.get(roomId).expectedSequence;
  }

  /**
   * Get buffered messages for a room
   */
  getBufferedMessages(roomId) {
    if (!this.roomStates.has(roomId)) {
      return [];
    }
    const { pendingMessages } = this.roomStates.get(roomId);
    return Array.from(pendingMessages.values()).sort((a, b) => a.sequence - b.sequence);
  }

  /**
   * Force advance sequence (when gap is too large)
   * This simulates that missing messages have arrived but were empty
   */
  forceAdvanceSequence(roomId, toSequence) {
    if (!this.roomStates.has(roomId)) {
      this.initializeRoom(roomId, toSequence - 1);
      return;
    }

    const roomState = this.roomStates.get(roomId);
    const { pendingMessages } = roomState;

    logger.warn('Force advancing sequence due to timeout', {
      roomId,
      from: roomState.expectedSequence,
      to: toSequence
    });

    // Clear all pending messages between expected and toSequence
    for (let seq = roomState.expectedSequence; seq < toSequence; seq++) {
      pendingMessages.delete(seq);
    }

    roomState.expectedSequence = toSequence;

    // Check if we can process any pending messages after the jump
    while (pendingMessages.has(roomState.expectedSequence)) {
      const pendingMsg = pendingMessages.get(roomState.expectedSequence);
      logger.debug('Processing buffered message after gap recovery', {
        roomId,
        sequence: roomState.expectedSequence
      });
      pendingMessages.delete(roomState.expectedSequence);
      roomState.expectedSequence += 1;
    }
  }

  /**
   * Get room state for diagnostics
   */
  getRoomState(roomId) {
    if (!this.roomStates.has(roomId)) {
      return null;
    }

    const state = this.roomStates.get(roomId);
    return {
      expectedSequence: state.expectedSequence,
      pendingMessageCount: state.pendingMessages.size,
      bufferedSequences: Array.from(state.pendingMessages.keys()).sort((a, b) => a - b),
      lastReceivedAt: state.lastReceivedAt,
      age: Date.now() - state.lastReceivedAt
    };
  }

  /**
   * Clean up room state (called when room is destroyed)
   */
  cleanupRoom(roomId) {
    if (this.cleanupTimeouts.has(roomId)) {
      clearTimeout(this.cleanupTimeouts.get(roomId));
      this.cleanupTimeouts.delete(roomId);
    }
    this.roomStates.delete(roomId);
    logger.debug('Room cleanup completed', { roomId });
  }

  /**
   * Schedule cleanup if room has no activity
   */
  scheduleCleanup(roomId) {
    // Clear existing timeout
    if (this.cleanupTimeouts.has(roomId)) {
      clearTimeout(this.cleanupTimeouts.get(roomId));
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      const roomState = this.roomStates.get(roomId);
      if (roomState) {
        const age = Date.now() - roomState.lastReceivedAt;

        if (age > this.MESSAGE_BUFFER_TIMEOUT * 2) {
          logger.info('Room cleaned up due to inactivity', {
            roomId,
            age,
            pendingMessages: roomState.pendingMessages.size
          });

          this.cleanupRoom(roomId);
        }
      }
    }, this.MESSAGE_BUFFER_TIMEOUT * 2);

    this.cleanupTimeouts.set(roomId, timeoutId);
  }

  /**
   * Force cleanup all rooms (for graceful shutdown)
   */
  cleanupAll() {
    for (const roomId of this.roomStates.keys()) {
      this.cleanupRoom(roomId);
    }
    logger.info('All rooms cleaned up');
  }

  /**
   * Get statistics about ordering service
   */
  getStats() {
    let totalRooms = 0;
    let totalPendingMessages = 0;
    let maxPendingInRoom = 0;

    for (const roomState of this.roomStates.values()) {
      totalRooms++;
      const pending = roomState.pendingMessages.size;
      totalPendingMessages += pending;
      maxPendingInRoom = Math.max(maxPendingInRoom, pending);
    }

    return {
      activeRooms: totalRooms,
      totalPendingMessages,
      maxPendingInRoom,
      bufferCapacity: this.MAX_BUFFER_SIZE,
      messageBufferTimeout: this.MESSAGE_BUFFER_TIMEOUT
    };
  }
}

// Export singleton instance
export default new MessageOrderingService();
