const express = require('express');
const AnalyticsService = require('../services/AnalyticsService');
const BadgeService = require('../services/BadgeService');
const User = require('../models/User');
const router = express.Router();

// Get user progress dashboard
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if MongoDB is available
    if (!require('mongoose').connection.readyState) {
      return res.status(503).json({ 
        error: 'Database not available',
        fallback: true 
      });
    }
    
    const [progress, badges, newBadges] = await Promise.all([
      AnalyticsService.getUserProgress(userId),
      BadgeService.getUserBadges(userId),
      BadgeService.checkAndAwardBadges(userId)
    ]);

    if (!progress) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        ...progress,
        badges,
        newBadges
      }
    });
  } catch (error) {
    // Log error for debugging but don't expose details
    res.status(503).json({ 
      error: 'Database not available',
      fallback: true 
    });
  }
});

// Record learning event
router.post('/event', async (req, res) => {
  try {
    const { userId, eventType, metadata } = req.body;
    
    if (!userId || !eventType) {
      return res.status(400).json({ error: 'userId and eventType required' });
    }

    // Check if MongoDB is available
    if (!require('mongoose').connection.readyState) {
      return res.json({
        success: true,
        data: {
          event: null,
          newBadges: []
        },
        fallback: true
      });
    }

    const event = await AnalyticsService.recordEvent(userId, eventType, metadata);
    const newBadges = await BadgeService.checkAndAwardBadges(userId);

    res.json({
      success: true,
      data: {
        event,
        newBadges
      }
    });
  } catch (error) {
    // Log error for debugging but don't expose details
    res.json({
      success: true,
      data: {
        event: null,
        newBadges: []
      },
      fallback: true
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const timeframe = req.query.timeframe || 'all-time'; // 'weekly', 'monthly', 'all-time'
    
    let dateFilter = {};
    if (timeframe === 'weekly') {
      dateFilter = { lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'monthly') {
      dateFilter = { lastActiveAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const leaderboard = await User.find(dateFilter)
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select('userId displayName totalPoints level badges lastActiveAt');

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    // Return empty leaderboard on error
    res.json({
      success: true,
      data: []
    });
  }
});

// Export progress as PDF data
router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await AnalyticsService.getUserProgress(userId);
    const badges = await BadgeService.getUserBadges(userId);

    if (!progress) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exportData = {
      user: progress.user,
      summary: {
        totalEvents: progress.totalEvents,
        totalPoints: progress.user.totalPoints,
        level: progress.user.level,
        dailyStreak: progress.dailyStreak,
        badgeCount: badges.length
      },
      eventStats: progress.eventStats,
      topLanguages: progress.topLanguages,
      badges: badges.map(b => ({
        name: b.name,
        description: b.description,
        category: b.category,
        rarity: b.rarity,
        points: b.points
      })),
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    // Return error for export failures
    res.status(500).json({ error: 'Export temporarily unavailable' });
  }
});

module.exports = router;