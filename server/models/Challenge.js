const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  timeLimit: { type: Number, default: 2000 }, // ms
  memoryLimit: { type: Number, default: 256 } // MB
});

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true 
  },
  category: { 
    type: String, 
    enum: ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dp', 'sorting', 'searching', 'math', 'other'],
    default: 'other'
  },
  points: { type: Number, required: true },
  testCases: [testCaseSchema],
  starterCode: {
    javascript: { type: String, default: '' },
    python: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' }
  },
  hints: [{ type: String }],
  editorial: { type: String, default: '' },
  constraints: { type: String, default: '' },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  tags: [{ type: String }],
  solvedCount: { type: Number, default: 0 },
  attemptCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Update success rate on save
challengeSchema.pre('save', function(next) {
  if (this.attemptCount > 0) {
    this.successRate = Math.round((this.solvedCount / this.attemptCount) * 100);
  }
  next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
