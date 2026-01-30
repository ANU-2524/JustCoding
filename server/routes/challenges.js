const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const ChallengeService = require('../services/ChallengeService');

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

/**
 * @api {get} /challenges Get all challenges with filters
 * @apiName GetChallenges
 * @apiGroup Challenges
 * @apiDescription Retrieve a list of active challenges with optional filters for difficulty, category, and search. Supports pagination.
 *
 * @apiQuery {String} [difficulty] Filter by difficulty level (e.g., 'easy', 'medium', 'hard').
 * @apiQuery {String} [category] Filter by category (e.g., 'algorithms', 'data-structures').
 * @apiQuery {String} [search] Search query to match title or tags (case-insensitive).
 * @apiQuery {Number} [page=1] Page number for pagination (must be >= 1).
 * @apiQuery {Number} [limit=20] Number of challenges per page (1-100).
 *
 * @apiSuccess {Object[]} challenges List of challenges.
 * @apiSuccess {String} challenges.title Challenge title.
 * @apiSuccess {String} challenges.slug Challenge slug.
 * @apiSuccess {String} challenges.difficulty Difficulty level.
 * @apiSuccess {String} challenges.category Category.
 * @apiSuccess {Number} challenges.points Points awarded.
 * @apiSuccess {Number} challenges.solvedCount Number of times solved.
 * @apiSuccess {Number} challenges.successRate Success rate percentage.
 * @apiSuccess {String[]} challenges.tags Associated tags.
 * @apiSuccess {Object} pagination Pagination info.
 * @apiSuccess {Number} pagination.page Current page.
 * @apiSuccess {Number} pagination.limit Items per page.
 * @apiSuccess {Number} pagination.total Total challenges.
 * @apiSuccess {Number} pagination.pages Total pages.
 *
 * @apiError {String} error Error message (e.g., 'Invalid page number', 'Invalid limit (1-100)').
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges?difficulty=easy&page=1&limit=10"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "challenges": [
 *         {
 *           "title": "Two Sum",
 *           "slug": "two-sum",
 *           "difficulty": "easy",
 *           "category": "algorithms",
 *           "points": 10,
 *           "solvedCount": 150,
 *           "successRate": 85.5,
 *           "tags": ["array", "hash-table"]
 *         }
 *       ],
 *       "pagination": {
 *         "page": 1,
 *         "limit": 10,
 *         "total": 50,
 *         "pages": 5
 *       }
 *     }
 */
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

/**
 * @api {get} /challenges/:slug Get single challenge
 * @apiName GetChallenge
 * @apiGroup Challenges
 * @apiDescription Retrieve details of a specific challenge by its slug, including visible test cases.
 *
 * @apiParam {String} slug Challenge slug (alphanumeric and hyphens only).
 *
 * @apiSuccess {String} title Challenge title.
 * @apiSuccess {String} slug Challenge slug.
 * @apiSuccess {String} description Challenge description.
 * @apiSuccess {String} difficulty Difficulty level.
 * @apiSuccess {String} category Category.
 * @apiSuccess {Number} points Points awarded.
 * @apiSuccess {Object[]} testCases Visible test cases.
 * @apiSuccess {String} testCases.input Test input.
 * @apiSuccess {String} testCases.expectedOutput Expected output.
 * @apiSuccess {Number} totalTestCases Total number of test cases.
 * @apiSuccess {String[]} tags Associated tags.
 *
 * @apiError {String} error Error message (e.g., 'Invalid slug format', 'Challenge not found').
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges/two-sum"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "title": "Two Sum",
 *       "slug": "two-sum",
 *       "description": "Given an array of integers...",
 *       "difficulty": "easy",
 *       "category": "algorithms",
 *       "points": 10,
 *       "testCases": [
 *         {
 *           "input": "[2,7,11,15], 9",
 *           "expectedOutput": "[0,1]"
 *         }
 *       ],
 *       "totalTestCases": 5,
 *       "tags": ["array", "hash-table"]
 *     }
 */
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

