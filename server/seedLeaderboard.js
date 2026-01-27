const mongoose = require('mongoose');
require('dotenv').config();

// User schema (simplified)
const userSchema = new mongoose.Schema({
  userId: String,
  displayName: String,
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [String],
  lastActiveAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const seedLeaderboard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});

    // Add test users
    const testUsers = [
      { userId: 'user1', displayName: 'CodeMaster', totalPoints: 1500, level: 5, badges: ['First Steps', 'Code Runner', 'AI Explorer'], lastActiveAt: new Date() },
      { userId: 'user2', displayName: 'DevNinja', totalPoints: 1200, level: 4, badges: ['First Steps', 'Code Runner'], lastActiveAt: new Date() },
      { userId: 'user3', displayName: 'ScriptKid', totalPoints: 900, level: 3, badges: ['First Steps'], lastActiveAt: new Date() },
      { userId: 'user4', displayName: 'BugHunter', totalPoints: 750, level: 3, badges: ['First Steps', 'Collaborator'], lastActiveAt: new Date() },
      { userId: 'user5', displayName: 'AlgoWiz', totalPoints: 600, level: 2, badges: ['First Steps'], lastActiveAt: new Date() },
      { userId: 'user6', displayName: 'ReactPro', totalPoints: 450, level: 2, badges: [], lastActiveAt: new Date() },
      { userId: 'user7', displayName: 'JSGuru', totalPoints: 300, level: 1, badges: [], lastActiveAt: new Date() },
      { userId: 'user8', displayName: 'PythonFan', totalPoints: 200, level: 1, badges: [], lastActiveAt: new Date() },
      { userId: 'user9', displayName: 'CppCoder', totalPoints: 150, level: 1, badges: [], lastActiveAt: new Date() },
      { userId: 'user10', displayName: 'WebDev', totalPoints: 100, level: 1, badges: [], lastActiveAt: new Date() }
    ];

    await User.insertMany(testUsers);
    console.log('✅ Test leaderboard data added!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedLeaderboard();