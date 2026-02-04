import React from "react";
import { FilterState } from "../../utils/propertyConstants";

interface BudgetFilterProps {
  filters: FilterState;
  handleFilterChange: (name: string, value: any) => void;
  formatPriceDisplay: (value: string) => string;
  propertyCategory: string;
  selectedCategory: string;
  showArea: boolean;
}

const BudgetFilter: React.FC<BudgetFilterProps> = ({
  filters,
  handleFilterChange,
  formatPriceDisplay,
  propertyCategory,
  selectedCategory,
  showArea,
}) => {
  return (
    <>
      {/* Area Filter - Only for Commercial and Plot */}
      {showArea && (
        <div className="flex gap-1">
          <div className="w-[120px]">
            <div className="mb-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Min. Area
              </label>
              <input
                id="minArea"
                placeholder="Min. Area"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={filters.minBudget}
                onChange={(e) => handleFilterChange("minBudget", e.target.value)}
                className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
              />
            </div>
          </div>
          <div className="w-[120px]">
            <div className="mb-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Max. Area
              </label>
              <input
                id="maxArea"
                placeholder="Max. Area"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={filters.maxBudget}
                onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
                className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Budget Filter */}
      <div className="flex gap-1">
        <div className="w-[120px]">
          <div className="mb-2">
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Min. Budget
            </label>
            <input
              id="minBudget"
              placeholder="Min. Budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={filters.minBudget}
              onChange={(e) => handleFilterChange("minBudget", e.target.value)}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  ![
                    "Backspace",
                    "Delete",
                    "Tab",
                    "Enter",
                    "ArrowLeft",
                    "ArrowRight",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
            />
            {filters.minBudget && (
              <div className="text-right text-xs text-gray-600 font-bold -mt-1">
                {formatPriceDisplay(filters.minBudget)}
              </div>
            )}
          </div>
        </div>
        <div className="w-[120px]">
          <div className="mb-2">
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Max. Budget
            </label>
            <input
              id="maxBudget"
              placeholder="Max. Budget"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={filters.maxBudget}
              onChange={(e) => handleFilterChange("maxBudget", e.target.value)}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  ![
                    "Backspace",
                    "Delete",
                    "Tab",
                    "Enter",
                    "ArrowLeft",
                    "ArrowRight",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
            />
            {filters.maxBudget && (
              <div className="text-right text-xs text-gray-600 font-bold -mt-1">
                {formatPriceDisplay(filters.maxBudget)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carpet Area Filter - Only for Resale and New */}
      {propertyCategory !== "Rental" && (
        <div className="flex gap-1">
          <div className="w-[120px]">
            <div className="mb-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Min. Carpet
              </label>
              <input
                id="minCarpetArea"
                placeholder="Area (sq ft)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={filters.minCarpetArea}
                onChange={(e) =>
                  handleFilterChange("minCarpetArea", e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
              />
            </div>
          </div>
          <div className="w-[120px]">
            <div className="mb-2">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Max. Carpet
              </label>
              <input
                id="maxCarpetArea"
                placeholder="Area (sq ft)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={filters.maxCarpetArea}
                onChange={(e) =>
                  handleFilterChange("maxCarpetArea", e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BudgetFilter;