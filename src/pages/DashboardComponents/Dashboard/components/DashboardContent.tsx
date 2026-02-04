import React, { useState } from "react";
import { Building, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import NewPropertiesActionBar from "./actionbars/NewPropertiesActionBar";
import ResaleRentalActionBar from "./actionbars/ResaleRentalActionBar";
import NewPropertiesTable from "./tables/NewPropertiesTable";
import ResaleRentalTable from "./tables/ResaleRentalTable";
import Pagination from "./Pagination";
import { PropertyCategory } from "../../../types";
import { FilterState, ITEMS_PER_PAGE } from "../utils/propertyConstants";
import { CostSheet } from "../../../components/CompareComponents/Compare";

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
  totalFloors?: string | number;
}

interface DashboardContentProps {
  selectedCategory: string;
  propertyCategory: PropertyCategory;
  hasFiltered: boolean;
  everFiltered: boolean;
  inventoryLoaded: boolean;
  filteredNewProperties: CostSheet[];
  filteredResaleRentalProperties: ResaleProperty[];
  selectedProperties: ResaleProperty[];
  selectedCostSheets: CostSheet[];
  appliedFilters: FilterState;
  currentPage: number;
  user: any;
  rrStationNames: string[];
  ndStationNames: string[];
  setSelectedProperties: React.Dispatch<React.SetStateAction<ResaleProperty[]>>;
  setSelectedCostSheets: React.Dispatch<React.SetStateAction<CostSheet[]>>;
  togglePropertySelection: (property: ResaleProperty) => void;
  toggleCostSheetSelection: (costSheet: CostSheet) => void;
  isPropertySelected: (property: ResaleProperty) => boolean;
  handleProjectClick: (sheet: CostSheet) => void;
  handlePropertyClick: (property: ResaleProperty) => void;
  handlePageChange: (page: number) => void;
  handleCompare: () => void;
  sendWhatsAppToInput: () => void;
  resetFilters: () => void;
  setSelectedProjectData: React.Dispatch<React.SetStateAction<CostSheet | null>>;
  openMediaModal: (title: string, files: string[], type?: "image" | "video" | "pdf") => void;
  getMediaSections: (mediaFiles: any, costSheet?: any) => { name: string; files: any; type: string }[];
  handleImageClick: (sheet: CostSheet) => void;
  handleVideoClick: (sheet: CostSheet) => void;
  handleBrochureClick: (sheet: CostSheet) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  selectedCategory,
  propertyCategory,
  hasFiltered,
  everFiltered,
  inventoryLoaded,
  filteredNewProperties,
  filteredResaleRentalProperties,
  selectedProperties,
  selectedCostSheets,
  appliedFilters,
  currentPage,
  user,
  rrStationNames,
  ndStationNames,
  setSelectedProperties,
  setSelectedCostSheets,
  togglePropertySelection,
  toggleCostSheetSelection,
  isPropertySelected,
  handleProjectClick,
  handlePropertyClick,
  handlePageChange,
  handleCompare,
  sendWhatsAppToInput,
  resetFilters,
  setSelectedProjectData,
  openMediaModal,
  getMediaSections,
  handleImageClick,
  handleVideoClick,
  handleBrochureClick,
}) => {
  const [processedNewPropertiesCount, setProcessedNewPropertiesCount] = useState(0);
  const [processedResaleRentalCount, setProcessedResaleRentalCount] = useState(0);
  const getCurrentPageData = (data: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const noActiveSubscription =
    !user ||
    (user.role !== "admin" &&
      user.role !== "manager" &&
      user.role !== "executive" &&
      !user.freeTrialActivated &&
      ((propertyCategory === "New" && ndStationNames.length === 0) ||
        (propertyCategory !== "New" && rrStationNames.length === 0)));

  // Coming Soon view for non-residential categories
  if (selectedCategory !== "residential") {
    return (
      <Card>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Coming Soon
          </h2>
          <p className="text-neutral-600">
            These properties will be available soon.
          </p>
        </div>
      </Card>
    );
  }

  // No subscription view
  if (noActiveSubscription) {
    return (
      <Card>
        <div className="text-center py-8">
          <Building className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            No Active Subscriptions
          </h2>
          <p className="text-neutral-600 mb-4">
            You need to subscribe for Resale & Rental package to view
            {propertyCategory === "New" ? " new properties" : " properties"}.
          </p>
          <Link to="/subscription">
            <Button variant="primary">Add Subscription</Button>
          </Link>
        </div>
      </Card>
    );
  }

  // New Properties view
  if (propertyCategory === "New") {
    if (!hasFiltered) {
      return (
        <Card>
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Apply Filters to See Properties
            </h2>
            <p className="text-neutral-600">
              Use the filters to narrow down your search and find the perfect property.
            </p>
          </div>
        </Card>
      );
    }

    if (filteredNewProperties.length === 0) {
      return (
        <Card>
          <div className="text-center py-8">
            <X className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No new properties added yet</p>
          </div>
        </Card>
      );
    }

    return (
      <div className="flex flex-col">
        {/* Action Bar for New Properties */}
        {selectedCostSheets.length > 0 && (
          <NewPropertiesActionBar
            selectedCostSheets={selectedCostSheets}
            setSelectedCostSheets={setSelectedCostSheets}
            appliedFilters={appliedFilters}
            hasFiltered={hasFiltered}
            handleCompare={handleCompare}
            sendWhatsAppToInput={sendWhatsAppToInput}
          />
        )}

        {/* Table Container */}
        <div className="flex flex-col">
          <NewPropertiesTable
            filteredNewProperties={filteredNewProperties}
            appliedFilters={appliedFilters}
            selectedCostSheets={selectedCostSheets}
            toggleCostSheetSelection={toggleCostSheetSelection}
            handleProjectClick={handleProjectClick}
            setSelectedProjectData={setSelectedProjectData}
            openMediaModal={openMediaModal}
            getMediaSections={getMediaSections}
            handleImageClick={handleImageClick}
            handleVideoClick={handleVideoClick}
            handleBrochureClick={handleBrochureClick}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            setProcessedCount={setProcessedNewPropertiesCount}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={processedNewPropertiesCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    );
  }

  // Resale/Rental Properties view
  if (!inventoryLoaded) {
    return (
      <Card>
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Loading Properties...
          </h2>
          <p className="text-neutral-600">
            Please wait while we load the property data.
          </p>
        </div>
      </Card>
    );
  }

  if (!everFiltered) {
    return (
      <Card>
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Apply Filters to See Properties
          </h2>
          <p className="text-neutral-600">
            Use the filters to narrow down your search and find the perfect property.
          </p>
        </div>
      </Card>
    );
  }

  if (filteredResaleRentalProperties.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <X className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            No Properties Found
          </h2>
          <p className="text-neutral-600 mb-4">
            No properties match your current filter criteria. Try adjusting your filters.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Action Bar */}
      {selectedProperties.length > 0 && (
        <ResaleRentalActionBar
          selectedProperties={selectedProperties}
          setSelectedProperties={setSelectedProperties}
          sendWhatsAppToInput={sendWhatsAppToInput}
        />
      )}

      {/* Table Container */}
      <div className="flex flex-col">
        <ResaleRentalTable
          filteredProperties={filteredResaleRentalProperties}
          propertyCategory={propertyCategory}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          user={user}
          appliedFilters={appliedFilters}
          isPropertySelected={isPropertySelected}
          togglePropertySelection={togglePropertySelection}
          handlePropertyClick={handlePropertyClick}
          setProcessedCount={setProcessedResaleRentalCount}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={processedResaleRentalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default DashboardContent;