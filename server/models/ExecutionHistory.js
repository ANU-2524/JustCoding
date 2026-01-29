const mongoose = require('mongoose');

const executionHistorySchema = new mongoose.Schema({
  executionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  correlationId: {
    type: String,
    index: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    default: 'Anonymous'
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  stdin: {
    type: String,
    default: ''
  },
  output: {
    type: String,
    default: ''
  },
  error: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  executionTime: {
    type: Number, // milliseconds
    default: 0
  },
  queuedAt: {
    type: Date
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'timeout', 'cancelled'],
    default: 'completed'
  },
  priority: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
executionHistorySchema.index({ roomId: 1, completedAt: -1 });
executionHistorySchema.index({ userId: 1, completedAt: -1 });
executionHistorySchema.index({ status: 1, completedAt: -1 });
executionHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Static method to record execution
executionHistorySchema.statics.recordExecution = async function(executionData) {
  try {
    const execution = new this(executionData);
    await execution.save();
    return execution;
  } catch (error) {
    console.error('Error recording execution:', error);
    return null;
  }
};

// Static method to get room history
executionHistorySchema.statics.getRoomHistory = async function(roomId, limit = 50) {
  return this.find({ roomId })
    .sort({ completedAt: -1 })
    .limit(limit)
    .select('-code -stdin') // Don't return code in history list
    .lean();
};

// Static method to get user history
executionHistorySchema.statics.getUserHistory = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ completedAt: -1 })
    .limit(limit)
    .select('-code -stdin')
    .lean();
};

// Static method to get execution stats
executionHistorySchema.statics.getStats = async function(roomId, timeRange = 3600000) {
  const since = new Date(Date.now() - timeRange);
  
  const stats = await this.aggregate([
    {
      $match: {
        roomId,
        completedAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: null,
        totalExecutions: { $sum: 1 },
        successfulExecutions: {
          $sum: { $cond: ['$success', 1, 0] }
        },
        failedExecutions: {
          $sum: { $cond: ['$success', 0, 1] }
        },
        avgExecutionTime: { $avg: '$executionTime' },
        totalExecutionTime: { $sum: '$executionTime' }
      }
    }
  ]);

  return stats[0] || {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    avgExecutionTime: 0,
    totalExecutionTime: 0
  };
};

module.exports = mongoose.model('ExecutionHistory', executionHistorySchema);
