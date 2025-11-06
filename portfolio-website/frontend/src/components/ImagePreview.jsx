import { useState, useEffect } from 'react';
import './ImagePreview.css';

const ImagePreview = ({ url, alt = 'Preview', className = '' }) => {
  const [imageStatus, setImageStatus] = useState('loading');
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (!url || url.trim() === '') {
      setImageStatus('empty');
      return;
    }

    setImageStatus('loading');
    setImageSrc('');

    // Handle different image URL formats
    let imageUrl = url.trim();

    // LinkedIn image handling - extract actual image URL from LinkedIn
    if (imageUrl.includes('linkedin.com') && !imageUrl.includes('/media/')) {
      // Try to convert profile URL to image URL pattern
      // This is a best-effort attempt; actual LinkedIn images may require authentication
      setImageStatus('info');
      setImageSrc(imageUrl);
      return;
    }

    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setImageStatus('loaded');
      setImageSrc(imageUrl);
    };
    img.onerror = () => {
      setImageStatus('error');
      setImageSrc('');
    };
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  if (imageStatus === 'empty') {
    return (
      <div className={`image-preview image-preview-empty ${className}`}>
        <div className="image-preview-placeholder">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p>No image URL</p>
        </div>
      </div>
    );
  }

  if (imageStatus === 'loading') {
    return (
      <div className={`image-preview image-preview-loading ${className}`}>
        <div className="image-preview-placeholder">
          <div className="spinner"></div>
          <p>Loading image...</p>
        </div>
      </div>
    );
  }

  if (imageStatus === 'error') {
    return (
      <div className={`image-preview image-preview-error ${className}`}>
        <div className="image-preview-placeholder">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>Failed to load image</p>
          <small>Check if the URL is correct</small>
        </div>
      </div>
    );
  }

  if (imageStatus === 'info') {
    return (
      <div className={`image-preview image-preview-info ${className}`}>
        <div className="image-preview-placeholder">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>LinkedIn URL detected</p>
          <small>Image preview may not be available for external profiles</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`image-preview image-preview-loaded ${className}`}>
      <img src={imageSrc} alt={alt} />
    </div>
  );
};

export default ImagePreview;
