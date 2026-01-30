import express from 'express';
const router = express.Router();
import Thread from '../models/Thread.js';
import Post from '../models/Post.js';
import ModerationLog from '../models/ModerationLog.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.middleware.js';

// Create a new thread
router.post('/threads', protect, async (req, res) => {
  try {
    const thread = new Thread({
      title: req.body.title,
      author: req.user._id,
      tags: req.body.tags || [],
    });
    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all threads
router.get('/threads', async (req, res) => {
  try {
    const threads = await Thread.find().sort({ pinned: -1, updatedAt: -1 }).populate('author', 'username reputation');
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a thread by ID (with posts)
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id).populate('author', 'username reputation');
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const posts = await Post.find({ thread: thread._id, parent: null }).populate('author', 'username reputation');
    res.json({ thread, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a post (or reply) to a thread
router.post('/threads/:id/posts', protect, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    const post = new Post({
      thread: thread._id,
      author: req.user._id,
      content: req.body.content,
      parent: req.body.parent || null,
      isReply: !!req.body.parent,
      mentions: req.body.mentions || [],
    });
    await post.save();
    thread.postCount += 1;
    thread.lastPost = post._id;
    thread.updatedAt = new Date();
    await thread.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote/Downvote a post
router.post('/posts/:id/vote', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { type } = req.body; // 'up' or 'down'
    if (type === 'up') {
      if (!post.upvotes.includes(req.user._id)) post.upvotes.push(req.user._id);
      post.downvotes = post.downvotes.filter(id => id.toString() !== req.user._id.toString());
    } else if (type === 'down') {
      if (!post.downvotes.includes(req.user._id)) post.downvotes.push(req.user._id);
      post.upvotes = post.upvotes.filter(id => id.toString() !== req.user._id.toString());
    }
    await post.save();
    res.json({ upvotes: post.upvotes.length, downvotes: post.downvotes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Moderation: lock, pin, delete thread/post
router.post('/moderate', protect, async (req, res) => {
  // Only allow moderators/admins (add your own logic)
  try {
    const { action, targetType, targetId, reason } = req.body;
    let result;
    if (targetType === 'Thread') {
      const thread = await Thread.findById(targetId);
      if (!thread) return res.status(404).json({ error: 'Thread not found' });
      if (action === 'lock') thread.locked = true;
      if (action === 'pin') thread.pinned = true;
      if (action === 'delete') await thread.remove();
      else await thread.save();
      result = thread;
    } else if (targetType === 'Post') {
      const post = await Post.findById(targetId);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      if (action === 'delete') post.deleted = true;
      await post.save();
      result = post;
    }
    const log = new ModerationLog({ action, targetType, targetId, moderator: req.user._id, reason });
    await log.save();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get notifications for user
router.get('/notifications', protect, async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
