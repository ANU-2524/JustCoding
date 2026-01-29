const express = require('express');
const router = express.Router();
const ExecutionHistory = require('../models/ExecutionHistory');
const ExecutionQueueService = require('../services/ExecutionQueueService');
const { asyncHandler } = require('../middleware/async');

// Get execution history for a room
router.get('/history/room/:roomId', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { limit = 50 } = req.query;

  const history = await ExecutionHistory.getRoomHistory(roomId, parseInt(limit));
  
  res.json({
    success: true,
    roomId,
    history,
    count: history.length
  });
}));

// Get execution history for a user
router.get('/history/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  const history = await ExecutionHistory.getUserHistory(userId, parseInt(limit));
  
  res.json({
    success: true,
    userId,
    history,
    count: history.length
  });
}));

// Get specific execution details
router.get('/history/execution/:executionId', asyncHandler(async (req, res) => {
  const { executionId } = req.params;

  const execution = await ExecutionHistory.findOne({ executionId }).lean();
  
  if (!execution) {
    return res.status(404).json({
      success: false,
      error: 'Execution not found'
    });
  }

  res.json({
    success: true,
    execution
  });
}));

// Get execution statistics for a room
router.get('/stats/room/:roomId', asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { timeRange = 3600000 } = req.query; // Default 1 hour

  const stats = await ExecutionHistory.getStats(roomId, parseInt(timeRange));
  
  res.json({
    success: true,
    roomId,
    timeRange: parseInt(timeRange),
    stats
  });
}));

// Get current queue status
router.get('/queue/status', (req, res) => {
  const { roomId } = req.query;

  const stats = ExecutionQueueService.getQueueStats(roomId);
  
  res.json({
    success: true,
    queueStats: stats
  });
});

// Get queue status for specific room
router.get('/queue/status/:roomId', (req, res) => {
  const { roomId } = req.params;

  const stats = ExecutionQueueService.getQueueStats(roomId);
  
  res.json({
    success: true,
    roomId,
    queueLength: stats.length,
    oldestAge: stats.oldestAge
  });
});

module.exports = router;
