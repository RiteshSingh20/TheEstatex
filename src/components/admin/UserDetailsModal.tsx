import { format } from "date-fns";
import Button from "../ui/Button";
import RoleBadge from "../ui/RoleBadge";
import { Users, Briefcase, Edit, X } from "lucide-react";

type UserRole = "admin" | "manager" | "executive" | "user";

type User = {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  reraNumber?: string;
  city?: string;
  state?: string;
  role: UserRole;
};

type SubscriptionInfo = {
  id: string;
  type: string;
  status: string;
  amount?: number;
  discountedPrice?: number;
  locations?: string[] | string;
  startDate: any;
  endDate: any;
};

type Permissions = {
  canModifyUsers: () => boolean;
};

const toDate = (timestamp: any): Date => {
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === "number" || typeof timestamp === "string") {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

const SubscriptionDisplay = ({
  subscription,
}: {
  subscription: SubscriptionInfo;
}) => {
  const getLocationText = () => {
    if (subscription.locations === "ALL") return "All Locations";
    if (Array.isArray(subscription.locations))
      return `${subscription.locations.length} Selected Locations`;
    return "No Locations Specified";
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="font-medium text-neutral-700">Type:</div>
        <div className="font-semibold">
          {subscription.type === "RR"
            ? "Rental/Resale"
            : subscription.type === "ND"
            ? "New Development"
            : "Unknown"}
        </div>
        <div className="font-medium text-neutral-700">Status:</div>
        <div>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              subscription.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {subscription.status}
          </span>
        </div>
        <div className="font-medium text-neutral-700">Amount:</div>
        <div>₹{subscription.amount?.toLocaleString("en-IN")}</div>
        {subscription.discountedPrice && (
          <>
            <div className="font-medium text-neutral-700">
              Discounted Price:
            </div>
            <div>₹{subscription.discountedPrice.toLocaleString("en-IN")}</div>
          </>
        )}
        <div className="font-medium text-neutral-700">Locations:</div>
        <div>{getLocationText()}</div>
        <div className="font-medium text-neutral-700">Start Date:</div>
        <div>{format(toDate(subscription.startDate), "dd MMM yyyy")}</div>
        <div className="font-medium text-neutral-700">End Date:</div>
        <div>{format(toDate(subscription.endDate), "dd MMM yyyy")}</div>
      </div>
    </div>
  );
};

type Props = {
  open: boolean;
  onClose: () => void;
  userDetails: User;
  permissions: Permissions;
  editingRole: boolean;
  setEditingRole: (v: boolean) => void;
  selectedRole: UserRole;
  setSelectedRole: (v: UserRole) => void;
  handleRoleUpdate: () => Promise<void> | void;
  actionLoading: boolean;
  userSubscriptions: SubscriptionInfo[];
  loadingSubscriptions: boolean;
};

const UserDetailsModal = ({
  open,
  onClose,
  userDetails,
  permissions,
  editingRole,
  setEditingRole,
  selectedRole,
  setSelectedRole,
  handleRoleUpdate,
  actionLoading,
  userSubscriptions,
  loadingSubscriptions,
}: Props) => {
  if (!open || !userDetails) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button
            className="text-neutral-500 hover:text-neutral-700"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Role:</span>
                    {editingRole ? (
                      <div className="flex gap-2">
                        <select
                          value={selectedRole}
                          onChange={(e) =>
                            setSelectedRole(e.target.value as UserRole)
                          }
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
            </div>
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
                        subscription={subscription}
                      />
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
        <div className="p-4 border-t border-neutral-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
