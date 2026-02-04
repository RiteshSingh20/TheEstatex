import React from "react";
import { FilterState, possessionOptions } from "../../utils/propertyConstants";
import { KeyboardNavigableDropdown } from "../../../../../components/ui/KeyboardNavigableDropdown";
import { TYPOLOGIES } from "../../../../../constants/typologies";

interface PropertyTypeFilterProps {
  filters: FilterState;
  handleFilterChange: (name: string, value: any) => void;
  showPropertyType: boolean;
  showPossession: boolean;
  propertyCategory: string;
}

const PropertyTypeFilter: React.FC<PropertyTypeFilterProps> = ({
  filters,
  handleFilterChange,
  showPropertyType,
  showPossession,
  propertyCategory,
}) => {
  const propertyTypeOptions = TYPOLOGIES.map(type => ({
    value: type,
    label: type
  }));
  return (
    <>
      {showPropertyType && (
        <div className="mb-2">
          <KeyboardNavigableDropdown
            options={propertyTypeOptions}
            value={filters.bhkType || ""}
            onChange={(value) => handleFilterChange("bhkType", value)}
            label="Property Type"
            placeholder="Select property type"
            searchable={true}
          />
        </div>
      )}

      {showPossession && (
        <div className="mb-2">
          <KeyboardNavigableDropdown
            options={possessionOptions}
            value={filters.possession || ""}
            onChange={(value) => handleFilterChange("possession", value)}
            label="Possession by"
            placeholder="Select possession"
            searchable={true}
          />
        </div>
      )}
    </>
  );
};

export default PropertyTypeFilter;