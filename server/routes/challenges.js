const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const ChallengeService = require('../services/ChallengeService');

// Get all challenges with filters
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const challenges = await Challenge.find(query)
      .select('title slug difficulty category points solvedCount successRate tags')
      .sort({ difficulty: 1, points: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Challenge.countDocuments(query);

    res.json({
      challenges,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single challenge
router.get('/:slug', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ slug: req.params.slug, isActive: true })
      .select('-testCases.expectedOutput -editorial');

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Get visible test cases only
    const visibleTestCases = challenge.testCases
      .filter(tc => !tc.isHidden)
      .map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }));

    res.json({
      ...challenge.toObject(),
      testCases: visibleTestCases,
      totalTestCases: challenge.testCases.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit solution
router.post('/:slug/submit', async (req, res) => {
  try {
    const { code, language, odId, odName } = req.body;

    if (!code || !language || !odId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const challenge = await Challenge.findOne({ slug: req.params.slug });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const submission = await ChallengeService.submitSolution(
      challenge._id,
      odId,
      odName || 'Anonymous',
      code,
      language
    );

    res.json({
      submissionId: submission._id,
      status: submission.status,
      passedTests: submission.passedTests,
      totalTests: submission.totalTests,
      executionTime: submission.executionTime,
      points: submission.points,
      testResults: submission.testResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run code (without submitting)
router.post('/:slug/run', async (req, res) => {
  try {
    const { code, language, customInput } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const challenge = await Challenge.findOne({ slug: req.params.slug });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Run against visible test cases only (or custom input)
    let testCases;
    if (customInput !== undefined) {
      testCases = [{ input: customInput, expectedOutput: '', isHidden: false, timeLimit: 2000 }];
    } else {
      testCases = challenge.testCases.filter(tc => !tc.isHidden).slice(0, 3);
    }

    const results = await ChallengeService.runTestCases(code, language, testCases);

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get challenge leaderboard
router.get('/:slug/leaderboard', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ slug: req.params.slug });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const leaderboard = await ChallengeService.getChallengeLeaderboard(challenge._id);
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user submissions for a challenge
router.get('/:slug/submissions/:odId', async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ slug: req.params.slug });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const submissions = await Submission.find({
      challengeId: challenge._id,
      odId: req.params.odId
    })
    .sort({ submittedAt: -1 })
    .limit(20)
    .select('status passedTests totalTests executionTime language submittedAt');

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get editorial (only if solved)
router.get('/:slug/editorial', async (req, res) => {
  try {
    const { odId } = req.query;
    const challenge = await Challenge.findOne({ slug: req.params.slug });
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if user has solved it
    const solved = await Submission.findOne({
      challengeId: challenge._id,
      odId,
      status: 'accepted'
    });

    if (!solved) {
      return res.status(403).json({ error: 'Solve the challenge first to view editorial' });
    }

    res.json({ editorial: challenge.editorial, hints: challenge.hints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress
router.get('/user/:odId/progress', async (req, res) => {
  try {
    const progress = await ChallengeService.getUserProgress(req.params.odId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CONTESTS ============

// Get all contests
router.get('/contests/list', async (req, res) => {
  try {
    const now = new Date();
    
    const contests = await Contest.find()
      .select('title slug description startTime endTime duration status participants')
      .sort({ startTime: -1 });

    // Update status for each contest
    const updatedContests = contests.map(c => {
      c.updateStatus();
      return {
        ...c.toObject(),
        participantCount: c.participants.length
      };
    });

    res.json({ contests: updatedContests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single contest
router.get('/contests/:slug', async (req, res) => {
  try {
    const contest = await Contest.findOne({ slug: req.params.slug })
      .populate('challenges', 'title slug difficulty points solvedCount');

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    contest.updateStatus();
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join contest
router.post('/contests/:slug/join', async (req, res) => {
  try {
    const { odId, odName } = req.body;
    const contest = await Contest.findOne({ slug: req.params.slug });

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    contest.updateStatus();
    if (contest.status === 'ended') {
      return res.status(400).json({ error: 'Contest has ended' });
    }

    // Check if already joined
    const existing = contest.participants.find(p => p.odId === odId);
    if (existing) {
      return res.json({ message: 'Already joined', participant: existing });
    }

    if (contest.participants.length >= contest.maxParticipants) {
      return res.status(400).json({ error: 'Contest is full' });
    }

    contest.participants.push({ odId, odName: odName || 'Anonymous' });
    await contest.save();

    res.json({ message: 'Joined successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest leaderboard
router.get('/contests/:slug/leaderboard', async (req, res) => {
  try {
    const contest = await Contest.findOne({ slug: req.params.slug });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json({ leaderboard: contest.leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
