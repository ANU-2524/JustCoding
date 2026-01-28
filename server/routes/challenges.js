import express from 'express';
const router = express.Router();
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import Contest from '../models/Contest.js';
import ChallengeService from '../services/ChallengeService.js';

// Utility function to escape regex to prevent ReDoS
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Validation functions
function validateSlug(slug) {
  return typeof slug === 'string' && slug.length > 0 && /^[a-zA-Z0-9-]+$/.test(slug);
}

function validateOdId(odId) {
  return typeof odId === 'string' && odId.length > 0;
}

// Get all challenges with filters
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, search, page = 1, limit = 20 } = req.query;

    // Validate page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum.toString() !== page || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page number' });
    }
    if (isNaN(limitNum) || limitNum.toString() !== limit || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: 'Invalid limit (1-100)' });
    }

    const query = { isActive: true };

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { tags: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const challenges = await Challenge.find(query)
      .select('title slug difficulty category points solvedCount successRate tags')
      .sort({ difficulty: 1, points: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Challenge.countDocuments(query);

    res.json({
      challenges,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single challenge
router.get('/:slug', async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

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
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

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
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

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

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get challenge leaderboard
router.get('/:slug/leaderboard', async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    const challenge = await Challenge.findOne({ slug: req.params.slug });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const leaderboard = await ChallengeService.getChallengeLeaderboard(challenge._id);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user submissions for a challenge
router.get('/:slug/submissions/:odId', async (req, res) => {
  try {
    const { slug, odId } = req.params;
    if (!validateSlug(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }
    if (!validateOdId(odId)) {
      return res.status(400).json({ error: 'Invalid odId' });
    }

    const challenge = await Challenge.findOne({ slug });
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const submissions = await Submission.find({
      challengeId: challenge._id,
      odId
    })
    .sort({ submittedAt: -1 })
    .limit(20)
    .select('status passedTests totalTests executionTime language submittedAt');

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get editorial (only if solved)
router.get('/:slug/editorial', async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    const { odId } = req.query;
    if (!validateOdId(odId)) {
      return res.status(400).json({ error: 'Invalid odId' });
    }

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

    res.json({
      editorial: challenge.editorial,
      hints: challenge.hints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress
router.get('/user/:odId/progress', async (req, res) => {
  try {
    const { odId } = req.params;
    if (!validateOdId(odId)) {
      return res.status(400).json({ error: 'Invalid odId' });
    }

    const progress = await ChallengeService.getUserProgress(odId);
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

    res.json(updatedContests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single contest
router.get('/contests/:slug', async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

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
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

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
      return res.json({ participant: existing });
    }

    if (contest.participants.length >= contest.maxParticipants) {
      return res.status(400).json({ error: 'Contest is full' });
    }

    const newParticipant = { odId, odName: odName || 'Anonymous' };
    contest.participants.push(newParticipant);
    await contest.save();

    res.json({ participant: newParticipant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest leaderboard
router.get('/contests/:slug/leaderboard', async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    const contest = await Contest.findOne({ slug: req.params.slug });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json(contest.leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
