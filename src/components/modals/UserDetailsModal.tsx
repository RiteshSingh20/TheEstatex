import { X, Users, Briefcase } from "lucide-react";
import Button from "../../components/ui/Button";
import RoleBadge from "../../components/ui/RoleBadge";
import { SubscriptionDisplay } from "../SubscriptionDisplay";
import { User } from "../../types";
import { SubscriptionInfo } from "../../types/admin";
// import { format } from "date-fns";
// import { toDate } from "../../utils/helpers";

interface UserDetailsModalProps {
  show: boolean;
  onClose: () => void;
  userDetails: User | null;
  userSubscriptions: SubscriptionInfo[];
  loadingSubscriptions: boolean;
}

const UserDetailsModal = (props: UserDetailsModalProps) => {
  if (!props.show || !props.userDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button
            onClick={props.onClose}
            className="text-neutral-500 hover:text-neutral-700"
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
                      {props.userDetails.fullName}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {props.userDetails.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone:</span>
                    <span className="font-medium text-neutral-900">
                      {props.userDetails.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">RERA Number:</span>
                    <span className="font-medium text-neutral-900">
                      {props.userDetails.reraNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Location:</span>
                    <span className="font-medium text-neutral-900">
                      {props.userDetails.city}, {props.userDetails.state}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Role:</span>
                    <RoleBadge role={props.userDetails.role} size="sm" />
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
                      {props.userSubscriptions.length} active subscriptions
                    </p>
                  </div>
                </div>

                {props.loadingSubscriptions ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-neutral-500">
                      Loading subscriptions...
                    </p>
                  </div>
                ) : props.userSubscriptions.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
                    {props.userSubscriptions.map((subscription) => (
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
          <Button variant="outline" onClick={props.onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
