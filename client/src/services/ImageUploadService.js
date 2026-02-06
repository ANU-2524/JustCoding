/**
 * Image Upload & Compression Service
 * Handles image optimization before upload
 */

export class ImageUploadService {
  // Configuration
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  static ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  static QUALITY = 0.8;
  static MAX_WIDTH = 2000;
  static MAX_HEIGHT = 2000;

  /**
   * Validate image file
   */
  static validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return { valid: false, errors };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`Invalid file type. Allowed: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`File too large. Max: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Compress image and convert to WebP if possible
   */
  static async compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large
          if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
            const ratio = Math.min(this.MAX_WIDTH / width, this.MAX_HEIGHT / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP if browser supports it
          canvas.toBlob(
            (blob) => {
              resolve({
                blob,
                dataUrl: canvas.toDataURL('image/webp', this.QUALITY),
                width,
                height,
                size: blob.size,
                originalSize: file.size,
                compressionRatio: ((1 - blob.size / file.size) * 100).toFixed(1)
              });
            },
            'image/webp',
            this.QUALITY
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate thumbnail for preview
   */
  static async generateThumbnail(file, width = 200, height = 200) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          // Center crop
          const srcX = (img.width - width) / 2;
          const srcY = (img.height - height) / 2;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, srcX, srcY, width, height, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve({
                blob,
                dataUrl: canvas.toDataURL('image/webp', this.QUALITY)
              });
            },
            'image/webp',
            this.QUALITY
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to create thumbnail'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload image to backend
   */
  static async uploadImage(file, metadata = {}) {
    try {
      // Validate
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Compress
      const compressed = await this.compressImage(file);

      // Create FormData
      const formData = new FormData();
      formData.append('image', compressed.blob, 'image.webp');
      formData.append('title', metadata.title || file.name.replace(/\.[^/.]+$/, ''));
      formData.append('description', metadata.description || '');
      formData.append('galleryId', metadata.galleryId || 'default');

      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please login first.');
      }

      // Upload to backend
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMsg = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.details || errorMsg;
        } catch (e) {
          // Couldn't parse error response
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      return {
        id: result.id,
        url: result.url,
        thumbnail: result.thumbnail,
        title: result.title,
        success: true
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Get responsive image srcset
   */
  static getSrcSet(imageUrl) {
    if (!imageUrl) return '';
    
    // Adjust sizes based on URL (assuming CDN with query params)
    return `
      ${imageUrl}?w=400 400w,
      ${imageUrl}?w=800 800w,
      ${imageUrl}?w=1200 1200w,
      ${imageUrl}?w=1600 1600w
    `;
  }

  /**
   * Get file size readable format
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default ImageUploadService;
