import { User } from "firebase/auth";
import { Property } from "../../../types/admin";
import Card from "../../ui/Card";
import Tabs from "../../ui/Tabs";
import { handlePendingProperties } from "./AdminPropertiesApprovalHandle/Pending/handlePendingProperties";
import { handleApprovedProperties } from "./AdminPropertiesApprovalHandle/Approved/handleApprovedProperties";
import { handleRejectedProperties } from "./AdminPropertiesApprovalHandle/Rejected/handleRejectedProperties";

export function renderPropertyApprovalTabs(
  pendingProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  pendingSearchTerms: { resale: string; rental: string; newProperty: string },
  setPendingSearchTerms,
  pendingFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setPendingFilters,
  getPendingResaleTypes: () => string[],
  setShowPropertyDetails,
  handleApproveProperty: (
    docId: string,
    category: "resale" | "rental"
  ) => Promise<void>,
  actionLoading: boolean,
  setRejectingProperty,
  setShowRejectModal,
  pendingNewPropertyReraRange: { min: string; max: string },
  setPendingNewPropertyReraRange,
  getUserInfo: (userId: string) => User,
  handleApproveNewProperty: (id: string) => Promise<void>,
  setShowNewPropertyModal,
  approvedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  approvedSearchTerms: { resale: string; rental: string; newProperty: string },
  setApprovedSearchTerms,
  approvedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setApprovedFilters,
  getAvailableResaleTypes: () => string[],
  filteredApprovedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  getAvailableRentalTypes: () => string[],
  getAvailableNewPropertyTypes: () => string[],
  rejectedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  rejectedSearchTerms: { resale: string; rental: string; newProperty: string },
  setRejectedSearchTerms,
  rejectedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setRejectedFilters,
  getRejectedResaleTypes: () => string[],
  filteredRejectedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  user: User | null,
  handleApproveRejectedProperty: (
    propertyId: string,
    category: "resale" | "rental" | "newProperty"
  ) => Promise<void>,
  getRejectedRentalTypes: () => string[],
  getRejectedNewPropertyTypes: () => string[]
) {
  return (
    <Card>
      <Tabs
        variant="underline"
        tabs={[
          {
            id: "pending",
            label: "Pending Approval",
            content: handlePendingProperties(
              pendingProperties,
              pendingSearchTerms,
              setPendingSearchTerms,
              pendingFilters,
              setPendingFilters,
              getPendingResaleTypes,
              setShowPropertyDetails,
              handleApproveProperty,
              actionLoading,
              setRejectingProperty,
              setShowRejectModal,
              pendingNewPropertyReraRange,
              setPendingNewPropertyReraRange,
              getUserInfo,
              handleApproveNewProperty,
              setShowNewPropertyModal
            ),
          },
          {
            id: "approved",
            label: "Approved",
            content: handleApprovedProperties(
              approvedProperties,
              approvedSearchTerms,
              setApprovedSearchTerms,
              approvedFilters,
              setApprovedFilters,
              getAvailableResaleTypes,
              filteredApprovedProperties,
              setShowPropertyDetails,
              getAvailableRentalTypes,
              getAvailableNewPropertyTypes,
              getUserInfo
            ),
          },
          {
            id: "rejected",
            label: "Rejected",
            content: handleRejectedProperties(
              rejectedProperties,
              rejectedSearchTerms,
              setRejectedSearchTerms,
              rejectedFilters,
              setRejectedFilters,
              getRejectedResaleTypes,
              filteredRejectedProperties,
              setShowPropertyDetails,
              user,
              handleApproveRejectedProperty,
              actionLoading,
              getRejectedRentalTypes,
              getRejectedNewPropertyTypes
            ),
          },
        ]}
      />
    </Card>
  );
}
