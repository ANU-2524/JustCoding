const express = require('express');
const AnalyticsService = require('../services/AnalyticsService');
const BadgeService = require('../services/BadgeService');
const User = require('../models/User');
const router = express.Router();

// Validation functions
function validateUserId(userId) {
  return typeof userId === 'string' && userId.length > 0 && userId.length <= 100;
}

function validateEventType(eventType) {
  const validTypes = ['code_run', 'code_submit', 'challenge_solve', 'tutorial_view', 'login'];
  return typeof eventType === 'string' && validTypes.includes(eventType);
}

function validateTimeframe(timeframe) {
  const validTimeframes = ['weekly', 'monthly', 'all-time'];
  return typeof timeframe === 'string' && validTimeframes.includes(timeframe);
}

function validateLimit(limit) {
  const num = parseInt(limit, 10);
  return !isNaN(num) && num > 0 && num <= 100;
}

// Logging helper
function logRequest(req, message, level = 'info') {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    message
  };
  console[level](JSON.stringify(logData));
}

// Get user progress dashboard
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      logRequest(req, `Invalid userId: ${userId}`, 'warn');
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    logRequest(req, `Fetching dashboard for user: ${userId}`);

    // Check if MongoDB is available
    if (!require('mongoose').connection.readyState) {
      logRequest(req, 'Database not available, returning fallback', 'warn');
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
      logRequest(req, `User not found: ${userId}`, 'warn');
      return res.status(404).json({ error: 'User not found' });
    }

    logRequest(req, `Dashboard fetched successfully for user: ${userId}`);
    res.json({
      ...progress,
      badges,
      newBadges
    });
  } catch (error) {
    logRequest(req, `Dashboard error: ${error.message}`, 'error');
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

    if (!validateUserId(userId)) {
      logRequest(req, `Invalid userId: ${userId}`, 'warn');
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    if (!validateEventType(eventType)) {
      logRequest(req, `Invalid eventType: ${eventType}`, 'warn');
      return res.status(400).json({ error: 'Invalid eventType. Must be one of: code_run, code_submit, challenge_solve, tutorial_view, login' });
    }

    logRequest(req, `Recording event: ${eventType} for user: ${userId}`);

    // Check if MongoDB is available
    if (!require('mongoose').connection.readyState) {
      logRequest(req, 'Database not available, returning fallback', 'warn');
      return res.json({
        event: null,
        newBadges: [],
        fallback: true
      });
    }

    const event = await AnalyticsService.recordEvent(userId, eventType, metadata);
    const newBadges = await BadgeService.checkAndAwardBadges(userId);

    logRequest(req, `Event recorded successfully: ${eventType} for user: ${userId}`);
    res.json({
      event,
      newBadges
    });
  } catch (error) {
    logRequest(req, `Event recording error: ${error.message}`, 'error');
    res.json({
      event: null,
      newBadges: [],
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

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Export progress as PDF data
router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      logRequest(req, `Invalid userId: ${userId}`, 'warn');
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    logRequest(req, `Exporting progress data for user: ${userId}`);

    const progress = await AnalyticsService.getUserProgress(userId);
    const badges = await BadgeService.getUserBadges(userId);

    if (!progress) {
      logRequest(req, `User not found for export: ${userId}`, 'warn');
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

    logRequest(req, `Progress data exported successfully for user: ${userId}`);
    res.json(exportData);
  } catch (error) {
    logRequest(req, `Export error: ${error.message}`, 'error');
    res.status(500).json({ error: 'Failed to export progress data' });
  }
});

module.exports = router;