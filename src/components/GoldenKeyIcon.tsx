import React from 'react';

interface GoldenKeyIconProps {
  isKeyAvailable: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const GoldenKeyIcon: React.FC<GoldenKeyIconProps> = ({ isKeyAvailable, size = 'sm' }) => {
  if (!isKeyAvailable) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <svg
      className={`${sizeClasses[size]} text-yellow-500 inline-block ml-1`}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31.84 2.41 2 2.83V20c0 .55.45 1 1 1h1v-3h2v3h1c.55 0 1-.45 1-1v-.17c1.16-.42 2-1.52 2-2.83 0-1.66-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10-12H9c-1.1 0-2 .9-2 2v7h2V8h8v7h2V4c0-1.1-.9-2-2-2z"/>
    </svg>
  );
};

export default GoldenKeyIcon;
