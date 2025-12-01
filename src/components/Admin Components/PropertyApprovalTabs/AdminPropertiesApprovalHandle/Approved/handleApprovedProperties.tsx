import Tabs from "../../../../ui/Tabs";
import { Property } from "../../../helperFunctions";
import { handleResaleApproved } from "./handleResaleApproved";
import { handleRentalApproved } from "./handleRentalApproved";
import { handleNewApproved } from "./handleNewApproved";

export function handleApprovedProperties(
  approvedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  approvedSearchTerms: { resale: string; rental: string; newProperty: string },
  setApprovedSearchTerms: any,
  approvedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setApprovedFilters: any,
  getAvailableResaleTypes: () => string[],
  filteredApprovedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  setShowPropertyDetails: any,
  getAvailableRentalTypes: () => string[],
  getAvailableNewPropertyTypes: () => string[],
  getUserInfo: (userId: string) => any
) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">
          Approved Properties
        </h3>
        <p className="text-neutral-600">
          Browse and manage all approved properties across categories
        </p>
      </div>

      <Tabs
        variant="underline"
        tabs={[
          {
            id: "resale-approved",
            label: `Resale (${approvedProperties.resale.length})`,
            content: (
              handleResaleApproved(approvedSearchTerms, setApprovedSearchTerms, approvedFilters, setApprovedFilters, getAvailableResaleTypes, filteredApprovedProperties, setShowPropertyDetails)
            ),
          },

          {
            id: "rental-approved",
            label: `Rental (${approvedProperties.rental.length})`,
            content: (
              handleRentalApproved(approvedSearchTerms, setApprovedSearchTerms, approvedFilters, setApprovedFilters, getAvailableRentalTypes, filteredApprovedProperties, setShowPropertyDetails)
            ),
          },

          {
            id: "new-approved",
            label: `New Properties (${
              approvedProperties.newProperties?.length || 0
            })`,
            content: (
              handleNewApproved(approvedSearchTerms, setApprovedSearchTerms, approvedFilters, setApprovedFilters, getAvailableNewPropertyTypes, filteredApprovedProperties, setShowPropertyDetails, getUserInfo)
            ),
          },
        ]}
      />
    </div>
  );
}






