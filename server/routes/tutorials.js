import express from 'express';
import { Tutorial, TutorialProgress } from '../models/Tutorial.js';
import LearningEvent from '../models/LearningEvent.js';

const router = express.Router();

// Simple auth middleware for tutorials - optional for now
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // For now, we'll decode a simple token or user ID
      // In a real implementation, this would verify Firebase or JWT tokens
      req.user = { uid: token.split('-')[0] || 'anonymous' };
    }
  } catch (error) {
    // Continue without auth
  }
  next();
};

// Required auth middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  try {
    // Simple token parsing for demo
    req.user = { uid: token.split('-')[0] || 'anonymous' };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Get all tutorials with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      difficulty,
      category,
      language,
      search,
      featured
    } = req.query;

    const query = { isPublished: true };
    
    // Apply filters
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (language && language !== 'all') query.language = language;
    if (featured === 'true') query.isFeatured = true;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const tutorials = await Tutorial.find(query)
      .select('-steps') // Exclude detailed steps in list view
      .sort({ isFeatured: -1, rating: -1, completionCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('prerequisites', 'title slug difficulty')
      .populate('relatedChallenges', 'title slug difficulty')
      .exec();

    const total = await Tutorial.countDocuments(query);

    res.json({
      tutorials,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch tutorials' });
  }
});

// Get tutorial categories and stats
router.get('/categories', async (req, res) => {
  try {
    const categories = await Tutorial.aggregate([
      { $match: { isPublished: true } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    const difficulties = await Tutorial.aggregate([
      { $match: { isPublished: true } },
      { $group: { 
        _id: '$difficulty', 
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const languages = await Tutorial.aggregate([
      { $match: { isPublished: true } },
      { $group: { 
        _id: '$language', 
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({ categories, difficulties, languages });
  } catch (error) {
    console.error('Error fetching tutorial categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get featured tutorials for homepage
router.get('/featured', async (req, res) => {
  try {
    const tutorials = await Tutorial.find({ 
      isPublished: true, 
      isFeatured: true 
    })
      .select('-steps')
      .limit(6)
      .sort({ rating: -1 })
      .exec();

    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching featured tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch featured tutorials' });
  }
});

// Get learning path recommendations
router.get('/learning-paths', async (req, res) => {
  try {
    const { language, difficulty = 'beginner' } = req.query;
    
    const query = { isPublished: true, difficulty };
    if (language && language !== 'all') {
      query.language = language;
    }

    const tutorials = await Tutorial.find(query)
      .select('-steps')
      .sort({ completionCount: -1 })
      .limit(8)
      .populate('nextTutorials', 'title slug difficulty')
      .exec();

    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ error: 'Failed to fetch learning paths' });
  }
});

// Get single tutorial with full details
router.get('/:slug', async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    })
      .populate('prerequisites', 'title slug difficulty')
      .populate('relatedChallenges', 'title slug difficulty points')
      .populate('nextTutorials', 'title slug difficulty estimatedDuration')
      .exec();

    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    res.json(tutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    res.status(500).json({ error: 'Failed to fetch tutorial' });
  }
});

// Get user's progress for a tutorial (requires auth)
router.get('/:slug/progress', requireAuth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ slug: req.params.slug });
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    const progress = await TutorialProgress.findOne({
      userId: req.user.uid,
      tutorialId: tutorial._id
    });

    res.json(progress || { 
      currentStep: 1, 
      completedSteps: [], 
      timeSpent: 0 
    });
  } catch (error) {
    console.error('Error fetching tutorial progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update user's progress for a tutorial (requires auth)
router.put('/:slug/progress', requireAuth, async (req, res) => {
  try {
    const { currentStep, completedSteps, timeSpent, rating, feedback } = req.body;
    
    const tutorial = await Tutorial.findOne({ slug: req.params.slug });
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    const updateData = {
      userId: req.user.uid,
      tutorialId: tutorial._id,
      lastAccessedAt: new Date()
    };

    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (completedSteps !== undefined) updateData.completedSteps = completedSteps;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (rating !== undefined) updateData.rating = rating;
    if (feedback !== undefined) updateData.feedback = feedback;

    // Mark as completed if all steps are done
    if (completedSteps && completedSteps.length === tutorial.steps.length) {
      updateData.completedAt = new Date();
    }

    const progress = await TutorialProgress.findOneAndUpdate(
      { userId: req.user.uid, tutorialId: tutorial._id },
      updateData,
      { upsert: true, new: true }
    );

    // Award points for completion (first time only)
    if (updateData.completedAt && !progress.completedAt) {
      // Add learning event for analytics
      await LearningEvent.create({
        userId: req.user.uid,
        eventType: 'tutorial_complete',
        metadata: {
          tutorialId: tutorial._id,
          tutorialTitle: tutorial.title,
          difficulty: tutorial.difficulty,
          timeSpent: timeSpent || 0
        },
        points: tutorial.difficulty === 'beginner' ? 10 : 
               tutorial.difficulty === 'intermediate' ? 15 : 20
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error updating tutorial progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get user's overall tutorial progress (requires auth)
router.get('/user/progress', requireAuth, async (req, res) => {
  try {
    const progressData = await TutorialProgress.find({ userId: req.user.uid })
      .populate('tutorialId', 'title slug difficulty category language estimatedDuration')
      .sort({ lastAccessedAt: -1 })
      .exec();

    const stats = await TutorialProgress.aggregate([
      { $match: { userId: req.user.uid } },
      {
        $group: {
          _id: null,
          totalTutorials: { $sum: 1 },
          completedTutorials: { $sum: { $cond: [{ $ne: ['$completedAt', null] }, 1, 0] } },
          totalTimeSpent: { $sum: '$timeSpent' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      progress: progressData,
      stats: stats[0] || {
        totalTutorials: 0,
        completedTutorials: 0,
        totalTimeSpent: 0,
        avgRating: 0
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

export default router;