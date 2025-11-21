import { useAuth } from "../utils/authContext";
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission, getRolePermissions } from "../utils/rbac";

// Custom hook for permission checking
export const usePermissions = () => {
  const { user } = useAuth();
  
  const checkPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;
    return hasPermission(user.role, permission);
  };
  
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user?.role) return false;
    return hasAllPermissions(user.role, permissions);
  };
  
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user?.role) return false;
    return hasAnyPermission(user.role, permissions);
  };
  
  const getUserPermissions = (): Permission[] => {
    if (!user?.role) return [];
    return getRolePermissions(user.role);
  };
  
  // Specific permission checks for common use cases
  const canCreateNewProperty = () => checkPermission('new_property.create');
  const canApproveNewProperty = () => checkPermission('new_property.approve');
  const canCreateResaleRental = () => checkPermission('resale_rental.create');
  const canApproveResaleRental = () => checkPermission('resale_rental.approve');
  const canChangeApprovalStatus = () => checkPermission('status.change_approval');
  const canViewUsers = () => checkPermission('user.view');
  const canModifyUsers = () => checkPermission('user.modify');
  const canManagePricing = () => checkPermission('system.pricing');
  const canManageStampDuty = () => checkPermission('system.stamp_duty');
  const canAccessContactSettings = () => checkPermission('system.contact_settings');
  
  // Role-based checks
  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager';
  const isExecutive = () => user?.role === 'executive';
  const isUser = () => user?.role === 'user';
  
  return {
    // Permission checking functions
    checkPermission,
    checkAllPermissions,
    checkAnyPermission,
    getUserPermissions,
    
    // Specific permission checks
    canCreateNewProperty,
    canApproveNewProperty,
    canCreateResaleRental,
    canApproveResaleRental,
    canChangeApprovalStatus,
    canViewUsers,
    canModifyUsers,
    canManagePricing,
    canManageStampDuty,
    canAccessContactSettings,
    
    // Role checks
    isAdmin,
    isManager,
    isExecutive,
    isUser,
    
    // Current user info
    currentRole: user?.role,
    currentUser: user
  };
};