import React, { useState, useRef } from 'react';
import { useSecureMedia } from '../hooks/useSecureMedia';
import { SecureMediaOptions } from '../utils/mediaSecurityManager';

interface SecureVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  fallbackSrc?: string;
  securityOptions?: SecureMediaOptions;
  showLoader?: boolean;
  onSecurityError?: (error: string) => void;
}

export const SecureVideo: React.FC<SecureVideoProps> = ({
  src,
  fallbackSrc,
  securityOptions,
  showLoader = true,
  onSecurityError,
  onError,
  onLoadedData,
  ...videoProps
}) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { secureUrl, loading, error } = useSecureMedia(src, securityOptions);

  React.useEffect(() => {
    if (error && onSecurityError) {
      onSecurityError(error);
    }
  }, [error, onSecurityError]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoError(true);
    onError?.(e);
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoLoaded(true);
    onLoadedData?.(e);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  if (loading && showLoader) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white animate-pulse" style={{ width: videoProps.width, height: videoProps.height }}>
        <div className="text-gray-300 text-sm">Loading video...</div>
      </div>
    );
  }

  if (error || !secureUrl) {
    return fallbackSrc ? (
      <video
        {...videoProps}
        ref={videoRef}
        src={fallbackSrc}
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
      />
    ) : (
      <div className="flex items-center justify-center bg-gray-900 text-white" style={{ width: videoProps.width, height: videoProps.height }}>
        <div className="text-gray-300 text-sm">Video unavailable</div>
      </div>
    );
  }

  const finalSrc = videoError && fallbackSrc ? fallbackSrc : secureUrl;

  return (
    <video
      {...videoProps}
      ref={videoRef}
      src={finalSrc}
      onError={handleVideoError}
      onLoadedData={handleVideoLoad}
      onContextMenu={handleContextMenu}
      className={`secure-media ${videoProps.className || ''}`}
      style={{ userSelect: 'none', ...videoProps.style }}
      controlsList="nodownload noremoteplayback noplaybackrate"
      disablePictureInPicture
    />
  );
};