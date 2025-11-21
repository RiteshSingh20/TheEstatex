import React from 'react';
import { UserRole, ROLE_DISPLAY_NAMES } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md', showIcon = false }) => {
  const getColorClasses = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'executive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'manager':
        return '👨‍💼';
      case 'executive':
        return '👨‍💻';
      case 'user':
        return '👤';
      default:
        return '👤';
    }
  };

  const colorClasses = getColorClasses(role);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && <span>{getIcon(role)}</span>}
      {ROLE_DISPLAY_NAMES[role]}
    </span>
  );
};

export default RoleBadge;