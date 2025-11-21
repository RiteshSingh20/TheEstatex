# Role-Based Access Control (RBAC) Implementation

## Overview
This document outlines the comprehensive RBAC system implemented for the EstateX Property Portal, providing role-based access control with a hierarchical approval workflow.

## User Roles & Permissions

### 🔑 Admin
**Full System Access**
- ✅ Create new property entries
- ✅ Approve/reject ALL property entries (from Managers & Executives)
- ✅ Approve/reject resale & rental property entries
- ✅ Change approval status of already approved properties
- ✅ Manage User Access Models (View & Modify)
- ✅ Access all system settings (Pricing, Stamp Duty, Cost Sheets)
- ✅ Contact Settings management

### 👨💼 Manager
**Property & Team Management**
- ✅ Create new property entries
- ✅ Approve/reject new property entries submitted by Executives
- ✅ Approve/reject resale & rental property entries
- ✅ Access User Access Models (View only)
- ❌ Cannot modify system settings
- ❌ Cannot manage user roles

### 👨💻 Executive
**Property Creation & Submission**
- ✅ Create new property entries
- ✅ Access User Access Models (View only)
- ✅ View their own submitted properties
- ❌ Cannot approve properties
- ❌ Cannot access system settings

### 👤 User
**Regular User Functionality**
- ✅ Regular user functionality (as already implemented)
- ✅ View properties
- ❌ Cannot create properties
- ❌ Cannot access admin features

## Implementation Files

### Core RBAC System
- `src/utils/rbac.ts` - Permission definitions and role mappings
- `src/hooks/usePermissions.ts` - Custom hook for permission checking
- `src/components/RoleBasedAccess.tsx` - Wrapper components for conditional rendering
- `src/utils/propertyApproval.ts` - Property approval workflow logic

### UI Components
- `src/components/ui/RoleBadge.tsx` - Consistent role display component
- Updated `src/pages/Admin.tsx` - Role-based admin panel
- Updated `src/components/Layout/Navbar.tsx` - Role-based navigation

### Enhanced Firestore Functions
- `src/utils/firestoreListings.ts` - Enhanced with approval workflow functions:
  - `approvePropertyWithWorkflow()`
  - `rejectPropertyWithReason()`
  - `getPropertiesPendingApproval()`
  - `addResalePropertyWithRole()`
  - `addRentalPropertyWithRole()`

### Type Definitions
- Updated `src/types/index.ts` - Role definitions and display names
- Updated `src/utils/authContext.tsx` - Role handling in authentication

## Property Approval Workflow

### Executive → Manager → Admin
1. **Executive** creates property → Status: "Pending Manager Approval"
2. **Manager** reviews → Can approve or reject
   - If approved → Status: "Pending Admin Approval"
   - If rejected → Status: "Rejected" (with reason)
3. **Admin** final review → Can approve or reject
   - If approved → Status: "Approved"
   - If rejected → Status: "Rejected" (with reason)

### Manager → Admin
1. **Manager** creates property → Status: "Pending Admin Approval"
2. **Admin** reviews → Can approve or reject

### Admin Auto-Approval
- **Admin** created properties are automatically approved

## Permission System

### Permission Categories
- **Property Management**: `property.create`, `property.approve`, `property.reject`, `property.view`
- **User Management**: `user.view`, `user.modify`, `user.manage_roles`
- **System Management**: `system.pricing`, `system.stamp_duty`, `system.cost_sheets`
- **Approval Workflow**: `approval.executive_submissions`, `approval.manager_submissions`, `approval.resale_rental`

### Usage Examples
```typescript
// Using the permission hook
const permissions = usePermissions();

// Check specific permissions
if (permissions.canApproveProperty()) {
  // Show approve button
}

// Using wrapper components
<CanApproveProperties>
  <ApproveButton />
</CanApproveProperties>

<AdminOnly>
  <SystemSettings />
</AdminOnly>
```

## Navigation & UI Updates

### Role-Based Navigation
- **Admin**: Home, Dashboard, Admin Panel
- **Manager**: Home, Dashboard, Manager Panel  
- **Executive**: Home, Dashboard, Executive Panel
- **User**: Home, Dashboard, Inventory

### Admin Panel Tabs (Role-Based)
- **Properties**: All roles with admin access
- **New Property (Cost Sheets)**: Admin only
- **Users**: Admin only
- **Pricing**: Admin only
- **Stamp Duty**: Admin only

## Security Features

### Route Protection
- Updated `App.tsx` with role-based route guards
- Admin routes accessible to Admin, Manager, and Executive
- Different content shown based on permissions

### Data Filtering
- Properties filtered based on user role and permissions
- Executives see only their properties
- Managers see executive submissions + their own
- Admins see all properties

### Approval Validation
- Server-side validation of approval permissions
- Audit trail for all approval actions
- Rejection reasons required and stored

## Database Schema Updates

### User Document
```typescript
{
  role: "admin" | "manager" | "executive" | "user",
  // ... existing fields
}
```

### Property Documents
```typescript
{
  submitterRole: UserRole,
  isApproved: boolean,
  currentApprovalLevel: UserRole | null,
  nextApprovalLevel: UserRole | null,
  approvedBy_manager?: string,
  approvedAt_manager?: Timestamp,
  approvedBy_admin?: string,
  approvedAt_admin?: Timestamp,
  rejectedBy?: string,
  rejectedAt?: Timestamp,
  rejectionReason?: string,
  rejectorRole?: UserRole,
  // ... existing fields
}
```

## Migration Notes

### Existing Users
- All existing users default to "user" role
- Admin can update roles through the admin panel
- Existing properties will need submitterRole field added

### Backward Compatibility
- Existing functionality preserved for regular users
- Admin panel enhanced with role-based features
- No breaking changes to existing APIs

## Testing Checklist

- [ ] Admin can access all features
- [ ] Manager can approve executive submissions
- [ ] Executive can only see their properties
- [ ] User role restrictions work correctly
- [ ] Property approval workflow functions
- [ ] Role-based navigation works
- [ ] Permission checks prevent unauthorized access
- [ ] Rejection workflow with reasons
- [ ] Role badge displays correctly
- [ ] Mobile navigation includes role-based items

## Future Enhancements

1. **Bulk Operations**: Bulk approve/reject properties
2. **Notifications**: Email/SMS notifications for approvals
3. **Analytics**: Role-based analytics dashboard
4. **Audit Logs**: Comprehensive audit trail
5. **Custom Permissions**: Fine-grained permission customization
6. **Department Management**: Organize users by departments
7. **Delegation**: Temporary permission delegation
8. **API Keys**: Role-based API access for integrations