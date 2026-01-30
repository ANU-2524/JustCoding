import LearningEvent from '../models/LearningEvent.js';
import User from '../models/User.js';

class AnalyticsService {
  static async getUserProgress(userId) {
    try {
      const user = await User.findOne({ userId });
      if (!user) return null;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [totalEvents, monthlyEvents, weeklyEvents, dailyStreak] = await Promise.all([
        LearningEvent.countDocuments({ userId }),
        LearningEvent.countDocuments({ userId, timestamp: { $gte: thirtyDaysAgo } }),
        LearningEvent.countDocuments({ userId, timestamp: { $gte: sevenDaysAgo } }),
        this.calculateDailyStreak(userId)
      ]);

      const eventStats = await LearningEvent.aggregate([
        { $match: { userId } },
        { $group: { _id: '$eventType', count: { $sum: 1 }, points: { $sum: '$points' } } }
      ]);

      const languageStats = await LearningEvent.aggregate([
        { $match: { userId, language: { $exists: true } } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        user,
        totalEvents,
        monthlyEvents,
        weeklyEvents,
        dailyStreak,
        eventStats: eventStats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, points: stat.points };
          return acc;
        }, {}),
        topLanguages: languageStats.slice(0, 5)
      };
    } catch (error) {
      console.error('Analytics error:', error);
      return null;
    }
  }

  static async calculateDailyStreak(userId) {
    const events = await LearningEvent.find({ userId })
      .sort({ timestamp: -1 })
      .select('timestamp');

    if (events.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const eventDates = [...new Set(events.map(e => {
      const date = new Date(e.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }))].sort((a, b) => b - a);

    for (const eventTime of eventDates) {
      if (eventTime === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (eventTime === currentDate.getTime() + 24 * 60 * 60 * 1000) {
        // Skip today if no activity, but continue streak from yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        if (eventTime === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
      } else {
        break;
      }
    }

    return streak;
  }

  static async recordEvent(userId, eventType, metadata = {}) {
    try {
      const points = this.calculatePoints(eventType, metadata);
      
      const event = new LearningEvent({
        userId,
        eventType,
        language: metadata.language,
        codeLength: metadata.codeLength,
        sessionDuration: metadata.sessionDuration,
        points,
        metadata
      });

      await event.save();
      await User.findOneAndUpdate(
        { userId },
        { 
          $inc: { totalPoints: points },
          $set: { lastActiveAt: new Date() }
        },
        { upsert: true }
      );

      return event;
    } catch (error) {
      console.error('Record event error:', error);
      return null;
    }
  }

  static calculatePoints(eventType, metadata) {
    const pointsMap = {
      code_run: 5,
      ai_explain: 3,
      ai_debug: 4,
      snippet_create: 8,
      session_join: 10,
      visualize: 6,
      challenge_complete: 20
    };

    let basePoints = pointsMap[eventType] || 1;
    
    // Bonus points for longer code
    if (metadata.codeLength > 100) basePoints += 2;
    if (metadata.codeLength > 500) basePoints += 3;

    return basePoints;
  }
}

export default AnalyticsService;