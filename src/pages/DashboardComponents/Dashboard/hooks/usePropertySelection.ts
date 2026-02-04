import { useState, useEffect } from "react";
import { CostSheet } from "../../../../components/CompareComponents/Compare";

interface ResaleProperty {
  id: string;
  docId: string;
  isApproved?: boolean;
  userListingState?: string;
  listingState?: string;
  userId?: string;
  society?: string | number;
  sublocation?: string;
  roadLocation?: string;
  expectedPrice?: number;
  floorNo?: string | number;
  flatNo?: string | number;
  contactName?: string;
  ownerName?: string;
  userFullName?: string;
  ownerNumber?: string;
  userMarketingPhoneNumber?: string;
  contactNumber?: string;
  type?: string;
  station?: string;
  cosmo?: boolean;
  rent?: number;
  deposit?: number;
  possession?: string;
  terrace?: boolean;
  directBroker?: string;
}

export const usePropertySelection = () => {
  const [selectedProperties, setSelectedProperties] = useState<ResaleProperty[]>([]);
  const [selectedCostSheets, setSelectedCostSheets] = useState<CostSheet[]>([]);

  const togglePropertySelection = (property: ResaleProperty) => {
    const isAlreadySelected = selectedProperties.some(
      (p) => p.docId === property.docId
    );

    if (isAlreadySelected) {
      setSelectedProperties(
        selectedProperties.filter((p) => p.docId !== property.docId)
      );
    } else {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const toggleCostSheetSelection = (costSheet: CostSheet) => {
    const isAlreadySelected = selectedCostSheets.some(
      (cs) => cs.projectName === costSheet.projectName
    );

    if (isAlreadySelected) {
      setSelectedCostSheets((prev) =>
        prev.filter((cs) => cs.projectName !== costSheet.projectName)
      );
    } else {
      setSelectedCostSheets((prev) => [...prev, costSheet]);
    }
  };

  const isPropertySelected = (property: ResaleProperty) => {
    return selectedProperties.some((p) => p.docId === property.docId);
  };

  const clearSelections = () => {
    setSelectedProperties([]);
    setSelectedCostSheets([]);
  };

  return {
    selectedProperties,
    selectedCostSheets,
    setSelectedProperties,
    setSelectedCostSheets,
    togglePropertySelection,
    toggleCostSheetSelection,
    isPropertySelected,
    clearSelections,
  };
};