/**
 * @api {post} /challenges/:slug/submit Submit solution
 * @apiName SubmitSolution
 * @apiGroup Challenges
 * @apiDescription Submit a solution for a challenge. The code is tested against all test cases.
 *
 * @apiParam {String} slug Challenge slug (alphanumeric and hyphens only).
 * @apiBody {String} code The source code to submit.
 * @apiBody {String} language Programming language (e.g., 'javascript', 'python').
 * @apiBody {String} odId Unique identifier for the user.
 * @apiBody {String} [odName] Optional display name for the user.
 *
 * @apiSuccess {String} submissionId Unique ID of the submission.
 * @apiSuccess {String} status Submission status ('accepted', 'wrong_answer', 'time_limit_exceeded', etc.).
 * @apiSuccess {Number} passedTests Number of test cases passed.
 * @apiSuccess {Number} totalTests Total number of test cases.
 * @apiSuccess {Number} executionTime Execution time in milliseconds.
 * @apiSuccess {Number} points Points awarded for the submission.
 * @apiSuccess {Object[]} testResults Detailed results for each test case.
 *
 * @apiError {String} error Error message (e.g., 'Missing required fields', 'Challenge not found').
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST "http://localhost:3000/challenges/two-sum/submit" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "code": "function twoSum(nums, target) { ... }",
 *       "language": "javascript",
 *       "odId": "user123",
 *       "odName": "John Doe"
 *     }'
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "submissionId": "60d5ecb74b24c72b8c8b4567",
 *       "status": "accepted",
 *       "passedTests": 5,
 *       "totalTests": 5,
 *       "executionTime": 120,
 *       "points": 10,
 *       "testResults": [...]
 *     }
 */
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

/**
 * @api {post} /challenges/:slug/run Run code
 * @apiName RunCode
 * @apiGroup Challenges
 * @apiDescription Run code against visible test cases or custom input without submitting a solution.
 *
 * @apiParam {String} slug Challenge slug (alphanumeric and hyphens only).
 * @apiBody {String} code The source code to run.
 * @apiBody {String} language Programming language (e.g., 'javascript', 'python').
 * @apiBody {String} [customInput] Optional custom input to test against (overrides visible test cases).
 *
 * @apiSuccess {Object[]} results Test results.
 * @apiSuccess {String} results.status Test status ('passed', 'failed', etc.).
 * @apiSuccess {String} results.input Test input used.
 * @apiSuccess {String} results.expectedOutput Expected output.
 * @apiSuccess {String} results.actualOutput Actual output from code.
 * @apiSuccess {Number} results.executionTime Execution time in milliseconds.
 *
 * @apiError {String} error Error message (e.g., 'Invalid slug format', 'Missing required fields', 'Challenge not found').
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST "http://localhost:3000/challenges/two-sum/run" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "code": "function twoSum(nums, target) { return [0,1]; }",
 *       "language": "javascript",
 *       "customInput": "[2,7,11,15], 9"
 *     }'
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "results": [
 *         {
 *           "status": "passed",
 *           "input": "[2,7,11,15], 9",
 *           "expectedOutput": "[0,1]",
 *           "actualOutput": "[0,1]",
 *           "executionTime": 5
 *         }
 *       ]
 *     }
 */
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

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @api {get} /challenges/:slug/leaderboard Get challenge leaderboard
 * @apiName GetChallengeLeaderboard
 * @apiGroup Challenges
 * @apiDescription Retrieve the leaderboard for a specific challenge, showing top performers.
 *
 * @apiParam {String} slug Challenge slug (alphanumeric and hyphens only).
 *
 * @apiSuccess {Object[]} leaderboard List of leaderboard entries.
 * @apiSuccess {String} leaderboard.odId User identifier.
 * @apiSuccess {String} leaderboard.odName User display name.
 * @apiSuccess {Number} leaderboard.score Total score.
 * @apiSuccess {Number} leaderboard.rank Rank position.
 *
 * @apiError {String} error Error message (e.g., 'Invalid slug format', 'Challenge not found').
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges/two-sum/leaderboard"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "leaderboard": [
 *         {
 *           "odId": "user123",
 *           "odName": "John Doe",
 *           "score": 100,
 *           "rank": 1
 *         }
 *       ]
 *     }
 */
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
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @api {get} /challenges/:slug/submissions/:odId Get user submissions for a challenge
 * @apiName GetUserSubmissions
 * @apiGroup Challenges
 * @apiDescription Retrieve the last 20 submissions for a specific user on a specific challenge.
 *
 * @apiParam {String} slug Challenge slug (alphanumeric and hyphens only).
 * @apiParam {String} odId User identifier.
 *
 * @apiSuccess {Object[]} submissions List of submissions.
 * @apiSuccess {String} submissions.status Submission status.
 * @apiSuccess {Number} submissions.passedTests Number of passed tests.
 * @apiSuccess {Number} submissions.totalTests Total number of tests.
 * @apiSuccess {Number} submissions.executionTime Execution time in milliseconds.
 * @apiSuccess {String} submissions.language Programming language used.
 * @apiSuccess {Date} submissions.submittedAt Submission timestamp.
 *
 * @apiError {String} error Error message (e.g., 'Invalid slug format', 'Invalid odId', 'Challenge not found').
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges/two-sum/submissions/user123"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "submissions": [
 *         {
 *           "status": "accepted",
 *           "passedTests": 5,
 *           "totalTests": 5,
 *           "executionTime": 120,
 *           "language": "javascript",
 *           "submittedAt": "2023-10-01T12:00:00.000Z"
 *         }
 *       ]
 *     }
 */
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

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @api {get} /challenges/:slug/editorial Get editorial
 * @apiName GetEditorial
 * @apiGroup Challenges
 * @apiDescription Retrieve the editorial and hints for a challenge, only accessible if the user has solved it.
 *
 * @apiParam {String} slug Challenge slug (alphanumeric and hyphens only).
 * @apiQuery {String} odId User identifier.
 *
 * @apiSuccess {String} editorial Editorial content.
 * @apiSuccess {String[]} hints List of hints.
 *
 * @apiError {String} error Error message (e.g., 'Invalid slug format', 'Invalid odId', 'Challenge not found', 'Solve the challenge first to view editorial').
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges/two-sum/editorial?odId=user123"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "editorial": "Use a hash map to store indices...",
 *       "hints": ["Think about using a map", "Consider edge cases"]
 *     }
 */
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

    res.json({ editorial: challenge.editorial, hints: challenge.hints });
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

