import Contest from '../models/Contest.js';
import Submission from '../models/Submission.js';
import redis from 'redis';

// Initialize Redis client
let redisClient = null;
let isRedisAvailable = false;

const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      // Suppress connection errors - Redis is optional
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected for leaderboard caching');
      isRedisAvailable = true;
    });

    await redisClient.connect();
  } catch (error) {
    isRedisAvailable = false;
  }
};

// Initialize Redis on module load
initRedis().catch(console.error);

class LeaderboardService {
  /**
   * Get cache key for a contest leaderboard
   */
  static getCacheKey(contestId) {
    return `leaderboard:contest:${contestId}`;
  }

  /**
   * Calculate leaderboard with optimized aggregation pipeline
   * Includes tie-breaking rules:
   * 1. Total points (descending)
   * 2. Number of problems solved (descending)
   * 3. Total time penalty (ascending) - sum of submission times
   * 4. Last submission time (ascending) - earlier is better
   */
  static async calculateLeaderboard(contestId, limit = 100) {
    try {
      // Get contest to validate and get challenge IDs
      const contest = await Contest.findById(contestId)
        .select('challenges startTime endTime')
        .lean();

      if (!contest) {
        throw new Error('Contest not found');
      }

      // Optimized aggregation pipeline with proper indexing
      const leaderboard = await Submission.aggregate([
        // Match submissions for this contest's challenges within contest time
        {
          $match: {
            challengeId: { $in: contest.challenges },
            submittedAt: {
              $gte: contest.startTime,
              $lte: contest.endTime
            }
          }
        },
        // Sort to get best submission per user per challenge
        {
          $sort: {
            odId: 1,
            challengeId: 1,
            points: -1,
            executionTime: 1,
            submittedAt: 1
          }
        },
        // Group by user and challenge to get best submission
        {
          $group: {
            _id: {
              odId: '$odId',
              challengeId: '$challengeId'
            },
            odName: { $first: '$odName' },
            points: { $first: '$points' },
            submittedAt: { $first: '$submittedAt' },
            status: { $first: '$status' }
          }
        },
        // Group by user to calculate totals
        {
          $group: {
            _id: '$_id.odId',
            odName: { $first: '$odName' },
            totalPoints: { $sum: '$points' },
            solvedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
              }
            },
            totalTime: { $sum: '$submittedAt' }, // Sum of timestamps for penalty
            lastSubmission: { $max: '$submittedAt' },
            submissions: { $sum: 1 }
          }
        },
        // Apply tie-breaking rules in sort
        {
          $sort: {
            totalPoints: -1,      // Higher points first
            solvedCount: -1,      // More problems solved
            totalTime: 1,         // Lower time penalty
            lastSubmission: 1     // Earlier last submission
          }
        },
        // Limit results
        { $limit: limit },
        // Add rank field
        {
          $setWindowFields: {
            sortBy: {
              totalPoints: -1,
              solvedCount: -1,
              totalTime: 1,
              lastSubmission: 1
            },
            output: {
              rank: { $rank: {} }
            }
          }
        },
        // Project final fields
        {
          $project: {
            _id: 0,
            rank: 1,
            odId: '$_id',
            odName: 1,
            totalPoints: 1,
            solvedCount: 1,
            totalTime: 1,
            lastSubmission: 1,
            submissions: 1
          }
        }
      ]).allowDiskUse(true); // Allow disk use for large datasets

      return leaderboard;
    } catch (error) {
      console.error('Error calculating leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard from cache or database
   */
  static async getLeaderboard(contestId, options = {}) {
    const {
      limit = 100,
      forceRefresh = false,
      page = 1
    } = options;

    const cacheKey = this.getCacheKey(contestId);

    // Try to get from Redis cache if available
    if (isRedisAvailable && redisClient && !forceRefresh) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const leaderboard = JSON.parse(cached);
          
          // Apply pagination
          const start = (page - 1) * limit;
          const end = start + limit;
          
          return {
            leaderboard: leaderboard.slice(start, end),
            totalParticipants: leaderboard.length,
            cached: true,
            page,
            limit
          };
        }
      } catch (error) {
        console.error('Redis get error:', error.message);
      }
    }

    // Calculate from database
    const leaderboard = await this.calculateLeaderboard(contestId, limit * 10); // Get more for caching

    // Cache the result
    if (isRedisAvailable && redisClient) {
      try {
        // Cache for 60 seconds for active contests, 5 minutes for ended ones
        const contest = await Contest.findById(contestId).select('status').lean();
        const ttl = contest.status === 'active' ? 60 : 300;
        
        await redisClient.setEx(
          cacheKey,
          ttl,
          JSON.stringify(leaderboard)
        );
      } catch (error) {
        console.error('Redis set error:', error.message);
      }
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      leaderboard: leaderboard.slice(start, end),
      totalParticipants: leaderboard.length,
      cached: false,
      page,
      limit
    };
  }

  /**
   * Invalidate cache for a contest
   */
  static async invalidateCache(contestId) {
    if (isRedisAvailable && redisClient) {
      try {
        await redisClient.del(this.getCacheKey(contestId));
      } catch (error) {
        console.error('Redis delete error:', error.message);
      }
    }
  }

  /**
   * Update leaderboard incrementally after a submission
   */
  static async updateAfterSubmission(contestId, submission) {
    try {
      // Invalidate cache to force recalculation on next request
      await this.invalidateCache(contestId);

      // Optionally: Update materialized view in database
      const contest = await Contest.findById(contestId);
      if (!contest) return;

      // For active contests, trigger background recalculation
      if (contest.status === 'active') {
        // This happens asynchronously without waiting
        setImmediate(async () => {
          try {
            const leaderboard = await this.calculateLeaderboard(contestId, 1000);
            contest.leaderboard = leaderboard;
            await contest.save();
          } catch (error) {
            console.error('Background leaderboard update error:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error updating leaderboard after submission:', error);
    }
  }

  /**
   * Get user's rank in contest
   */
  static async getUserRank(contestId, odId) {
    const cacheKey = this.getCacheKey(contestId);

    // Try cache first
    if (isRedisAvailable && redisClient) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          const leaderboard = JSON.parse(cached);
          const userEntry = leaderboard.find(entry => entry.odId === odId);
          return userEntry || null;
        }
      } catch (error) {
        console.error('Redis error:', error.message);
      }
    }

    // Calculate and find user
    const leaderboard = await this.calculateLeaderboard(contestId, 10000);
    const userEntry = leaderboard.find(entry => entry.odId === odId);
    
    return userEntry || null;
  }

  /**
   * Get top N participants
   */
  static async getTopParticipants(contestId, limit = 10) {
    const result = await this.getLeaderboard(contestId, { limit, page: 1 });
    return result.leaderboard;
  }

  /**
   * Cleanup - close Redis connection
   */
  static async cleanup() {
    if (redisClient && isRedisAvailable) {
      try {
        await redisClient.quit();
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await LeaderboardService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await LeaderboardService.cleanup();
  process.exit(0);
});

export default LeaderboardService;
