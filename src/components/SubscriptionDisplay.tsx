import { format } from "date-fns";
import { SubscriptionInfo } from "../types/admin";
import { toDate } from "../utils/helpers";

interface SubscriptionDisplayProps {
  subscription: SubscriptionInfo;
}

export const SubscriptionDisplay = ({
  subscription,
}: SubscriptionDisplayProps) => {
  const getLocationText = () => {
    if (subscription.locations === "ALL") return "All Locations";
    if (Array.isArray(subscription.locations)) {
      return `${subscription.locations.length} Selected Locations`;
    }
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