/**
 * @api {get} /challenges/user/:odId/progress Get user progress
 * @apiName GetUserProgress
 * @apiGroup Challenges
 * @apiDescription Retrieve the progress statistics for a specific user across all challenges.
 *
 * @apiParam {String} odId User identifier.
 *
 * @apiSuccess {Object} progress User progress data.
 * @apiSuccess {Number} progress.totalSolved Total challenges solved.
 * @apiSuccess {Number} progress.totalAttempted Total challenges attempted.
 * @apiSuccess {Number} progress.totalPoints Total points earned.
 * @apiSuccess {Object} progress.byDifficulty Progress breakdown by difficulty.
 * @apiSuccess {Object} progress.byCategory Progress breakdown by category.
 *
 * @apiError {String} error Error message (e.g., 'Invalid odId').
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges/user/user123/progress"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "totalSolved": 25,
 *       "totalAttempted": 35,
 *       "totalPoints": 500,
 *       "byDifficulty": {
 *         "easy": { "solved": 15, "attempted": 20 },
 *         "medium": { "solved": 8, "attempted": 12 },
 *         "hard": { "solved": 2, "attempted": 3 }
 *       },
 *       "byCategory": {
 *         "algorithms": { "solved": 20, "attempted": 28 },
 *         "data-structures": { "solved": 5, "attempted": 7 }
 *       }
 *     }
 */
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

