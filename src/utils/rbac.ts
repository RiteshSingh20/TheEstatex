import { UserRole } from "../types";

// Define all possible permissions in the system
export type Permission = 
  // New Properties
  | 'new_property.create'
  | 'new_property.approve'
  
  // Resale & Rental Properties
  | 'resale_rental.create'
  | 'resale_rental.approve'
  
  // Status Management
  | 'status.change_approval'
  
  // User Management
  | 'user.view'
  | 'user.modify'
  
  // System Management
  | 'system.pricing'
  | 'system.stamp_duty'
  | 'system.contact_settings';

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // New Properties
    'new_property.create',
    'new_property.approve',
    // Resale & Rental
    'resale_rental.approve',
    // Status Management
    'status.change_approval',
    // User Management
    'user.view',
    'user.modify',
    // System Management
    'system.pricing',
    'system.stamp_duty',
    'system.contact_settings'
  ],
  
  manager: [
    // New Properties
    'new_property.create',
    'new_property.approve',
    // Resale & Rental
    'resale_rental.approve',
    // User Management
    'user.view' // View only
  ],
  
  executive: [
    // New Properties
    'new_property.create',
    // User Management
    'user.view' // View only
  ],
  
  user: [
    // Resale & Rental
    'resale_rental.create'
  ]
};

// Helper function to check if a user has a specific permission
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Helper function to check multiple permissions (user must have ALL)
export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Helper function to check multiple permissions (user must have ANY)
export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Get all permissions for a role
export const getRolePermissions = (userRole: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[userRole] || [];
};

// Check if user can create new properties
export const canCreateNewProperty = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'new_property.create');
};

// Check if user can approve new properties
export const canApproveNewProperty = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'new_property.approve');
};

// Check if user can create resale/rental properties
export const canCreateResaleRental = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'resale_rental.create');
};

// Check if user can approve resale/rental properties
export const canApproveResaleRental = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'resale_rental.approve');
};

// Check if user can change approval status
export const canChangeApprovalStatus = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'status.change_approval');
};