import React from "react";
import { FilterState } from "../../utils/propertyConstants";
import { KeyboardNavigableDropdown } from "../../../../../components/ui/KeyboardNavigableDropdown";

interface LocationFilterProps {
  filters: FilterState;
  handleFilterChange: (name: string, value: any) => void;
  locationOptions: { value: string; label: string }[];
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  filters,
  handleFilterChange,
  locationOptions,
}) => {
  return (
    <KeyboardNavigableDropdown
      options={locationOptions}
      value={filters.station || ""}
      onChange={(value) => handleFilterChange("station", value)}
      label="Location"
      placeholder="Search location..."
      searchable={true}
    />
  );
};

export default LocationFilter;