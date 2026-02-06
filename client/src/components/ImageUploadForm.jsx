import React, { useState, useRef } from 'react';
import { FaUpload, FaX, FaCheckCircle } from 'react-icons/fa';
import ImageUploadService from '../services/ImageUploadService';
import '../Style/ImageUploadForm.css';

/**
 * ImageUploadForm Component
 * Features: Drag & drop, file input, preview, progress, error handling
 */
const ImageUploadForm = ({ onUploadSuccess, onUploadError, maxImages = 5 }) => {
  const [files, setFiles] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState({});
  const [successFiles, setSuccessFiles] = useState(new Set());
  const [errorFiles, setErrorFiles] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  /**
   * Handle file selection
   */
  const handleFileSelect = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles = Array.from(selectedFiles).slice(0, maxImages - files.length);
    
    // Validate files
    const validFiles = newFiles.filter(file => {
      const error = validateFile(file);
      if (error) {
        setErrorFiles(prev => ({
          ...prev,
          [file.name]: error
        }));
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  /**
   * Validate file
   */
  const validateFile = (file) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF';
    }

    if (file.size > MAX_SIZE) {
      return `File too large (max ${(MAX_SIZE / 1024 / 1024).toFixed(0)}MB)`;
    }

    if (files.some(f => f.name === file.name)) {
      return 'File already added';
    }

    return null;
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  /**
   * Handle drag over
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    handleFileSelect(e.dataTransfer.files);
  };

  /**
   * Remove file from queue
   */
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    const fileName = files[index].name;
    setErrorFiles(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setSuccessFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
  };

  /**
   * Upload all files
   */
  const handleUploadAll = async () => {
    if (files.length === 0) return;

    setUploadingCount(files.length);

    for (const file of files) {
      try {
        // Simulate progress
        const interval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + Math.random() * 30, 90)
          }));
        }, 300);

        // Upload
        const result = await ImageUploadService.uploadImage(file, {
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: ''
        });

        clearInterval(interval);

        // Mark as success
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
        setSuccessFiles(prev => new Set([...prev, file.name]));
        setUploadedImages(prev => [...prev, result]);

        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setErrorFiles(prev => ({
          ...prev,
          [file.name]: error.message || 'Upload failed'
        }));

        if (onUploadError) {
          onUploadError(file.name, error);
        }
      }

      setUploadingCount(prev => prev - 1);
    }
  };

  /**
   * Clear all
   */
  const handleClearAll = () => {
    setFiles([]);
    setUploadProgress({});
    setSuccessFiles(new Set());
    setErrorFiles({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = uploadingCount > 0;
  const hasErrors = Object.keys(errorFiles).length > 0;

  return (
    <div className="image-upload-form">
      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          disabled={isUploading}
          className="file-input-hidden"
        />

        <div className="drop-zone-content">
          <FaUpload className="drop-icon" />
          <h3>Drop images here</h3>
          <p>or click to browse</p>
          <small>Max {maxImages} files, 10MB each</small>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h4>
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </h4>
            {!isUploading && (
              <button
                className="clear-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="files">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                {/* File Icon & Info */}
                <div className="file-info-container">
                  <div className="file-preview">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="preview-thumb"
                    />
                  </div>

                  <div className="file-details">
                    <p className="file-name" title={file.name}>
                      {file.name}
                    </p>
                    <p className="file-size">
                      {ImageUploadService.formatFileSize(file.size)}
                    </p>

                    {errorFiles[file.name] && (
                      <p className="file-error">
                        ⚠️ {errorFiles[file.name]}
                      </p>
                    )}

                    {successFiles.has(file.name) && (
                      <p className="file-success">
                        ✓ Upload complete
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress or Actions */}
                <div className="file-actions-container">
                  {uploadProgress[file.name] !== undefined ? (
                    <div className="progress-container">
                      <div className="progress-bar-small">
                        <div
                          className="progress-fill-small"
                          style={{
                            width: `${uploadProgress[file.name]}%`
                          }}
                        />
                      </div>
                      <span className="progress-percent">
                        {Math.round(uploadProgress[file.name])}%
                      </span>
                    </div>
                  ) : (
                    <button
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      title="Remove file"
                    >
                      <FaX />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {(uploadedImages.length > 0 || hasErrors) && (
        <div className="upload-summary">
          {uploadedImages.length > 0 && (
            <div className="summary-item success">
              <FaCheckCircle />
              <span>
                {uploadedImages.length} {uploadedImages.length === 1 ? 'file' : 'files'} uploaded
              </span>
            </div>
          )}
          {hasErrors && (
            <div className="summary-item error">
              <span>⚠️</span>
              <span>
                {Object.keys(errorFiles).length} {Object.keys(errorFiles).length === 1 ? 'error' : 'errors'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !isUploading && (
        <div className="form-actions">
          <button
            className="upload-all-btn"
            onClick={handleUploadAll}
          >
            <FaUpload /> Upload All ({files.length})
          </button>
        </div>
      )}

      {/* Uploading State */}
      {isUploading && (
        <div className="uploading-state">
          <div className="spinner-small" />
          <p>Uploading {uploadingCount} remaining...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadForm;
