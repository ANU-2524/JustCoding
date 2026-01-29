import express from 'express';
import communityModels from '../models/Community.js';
import { protect as auth } from '../middleware/auth.middleware.js';

const { Post, Comment, Vote, Reputation } = communityModels;

const router = express.Router();

// Get all posts with filtering and pagination
router.get('/posts', async (req, res) => {
  try {
    const {
      category,
      tag,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      search
    } = req.query;

    const query = { isDeleted: false };

    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }
    if (author) {
      query.author = author;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'score', 'viewCount', 'commentCount', 'lastActivity'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
      // Always sort pinned posts first when sorting by other fields
      if (sortBy !== 'createdAt') {
        sortOptions.isPinned = -1;
      }
    }

    const posts = await Post.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post with comments
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).where({ isDeleted: false });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Get comments (top-level and nested)
    const comments = await Comment.find({
      postId: req.params.id,
      isDeleted: false,
      parentCommentId: null
    })
      .sort({ score: -1, createdAt: 1 })
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        options: { sort: { score: -1, createdAt: 1 } }
      })
      .lean();

    res.json({ post, comments });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category, tags, codeSnippets } = req.body;
    const author = req.user?.uid || req.body.author; // Fallback for optional auth

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const post = new Post({
      title,
      content,
      category,
      tags: tags || [],
      codeSnippets: codeSnippets || [],
      author,
      authorName: req.user?.displayName || req.body.authorName || 'Anonymous',
      authorPhotoURL: req.user?.photoURL || req.body.authorPhotoURL || ''
    });

    await post.save();

    // Update user reputation
    await Reputation.findOneAndUpdate(
      { userId: author },
      {
        $inc: { postsCount: 1 },
        $setOnInsert: { userId: author }
      },
      { upsert: true, new: true }
    );

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author !== req.user?.uid && post.author !== req.body.author) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    const updates = req.body;
    updates.lastEditedAt = new Date();
    updates.editedBy = req.user?.uid || req.body.author;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post (soft delete)
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author !== req.user?.uid && post.author !== req.body.author) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Vote on post
router.post('/posts/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const userId = req.user?.uid || req.body.userId;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const existingVote = await Vote.findOne({
      userId,
      targetType: 'post',
      targetId: req.params.id
    });

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existingVote) {
      // Remove existing vote
      if (existingVote.voteType === 'upvote') {
        post.upvotes -= 1;
      } else {
        post.downvotes -= 1;
      }

      await Vote.findByIdAndDelete(existingVote._id);
    }

    // Add new vote if different from existing
    if (!existingVote || existingVote.voteType !== voteType) {
      if (voteType === 'upvote') {
        post.upvotes += 1;
      } else {
        post.downvotes += 1;
      }

      await Vote.create({
        userId,
        targetType: 'post',
        targetId: req.params.id,
        voteType
      });
    }

    await post.save();
    res.json({ upvotes: post.upvotes, downvotes: post.downvotes, score: post.score });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ error: 'Failed to vote on post' });
  }
});

// Get comments for a post
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.id,
      isDeleted: false
    })
      .sort({ score: -1, createdAt: 1 })
      .populate('replies')
      .lean();

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { content, parentCommentId, codeSnippets } = req.body;
    const author = req.user?.uid || req.body.author;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = new Comment({
      postId: req.params.id,
      content,
      parentCommentId,
      codeSnippets: codeSnippets || [],
      author,
      authorName: req.user?.displayName || req.body.authorName || 'Anonymous',
      authorPhotoURL: req.user?.photoURL || req.body.authorPhotoURL || ''
    });

    await comment.save();

    // Update post comment count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

    // Update user reputation
    await Reputation.findOneAndUpdate(
      { userId: author },
      {
        $inc: { commentsCount: 1 },
        $setOnInsert: { userId: author }
      },
      { upsert: true, new: true }
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Vote on comment
router.post('/comments/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const userId = req.user?.uid || req.body.userId;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const existingVote = await Vote.findOne({
      userId,
      targetType: 'comment',
      targetId: req.params.id
    });

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existingVote) {
      if (existingVote.voteType === 'upvote') {
        comment.upvotes -= 1;
      } else {
        comment.downvotes -= 1;
      }
      await Vote.findByIdAndDelete(existingVote._id);
    }

    if (!existingVote || existingVote.voteType !== voteType) {
      if (voteType === 'upvote') {
        comment.upvotes += 1;
      } else {
        comment.downvotes += 1;
      }

      await Vote.create({
        userId,
        targetType: 'comment',
        targetId: req.params.id,
        voteType
      });
    }

    await comment.save();
    res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes, score: comment.score });
  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({ error: 'Failed to vote on comment' });
  }
});

// Get user reputation
router.get('/reputation/:userId', async (req, res) => {
  try {
    const reputation = await Reputation.findOne({ userId: req.params.userId }).lean();
    res.json(reputation || {
      userId: req.params.userId,
      totalReputation: 0,
      postsCount: 0,
      commentsCount: 0
    });
  } catch (error) {
    console.error('Error fetching reputation:', error);
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

// Get categories with post counts
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'general-discussion', name: 'General Discussion', description: 'General topics and discussions' },
      { id: 'help-request', name: 'Help Request', description: 'Ask for help with coding problems' },
      { id: 'code-review', name: 'Code Review', description: 'Share code for review and feedback' },
      { id: 'project-showcase', name: 'Project Showcase', description: 'Show off your projects and get feedback' },
      { id: 'career-advice', name: 'Career Advice', description: 'Career development and job-related discussions' },
      { id: 'learning-resources', name: 'Learning Resources', description: 'Share and discuss learning materials' },
      { id: 'bug-reports', name: 'Bug Reports', description: 'Report bugs and issues' },
      { id: 'feature-requests', name: 'Feature Requests', description: 'Suggest new features and improvements' },
      { id: 'announcements', name: 'Announcements', description: 'Important announcements and updates' },
      { id: 'off-topic', name: 'Off Topic', description: 'Anything not related to coding' }
    ];

    // Get post counts for each category
    const categoryCounts = await Post.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countsMap = {};
    categoryCounts.forEach(cat => {
      countsMap[cat._id] = cat.count;
    });

    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      postCount: countsMap[cat.id] || 0
    }));

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;