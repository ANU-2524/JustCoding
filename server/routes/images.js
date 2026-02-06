import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import Image from '../models/Image.js';
import { protect as authMiddleware } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/async.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/images');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * POST /api/images/upload
 * Upload single image
 * FormData: image (file), title (text), description (text), galleryId (text)
 */
router.post('/upload', authMiddleware, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const userId = req.user.id;
    const imageFile = req.file;
    const { title, description, galleryId = 'default' } = req.body;
    
    const imageUrl = `/uploads/images/${imageFile.filename}`;
    
    // Create image record
    const image = new Image({
      id: uuidv4(),
      url: imageUrl,
      thumbnail: imageUrl,
      title: title || imageFile.originalname.replace(/\.[^/.]+$/, ''),
      description: description || '',
      metadata: {
        originalName: imageFile.originalname,
        mimeType: imageFile.mimetype,
        size: imageFile.size
      },
      userId,
      galleryId: galleryId || 'default',
      uploadedAt: new Date(),
      views: 0,
      likes: 0
    });

    await image.save();

    res.status(201).json({
      success: true,
      id: image.id,
      url: imageUrl,
      thumbnail: imageUrl,
      title: image.title,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
}));

/**
 * GET /api/images
 * Get images with pagination and filtering
 */
router.get('/', asyncHandler(async (req, res) => {
  const { galleryId = 'default', limit = 50, skip = 0, sortBy = 'recent' } = req.query;
  
  let sortOption = { uploadedAt: -1 };
  if (sortBy === 'popular') {
    sortOption = { views: -1 };
  } else if (sortBy === 'liked') {
    sortOption = { likes: -1 };
  }

  const query = { galleryId };
  if (req.user) {
    query.userId = req.user.id;
  }

  const images = await Image.find(query)
    .sort(sortOption)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .exec();

  const total = await Image.countDocuments(query);

  res.json({
    images,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: skip + limit < total
    }
  });
}));

/**
 * GET /api/images/:id
 * Get single image with details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);
  
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Increment view count
  image.views = (image.views || 0) + 1;
  await image.save();

  res.json(image);
}));

/**
 * PATCH /api/images/:id
 * Update image metadata
 */
router.patch('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  
  const image = await Image.findById(req.params.id);
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Check ownership
  if (image.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to update this image' });
  }

  if (title) image.title = title;
  if (description) image.description = description;

  await image.save();
  res.json(image);
}));

/**
 * DELETE /api/images/:id
 * Delete image
 */
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);
  
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Check ownership
  if (image.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this image' });
  }

  // Delete file from disk
  try {
    const filePath = path.join(__dirname, '../..', image.url);
    await fs.unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  await Image.findByIdAndDelete(req.params.id);
  res.json({ message: 'Image deleted successfully' });
}));

/**
 * POST /api/images/:id/like
 * Toggle like status
 */
router.post('/:id/like', authMiddleware, asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);
  
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  const userId = req.user.id;
  
  if (!image.likes) image.likes = 0;
  if (!image.likedBy) image.likedBy = [];

  const liked = image.likedBy.includes(userId);

  if (liked) {
    image.likedBy = image.likedBy.filter(id => id.toString() !== userId);
    image.likes = Math.max(0, image.likes - 1);
  } else {
    image.likedBy.push(userId);
    image.likes = (image.likes || 0) + 1;
  }

  await image.save();
  res.json({
    image,
    liked: !liked,
    likes: image.likes
  });
}));

/**
 * GET /api/images/gallery/:galleryId
 * Get all images for a specific gallery
 */
router.get('/gallery/:galleryId', asyncHandler(async (req, res) => {
  const { galleryId } = req.params;
  const { limit = 100, skip = 0 } = req.query;

  const images = await Image.find({ galleryId })
    .sort({ uploadedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .exec();

  const total = await Image.countDocuments({ galleryId });

  res.json({
    images,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: skip + limit < total
    }
  });
}));

/**
 * GET /api/images/search
 * Search images by title or description
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit = 50, skip = 0 } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const searchRegex = new RegExp(q, 'i');
  
  const images = await Image.find({
    $or: [
      { title: searchRegex },
      { description: searchRegex }
    ]
  })
    .sort({ uploadedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .exec();

  const total = await Image.countDocuments({
    $or: [
      { title: searchRegex },
      { description: searchRegex }
    ]
  });

  res.json({
    images,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: skip + limit < total
    }
  });
}));

/**
 * GET /api/images/trending
 * Get trending images (most views/likes)
 */
router.get('/trending', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const images = await Image.find()
    .sort({ views: -1, likes: -1 })
    .limit(parseInt(limit))
    .exec();

  res.json({
    images,
    total: images.length
  });
}));

export default router;
