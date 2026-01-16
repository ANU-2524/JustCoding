const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, sparse: true },
  displayName: { type: String, default: 'Guest' },
  bio: { type: String, default: '', maxlength: 500 },
  photoURL: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  preferences: {
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'javascript' }
  }
});

module.exports = mongoose.model('User', userSchema);