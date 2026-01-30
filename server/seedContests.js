const mongoose = require('mongoose');
require('dotenv').config();

// Contest schema
const contestSchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  startTime: Date,
  endTime: Date,
  duration: Number, // in minutes
  status: { type: String, enum: ['upcoming', 'active', 'ended'], default: 'upcoming' },
  maxParticipants: { type: Number, default: 1000 },
  participants: [{
    odId: String,
    odName: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  leaderboard: [{
    odId: String,
    odName: String,
    totalScore: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    lastSubmission: Date
  }]
});

const Contest = mongoose.model('Contest', contestSchema);

const seedContests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing contests
    await Contest.deleteMany({});

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Add test contests
    const testContests = [
      {
        title: 'Weekly Coding Challenge',
        slug: 'weekly-coding-challenge',
        description: 'Test your coding skills in this weekly programming contest. Solve algorithmic problems and compete with developers worldwide.',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Started 2 hours ago
        endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // Ends in 4 hours
        duration: 360, // 6 hours
        status: 'active',
        participants: [
          { odId: 'user1', odName: 'CodeMaster' },
          { odId: 'user2', odName: 'DevNinja' },
          { odId: 'user3', odName: 'ScriptKid' }
        ],
        leaderboard: [
          { odId: 'user1', odName: 'CodeMaster', totalScore: 300, problemsSolved: 3, penalty: 20, lastSubmission: new Date() },
          { odId: 'user2', odName: 'DevNinja', totalScore: 250, problemsSolved: 2, penalty: 15, lastSubmission: new Date() },
          { odId: 'user3', odName: 'ScriptKid', totalScore: 180, problemsSolved: 2, penalty: 30, lastSubmission: new Date() }
        ]
      },
      {
        title: 'Algorithm Masters Cup',
        slug: 'algorithm-masters-cup',
        description: 'Advanced algorithmic programming contest for experienced developers. Featuring complex data structures and optimization problems.',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        duration: 180, // 3 hours
        status: 'upcoming',
        participants: [
          { odId: 'user4', odName: 'BugHunter' },
          { odId: 'user5', odName: 'AlgoWiz' }
        ],
        leaderboard: []
      },
      {
        title: 'Beginner Friendly Contest',
        slug: 'beginner-friendly-contest',
        description: 'Perfect for newcomers to competitive programming. Easy to medium difficulty problems with detailed explanations.',
        startTime: nextWeek,
        endTime: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
        duration: 120, // 2 hours
        status: 'upcoming',
        participants: [],
        leaderboard: []
      },
      {
        title: 'Speed Coding Sprint',
        slug: 'speed-coding-sprint',
        description: 'Fast-paced coding contest focusing on implementation speed and accuracy. Quick problems, quick solutions!',
        startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000), // Started 5 hours ago
        endTime: new Date(now.getTime() - 4 * 60 * 60 * 1000), // Ended 4 hours ago
        duration: 60, // 1 hour
        status: 'ended',
        participants: [
          { odId: 'user6', odName: 'ReactPro' },
          { odId: 'user7', odName: 'JSGuru' },
          { odId: 'user8', odName: 'PythonFan' }
        ],
        leaderboard: [
          { odId: 'user6', odName: 'ReactPro', totalScore: 400, problemsSolved: 4, penalty: 10, lastSubmission: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
          { odId: 'user7', odName: 'JSGuru', totalScore: 350, problemsSolved: 3, penalty: 25, lastSubmission: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
          { odId: 'user8', odName: 'PythonFan', totalScore: 200, problemsSolved: 2, penalty: 40, lastSubmission: new Date(now.getTime() - 4 * 60 * 60 * 1000) }
        ]
      }
    ];

    await Contest.insertMany(testContests);
    // console.log('✅ Test contest data added!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedContests();