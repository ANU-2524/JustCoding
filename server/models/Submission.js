import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  odId: { type: String, required: true }, // odId from localStorage
  odName: { type: String, default: 'Anonymous' },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compile_error'],
    default: 'pending'
  },
  testResults: [{
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number,
    error: String
  }],
  passedTests: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  executionTime: { type: Number, default: 0 }, // Total ms
  memoryUsed: { type: Number, default: 0 }, // MB
  points: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

// Index for leaderboard queries
submissionSchema.index({ challengeId: 1, status: 1, executionTime: 1 });
submissionSchema.index({ odId: 1, challengeId: 1 });

export default mongoose.model('Submission', submissionSchema);
