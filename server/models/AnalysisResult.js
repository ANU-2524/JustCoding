import mongoose from 'mongoose';

const analysisResultSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    index: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    required: true
  },
  codeHash: {
    type: String,
    index: true // For caching same code
  },
  analyzers: [{
    name: String,
    version: String,
    executionTime: Number,
    issues: [{
      line: Number,
      column: Number,
      endLine: Number,
      endColumn: Number,
      message: String,
      severity: String, // error, warning, info
      category: String, // security, performance, style, bug, smell
      ruleId: String,
      suggestion: String
    }],
    metrics: mongoose.Schema.Types.Mixed,
    suggestions: [String],
    score: Number
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  summary: {
    totalIssues: Number,
    errors: Number,
    warnings: Number,
    infos: Number,
    byCategory: {
      security: Number,
      performance: Number,
      style: Number,
      bug: Number,
      smell: Number
    }
  },
  cached: {
    type: Boolean,
    default: false
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// TTL index - auto-delete after 90 days
analysisResultSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Compound indexes
analysisResultSchema.index({ userId: 1, analyzedAt: -1 });
analysisResultSchema.index({ challengeId: 1, overallScore: -1 });

// Static methods
analysisResultSchema.statics.getByHash = async function(codeHash) {
  return this.findOne({ codeHash, analyzedAt: { $gt: new Date(Date.now() - 3600000) } })
    .sort({ analyzedAt: -1 })
    .lean();
};

analysisResultSchema.statics.getUserStats = async function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$overallScore' },
        totalAnalyses: { $sum: 1 },
        totalIssues: { $sum: '$summary.totalIssues' },
        avgIssues: { $avg: '$summary.totalIssues' }
      }
    }
  ]);
};

export default mongoose.model('AnalysisResult', analysisResultSchema);
