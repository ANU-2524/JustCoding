const mongoose = require('mongoose');
require('dotenv').config();

// User schema for analytics
const userSchema = new mongoose.Schema({
  userId: String,
  displayName: String,
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [String],
  lastActiveAt: { type: Date, default: Date.now }
});

// Learning Event schema
const learningEventSchema = new mongoose.Schema({
  userId: String,
  eventType: String,
  metadata: Object,
  timestamp: { type: Date, default: Date.now }
});

// Badge schema
const badgeSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  rarity: String,
  points: Number,
  icon: String
});

const User = mongoose.model('User', userSchema);
const LearningEvent = mongoose.model('LearningEvent', learningEventSchema);
const Badge = mongoose.model('Badge', badgeSchema);

const seedAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await LearningEvent.deleteMany({});
    await Badge.deleteMany({});

    // Add test badges
    const testBadges = [
      {
        name: 'First Steps',
        description: 'Run your first code snippet',
        category: 'beginner',
        rarity: 'common',
        points: 10,
        icon: 'rocket'
      },
      {
        name: 'Code Runner',
        description: 'Run 50 code snippets',
        category: 'activity',
        rarity: 'uncommon',
        points: 50,
        icon: 'code'
      },
      {
        name: 'AI Explorer',
        description: 'Use AI assistance 10 times',
        category: 'ai',
        rarity: 'rare',
        points: 75,
        icon: 'brain'
      },
      {
        name: 'Collaborator',
        description: 'Join 5 collaboration sessions',
        category: 'social',
        rarity: 'uncommon',
        points: 40,
        icon: 'users'
      },
      {
        name: 'Snippet Creator',
        description: 'Create 10 code snippets',
        category: 'creation',
        rarity: 'rare',
        points: 60,
        icon: 'star'
      }
    ];

    await Badge.insertMany(testBadges);

    // Add test learning events for different users
    const testEvents = [
      // Events for user1 (CodeMaster)
      { userId: 'user1', eventType: 'code_run', metadata: { language: 'javascript' } },
      { userId: 'user1', eventType: 'code_run', metadata: { language: 'python' } },
      { userId: 'user1', eventType: 'code_run', metadata: { language: 'javascript' } },
      { userId: 'user1', eventType: 'ai_explain', metadata: { topic: 'algorithms' } },
      { userId: 'user1', eventType: 'ai_debug', metadata: { language: 'python' } },
      { userId: 'user1', eventType: 'challenge_solve', metadata: { difficulty: 'easy' } },
      { userId: 'user1', eventType: 'challenge_solve', metadata: { difficulty: 'medium' } },
      { userId: 'user1', eventType: 'tutorial_view', metadata: { topic: 'react' } },
      
      // Events for user2 (DevNinja)
      { userId: 'user2', eventType: 'code_run', metadata: { language: 'java' } },
      { userId: 'user2', eventType: 'code_run', metadata: { language: 'cpp' } },
      { userId: 'user2', eventType: 'ai_explain', metadata: { topic: 'data structures' } },
      { userId: 'user2', eventType: 'challenge_solve', metadata: { difficulty: 'hard' } },
      { userId: 'user2', eventType: 'tutorial_view', metadata: { topic: 'algorithms' } },
      
      // Events for current user (if logged in)
      { userId: 'guest', eventType: 'code_run', metadata: { language: 'javascript' } },
      { userId: 'guest', eventType: 'code_run', metadata: { language: 'python' } },
      { userId: 'guest', eventType: 'code_run', metadata: { language: 'javascript' } },
      { userId: 'guest', eventType: 'code_run', metadata: { language: 'java' } },
      { userId: 'guest', eventType: 'ai_explain', metadata: { topic: 'functions' } },
      { userId: 'guest', eventType: 'ai_explain', metadata: { topic: 'loops' } },
      { userId: 'guest', eventType: 'ai_debug', metadata: { language: 'javascript' } },
      { userId: 'guest', eventType: 'challenge_solve', metadata: { difficulty: 'easy' } },
      { userId: 'guest', eventType: 'tutorial_view', metadata: { topic: 'basics' } },
      { userId: 'guest', eventType: 'tutorial_view', metadata: { topic: 'advanced' } }
    ];

    await LearningEvent.insertMany(testEvents);

    // Update user with analytics data
    await User.findOneAndUpdate(
      { userId: 'guest' },
      {
        userId: 'guest',
        displayName: 'Guest User',
        totalPoints: 285,
        level: 3,
        badges: ['First Steps', 'Code Runner', 'AI Explorer'],
        lastActiveAt: new Date()
      },
      { upsert: true }
    );

    console.log('✅ Test analytics data added!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedAnalytics();