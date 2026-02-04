import React from "react";
import { Filter, X, ChevronRight } from "lucide-react";
import Card from "../../../../../components/ui/Card";
import Button from "../../../../../components/ui/Button";
import LocationFilter from "./LocationFilter";
import BudgetFilter from "./BudgetFilter";
import PropertyTypeFilter from "./PropertyTypeFilter";
import AdvancedFilters from "./AdvancedFilters";
import { FilterState } from "../../utils/propertyConstants";
import { formatPriceDisplay } from "../../utils/propertyFormatters";

// Dynamic filter configuration based on selected category
const getFilterConfig = (selectedCategory: string, propertyCategory: string, dynamicPropertyTypeOptions: any[]) => {
  switch (selectedCategory) {
    case "residential":
      return {
        showPropertyType: true,
        propertyTypeOptions: dynamicPropertyTypeOptions,
        showPossession: propertyCategory === "New",
        showCosmo: true,
        showGalleryTerrace: true,
        budgetLabel: "Budget",
        showArea: false,
      };
    case "commercial":
      return {
        showPropertyType: true,
        propertyTypeOptions: dynamicPropertyTypeOptions,
        showPossession: propertyCategory === "New",
        showCosmo: false,
        showGalleryTerrace: false,
        budgetLabel: "Budget",
        showArea: true,
      };
    case "plot":
      return {
        showPropertyType: false,
        propertyTypeOptions: [],
        showPossession: propertyCategory === "New",
        showCosmo: false,
        showGalleryTerrace: false,
        budgetLabel: "Budget",
        showArea: true,
      };
    default:
      return {
        showPropertyType: true,
        propertyTypeOptions: dynamicPropertyTypeOptions,
        showPossession: propertyCategory === "New",
        showCosmo: true,
        showGalleryTerrace: true,
        budgetLabel: "Budget",
        showArea: false,
      };
  }
};

interface FiltersSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: FilterState;
  appliedFilters: FilterState;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  locationFilterType: "subLocation" | "society";
  setLocationFilterType: (type: "subLocation" | "society") => void;
  propertyCategory: string;
  selectedCategory: string;
  handleFilterChange: (name: string, value: any) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  receiverPrefix: string;
  setReceiverPrefix: (prefix: string) => void;
  receiverName: string;
  setReceiverName: (name: string) => void;
  receiverWhatsApp: string;
  setReceiverWhatsApp: (whatsApp: string) => void;
  nameError: string;
  setNameError: (error: string) => void;
  whatsAppError: string;
  setWhatsAppError: (error: string) => void;
  locationOptions: { value: string; label: string }[];
  subLocationOptions: { value: string; label: string }[];
  dynamicPropertyTypeOptions: { value: string; label: string }[];
  costSheets: any[];
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  showFilters,
  setShowFilters,
  filters,
  showAdvancedFilters,
  setShowAdvancedFilters,
  locationFilterType,
  setLocationFilterType,
  propertyCategory,
  selectedCategory,
  handleFilterChange,
  resetFilters,
  applyFilters,
  receiverPrefix,
  setReceiverPrefix,
  receiverName,
  setReceiverName,
  receiverWhatsApp,
  setReceiverWhatsApp,
  nameError,
  setNameError,
  whatsAppError,
  setWhatsAppError,
  locationOptions,
  subLocationOptions,
  dynamicPropertyTypeOptions,
  costSheets,
}) => {
  return (
    <div className="relative sidebar-container flex-shrink-0 sticky top-4">
      {!showFilters && (
        <div
          className={`group w-10 hover:w-14 bg-gray-300 hover:bg-white hover:border hover:border-gray-300 rounded-l-md rounded-r-md hover:rounded-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-start pt-2 h-[600px]`}
          onMouseEnter={() => setShowFilters(true)}
        >
          <Filter
            className="h-6 w-6 text-gray-600 mb-2"
            strokeWidth={2.5}
          />
          <div className="flex-1 flex items-center">
            <ChevronRight
              className="h-6 w-6 text-gray-600"
              strokeWidth={2.5}
            />
          </div>
          <div className="mb-2">
            <ChevronRight
              className="h-5 w-5 text-gray-500"
              strokeWidth={2.5}
            />
          </div>
        </div>
      )}
      <div
        className={`transition-all duration-300 ease-in-out h-[600px] ${
          showFilters
            ? "w-80 opacity-100"
            : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        {showFilters && (
          <Card className="h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="flex items-center gap-2">
                <Button variant="text" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {/* Client Information */}
              <div className="mb-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Prefix
                </label>
                <select
                  id="receiverPrefix"
                  value={receiverPrefix}
                  onChange={(e) => setReceiverPrefix(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-xs focus:outline-none focus:ring-1"
                >
                  <option value="">Select prefix</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                  <option value="Prof">Prof</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Client Name
                </label>
                <input
                  id="receiverName"
                  placeholder="Enter client name"
                  value={receiverName}
                  onChange={(e) => {
                    setReceiverName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
                />
                {nameError && (
                  <div className="text-xs text-red-600 mt-1">
                    {nameError}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Client WhatsApp Number
                </label>
                <input
                  id="receiverWhatsApp"
                  placeholder="Enter client WhatsApp number"
                  value={receiverWhatsApp}
                  onChange={(e) => {
                    setReceiverWhatsApp(e.target.value);
                    if (whatsAppError) setWhatsAppError("");
                  }}
                  className="w-full rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-2 py-1 text-sm focus:outline-none focus:ring-1"
                />
                {whatsAppError && (
                  <div className="text-xs text-red-600 mt-1">
                    {whatsAppError}
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <LocationFilter
                filters={filters}
                handleFilterChange={handleFilterChange}
                locationOptions={locationOptions}
              />

              {/* Property Type Filter */}
              <PropertyTypeFilter
                filters={filters}
                handleFilterChange={handleFilterChange}
                propertyTypeOptions={getFilterConfig(selectedCategory, propertyCategory, dynamicPropertyTypeOptions).propertyTypeOptions}
                showPropertyType={getFilterConfig(selectedCategory, propertyCategory, dynamicPropertyTypeOptions).showPropertyType}
                showPossession={getFilterConfig(selectedCategory, propertyCategory, dynamicPropertyTypeOptions).showPossession}
                propertyCategory={propertyCategory}
              />

              {/* Budget Filter */}
              <BudgetFilter
                filters={filters}
                handleFilterChange={handleFilterChange}
                formatPriceDisplay={formatPriceDisplay}
                propertyCategory={propertyCategory}
                selectedCategory={selectedCategory}
                showArea={getFilterConfig(selectedCategory, propertyCategory, dynamicPropertyTypeOptions).showArea}
              />

              {/* Advanced Filters */}
              <AdvancedFilters
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                filters={filters}
                handleFilterChange={handleFilterChange}
                locationFilterType={locationFilterType}
                setLocationFilterType={setLocationFilterType}
                subLocationOptions={subLocationOptions}
                propertyCategory={propertyCategory}
                selectedCategory={selectedCategory}
                costSheets={costSheets}
                showCosmo={getFilterConfig(selectedCategory, propertyCategory, dynamicPropertyTypeOptions).showCosmo}
                showGalleryTerrace={getFilterConfig(selectedCategory, propertyCategory, dynamicPropertyTypeOptions).showGalleryTerrace}
              />

              <Button
                variant="primary"
                fullWidth
                onClick={applyFilters}
                disabled={selectedCategory !== "residential"}
              >
                Apply Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FiltersSidebar;