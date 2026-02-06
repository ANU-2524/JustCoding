import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaDownload, FaShare } from 'react-icons/fa';
import '../Style/ImageLightbox.css';

/**
 * ImageLightbox Component
 * Modal for viewing images in fullscreen with navigation
 */
const ImageLightbox = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [canNavigate, setCanNavigate] = useState(true);

  const currentImage = images[currentIndex];

  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, canNavigate]);

  const goToNext = () => {
    if (!canNavigate) return;
    setCanNavigate(false);
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setCanNavigate(true), 300);
  };

  const goToPrevious = () => {
    if (!canNavigate) return;
    setCanNavigate(false);
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setCanNavigate(true), 300);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.title || 'image.jpg';
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.title,
          text: currentImage.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="lightbox-header">
          <div className="lightbox-title">
            <h3>{currentImage.title || 'Image'}</h3>
            <span className="lightbox-counter">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button className="lightbox-close" onClick={onClose} title="Close (ESC)">
            <FaTimes />
          </button>
        </div>

        {/* Main Image Area */}
        <div className="lightbox-image-container">
          <button
            className="lightbox-nav-btn lightbox-prev"
            onClick={goToPrevious}
            disabled={!canNavigate}
            title="Previous (←)"
          >
            <FaChevronLeft />
          </button>

          <div className="lightbox-image-wrapper">
            {isLoading && <div className="lightbox-loading" />}
            <img
              key={currentImage.id}
              src={currentImage.url}
              alt={currentImage.title}
              className={`lightbox-image ${isLoading ? 'loading' : 'loaded'}`}
              onLoad={() => setIsLoading(false)}
            />
          </div>

          <button
            className="lightbox-nav-btn lightbox-next"
            onClick={goToNext}
            disabled={!canNavigate}
            title="Next (→)"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* Image Info */}
        {(currentImage.description || currentImage.author) && (
          <div className="lightbox-info">
            {currentImage.description && (
              <p className="lightbox-description">{currentImage.description}</p>
            )}
            {currentImage.author && (
              <p className="lightbox-author">By {currentImage.author}</p>
            )}
            {currentImage.uploadedAt && (
              <p className="lightbox-date">
                {new Date(currentImage.uploadedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Footer with Actions */}
        <div className="lightbox-footer">
          <div className="lightbox-stats">
            {currentImage.views && <span>👁️ {currentImage.views} views</span>}
            {currentImage.likes && <span>❤️ {currentImage.likes} likes</span>}
          </div>
          <div className="lightbox-actions">
            <button
              className="lightbox-action-btn"
              onClick={handleDownload}
              title="Download"
            >
              <FaDownload />
              Download
            </button>
            <button
              className="lightbox-action-btn"
              onClick={handleShare}
              title="Share"
            >
              <FaShare />
              Share
            </button>
          </div>
        </div>

        {/* Thumbnails Navigation */}
        {images.length > 1 && (
          <div className="lightbox-thumbnails">
            {images.map((img, idx) => (
              <button
                key={img.id}
                className={`lightbox-thumbnail ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setIsLoading(true);
                  setCurrentIndex(idx);
                }}
                title={img.title}
              >
                <img src={img.thumbnail || img.url} alt={img.title} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
