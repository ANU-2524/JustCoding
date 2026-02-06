import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Image Model
 * Stores information about uploaded images and screenshots
 */
const ImageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true
    },
    url: {
      type: String,
      required: true,
      index: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    metadata: {
      originalName: String,
      mimeType: String,
      size: Number,
      width: Number,
      height: Number,
      compressionRatio: String,
      srcSet: [String] // Responsive image variants
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    galleryId: {
      type: String,
      default: 'default',
      index: true
    },
    category: {
      type: String,
      enum: ['screenshot', 'code', 'diagram', 'artwork', 'other'],
      default: 'other',
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    views: {
      type: Number,
      default: 0,
      index: true
    },
    likes: {
      type: Number,
      default: 0,
      index: true
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isFavorite: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    },
    exifData: {
      camera: String,
      lens: String,
      iso: Number,
      aperture: String,
      shutterSpeed: String,
      focalLength: String,
      uploadDate: Date
    }
  },
  {
    timestamps: true,
    collection: 'images'
  }
);

// Indexes for common queries
ImageSchema.index({ userId: 1, uploadedAt: -1 });
ImageSchema.index({ galleryId: 1, uploadedAt: -1 });
ImageSchema.index({ title: 'text', description: 'text' });
ImageSchema.index({ tags: 1 });
ImageSchema.index({ category: 1 });
ImageSchema.index({ views: -1 });
ImageSchema.index({ likes: -1 });
ImageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 day retention

/**
 * Virtual field for image size display
 */
ImageSchema.virtual('sizeDisplay').get(function () {
  if (!this.metadata?.size) return 'Unknown';
  const bytes = this.metadata.size;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
});

/**
 * Virtual field for upload time in readable format
 */
ImageSchema.virtual('formattedDate').get(function () {
  if (!this.uploadedAt) return 'Unknown';
  return this.uploadedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

/**
 * Instance methods
 */

/**
 * Add a like from a user
 */
ImageSchema.methods.like = async function (userId) {
  if (!this.likedBy) this.likedBy = [];
  
  const alreadyLiked = this.likedBy.some(id => id.toString() === userId.toString());
  
  if (!alreadyLiked) {
    this.likedBy.push(userId);
    this.likes = (this.likes || 0) + 1;
    await this.save();
  }
  
  return this;
};

/**
 * Remove a like from a user
 */
ImageSchema.methods.unlike = async function (userId) {
  if (!this.likedBy) return this;
  
  this.likedBy = this.likedBy.filter(id => id.toString() !== userId.toString());
  this.likes = Math.max(0, (this.likes || 1) - 1);
  await this.save();
  
  return this;
};

/**
 * Check if user has liked this image
 */
ImageSchema.methods.isLikedBy = function (userId) {
  if (!this.likedBy) return false;
  return this.likedBy.some(id => id.toString() === userId.toString());
};

/**
 * Increment view count
 */
ImageSchema.methods.incrementViews = async function () {
  this.views = (this.views || 0) + 1;
  await this.save();
  return this;
};

/**
 * Delete image (soft delete)
 */
ImageSchema.methods.delete = async function () {
  this.deletedAt = new Date();
  await this.save();
  return this;
};

/**
 * Restore deleted image
 */
ImageSchema.methods.restore = async function () {
  this.deletedAt = null;
  await this.save();
  return this;
};

/**
 * Get image with full user information
 */
ImageSchema.methods.populateUser = async function () {
  await this.populate('userId', 'username email avatar');
  return this;
};

/**
 * Static methods
 */

/**
 * Get trending images
 */
ImageSchema.statics.getTrending = function (limit = 20) {
  return this.find({ deletedAt: null })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('userId', 'username avatar');
};

/**
 * Get images by gallery
 */
ImageSchema.statics.getByGallery = function (galleryId, limit = 50, skip = 0) {
  return this.find({ galleryId, deletedAt: null })
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username avatar');
};

/**
 * Get images by user
 */
ImageSchema.statics.getByUser = function (userId, limit = 100, skip = 0) {
  return this.find({ userId, deletedAt: null })
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Search images
 */
ImageSchema.statics.search = function (query, limit = 50, skip = 0) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ],
    deletedAt: null
  })
    .sort({ views: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'username avatar');
};

/**
 * Get statistics
 */
ImageSchema.statics.getStats = async function (galleryId) {
  const result = await this.aggregate([
    {
      $match: {
        galleryId: galleryId || 'default',
        deletedAt: null
      }
    },
    {
      $group: {
        _id: null,
        totalImages: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        avgViews: { $avg: '$views' },
        avgLikes: { $avg: '$likes' }
      }
    }
  ]);

  return result[0] || {
    totalImages: 0,
    totalViews: 0,
    totalLikes: 0,
    avgViews: 0,
    avgLikes: 0
  };
};

/**
 * Cleanup old deleted images (older than 30 days)
 */
ImageSchema.statics.cleanupDeleted = async function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    deletedAt: { $lt: cutoffDate }
  });

  return result.deletedCount;
};

// Ensure indexes are created
ImageSchema.index({ deletedAt: 1 });

export default mongoose.model('Image', ImageSchema);
