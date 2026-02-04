import React, { useState } from 'react';
import { useSecureMedia } from '../hooks/useSecureMedia';
import { SecureMediaOptions } from '../utils/mediaSecurityManager';

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  securityOptions?: SecureMediaOptions;
  showLoader?: boolean;
  onSecurityError?: (error: string) => void;
}

export const SecureImage: React.FC<SecureImageProps> = ({
  src,
  fallbackSrc,
  securityOptions,
  showLoader = true,
  onSecurityError,
  onError,
  onLoad,
  ...imgProps
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { secureUrl, loading, error } = useSecureMedia(src, securityOptions);

  React.useEffect(() => {
    if (error && onSecurityError) {
      onSecurityError(error);
    }
  }, [error, onSecurityError]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    onError?.(e);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    onLoad?.(e);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  if (loading && showLoader) {
    return (
      <div className="flex items-center justify-center bg-gray-100 animate-pulse" style={{ width: imgProps.width, height: imgProps.height }}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !secureUrl) {
    return fallbackSrc ? (
      <img
        {...imgProps}
        src={fallbackSrc}
        onError={handleImageError}
        onLoad={handleImageLoad}
        alt={imgProps.alt || 'Fallback image'}
      />
    ) : (
      <div className="flex items-center justify-center bg-gray-100" style={{ width: imgProps.width, height: imgProps.height }}>
        <div className="text-gray-400 text-sm">Image unavailable</div>
      </div>
    );
  }

  const finalSrc = imageError && fallbackSrc ? fallbackSrc : secureUrl;

  return (
    <img
      {...imgProps}
      src={finalSrc}
      onError={handleImageError}
      onLoad={handleImageLoad}
      onContextMenu={handleContextMenu}
      draggable={false}
      className={`secure-media ${imgProps.className || ''}`}
      style={{ userSelect: 'none', ...imgProps.style }}
    />
  );
};