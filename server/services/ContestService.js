const Contest = require('../models/Contest');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const ChallengeService = require('./ChallengeService');
const LeaderboardService = require('./LeaderboardService');

class ContestService {
  /**
   * Submit solution to a contest challenge
   */
  static async submitSolution(contestId, challengeId, odId, odName, code, language) {
    // Validate contest
    const contest = await Contest.findById(contestId)
      .populate('challenges')
      .lean();

    if (!contest) {
      throw new Error('Contest not found');
    }

    // Check if contest is active
    const now = new Date();
    if (now < contest.startTime) {
      throw new Error('Contest has not started yet');
    }
    if (now > contest.endTime) {
      throw new Error('Contest has ended');
    }

    // Verify challenge belongs to this contest
    const challengeInContest = contest.challenges.some(
      c => c._id.toString() === challengeId.toString()
    );
    
    if (!challengeInContest) {
      throw new Error('Challenge not part of this contest');
    }

    // Check if user is registered
    const participant = contest.participants.find(p => p.odId === odId);
    if (!participant && !contest.isPublic) {
      throw new Error('You must register for this contest first');
    }

    // Submit solution using ChallengeService
    const submission = await ChallengeService.submitSolution(
      challengeId,
      odId,
      odName,
      code,
      language
    );

    // Update leaderboard asynchronously
    setImmediate(() => {
      LeaderboardService.updateAfterSubmission(contestId, submission)
        .catch(err => console.error('Leaderboard update error:', err));
    });

    // Update participant info in contest if exists
    if (participant) {
      const contestDoc = await Contest.findById(contestId);
      const idx = contestDoc.participants.findIndex(p => p.odId === odId);
      
      if (idx >= 0) {
        // Update stats
        if (submission.status === 'accepted') {
          contestDoc.participants[idx].solvedCount = 
            (contestDoc.participants[idx].solvedCount || 0) + 1;
          contestDoc.participants[idx].totalPoints = 
            (contestDoc.participants[idx].totalPoints || 0) + submission.points;
        }
        contestDoc.participants[idx].lastSubmission = submission.submittedAt;
        
        await contestDoc.save();
      }
    }

    return submission;
  }

  /**
   * Get contest leaderboard with pagination
   */
  static async getLeaderboard(contestId, options = {}) {
    return await LeaderboardService.getLeaderboard(contestId, options);
  }

  /**
   * Get user's standing in a contest
   */
  static async getUserStanding(contestId, odId) {
    try {
      const rank = await LeaderboardService.getUserRank(contestId, odId);
      
      if (!rank) {
        return {
          rank: null,
          totalPoints: 0,
          solvedCount: 0,
          message: 'No submissions yet'
        };
      }

      return rank;
    } catch (error) {
      console.error('Error getting user standing:', error);
      throw error;
    }
  }

  /**
   * Get top performers for a contest
   */
  static async getTopPerformers(contestId, limit = 10) {
    return await LeaderboardService.getTopParticipants(contestId, limit);
  }

  /**
   * Refresh leaderboard (admin function)
   */
  static async refreshLeaderboard(contestId) {
    await LeaderboardService.invalidateCache(contestId);
    return await LeaderboardService.getLeaderboard(contestId, { forceRefresh: true });
  }

  /**
   * Get contest statistics
   */
  static async getContestStats(contestId) {
    const contest = await Contest.findById(contestId)
      .populate('challenges', 'title difficulty points')
      .lean();

    if (!contest) {
      throw new Error('Contest not found');
    }

    // Get submission statistics
    const submissionStats = await Submission.aggregate([
      {
        $match: {
          challengeId: { $in: contest.challenges.map(c => c._id) },
          submittedAt: {
            $gte: contest.startTime,
            $lte: contest.endTime
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          uniqueParticipants: { $addToSet: '$odId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalSubmissions: 1,
          acceptedSubmissions: 1,
          participantCount: { $size: '$uniqueParticipants' },
          acceptanceRate: {
            $multiply: [
              { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
              100
            ]
          }
        }
      }
    ]);

    const stats = submissionStats[0] || {
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      participantCount: 0,
      acceptanceRate: 0
    };

    return {
      contest: {
        title: contest.title,
        status: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime,
        challengeCount: contest.challenges.length
      },
      stats
    };
  }

  /**
   * Get user's submissions for a contest
   */
  static async getUserSubmissions(contestId, odId) {
    const contest = await Contest.findById(contestId)
      .select('challenges startTime endTime')
      .lean();

    if (!contest) {
      throw new Error('Contest not found');
    }

    const submissions = await Submission.find({
      challengeId: { $in: contest.challenges },
      odId,
      submittedAt: {
        $gte: contest.startTime,
        $lte: contest.endTime
      }
    })
    .populate('challengeId', 'title slug difficulty points')
    .sort({ submittedAt: -1 })
    .lean();

    return submissions;
  }
}

module.exports = ContestService;
