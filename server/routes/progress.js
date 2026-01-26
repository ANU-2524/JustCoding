const express = require('express');
const mongoose = require('mongoose');
const AnalyticsService = require('../services/AnalyticsService');
const BadgeService = require('../services/BadgeService');
const User = require('../models/User');
const { validators, validate, logRequest } = require('../middleware/validation');
const router = express.Router();

// Local validation helpers for route-specific params
function validateUserId(userId) {
  return typeof userId === 'string' && userId.length > 0 && userId.length <= 100;
}

function validateTimeframe(timeframe) {
  const validTimeframes = ['weekly', 'monthly', 'all-time'];
  return typeof timeframe === 'string' && validTimeframes.includes(timeframe);
}

function validateLimit(limit) {
  const num = parseInt(limit, 10);
  return !isNaN(num) && num > 0 && num <= 100;
}

/**
 * GET /api/progress/dashboard/:userId
 * Get user progress dashboard with badges
 * Returns: { success, user, badges, newBadges, ... }
 */
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      logRequest(req, `Invalid userId: ${userId}`, 'warn');
      return res.status(400).json({ success: false, error: 'Invalid userId format' });
    }

    logRequest(req, `Fetching dashboard for user: ${userId}`);

    // Check if MongoDB is available
    if (!mongoose.connection.readyState) {
      logRequest(req, 'Database not available, returning fallback', 'warn');
      return res.status(503).json({
        success: false,
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
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    logRequest(req, `Dashboard fetched successfully for user: ${userId}`);
    res.json({
      success: true,
      ...progress,
      badges,
      newBadges
    });
  } catch (error) {
    logRequest(req, `Dashboard error: ${error.message}`, 'error');
    res.status(503).json({
      success: false,
      error: 'Database not available',
      fallback: true
    });
  }
});

/**
 * POST /api/progress/event
 * Record learning event
 * Returns: { success, event, newBadges }
 */
router.post('/event', validate('progressEvent'), async (req, res) => {
  try {
    const { userId, eventType, metadata } = req.body;

    logRequest(req, `Recording event: ${eventType} for user: ${userId}`);

    // Check if MongoDB is available
    if (!mongoose.connection.readyState) {
      logRequest(req, 'Database not available, returning fallback', 'warn');
      return res.json({
        success: false,
        event: null,
        newBadges: [],
        fallback: true
      });
    }

    const event = await AnalyticsService.recordEvent(userId, eventType, metadata);
    const newBadges = await BadgeService.checkAndAwardBadges(userId);

    logRequest(req, `Event recorded successfully: ${eventType} for user: ${userId}`);
    res.json({
      success: true,
      event,
      newBadges
    });
  } catch (error) {
    logRequest(req, `Event recording error: ${error.message}`, 'error');
    res.json({
      success: false,
      event: null,
      newBadges: [],
      fallback: true
    });
  }
});

/**
 * GET /api/progress/leaderboard
 * Get leaderboard with optional filtering
 * Returns: { success, leaderboard, total }
 */
router.get('/leaderboard', validate('leaderboard', 'query'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const timeframe = req.query.timeframe || 'all-time';
    
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
      leaderboard,
      total: leaderboard.length,
      timeframe
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/progress/export/:userId
 * Export progress as PDF data
 * Returns: { success, user, summary, eventStats, topLanguages, badges, generatedAt }
 */
router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      logRequest(req, `Invalid userId: ${userId}`, 'warn');
      return res.status(400).json({ success: false, error: 'Invalid userId format' });
    }

    logRequest(req, `Exporting progress data for user: ${userId}`);

    const progress = await AnalyticsService.getUserProgress(userId);
    const badges = await BadgeService.getUserBadges(userId);

    if (!progress) {
      logRequest(req, `User not found for export: ${userId}`, 'warn');
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const exportData = {
      success: true,
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
    res.status(500).json({ success: false, error: 'Failed to export progress data' });
  }
});

module.exports = router;