/**
 * @api {get} /challenges/contests/list Get all contests
 * @apiName GetContests
 * @apiGroup Contests
 * @apiDescription Retrieve a list of all contests with their current status and participant count.
 *
 * @apiSuccess {Object[]} contests List of contests.
 * @apiSuccess {String} contests.title Contest title.
 * @apiSuccess {String} contests.slug Contest slug.
 * @apiSuccess {String} contests.description Contest description.
 * @apiSuccess {Date} contests.startTime Contest start time.
 * @apiSuccess {Date} contests.endTime Contest end time.
 * @apiSuccess {Number} contests.duration Duration in minutes.
 * @apiSuccess {String} contests.status Contest status ('upcoming', 'ongoing', 'ended').
 * @apiSuccess {Number} contests.participantCount Number of participants.
 *
 * @apiError {String} error Error message.
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges/contests/list"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "contests": [
 *         {
 *           "title": "Weekly Contest 1",
 *           "slug": "weekly-contest-1",
 *           "description": "Solve challenging problems...",
 *           "startTime": "2023-10-01T10:00:00.000Z",
 *           "endTime": "2023-10-01T12:00:00.000Z",
 *           "duration": 120,
 *           "status": "ended",
 *           "participantCount": 150
 *         }
 *       ]
 *     }
 */
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

/**
 * @api {get} /challenges/contests/:slug Get single contest
 * @apiName GetContest
 * @apiGroup Contests
 * @apiDescription Retrieve details of a specific contest by its slug, including associated challenges.
 *
 * @apiParam {String} slug Contest slug (alphanumeric and hyphens only).
 *
 * @apiSuccess {String} title Contest title.
 * @apiSuccess {String} slug Contest slug.
 * @apiSuccess {String} description Contest description.
 * @apiSuccess {Date} startTime Contest start time.
 * @apiSuccess {Date} endTime Contest end time.
 * @apiSuccess {Number} duration Duration in minutes.
 * @apiSuccess {String} status Contest status ('upcoming', 'ongoing', 'ended').
 * @apiSuccess {Number} maxParticipants Maximum number of participants.
 * @apiSuccess {Object[]} participants List of participants.
 * @apiSuccess {Object[]} challenges List of associated challenges.
 * @apiSuccess {String} challenges.title Challenge title.
 * @apiSuccess {String} challenges.slug Challenge slug.
 * @apiSuccess {String} challenges.difficulty Difficulty level.
 * @apiSuccess {Number} challenges.points Points awarded.
 * @apiSuccess {Number} challenges.solvedCount Number of times solved.
 *
 * @apiError {String} error Error message (e.g., 'Contest not found').
 *
 * @apiExample {curl} Example usage:
 *     curl -X GET "http://localhost:3000/challenges/contests/weekly-contest-1"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "title": "Weekly Contest 1",
 *       "slug": "weekly-contest-1",
 *       "description": "Solve challenging problems...",
 *       "startTime": "2023-10-01T10:00:00.000Z",
 *       "endTime": "2023-10-01T12:00:00.000Z",
 *       "duration": 120,
 *       "status": "ended",
 *       "maxParticipants": 1000,
 *       "participants": [...],
 *       "challenges": [
 *         {
 *           "title": "Two Sum",
 *           "slug": "two-sum",
 *           "difficulty": "easy",
 *           "points": 10,
 *           "solvedCount": 150
 *         }
 *       ]
 *     }
 */
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

/**
 * @api {post} /challenges/contests/:slug/join Join contest
 * @apiName JoinContest
 * @apiGroup Contests
 * @apiDescription Join a contest as a participant. The contest must be active and not full.
 *
 * @apiParam {String} slug Contest slug (alphanumeric and hyphens only).
 * @apiBody {String} odId User identifier.
 * @apiBody {String} [odName] Optional display name for the user.
 *
 * @apiSuccess {String} odId User identifier.
 * @apiSuccess {String} odName User display name.
 *
 * @apiError {String} error Error message (e.g., 'Invalid slug format', 'Contest not found', 'Contest has ended', 'Contest is full').
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST "http://localhost:3000/challenges/contests/weekly-contest-1/join" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "odId": "user123",
 *       "odName": "John Doe"
 *     }'
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "odId": "user123",
 *       "odName": "John Doe"
 *     }
 */
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

    res.json({ leaderboard: contest.leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
