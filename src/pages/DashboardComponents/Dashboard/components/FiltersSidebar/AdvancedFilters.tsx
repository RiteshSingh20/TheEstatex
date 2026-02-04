import React, { useState, useEffect } from "react";
import { FilterState, AMENITIES_LIST } from "../../utils/propertyConstants";
import { KeyboardNavigableDropdown } from "../../../../../components/ui/KeyboardNavigableDropdown";

interface AdvancedFiltersProps {
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  filters: FilterState;
  handleFilterChange: (name: string, value: any) => void;
  locationFilterType: "subLocation" | "society";
  setLocationFilterType: (type: "subLocation" | "society") => void;
  subLocationOptions: { value: string; label: string }[];
  propertyCategory: string;
  selectedCategory: string;
  costSheets: any[];
  showCosmo: boolean;
  showGalleryTerrace: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  showAdvancedFilters,
  setShowAdvancedFilters,
  filters,
  handleFilterChange,
  locationFilterType,
  setLocationFilterType,
  subLocationOptions,
  propertyCategory,
  selectedCategory,
  costSheets,
  showCosmo,
  showGalleryTerrace,
}) => {
  // Get unique schemes from cost sheets
  const schemesSet = new Set<string>();
  costSheets.forEach((sheet) => {
    if (sheet.paymentSchemes && Array.isArray(sheet.paymentSchemes)) {
      sheet.paymentSchemes.forEach((scheme: any) => {
        if (scheme.schemeName) schemesSet.add(scheme.schemeName.trim());
      });
    }
  });
  const schemesOptions = Array.from(schemesSet).sort().map(scheme => ({
    value: scheme,
    label: scheme
  }));

  return (
    <>
      {/* Sub Location Filter */}
      <div>
        <div className="mb-2">
          <div className="flex items-center space-x-4 mb-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="locationFilterType"
                value="subLocation"
                checked={locationFilterType === "subLocation"}
                onChange={() => {
                  setLocationFilterType("subLocation");
                  handleFilterChange("subLocation", []);
                }}
                className="mr-1"
              />
              <span className="text-xs font-medium text-neutral-700">
                Sub Location
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="locationFilterType"
                value="society"
                checked={locationFilterType === "society"}
                onChange={() => {
                  setLocationFilterType("society");
                  handleFilterChange("subLocation", []);
                }}
                className="mr-1"
              />
              <span className="text-xs font-medium text-neutral-700">
                Building/Society
              </span>
            </label>
          </div>
        </div>

        {/* Selected badges */}
        {filters.subLocation.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {filters.subLocation.map((location) => (
              <span
                key={location}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white"
              >
                {location}
                <button
                  type="button"
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-dark"
                  onClick={() => {
                    const newSubLocations = filters.subLocation.filter(
                      (loc) => loc !== location
                    );
                    handleFilterChange("subLocation", newSubLocations);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <KeyboardNavigableDropdown
          options={subLocationOptions.filter(option => !filters.subLocation.includes(option.value))}
          value={[]}
          onChange={(value) => {
            if (Array.isArray(value) && value.length > 0) {
              const newSubLocations = [...filters.subLocation, ...value];
              handleFilterChange("subLocation", newSubLocations);
            }
          }}
          placeholder={`Search ${
            locationFilterType === "subLocation"
              ? "sub location"
              : "building/society"
          }...`}
          searchable={true}
          multiSelect={true}
          showSelectedBadges={true}
        />
      </div>

      {/* Cosmo Filter - Only for Residential */}
      {showCosmo && (
        <div className="border border-neutral-200 rounded-lg p-2">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium text-neutral-700 w-[86px]">
              Cosmo:
            </span>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="lookingForCosmo"
                  checked={filters.lookingForCosmo === true}
                  onClick={() =>
                    handleFilterChange(
                      "lookingForCosmo",
                      filters.lookingForCosmo === true ? undefined : true
                    )
                  }
                  onChange={() => {}}
                  className="text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs">Yes</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="lookingForCosmo"
                  checked={filters.lookingForCosmo === false}
                  onClick={() =>
                    handleFilterChange(
                      "lookingForCosmo",
                      filters.lookingForCosmo === false ? undefined : false
                    )
                  }
                  onChange={() => {}}
                  className="text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs">No</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Balcony/Terrace Filter - Only for Residential */}
      {showGalleryTerrace && (
        <div className="border border-neutral-200 rounded-lg p-2">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-medium text-neutral-700 w-[84px]">
              BA / TA:
            </span>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="balconyTerrace"
                  checked={filters.BalconyorTerrace === "Balcony"}
                  onClick={() =>
                    handleFilterChange(
                      "BalconyorTerrace",
                      filters.BalconyorTerrace === "Balcony" ? undefined : "Balcony"
                    )
                  }
                  onChange={() => {}}
                  className="text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs">Balcony</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="balconyTerrace"
                  checked={filters.BalconyorTerrace === "Terrace"}
                  onClick={() =>
                    handleFilterChange(
                      "BalconyorTerrace",
                      filters.BalconyorTerrace === "Terrace" ? undefined : "Terrace"
                    )
                  }
                  onChange={() => {}}
                  className="text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs">Terrace</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Schemes Filter - Only for New Properties */}
      {propertyCategory === "New" && (
        <div>
          <KeyboardNavigableDropdown
            options={schemesOptions.filter(option => !filters.schemes.includes(option.value))}
            value={filters.schemes}
            onChange={(value) => {
              if (Array.isArray(value)) {
                handleFilterChange("schemes", value);
              }
            }}
            label="Schemes"
            placeholder="Search schemes..."
            searchable={true}
            multiSelect={true}
            showSelectedBadges={true}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="text-xs text-primary hover:text-primary-dark font-medium"
      >
        {showAdvancedFilters
          ? "- Hide Advanced Filters"
          : "+ Show Advanced Filters"}
      </button>

      {showAdvancedFilters && (
        <>
          {/* Furnishing Filter - Only for Resale/Rental */}
          {propertyCategory !== "New" && (
            <div className="border border-neutral-200 rounded-lg p-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-medium text-neutral-700 w-[86px]">
                  Furnishing:
                </span>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="furnishing"
                      checked={filters.furnishing === "Fully Furnished"}
                      onClick={() =>
                        handleFilterChange(
                          "furnishing",
                          filters.furnishing === "Fully Furnished"
                            ? undefined
                            : "Fully Furnished"
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">Fully</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="furnishing"
                      checked={filters.furnishing === "Semi-Furnished"}
                      onClick={() =>
                        handleFilterChange(
                          "furnishing",
                          filters.furnishing === "Semi-Furnished"
                            ? undefined
                            : "Semi-Furnished"
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">Semi</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Parking Filter - Only for Resale/Rental */}
          {propertyCategory !== "New" && (
            <div className="border border-neutral-200 rounded-lg p-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-medium text-neutral-700 w-[86px]">
                  Parking:
                </span>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="parking"
                      checked={filters.parking === true}
                      onClick={() =>
                        handleFilterChange(
                          "parking",
                          filters.parking === true ? undefined : true
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="parking"
                      checked={filters.parking === false}
                      onClick={() =>
                        handleFilterChange(
                          "parking",
                          filters.parking === false ? undefined : false
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">No</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* OC/Red Filter - Only for Resale */}
          {propertyCategory === "Resale" && (
            <div className="border border-neutral-200 rounded-lg p-2">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-medium text-neutral-700 w-[88px]">
                  OC Received:
                </span>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="ocReceived"
                      checked={filters.ocRed === "OC"}
                      onClick={() =>
                        handleFilterChange(
                          "ocRed",
                          filters.ocRed === "OC" ? undefined : "OC"
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="ocReceived"
                      checked={filters.ocRed === "Red"}
                      onClick={() =>
                        handleFilterChange(
                          "ocRed",
                          filters.ocRed === "Red" ? undefined : "Red"
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">No</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Pet Friendly Filter - Only for Rental */}
          {propertyCategory === "Rental" && (
            <div className="border border-neutral-200 rounded-lg p-3">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-medium text-neutral-700 w-[86px]">
                  Pet friendly:
                </span>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="petFriendly"
                      checked={filters.petFriendly === true}
                      onClick={() =>
                        handleFilterChange(
                          "petFriendly",
                          filters.petFriendly === true ? undefined : true
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">Yes</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="petFriendly"
                      checked={filters.petFriendly === false}
                      onClick={() =>
                        handleFilterChange(
                          "petFriendly",
                          filters.petFriendly === false ? undefined : false
                        )
                      }
                      onChange={() => {}}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs">No</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Amenities Filter */}
          <div>
            <p className="block text-xs font-medium text-neutral-700 mb-1">
              Amenities
            </p>
            <div className="space-y-2">
              {AMENITIES_LIST.filter((amenity) => 
                propertyCategory !== "New" || !["Gas Pipeline", "Security"].includes(amenity)
              ).map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => {
                      const currentAmenities = filters.amenities;
                      const newAmenities = e.target.checked
                        ? [...currentAmenities, amenity]
                        : currentAmenities.filter((a) => a !== amenity);
                      handleFilterChange("amenities", newAmenities);
                    }}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-xs">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AdvancedFilters;