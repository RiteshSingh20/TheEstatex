import { User } from "firebase/auth";
import Tabs from "../../../../ui/Tabs";
import { Property } from "../../../helperFunctions";
import { handleResalePending } from "./handleResalePending";
import { handleRentalPending } from "./handleRentalPending";
import { handleNewPending } from "./handleNewPending";

export function handlePendingProperties(
  pendingProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  pendingSearchTerms: { resale: string; rental: string; newProperty: string },
  setPendingSearchTerms: any,
  pendingFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setPendingFilters: any,
  getPendingResaleTypes: () => string[],
  setShowPropertyDetails: any,
  handleApproveProperty: (
    docId: string,
    category: "resale" | "rental"
  ) => Promise<void>,
  actionLoading: boolean,
  setRejectingProperty: any,
  setShowRejectModal: any,
  pendingNewPropertyReraRange: { min: string; max: string },
  setPendingNewPropertyReraRange: any,
  getUserInfo: (userId: string) => User,
  handleApproveNewProperty: (id: string) => Promise<void>,
  setShowNewPropertyModal: any
) {
  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Pending Properties</h3>

      <Tabs
        variant="underline"
        tabs={[
          {
            id: "resale",
            label: `Resale (${pendingProperties.resale.length})`,
            content: handleResalePending(
              pendingSearchTerms,
              setPendingSearchTerms,
              pendingFilters,
              setPendingFilters,
              getPendingResaleTypes,
              pendingProperties,
              setShowPropertyDetails,
              handleApproveProperty,
              actionLoading,
              setRejectingProperty,
              setShowRejectModal
            ),
          },
          {
            id: "rental",
            label: `Rental (${pendingProperties.rental.length})`,
            content: handleRentalPending(
              pendingSearchTerms,
              setPendingSearchTerms,
              pendingFilters,
              setPendingFilters,
              pendingProperties,
              setShowPropertyDetails,
              handleApproveProperty,
              actionLoading,
              setRejectingProperty,
              setShowRejectModal
            ),
          },
          {
            id: "newProperty",
            label: `New Properties (${
              pendingProperties.newProperties?.length || 0
            })`,
            content: handleNewPending(
              pendingSearchTerms,
              setPendingSearchTerms,
              pendingFilters,
              setPendingFilters,
              pendingNewPropertyReraRange,
              setPendingNewPropertyReraRange,
              pendingProperties,
              getUserInfo,
              setShowPropertyDetails,
              handleApproveNewProperty,
              actionLoading,
              setRejectingProperty,
              setShowRejectModal,
            ),
          },
        ]}
      />
    </div>
  );
}
