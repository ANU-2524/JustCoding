/**
 * Client-side Message Ordering Utility
 * Ensures messages are sent with proper sequence numbers
 * and handles sequence gaps from server
 */

export class ClientMessageOrderingService {
  constructor(socket) {
    this.socket = socket;
    this.localSequence = 0;
    this.expectedServerSequence = 1;
    this.pendingAcknowledgments = new Map();
    this.messageCallbacks = {
      onSequenceGapDetected: null,
      onOutOfOrder: null,
      onProcessed: null
    };
  }

  /**
   * Initialize with server's expected sequence
   */
  initialize(serverSequence) {
    this.expectedServerSequence = serverSequence;
    this.localSequence = serverSequence - 1;
    console.log('Client message ordering initialized', {
      localSequence: this.localSequence,
      expectedServerSequence: this.expectedServerSequence
    });
  }

  /**
   * Get next sequence number for outgoing message
   */
  getNextSequence() {
    this.localSequence++;
    return this.localSequence;
  }

  /**
   * Send code change with sequence
   */
  sendCodeChange(code) {
    const sequence = this.getNextSequence();
    
    this.socket.emit('code-change', {
      roomId: this.getRoomId(),
      code,
      sequence
    });

    this.pendingAcknowledgments.set(sequence, {
      type: 'code-change',
      sentAt: Date.now(),
      code
    });

    return sequence;
  }

  /**
   * Send execution with sequence
   */
  sendExecution(code, language, stdin, codeChangeSequence) {
    const sequence = this.getNextSequence();

    this.socket.emit('execute-code', {
      roomId: this.getRoomId(),
      code,
      language,
      stdin,
      sequence,
      codeChangeSequence
    });

    this.pendingAcknowledgments.set(sequence, {
      type: 'code-execute',
      sentAt: Date.now(),
      language,
      codeChangeSequence
    });

    return sequence;
  }

  /**
   * Setup event handlers for server responses
   */
  setupEventHandlers() {
    // Handle sequence gap detection
    this.socket.on('sequence-gap-detected', ({ expectedSequence, receivedSequence, type }) => {
      console.warn('Sequence gap detected on server', {
        expectedSequence,
        receivedSequence,
        gap: receivedSequence - expectedSequence,
        type
      });

      if (this.messageCallbacks.onSequenceGapDetected) {
        this.messageCallbacks.onSequenceGapDetected({
          expectedSequence,
          receivedSequence,
          type
        });
      }

      // Trigger resync
      this.requestResync();
    });

    // Handle execution results with sequence
    this.socket.on('execution-result', (result) => {
      if (result.sequence && this.pendingAcknowledgments.has(result.sequence)) {
        const pending = this.pendingAcknowledgments.get(result.sequence);
        
        const latency = Date.now() - pending.sentAt;
        console.log('Execution result received', {
          sequence: result.sequence,
          latency,
          success: result.success
        });

        if (this.messageCallbacks.onProcessed) {
          this.messageCallbacks.onProcessed({
            sequence: result.sequence,
            latency,
            result
          });
        }

        // Clean up acknowledged message
        this.pendingAcknowledgments.delete(result.sequence);
      }
    });

    // Handle code updates from other users
    this.socket.on('code-update', ({ code, sequence, username }) => {
      if (sequence && sequence >= this.expectedServerSequence) {
        this.expectedServerSequence = sequence + 1;
        
        if (this.messageCallbacks.onProcessed) {
          this.messageCallbacks.onProcessed({
            type: 'remote-code-change',
            sequence,
            username
          });
        }
      }
    });
  }

  /**
   * Request server to resync ordering state
   */
  requestResync() {
    this.socket.emit('request-orderingstate', {
      roomId: this.getRoomId()
    });
  }

  /**
   * Get pending messages
   */
  getPendingMessages() {
    return Array.from(this.pendingAcknowledgments.entries()).map(([seq, msg]) => ({
      sequence: seq,
      ...msg,
      age: Date.now() - msg.sentAt
    }));
  }

  /**
   * Retry pending messages after sequence recovery
   */
  retryPendingMessages() {
    const pending = Array.from(this.pendingAcknowledgments.values())
      .filter(msg => Date.now() - msg.sentAt < 30000); // 30 second timeout

    console.warn(`Retrying ${pending.length} pending messages`);

    for (const msg of pending) {
      if (msg.type === 'code-change') {
        this.sendCodeChange(msg.code);
      } else if (msg.type === 'code-execute') {
        this.sendExecution(msg.code, msg.language, msg.stdin || '', msg.codeChangeSequence);
      }
    }
  }

  /**
   * Register callback
   */
  onSequenceGapDetected(callback) {
    this.messageCallbacks.onSequenceGapDetected = callback;
  }

  onProcessed(callback) {
    this.messageCallbacks.onProcessed = callback;
  }

  /**
   * Get current state for debugging
   */
  getDebugState() {
    return {
      localSequence: this.localSequence,
      expectedServerSequence: this.expectedServerSequence,
      pendingCount: this.pendingAcknowledgments.size,
      pending: this.getPendingMessages()
    };
  }

  /**
   * Helper to get room ID (should be overridden or passed)
   */
  getRoomId() {
    // This should be set from the actual room context
    return window.__roomId || 'unknown';
  }
}

export default ClientMessageOrderingService;
