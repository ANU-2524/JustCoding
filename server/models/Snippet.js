const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'Untitled', maxlength: 120 },
  language: { type: String, default: 'javascript' },
  code: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

snippetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Snippet', snippetSchema);
