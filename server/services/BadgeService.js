import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import LearningEvent from '../models/LearningEvent.js';

class BadgeService {
  static async initializeBadges() {
    const badges = [
      // Coding badges
      { badgeId: 'first_run', name: 'First Steps', description: 'Run your first code', icon: '🚀', category: 'coding', points: 10 },
      { badgeId: 'code_runner_10', name: 'Code Runner', description: 'Run code 10 times', icon: '⚡', category: 'coding', points: 25 },
      { badgeId: 'code_runner_100', name: 'Speed Demon', description: 'Run code 100 times', icon: '💨', category: 'coding', points: 100, rarity: 'rare' },
      { badgeId: 'polyglot', name: 'Polyglot', description: 'Use 5 different languages', icon: '🌍', category: 'coding', points: 50, rarity: 'rare' },
      
      // Learning badges
      { badgeId: 'first_ai_help', name: 'AI Assistant', description: 'Use AI explanation for the first time', icon: '🤖', category: 'learning', points: 15 },
      { badgeId: 'debug_master', name: 'Debug Master', description: 'Use AI debugging 25 times', icon: '🔧', category: 'learning', points: 75, rarity: 'rare' },
      { badgeId: 'visualizer', name: 'Visual Learner', description: 'Use code visualizer 10 times', icon: '📊', category: 'learning', points: 40 },
      
      // Social badges
      { badgeId: 'collaborator', name: 'Team Player', description: 'Join 5 collaboration sessions', icon: '👥', category: 'social', points: 60 },
      { badgeId: 'mentor', name: 'Mentor', description: 'Help others in 10 sessions', icon: '🎓', category: 'social', points: 100, rarity: 'epic' },
      
      // Milestone badges
      { badgeId: 'points_100', name: 'Century', description: 'Earn 100 points', icon: '💯', category: 'milestone', points: 20 },
      { badgeId: 'points_500', name: 'High Achiever', description: 'Earn 500 points', icon: '⭐', category: 'milestone', points: 50, rarity: 'rare' },
      { badgeId: 'points_1000', name: 'Elite Coder', description: 'Earn 1000 points', icon: '👑', category: 'milestone', points: 100, rarity: 'epic' },
      
      // Streak badges
      { badgeId: 'streak_3', name: 'Consistent', description: '3-day coding streak', icon: '🔥', category: 'streak', points: 30 },
      { badgeId: 'streak_7', name: 'Dedicated', description: '7-day coding streak', icon: '🌟', category: 'streak', points: 70, rarity: 'rare' },
      { badgeId: 'streak_30', name: 'Unstoppable', description: '30-day coding streak', icon: '💎', category: 'streak', points: 200, rarity: 'legendary' }
    ];

    for (const badge of badges) {
      await Achievement.findOneAndUpdate(
        { badgeId: badge.badgeId },
        badge,
        { upsert: true, new: true }
      );
    }
  }

  static async checkAndAwardBadges(userId) {
    try {
      // FIX: Sanitize input to prevent NoSQL injection
      const safeUserId = String(userId);

      const user = await User.findOne({ userId: safeUserId });
      if (!user) return [];

      const newBadges = [];
      const achievements = await Achievement.find({ isActive: true });

      for (const achievement of achievements) {
        if (user.badges.includes(achievement.badgeId)) continue;

        // Pass sanitized userId
        const earned = await this.checkBadgeCriteria(safeUserId, achievement);
        if (earned) {
          await User.findOneAndUpdate(
            { userId: safeUserId },
            { 
              $push: { badges: achievement.badgeId },
              $inc: { totalPoints: achievement.points }
            }
          );
          newBadges.push(achievement);
        }
      }

      return newBadges;
    } catch (error) {
      console.error('Badge check error:', error);
      return [];
    }
  }

  static async checkBadgeCriteria(userId, achievement) {
    const { badgeId } = achievement;
    
    // FIX: Ensure userId is treated strictly as a string
    const safeUserId = String(userId);

    switch (badgeId) {
      case 'first_run':
        return await LearningEvent.countDocuments({ userId: safeUserId, eventType: 'code_run' }) >= 1;
      
      case 'code_runner_10':
        return await LearningEvent.countDocuments({ userId: safeUserId, eventType: 'code_run' }) >= 10;
      
      case 'code_runner_100':
        return await LearningEvent.countDocuments({ userId: safeUserId, eventType: 'code_run' }) >= 100;
      
      case 'polyglot':
        const languages = await LearningEvent.distinct('language', { userId: safeUserId, language: { $exists: true } });
        return languages.length >= 5;
      
      case 'first_ai_help':
        return await LearningEvent.countDocuments({ userId: safeUserId, eventType: 'ai_explain' }) >= 1;
      
      case 'debug_master':
        return await LearningEvent.countDocuments({ userId: safeUserId, eventType: 'ai_debug' }) >= 25;
      
      case 'visualizer':
        return await LearningEvent.countDocuments({ userId: safeUserId, eventType: 'visualize' }) >= 10;
      
      case 'collaborator':
        return await LearningEvent.countDocuments({ userId: safeUserId, eventType: 'session_join' }) >= 5;
      
      case 'points_100':
        const user100 = await User.findOne({ userId: safeUserId });
        return user100 && user100.totalPoints >= 100;
      
      case 'points_500':
        const user500 = await User.findOne({ userId: safeUserId });
        return user500 && user500.totalPoints >= 500;
      
      case 'points_1000':
        const user1000 = await User.findOne({ userId: safeUserId });
        return user1000 && user1000.totalPoints >= 1000;
      
      default:
        return false;
    }
  }

  static async getUserBadges(userId) {
    try {
      // FIX: Sanitize input to prevent NoSQL injection
      const safeUserId = String(userId);

      const user = await User.findOne({ userId: safeUserId });
      if (!user) return [];

      const badges = await Achievement.find({ 
        badgeId: { $in: user.badges },
        isActive: true 
      });

      return badges.map(badge => ({
        ...badge.toObject(),
        earnedAt: user.createdAt // Simplified - could track individual earn dates
      }));
    } catch (error) {
      console.error('Get badges error:', error);
      return [];
    }
  }
}

export default BadgeService;