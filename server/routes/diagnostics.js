/**
 * Diagnostics & Monitoring Route
 * Provides insights into message ordering, execution history, and room states
 */

import express from 'express';
import MessageOrderingService from '../services/MessageOrderingService.js';
import MessageHistoryModel from '../models/MessageHistory.js';
import Room from '../models/Room.js';
import { logger } from '../services/logger.js';

const router = express.Router();

/**
 * GET /api/diagnostics/ordering - Get message ordering statistics
 */
router.get('/ordering', (req, res) => {
  try {
    const stats = MessageOrderingService.getStats();
    res.json({
      success: true,
      orderingStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting ordering stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/diagnostics/room/:roomId - Get room's message ordering state
 */
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const roomState = MessageOrderingService.getRoomState(roomId);
    const room = await Room.findOne({ roomId });
    const messageStats = await MessageHistoryModel.getRoomStats(roomId);
    const bufferedMessages = MessageOrderingService.getBufferedMessages(roomId);

    res.json({
      success: true,
      roomId,
      orderingState: roomState || { status: 'not-initialized' },
      roomCausality: room?.getCausalityState() || {},
      messageStats: messageStats || {},
      bufferedMessageCount: bufferedMessages.length,
      bufferedSequences: bufferedMessages.map(m => m.sequence),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting room diagnostics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/diagnostics/room/:roomId/history - Get message history for debugging
 */
router.get('/room/:roomId/history', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const messages = await MessageHistoryModel.find({ roomId })
      .sort({ sequence: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const totalCount = await MessageHistoryModel.countDocuments({ roomId });

    res.json({
      success: true,
      roomId,
      messages: messages.reverse(),
      pagination: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        total: totalCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting room message history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/diagnostics/room/:roomId/gaps - Find sequence gaps
 */
router.get('/room/:roomId/gaps', async (req, res) => {
  try {
    const { roomId } = req.params;

    const roomState = MessageOrderingService.getRoomState(roomId);
    if (!roomState) {
      return res.json({
        success: true,
        roomId,
        gaps: [],
        status: 'room-not-initialized'
      });
    }

    const fromSeq = 1;
    const toSeq = Math.max(...roomState.bufferedSequences, roomState.expectedSequence - 1) || 1;

    const gaps = await MessageHistoryModel.findSequenceGaps(roomId, fromSeq, toSeq);

    res.json({
      success: true,
      roomId,
      gaps,
      expectedSequence: roomState.expectedSequence,
      hasCriticalGaps: gaps.some(g => g.to - g.from > 10)
    });
  } catch (error) {
    logger.error('Error detecting gaps:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/diagnostics/room/:roomId/force-advance - Force advance sequence (admin only)
 * Used to recover from stuck rooms
 */
router.post('/room/:roomId/force-advance', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { toSequence } = req.body;

    if (!toSequence) {
      return res.status(400).json({
        success: false,
        error: 'toSequence is required'
      });
    }

    logger.warn('Force advancing sequence', { roomId, toSequence });
    MessageOrderingService.forceAdvanceSequence(roomId, toSequence);

    const newState = MessageOrderingService.getRoomState(roomId);
    res.json({
      success: true,
      message: 'Sequence advanced',
      newState
    });
  } catch (error) {
    logger.error('Error force advancing sequence:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/diagnostics/room/:roomId/replay - Get messages for replay
 */
router.get('/room/:roomId/replay', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { fromSequence = 1, toSequence } = req.query;

    const to = toSequence || MessageOrderingService.getExpectedSequence(roomId);

    const messages = await MessageHistoryModel.getSequenceRange(
      roomId,
      parseInt(fromSequence),
      parseInt(to)
    );

    res.json({
      success: true,
      roomId,
      replayMessages: messages,
      range: {
        from: parseInt(fromSequence),
        to: parseInt(to)
      }
    });
  } catch (error) {
    logger.error('Error getting replay messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/diagnostics/cleanup - Force cleanup all rooms (admin use only)
 */
router.post('/cleanup', (req, res) => {
  try {
    logger.warn('Manual cleanup triggered');
    MessageOrderingService.cleanupAll();

    res.json({
      success: true,
      message: 'All rooms cleanup completed'
    });
  } catch (error) {
    logger.error('Error in cleanup:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/diagnostics/health - Health check
 */
router.get('/health', (req, res) => {
  try {
    const orderingStats = MessageOrderingService.getStats();
    const hasIssues = orderingStats.maxPendingInRoom > orderingStats.bufferCapacity * 0.8;

    res.json({
      success: true,
      status: hasIssues ? 'warning' : 'healthy',
      orderingStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      error: error.message
    });
  }
});

export default router;
