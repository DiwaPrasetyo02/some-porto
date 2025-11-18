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

    // Pinterest image handling - convert Pinterest URLs to direct image URLs
    if (imageUrl.includes('pinterest.com') || imageUrl.includes('pin.it')) {
      // Pinterest pins don't allow direct embedding without their API
      // Show info message instead
      setImageStatus('info');
      setImageSrc(imageUrl);
      return;
    }

    // LinkedIn image handling - extract actual image URL from LinkedIn
    if (imageUrl.includes('linkedin.com') && !imageUrl.includes('/media/')) {
      // Try to convert profile URL to image URL pattern
      // This is a best-effort attempt; actual LinkedIn images may require authentication
      setImageStatus('info');
      setImageSrc(imageUrl);
      return;
    }

    // Instagram image handling
    if (imageUrl.includes('instagram.com') && !imageUrl.includes('.jpg') && !imageUrl.includes('.png')) {
      // Instagram posts don't allow direct embedding without their API
      setImageStatus('info');
      setImageSrc(imageUrl);
      return;
    }

    // Facebook image handling
    if (imageUrl.includes('facebook.com') && !imageUrl.includes('.jpg') && !imageUrl.includes('.png')) {
      // Facebook images may require authentication
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
    let platform = 'External';
    if (url.includes('pinterest.com') || url.includes('pin.it')) platform = 'Pinterest';
    else if (url.includes('linkedin.com')) platform = 'LinkedIn';
    else if (url.includes('instagram.com')) platform = 'Instagram';
    else if (url.includes('facebook.com')) platform = 'Facebook';

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
          <p>{platform} URL detected</p>
          <small>Direct image preview not available. Use direct image URLs from Imgur, Postimages, or similar services.</small>
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
