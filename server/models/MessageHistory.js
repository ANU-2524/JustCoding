/**
 * MessageHistory Model - Tracks all collaborative messages
 * Enables replay of messages for new clients and debugging of ordering issues
 */

import mongoose from 'mongoose';

const messageHistorySchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
    sparse: true
  },
  sequence: {
    type: Number,
    required: true
  },
  messageType: {
    type: String,
    enum: ['code-change', 'code-execute', 'user-joined', 'user-left', 'chat', 'debug', 'other'],
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  username: String,
  
  // Message content (varies by type)
  payload: mongoose.Schema.Types.Mixed,
  
  // Message metadata
  correlationId: String,
  clientTimestamp: Date,
  serverTimestamp: {
    type: Date,
    default: Date.now
  },
  socketId: String,
  
  // Processing info
  processedAt: Date,
  status: {
    type: String,
    enum: ['buffered', 'processed', 'skipped', 'error'],
    required: true,
    default: 'buffered'
  },
  error: String,
  
  // TTL: Auto-delete after 30 days
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }
  }
},
{
  timestamps: true
});

// Compound index for efficient queries
messageHistorySchema.index({ roomId: 1, sequence: 1 }, { unique: true });
messageHistorySchema.index({ roomId: 1, serverTimestamp: -1 });
messageHistorySchema.index({ correlationId: 1 });

/**
 * Record a message in history
 */
messageHistorySchema.statics.recordMessage = async function(data) {
  try {
    const message = new this({
      roomId: data.roomId,
      sequence: data.sequence,
      messageType: data.messageType,
      userId: data.userId,
      username: data.username,
      payload: data.payload,
      correlationId: data.correlationId,
      clientTimestamp: data.clientTimestamp,
      socketId: data.socketId,
      status: 'buffered'
    });

    await message.save();
    return message;
  } catch (error) {
    console.error('Error recording message:', error);
    throw error;
  }
};

/**
 * Mark message as processed
 */
messageHistorySchema.statics.markProcessed = async function(roomId, sequence, error = null) {
  try {
    return await this.updateOne(
      { roomId, sequence },
      {
        status: error ? 'error' : 'processed',
        processedAt: new Date(),
        ...(error && { error })
      }
    );
  } catch (err) {
    console.error('Error marking message as processed:', err);
  }
};

/**
 * Get messages in sequence range for replay
 */
messageHistorySchema.statics.getSequenceRange = async function(roomId, fromSequence, toSequence) {
  try {
    return await this.find({
      roomId,
      sequence: { $gte: fromSequence, $lte: toSequence },
      status: 'processed'
    })
      .sort({ sequence: 1 })
      .lean();
  } catch (error) {
    console.error('Error fetching message sequence range:', error);
    return [];
  }
};

/**
 * Find gaps in message sequence
 */
messageHistorySchema.statics.findSequenceGaps = async function(roomId, fromSequence, toSequence) {
  try {
    const messages = await this.find({
      roomId,
      sequence: { $gte: fromSequence, $lte: toSequence }
    })
      .select('sequence')
      .sort({ sequence: 1 })
      .lean();

    const gaps = [];
    let expectedSeq = fromSequence;

    for (const msg of messages) {
      if (msg.sequence > expectedSeq) {
        gaps.push({
          from: expectedSeq,
          to: msg.sequence - 1
        });
      }
      expectedSeq = msg.sequence + 1;
    }

    if (expectedSeq <= toSequence) {
      gaps.push({
        from: expectedSeq,
        to: toSequence
      });
    }

    return gaps;
  } catch (error) {
    console.error('Error finding sequence gaps:', error);
    return [];
  }
};

/**
 * Get message statistics for a room
 */
messageHistorySchema.statics.getRoomStats = async function(roomId) {
  try {
    const stats = await this.aggregate([
      { $match: { roomId } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          processedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] }
          },
          errorCount: {
            $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
          },
          maxSequence: { $max: '$sequence' },
          minSequence: { $min: '$sequence' },
          messageTypes: { $push: '$messageType' }
        }
      }
    ]);

    if (stats.length === 0) {
      return null;
    }

    return stats[0];
  } catch (error) {
    console.error('Error getting room stats:', error);
    return null;
  }
};

/**
 * Find duplicate messages (same content sent multiple times)
 */
messageHistorySchema.statics.findDuplicates = async function(roomId, correlationId) {
  try {
    return await this.find({
      roomId,
      correlationId
    })
      .sort({ sequence: 1 })
      .lean();
  } catch (error) {
    console.error('Error finding duplicates:', error);
    return [];
  }
};

/**
 * Clean old messages
 */
messageHistorySchema.statics.cleanOldMessages = async function(roomId, olderThanDays = 30) {
  try {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await this.deleteMany({
      roomId,
      serverTimestamp: { $lt: cutoffDate }
    });

    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning old messages:', error);
    return 0;
  }
};

export default mongoose.model('MessageHistory', messageHistorySchema);
