import React, { useState } from 'react';
import { SecureImage } from './SecureImage';
import { SecureVideo } from './SecureVideo';
import { SecureMediaOptions } from '../utils/mediaSecurityManager';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  title?: string;
  description?: string;
}

interface SecureMediaGalleryProps {
  items: MediaItem[];
  securityOptions?: SecureMediaOptions;
  className?: string;
  itemClassName?: string;
  showTitles?: boolean;
  onItemClick?: (item: MediaItem, index: number) => void;
  onSecurityError?: (error: string, item: MediaItem) => void;
}

export const SecureMediaGallery: React.FC<SecureMediaGalleryProps> = ({
  items,
  securityOptions,
  className = '',
  itemClassName = '',
  showTitles = false,
  onItemClick,
  onSecurityError
}) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const handleItemClick = (item: MediaItem, index: number) => {
    setSelectedItem(item);
    onItemClick?.(item, index);
  };

  const handleSecurityError = (error: string, item: MediaItem) => {
    console.error(`Security error for media item ${item.id}:`, error);
    onSecurityError?.(error, item);
  };

  const renderMediaItem = (item: MediaItem, index: number) => {
    const commonProps = {
      key: item.id,
      className: `cursor-pointer transition-transform hover:scale-105 ${itemClassName}`,
      onClick: () => handleItemClick(item, index),
      securityOptions,
      onSecurityError: (error: string) => handleSecurityError(error, item)
    };

    if (item.type === 'video') {
      return (
        <div className="relative">
          <SecureVideo
            {...commonProps}
            src={item.url}
            poster={item.thumbnail}
            controls={false}
            muted
            className={`w-full h-48 object-cover rounded-lg ${itemClassName}`}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
            <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5-8-5z"/>
              </svg>
            </div>
          </div>
          {showTitles && item.title && (
            <div className="mt-2 text-sm font-medium text-gray-900 truncate">
              {item.title}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <SecureImage
          {...commonProps}
          src={item.url}
          alt={item.title || `Media item ${index + 1}`}
          className={`w-full h-48 object-cover rounded-lg ${itemClassName}`}
        />
        {showTitles && item.title && (
          <div className="mt-2 text-sm font-medium text-gray-900 truncate">
            {item.title}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {items.map((item, index) => renderMediaItem(item, index))}
    </div>
  );
};