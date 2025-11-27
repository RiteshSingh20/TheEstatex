import { User } from "../../types";
import { X, Users, Edit, Briefcase } from "lucide-react";
import { UserRole } from "../../types";
import { SubscriptionInfo } from "../../types/admin";
import { Permission } from "../../utils/rbac";
import Button from "../ui/Button";
import RoleBadge from "../ui/RoleBadge";

export function showUserDetailsModal(setShowUserModal, userDetails: User, editingRole: boolean, selectedRole: string, setSelectedRole, handleRoleUpdate: () => Promise<void>, actionLoading: boolean, setEditingRole, permissions: { checkPermission: (permission: Permission) => boolean; checkAllPermissions: (permissions: Permission[]) => boolean; checkAnyPermission: (permissions: Permission[]) => boolean; getUserPermissions: () => Permission[]; canCreateNewProperty: () => boolean; canApproveNewProperty: () => boolean; canCreateResaleRental: () => boolean; canApproveResaleRental: () => boolean; canChangeApprovalStatus: () => boolean; canViewUsers: () => boolean; canModifyUsers: () => boolean; canManagePricing: () => boolean; canManageStampDuty: () => boolean; canAccessContactSettings: () => boolean; isAdmin: () => boolean; isManager: () => boolean; isExecutive: () => boolean; isUser: () => boolean; currentRole: UserRole | undefined; currentUser: User | null; }, userSubscriptions: SubscriptionInfo[], loadingSubscriptions: boolean, SubscriptionDisplay) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Details</h3>
        <button
          className="text-neutral-500 hover:text-neutral-700"
          onClick={() => setShowUserModal(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Grid content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Info */}
          <div>
            <h4 className="font-medium text-neutral-600 mb-2">
              Personal Information
            </h4>
            <div className="bg-neutral-50 rounded-md p-4">
              <div className="flex items-center mb-3">
                <Users className="h-10 w-10 text-primary bg-primary/10 p-2 rounded-full mr-3" />
                <div>
                  <p className="font-semibold text-neutral-900">
                    {userDetails.fullName}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {userDetails.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Phone:</span>
                  <span className="font-medium text-neutral-900">
                    {userDetails.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">RERA Number:</span>
                  <span className="font-medium text-neutral-900">
                    {userDetails.reraNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Location:</span>
                  <span className="font-medium text-neutral-900">
                    {userDetails.city}, {userDetails.state}
                  </span>
                </div>

                {/* Role Selector */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Role:</span>
                  {editingRole ? (
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="executive">Executive</option>
                        <option value="user">User</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={handleRoleUpdate}
                        isLoading={actionLoading}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRole(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RoleBadge role={userDetails.role} size="sm" />
                      {permissions.canModifyUsers() && (
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => setEditingRole(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            <div>
              <h4 className="font-medium text-neutral-600 mb-2">
                Subscription Information
              </h4>
              <div className="bg-neutral-50 rounded-md p-4 shadow-sm">
                <div className="flex items-center mb-4">
                  <Briefcase className="h-10 w-10 text-accent bg-accent/10 p-2 rounded-full mr-3" />
                  <div>
                    <p className="font-semibold text-neutral-900">
                      Active Subscriptions
                    </p>
                    <p className="text-sm text-neutral-500">
                      {userSubscriptions.length} active subscriptions
                    </p>
                  </div>
                </div>

                {loadingSubscriptions ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-neutral-500">
                      Loading subscriptions...
                    </p>
                  </div>
                ) : userSubscriptions.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
                    {userSubscriptions.map((subscription) => (
                      <SubscriptionDisplay
                        key={subscription.id}
                        subscription={subscription} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-neutral-500">
                    <p>No active subscriptions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowUserModal(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  </div>;
}