import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../utils/rbac';
import { UserRole } from '../types';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  // Permission-based access
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  // Role-based access
  roles?: UserRole[];
  // Fallback content when access is denied
  fallback?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = true,
  roles,
  fallback = null
}) => {
  const { checkPermission, checkAllPermissions, checkAnyPermission, currentRole } = usePermissions();

  // Check single permission
  if (permission && !checkPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Check role-based access
  if (roles && roles.length > 0 && currentRole && !roles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleBasedAccess roles={['admin']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const ManagerAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleBasedAccess roles={['admin', 'manager']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const ExecutiveAndAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleBasedAccess roles={['admin', 'manager', 'executive']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const CanCreateNewProperties: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleBasedAccess permission="new_property.create" fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const CanApproveNewProperties: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleBasedAccess permission="new_property.approve" fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const CanCreateResaleRental: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleBasedAccess permission="resale_rental.create" fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const CanManageUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <RoleBasedAccess permission="user.modify" fallback={fallback}>
    {children}
  </RoleBasedAccess>
);