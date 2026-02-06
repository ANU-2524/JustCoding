import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaUpload, FaFilter, FaSearch, FaTrash, FaHeart, FaEye } from 'react-icons/fa';
import ImageLightbox from './ImageLightbox';
import ImageUploadService from '../services/ImageUploadService';
import '../Style/ImageGallery.css';

/**
 * ImageGallery Component
 * Features: Grid/Carousel view, lazy loading, responsive, lightbox modal
 */
const ImageGallery = ({ galleryId = 'default', allowUpload = true, maxImages = 50 }) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // grid or carousel
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [filter, setFilter] = useState('all'); // all, favorites, trending
  
  const fileInputRef = useRef(null);
  const observerRef = useRef(new IntersectionObserver(handleImageInView));

  // Load images on mount
  useEffect(() => {
    fetchImages();
  }, [galleryId]);

  // Filter and sort images
  useEffect(() => {
    let filtered = images;

    // Filter by search
    if (search.trim()) {
      filtered = filtered.filter(img =>
        img.title?.toLowerCase().includes(search.toLowerCase()) ||
        img.description?.toLowerCase().includes(search.toLowerCase()) ||
        img.author?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by type
    if (filter === 'favorites') {
      filtered = filtered.filter(img => img.isFavorite);
    } else if (filter === 'trending') {
      filtered = filtered.filter(img => img.views > 10 || img.likes > 5);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );
    } else if (sortBy === 'popular') {
      filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'liked') {
      filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredImages(filtered);
  }, [images, search, sortBy, filter]);

  /**
   * Fetch images from backend
   */
  async function fetchImages() {
    try {
      setLoading(true);
      const response = await fetch(`/api/images?galleryId=${galleryId}&limit=${maxImages}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch images');

      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      // Use demo data if API fails
      setImages(getDemoImages());
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle image in view (lazy loading)
   */
  function handleImageInView(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        if (src && !img.src) {
          img.src = src;
          img.classList.add('loaded');
          observerRef.current.unobserve(img);
        }
      }
    });
  }

  /**
   * Handle file upload
   */
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(file.name);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 30, 90));
      }, 500);

      // Upload
      const result = await ImageUploadService.uploadImage(file, {
        galleryId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: ''
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add to gallery
      const newImage = {
        id: result.id || Date.now(),
        url: result.url,
        thumbnail: result.thumbnail,
        title: result.metadata?.originalName || file.name,
        description: '',
        author: localStorage.getItem('username') || 'Guest',
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        isFavorite: false
      };

      setImages([newImage, ...images]);
      setUploadingFile(null);
      setUploadProgress(0);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setUploadingFile(null);
      setUploadProgress(0);
    }
  };

  /**
   * Delete image
   */
  const handleDeleteImage = async (id) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await fetch(`/api/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  /**
   * Toggle favorite
   */
  const handleToggleFavorite = (id) => {
    setImages(images.map(img =>
      img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
    ));
  };

  /**
   * Open lightbox
   */
  const openLightbox = (index) => {
    setSelectedImageIndex(index);
  };

  /**
   * Get demo images
   */
  function getDemoImages() {
    return [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
        title: 'Code Snippets',
        description: 'Collection of useful code examples',
        author: 'Demo User',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        views: 24,
        likes: 8,
        isFavorite: false
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=500&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=200&h=200&fit=crop',
        title: 'Programming',
        description: 'Developer at work',
        author: 'Demo User',
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        views: 156,
        likes: 32,
        isFavorite: false
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1517694712592-7d5775b5e968?w=500&h=500&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1517694712592-7d5775b5e968?w=200&h=200&fit=crop',
        title: 'Web Design',
        description: 'Modern UI concepts',
        author: 'Demo User',
        uploadedAt: new Date(Date.now() - 259200000).toISOString(),
        views: 89,
        likes: 18,
        isFavorite: false
      }
    ];
  }

  return (
    <div className="image-gallery-container">
      {/* Header */}
      <div className="gallery-header">
        <h1>Image Gallery</h1>
        <p className="gallery-subtitle">
          {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
        </p>
      </div>

      {/* Controls */}
      <div className="gallery-controls">
        {/* Search */}
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filters */}
        <div className="filter-group">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Images</option>
            <option value="favorites">❤️ Favorites</option>
            <option value="trending">🔥 Trending</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="liked">Most Liked</option>
          </select>
        </div>

        {/* Actions */}
        <div className="gallery-actions">
          {allowUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
                style={{ display: 'none' }}
                disabled={!!uploadingFile}
              />
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={!!uploadingFile}
              >
                <FaUpload />
                Upload
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFile && (
        <div className="upload-progress-container">
          <div className="upload-info">
            Uploading: <strong>{uploadingFile}</strong>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="progress-text">{Math.round(uploadProgress)}%</div>
        </div>
      )}

      {/* Gallery Content */}
      {loading ? (
        <div className="gallery-loading">
          <div className="spinner" />
          <p>Loading images...</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="gallery-empty">
          <div className="empty-icon">📸</div>
          <h2>No images found</h2>
          <p>
            {search ? 'Try adjusting your search' : 'Upload your first image to get started!'}
          </p>
        </div>
      ) : (
        <div className={`gallery-grid gallery-${viewMode}`}>
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="gallery-item"
              onClick={() => openLightbox(index)}
            >
              <div className="gallery-image-container">
                <img
                  className="gallery-image"
                  data-src={image.url}
                  alt={image.title}
                  ref={(el) => {
                    if (el) observerRef.current?.observe(el);
                  }}
                />
                <div className="image-overlay">
                  <div className="image-actions">
                    <button
                      className={`action-btn ${image.isFavorite ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(image.id);
                      }}
                      title="Add to favorites"
                    >
                      <FaHeart />
                    </button>
                    {allowUpload && (
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.id);
                        }}
                        title="Delete image"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Info */}
              <div className="image-info">
                <h3 className="image-title">{image.title}</h3>
                {image.description && (
                  <p className="image-description">{image.description}</p>
                )}
                <div className="image-meta">
                  <span className="author">by {image.author}</span>
                  <div className="image-stats">
                    {image.views > 0 && (
                      <span className="stat">
                        <FaEye /> {image.views}
                      </span>
                    )}
                    {image.likes > 0 && (
                      <span className="stat">
                        <FaHeart /> {image.likes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImageIndex !== null && (
        <ImageLightbox
          images={filteredImages}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
};

export default ImageGallery;
