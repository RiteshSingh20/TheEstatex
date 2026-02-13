import React from 'react';
import { SecureImage } from './SecureImage';
import { SecureMediaGallery } from './SecureMediaGallery';
import GoldenKeyIcon from './GoldenKeyIcon';

interface PropertyMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  title?: string;
}

interface PropertyCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  mainImage: string;
  gallery?: PropertyMedia[];
  keyAvailable?: boolean | string;
  className?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  description,
  price,
  location,
  mainImage,
  gallery = [],
  keyAvailable = false,
  className = ''
}) => {
  const handleMediaError = (error: string) => {
    console.error(`Media error for property ${id}:`, error);
  };

  const isKeyAvailable = typeof keyAvailable === 'string' 
    ? keyAvailable.toLowerCase() === 'yes' 
    : keyAvailable;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Main Image */}
      <div className="relative h-48">
        <SecureImage
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover"
          fallbackSrc="/placeholder-property.jpg"
          securityOptions={{ expiryHours: 6 }}
          onSecurityError={handleMediaError}
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
          ₹{price.toLocaleString()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          {title}
          {typeof keyAvailable === 'string' 
            ? keyAvailable.toLowerCase() === 'yes' && <GoldenKeyIcon isKeyAvailable={true} size="sm" />
            : keyAvailable && <GoldenKeyIcon isKeyAvailable={true} size="sm" />
          }
        </h3>
        <p className="text-gray-600 text-sm mb-2">{location}</p>
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Gallery Preview */}
        {gallery.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Gallery ({gallery.length} items)
            </h4>
            <SecureMediaGallery
              items={gallery.slice(0, 4)} // Show first 4 items
              securityOptions={{ expiryHours: 4 }}
              className="grid-cols-2 gap-2"
              itemClassName="h-20"
              onSecurityError={(error, item) => 
                console.error(`Gallery error for ${item.id}:`, error)
              }
            />
            {gallery.length > 4 && (
              <div className="mt-2 text-xs text-gray-500">
                +{gallery.length - 4} more items
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
            View Details
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded text-sm font-medium hover:bg-gray-50 transition-colors">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};