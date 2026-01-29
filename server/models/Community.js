import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true },
  author: { type: String, required: true, index: true }, // odId from localStorage
  authorName: { type: String, default: 'Anonymous' },
  authorPhotoURL: { type: String, default: '' },

  category: {
    type: String,
    required: true,
    enum: [
      'general-discussion',
      'help-request',
      'code-review',
      'project-showcase',
      'career-advice',
      'learning-resources',
      'bug-reports',
      'feature-requests',
      'announcements',
      'off-topic'
    ]
  },

  tags: [{ type: String, maxlength: 30 }],
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },

  // Voting system
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  score: { type: Number, default: 0 }, // upvotes - downvotes

  // Engagement metrics
  viewCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },

  // Code-related fields
  codeSnippets: [{
    language: { type: String, default: 'javascript' },
    code: { type: String },
    description: { type: String, default: '' }
  }],

  // Metadata
  lastActivity: { type: Date, default: Date.now },
  lastEditedAt: { type: Date },
  editedBy: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
postSchema.index({ category: 1, isPinned: -1, score: -1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isDeleted: 1 });

// Update score when upvotes/downvotes change
postSchema.pre('save', function(next) {
  this.score = this.upvotes - this.downvotes;
  this.lastActivity = new Date();
  next();
});

// Virtual for URL slug
postSchema.virtual('slug').get(function() {
  return this._id.toString();
});

// Virtual for reading time estimate (rough calculation)
postSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const words = this.content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
});

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  content: { type: String, required: true },
  author: { type: String, required: true, index: true },
  authorName: { type: String, default: 'Anonymous' },
  authorPhotoURL: { type: String, default: '' },

  // For nested replies
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],

  // Voting system
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  score: { type: Number, default: 0 },

  // Code snippets in comments
  codeSnippets: [{
    language: { type: String, default: 'javascript' },
    code: { type: String },
    description: { type: String, default: '' }
  }],

  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update comment score
commentSchema.pre('save', function(next) {
  this.score = this.upvotes - this.downvotes;
  next();
});

// Vote tracking schema
const voteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetType: { type: String, required: true, enum: ['post', 'comment'] },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  voteType: { type: String, required: true, enum: ['upvote', 'downvote'] },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate votes
voteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// User reputation tracking
const reputationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  totalReputation: { type: Number, default: 0 },

  // Breakdown of reputation sources
  postUpvotes: { type: Number, default: 0 },
  commentUpvotes: { type: Number, default: 0 },
  acceptedAnswers: { type: Number, default: 0 },
  helpfulAnswers: { type: Number, default: 0 },

  // Activity counts
  postsCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  bestAnswersCount: { type: Number, default: 0 },

  // Badges earned through community activity
  communityBadges: [{
    badgeId: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
reputationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Vote = mongoose.model('Vote', voteSchema);
const Reputation = mongoose.model('Reputation', reputationSchema);

export { Post, Comment, Vote, Reputation };
export default {
  Post,
  Comment,
  Vote,
  Reputation
};