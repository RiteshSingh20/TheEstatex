import React, { useState, useEffect } from 'react';
import { Banner } from '../../types';

interface BannerVerticalProps {
  banners: Banner[];
}

const BannerVertical: React.FC<BannerVerticalProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {

          return (prev + 1) % banners.length;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);



  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] max-h-screen overflow-hidden relative bg-white shadow-lg rounded-lg flex flex-col">
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.title}
        className="w-full flex-grow object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
        <h3 className="text-white text-3xl font-bold mb-2">{currentBanner.title}</h3>
        <p className="text-white text-sm mt-1">{currentBanner.location}</p>
      </div>
      {/* Carousel indicators */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Show banner ${index + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

export default BannerVertical;
