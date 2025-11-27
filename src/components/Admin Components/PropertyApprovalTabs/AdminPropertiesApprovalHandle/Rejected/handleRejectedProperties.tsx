import { toDate, format } from "date-fns";
import { User } from "firebase/auth";
import { Eye, Check } from "lucide-react";
import Button from "../../../../ui/Button";
import Tabs from "../../../../ui/Tabs";
import { Property } from "../../../helperFunctions";
import { handleResaleRejected } from "./handleResaleRejected";
import { handleRentalRejected } from "./handleRentalRejected";
import { handleNewRejected } from "./handleNewRejected";

export function handleRejectedProperties(
  rejectedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  rejectedSearchTerms: { resale: string; rental: string; newProperty: string },
  setRejectedSearchTerms: any,
  rejectedFilters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  },
  setRejectedFilters: any,
  getRejectedResaleTypes: () => string[],
  filteredRejectedProperties: {
    resale: Property[];
    rental: Property[];
    newProperties: any[];
  },
  setShowPropertyDetails: any,
  user: User | null,
  handleApproveRejectedProperty: (
    propertyId: string,
    category: "resale" | "rental" | "newProperty"
  ) => Promise<void>,
  actionLoading: boolean,
  getRejectedRentalTypes: () => string[],
  getRejectedNewPropertyTypes: () => string[]
) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">
          Rejected Properties
        </h3>
        <p className="text-neutral-600">
          Browse and manage all rejected properties across categories
        </p>
      </div>

      <Tabs
        variant="underline"
        tabs={[
          {
            id: "resale-rejected",
            label: `Resale (${rejectedProperties.resale.length})`,
            content: (
              handleResaleRejected(rejectedSearchTerms, setRejectedSearchTerms, rejectedFilters, setRejectedFilters, getRejectedResaleTypes, filteredRejectedProperties, setShowPropertyDetails, user, handleApproveRejectedProperty, actionLoading)
            ),
          },
          {
            id: "rental-rejected",
            label: `Rental (${rejectedProperties.rental.length})`,
            content: (
              handleRentalRejected(rejectedSearchTerms, setRejectedSearchTerms, rejectedFilters, setRejectedFilters, getRejectedRentalTypes, filteredRejectedProperties, setShowPropertyDetails, user, handleApproveRejectedProperty, actionLoading)
            ),
          },
          {
            id: "new-rejected",
            label: `New Properties (${
              rejectedProperties.newProperties?.length || 0
            })`,
            content: (
              handleNewRejected(rejectedSearchTerms, setRejectedSearchTerms, rejectedFilters, setRejectedFilters, getRejectedNewPropertyTypes, filteredRejectedProperties, setShowPropertyDetails, user, handleApproveRejectedProperty, actionLoading)
            ),
          },
        ]}
      />
    </div>
  );
}




