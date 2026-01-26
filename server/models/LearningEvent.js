const mongoose = require('mongoose');

const learningEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  eventType: { 
    type: String, 
    required: true,
    enum: ['code_run', 'ai_explain', 'ai_debug', 'snippet_create', 'session_join', 'visualize', 'challenge_complete', 'tutorial_start', 'tutorial_step_complete', 'tutorial_complete', 'tutorial_quiz_attempt']
  },
  language: { type: String },
  codeLength: { type: Number },
  sessionDuration: { type: Number }, // in seconds
  points: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

learningEventSchema.index({ userId: 1, timestamp: -1 });
learningEventSchema.index({ eventType: 1, timestamp: -1 });

module.exports = mongoose.model('LearningEvent', learningEventSchema);