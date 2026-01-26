const mongoose = require('mongoose');

const tutorialStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }, // Rich text content/markdown
  codeExample: {
    code: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    explanation: { type: String, default: '' }
  },
  videoUrl: { type: String, default: '' }, // Optional video lesson
  interactive: {
    enabled: { type: Boolean, default: false },
    prompt: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    solution: { type: String, default: '' },
    hints: [{ type: String }]
  },
  quiz: {
    enabled: { type: Boolean, default: false },
    question: { type: String, default: '' },
    options: [{ type: String }],
    correctAnswer: { type: Number, default: 0 }, // Index of correct option
    explanation: { type: String, default: '' }
  }
});

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'fundamentals', 'data-structures', 'algorithms', 'web-development', 
      'backend', 'frontend', 'databases', 'devops', 'mobile', 'machine-learning',
      'security', 'testing', 'design-patterns'
    ],
    required: true
  },
  language: { 
    type: String, 
    enum: ['javascript', 'python', 'java', 'cpp', 'react', 'node', 'general'],
    required: true 
  },
  tags: [{ type: String }],
  estimatedDuration: { type: Number, required: true }, // minutes
  prerequisites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutorial' 
  }],
  learningObjectives: [{ type: String }],
  steps: [tutorialStepSchema],
  relatedChallenges: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Challenge' 
  }],
  nextTutorials: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutorial' 
  }],
  thumbnailUrl: { type: String, default: '' },
  author: { type: String, default: 'JustCoding Team' },
  completionCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Progress Schema for tracking individual tutorial progress
const tutorialProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  currentStep: { type: Number, default: 1 },
  completedSteps: [{ type: Number }],
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // minutes
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, default: '' }
});

// Compound index for user tutorial progress
tutorialProgressSchema.index({ userId: 1, tutorialId: 1 }, { unique: true });

// Update tutorial stats when progress is updated
tutorialProgressSchema.post('save', async function() {
  if (this.completedAt && this.isNew) {
    await mongoose.model('Tutorial').findByIdAndUpdate(
      this.tutorialId,
      { $inc: { completionCount: 1 } }
    );
  }
});

// Update average rating when user rates tutorial
tutorialProgressSchema.post('save', async function() {
  if (this.rating && this.modifiedPaths().includes('rating')) {
    const Tutorial = mongoose.model('Tutorial');
    const allRatings = await mongoose.model('TutorialProgress').find({
      tutorialId: this.tutorialId,
      rating: { $exists: true, $gte: 1 }
    }).select('rating');
    
    const avgRating = allRatings.reduce((sum, p) => sum + p.rating, 0) / allRatings.length;
    await Tutorial.findByIdAndUpdate(this.tutorialId, {
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: allRatings.length
    });
  }
});

module.exports = {
  Tutorial: mongoose.model('Tutorial', tutorialSchema),
  TutorialProgress: mongoose.model('TutorialProgress', tutorialProgressSchema)
};