import { useState, useMemo, useCallback } from "react";
import { FilterState, EMPTY_FILTERS } from "../utils/propertyConstants";
import { PropertyCategory } from "../../../../types";

type CategoryFilters = {
  [K in PropertyCategory]: {
    filters: FilterState;
    appliedFilters: FilterState;
    hasFiltered: boolean;
    everFiltered: boolean;
  };
};

const INITIAL_CATEGORY_FILTERS: CategoryFilters = {
  Resale: {
    filters: EMPTY_FILTERS,
    appliedFilters: EMPTY_FILTERS,
    hasFiltered: false,
    everFiltered: false,
  },
  Rental: {
    filters: EMPTY_FILTERS,
    appliedFilters: EMPTY_FILTERS,
    hasFiltered: false,
    everFiltered: false,
  },
  New: {
    filters: EMPTY_FILTERS,
    appliedFilters: EMPTY_FILTERS,
    hasFiltered: false,
    everFiltered: false,
  },
};

export const usePropertyFilters = (propertyCategory: PropertyCategory) => {
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters>(INITIAL_CATEGORY_FILTERS);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [locationFilterType, setLocationFilterType] = useState<"subLocation" | "society">("subLocation");

  const currentCategoryData = categoryFilters[propertyCategory];

  const handleFilterChange = useCallback((name: string, value: string | number | boolean | undefined | string[]) => {
    setCategoryFilters((prev) => ({
      ...prev,
      [propertyCategory]: {
        ...prev[propertyCategory],
        filters: {
          ...prev[propertyCategory].filters,
          [name]: value,
        },
      },
    }));
  }, [propertyCategory]);

  const resetFilters = useCallback(() => {
    setCategoryFilters((prev) => ({
      ...prev,
      [propertyCategory]: {
        filters: EMPTY_FILTERS,
        appliedFilters: EMPTY_FILTERS,
        hasFiltered: false,
        everFiltered: false,
      },
    }));
  }, [propertyCategory]);

  const applyFilters = useCallback(() => {
    setCategoryFilters((prev) => ({
      ...prev,
      [propertyCategory]: {
        ...prev[propertyCategory],
        appliedFilters: { ...prev[propertyCategory].filters },
        hasFiltered: true,
        everFiltered: true,
      },
    }));
  }, [propertyCategory]);

  return {
    filters: currentCategoryData.filters,
    appliedFilters: currentCategoryData.appliedFilters,
    hasFiltered: currentCategoryData.hasFiltered,
    everFiltered: currentCategoryData.everFiltered,
    showAdvancedFilters,
    locationFilterType,
    setShowAdvancedFilters,
    setLocationFilterType,
    handleFilterChange,
    resetFilters,
    applyFilters,
  };
};