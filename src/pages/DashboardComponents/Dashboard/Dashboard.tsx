import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MapPin, Eye } from "lucide-react";
import { useAuth } from "../../../utils/authContext";
import { PropertyCategory } from "../../../types";
import Tabs from "../../../components/ui/Tabs";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";

// Import custom hooks
import { usePropertyFilters } from "./hooks/usePropertyFilters";
import { usePropertyData } from "./hooks/usePropertyData";
import { usePropertySelection } from "./hooks/usePropertySelection";
import { useWhatsAppSharing } from "./hooks/useWhatsAppSharing";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";

// Import components
import DashboardHeader from "./components/DashboardHeader";
import PropertyCategorySelector from "./components/PropertyCategorySelector";
import FiltersSidebar from "./components/FiltersSidebar/FiltersSidebar";
import DashboardContent from "./components/DashboardContent";
import WhatsAppPreviewModal from "./components/modals/WhatsAppPreviewModal";

// Import modal components
import ResaleRentalPropertyModal from "./components/modals/ResaleRentalPropertyModal";
import { NewPropertyModal } from "../../../components/NewPropertyTables/NewPropertyModal";

// Import utilities
import { getMediaSections } from "./utils/mediaHandlers";
import { MediaDisplayComponent } from "../mediaDisplayComponent";
import MediaPreviewGridModal from "./components/modals/MediaPreviewGridModal";
import { checkSubscriptionAccess } from "./utils/subscriptionUtils";
import { fetchBanners } from "../../../utils/api";
import { stations } from "../../../utils/stations";
import { CostSheet } from "../../../components/CompareComponents/Compare";

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  location: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const quickSendRef = useRef<HTMLDivElement>(null);
  
  // Category and UI state
  const [selectedCategory, setSelectedCategory] = useState("residential");
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory>("Resale");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Modal and media state
  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [selectedProjectData, setSelectedProjectData] = useState<CostSheet | null>(null);
  const [selectedMediaProjectData, setSelectedMediaProjectData] = useState<CostSheet | null>(null);
  const [openPropertyModal, setOpenPropertyModal] = useState(false);
  const [selectedPropertyData, setSelectedPropertyData] = useState<any>(null);
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    title: string;
    files: string[];
    type: "image" | "video" | "pdf";
  }>({ isOpen: false, title: "", files: [], type: "image" });
  const [fullViewer, setFullViewer] = useState<{
    isOpen: boolean;
    files: string[];
    currentIndex: number;
    type: "image" | "video" | "pdf";
  }>({ isOpen: false, files: [], currentIndex: 0, type: "image" });

  // Quick send state
  const [selectedQuickSendProperty, setSelectedQuickSendProperty] = useState<CostSheet | null>(null);
  const [quickSendSearch, setQuickSendSearch] = useState("");
  const [showQuickSendDropdown, setShowQuickSendDropdown] = useState(false);
  const [selectedQuickSendIndex, setSelectedQuickSendIndex] = useState(-1);

  // Location dropdown state
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);

  // Custom hooks
  const {
    filters,
    appliedFilters,
    hasFiltered,
    everFiltered,
    showAdvancedFilters,
    locationFilterType,
    setShowAdvancedFilters,
    setLocationFilterType,
    handleFilterChange,
    resetFilters,
    applyFilters,
  } = usePropertyFilters(propertyCategory);

  const {
    inventory,
    inventoryLoaded,
    costSheets,
    rrStationNames,
    ndStationNames,
    subscriptionFilteredProperties,
  } = usePropertyData();

  const {
    selectedProperties,
    selectedCostSheets,
    setSelectedProperties,
    setSelectedCostSheets,
    togglePropertySelection,
    toggleCostSheetSelection,
    isPropertySelected,
    clearSelections,
  } = usePropertySelection();

  const {
    receiverPrefix,
    receiverName,
    receiverWhatsApp,
    whatsAppError,
    nameError,
    showPreviewModal,
    previewText,
    setReceiverPrefix,
    setReceiverName,
    setReceiverWhatsApp,
    setNameError,
    setWhatsAppError,
    setShowPreviewModal,
    sendWhatsAppMessage,
    previewWhatsAppMessage,
  } = useWhatsAppSharing();

  // Location options
  const locationOptions = useMemo(() => {
    const stationNames = stations.map((s) => s.name);
    const defaultLocationOptions = stationNames.flatMap((name) => [
      { value: `${name} East`, label: `${name} East` },
      { value: `${name} West`, label: `${name} West` },
    ]);

    const additionalLocations = new Set<string>();

    if (propertyCategory === "Resale") {
      subscriptionFilteredProperties.resale.forEach((property) => {
        if (property.station) {
          const stationName = property.station.trim();
          if (
            stationName &&
            !defaultLocationOptions.some(
              (opt) => opt.value.toLowerCase() === stationName.toLowerCase()
            )
          ) {
            additionalLocations.add(stationName);
          }
        }
      });
    } else if (propertyCategory === "Rental") {
      subscriptionFilteredProperties.rental.forEach((property) => {
        if (property.station) {
          const stationName = property.station.trim();
          if (
            stationName &&
            !defaultLocationOptions.some(
              (opt) => opt.value.toLowerCase() === stationName.toLowerCase()
            )
          ) {
            additionalLocations.add(stationName);
          }
        }
      });
    } else if (propertyCategory === "New") {
      costSheets.forEach((sheet) => {
        const stationToCheck = sheet.station || sheet.location;
        if (stationToCheck) {
          const stationName = stationToCheck.trim();
          if (
            stationName &&
            !defaultLocationOptions.some(
              (opt) => opt.value.toLowerCase() === stationName.toLowerCase()
            )
          ) {
            additionalLocations.add(stationName);
          }
        }
      });
    }

    const additionalLocationOptions = Array.from(additionalLocations)
      .sort()
      .map((location) => ({ value: location, label: location }));

    return [...defaultLocationOptions, ...additionalLocationOptions];
  }, [subscriptionFilteredProperties, costSheets, propertyCategory]);

  // Dynamic property type options
  const dynamicPropertyTypeOptions = useMemo(() => {
    const typeSet = new Set<string>();

    if (propertyCategory === "New") {
      costSheets.forEach((sheet) => {
        const stationToCheck = sheet.station || sheet.location;
        const isApproved =
          sheet.isApproved === true || sheet.approvalStatus === "approved" || sheet.approvalWorkflow?.status === "approved";

        if (isApproved) {
          if (
            filters.station &&
            stationToCheck?.toLowerCase().trim() !==
              filters.station.toLowerCase().trim()
          ) {
            return;
          }

          if (sheet.typologies && Array.isArray(sheet.typologies)) {
            sheet.typologies.forEach((typology) => {
              if (typology.typology && typology.availability !== "Sold Out") {
                typeSet.add(typology.typology.trim());
              }
            });
          }

          if (sheet.subTabData) {
            Object.values(sheet.subTabData).forEach((tabData: any) => {
              if (
                tabData.pricingConfigs &&
                Array.isArray(tabData.pricingConfigs)
              ) {
                tabData.pricingConfigs.forEach((config: any) => {
                  if (config.typology && config.availability !== "Sold Out") {
                    typeSet.add(config.typology.trim());
                  }
                });
              }
            });
          }

          const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
          const availability =
            sheet.availability || sheet.typologies?.[0]?.availability;
          if (flatType && availability !== "Sold Out") {
            typeSet.add(flatType.trim());
          }
        }
      });
    } else {
      const properties =
        propertyCategory === "Rental"
          ? subscriptionFilteredProperties.rental
          : subscriptionFilteredProperties.resale;

      properties.forEach((property) => {
        if (property.type && property.listingState !== "Hold") {
          if (
            filters.station &&
            property.station?.toLowerCase().trim() !==
              filters.station.toLowerCase().trim()
          ) {
            return;
          }
          typeSet.add(property.type.trim());
        }
      });
    }

    return Array.from(typeSet)
      .filter((type) => type.length > 0)
      .sort()
      .map((type) => ({ value: type, label: type }));
  }, [
    subscriptionFilteredProperties,
    costSheets,
    propertyCategory,
    filters.station,
  ]);

  // Sub location options
  const subLocationOptions = useMemo(() => {
    const locationSet = new Set<string>();

    if (propertyCategory === "New") {
      costSheets.forEach((sheet) => {
        const fieldValue =
          locationFilterType === "subLocation"
            ? sheet.subLocation || sheet.road
            : sheet.projectName;

        const isApproved =
          sheet.isApproved === true || sheet.approvalStatus === "approved" || sheet.approvalWorkflow?.status === "approved";

        if (fieldValue && isApproved) {
          let hasMatchingTypology = false;

          if (sheet.typologies && Array.isArray(sheet.typologies)) {
            hasMatchingTypology = sheet.typologies.some((typology) => {
              if (typology.availability === "Sold Out") return false;
              if (filters.bhkType) {
                return (
                  typology.typology?.toLowerCase() ===
                  filters.bhkType.toLowerCase()
                );
              }
              return true;
            });
          }

          if (!hasMatchingTypology && sheet.subTabData) {
            Object.values(sheet.subTabData).forEach((tabData: any) => {
              if (
                tabData.pricingConfigs &&
                Array.isArray(tabData.pricingConfigs)
              ) {
                const hasMatch = tabData.pricingConfigs.some((config: any) => {
                  if (config.availability === "Sold Out") return false;
                  if (filters.bhkType) {
                    return (
                      config.typology?.toLowerCase() ===
                      filters.bhkType.toLowerCase()
                    );
                  }
                  return true;
                });
                if (hasMatch) hasMatchingTypology = true;
              }
            });
          }

          if (!hasMatchingTypology) {
            const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
            const availability =
              sheet.availability || sheet.typologies?.[0]?.availability;

            if (availability === "Sold Out") return;

            if (filters.bhkType) {
              hasMatchingTypology =
                flatType?.toLowerCase() === filters.bhkType.toLowerCase();
            } else {
              hasMatchingTypology = true;
            }
          }

          if (!hasMatchingTypology) return;

          const stationToCheck = sheet.station || sheet.location;
          if (
            filters.station &&
            stationToCheck?.toLowerCase().trim() !==
              filters.station.toLowerCase().trim()
          ) {
            return;
          }

          locationSet.add(fieldValue.trim());
        }
      });
    } else {
      const properties =
        propertyCategory === "Rental"
          ? subscriptionFilteredProperties.rental
          : subscriptionFilteredProperties.resale;

      properties.forEach((property) => {
        const fieldValue =
          locationFilterType === "subLocation"
            ? property.sublocation
            : property.society;
        if (fieldValue && property.listingState !== "Hold") {
          if (filters.bhkType && property.type !== filters.bhkType) {
            return;
          }
          if (
            filters.station &&
            property.station?.toLowerCase().trim() !==
              filters.station.toLowerCase().trim()
          ) {
            return;
          }
          locationSet.add(fieldValue.toString().trim());
        }
      });
    }

    return Array.from(locationSet)
      .filter((loc) => loc.length > 0)
      .sort()
      .map((loc) => ({ value: loc, label: loc }));
  }, [
    subscriptionFilteredProperties,
    costSheets,
    filters.bhkType,
    filters.station,
    propertyCategory,
    locationFilterType,
  ]);

  // Quick send property options
  const quickSendPropertyOptions = useMemo(() => {
    const projectSet = new Set<string>();

    if (propertyCategory === "New") {
      costSheets.forEach((sheet) => {
        const isApproved =
          sheet.isApproved === true || sheet.approvalStatus === "approved" || sheet.approvalWorkflow?.status === "approved";

        if (sheet.projectName && isApproved) {
          const isCompletelySoldOut =
            sheet.availability === "Sold Out" &&
            (!sheet.typologies ||
              sheet.typologies.every((t) => t.availability === "Sold Out"));

          if (!isCompletelySoldOut) {
            projectSet.add(sheet.projectName.trim());
          }
        }
      });
    }

    return Array.from(projectSet)
      .filter((project) => project.length > 0)
      .sort((a, b) => {
        const aStartsWithNumber = /^\d/.test(a);
        const bStartsWithNumber = /^\d/.test(b);
        if (aStartsWithNumber && !bStartsWithNumber) return -1;
        if (!aStartsWithNumber && bStartsWithNumber) return 1;
        const aClean = a.toLowerCase().replace(/[^a-z0-9]/g, "");
        const bClean = b.toLowerCase().replace(/[^a-z0-9]/g, "");
        return aClean < bClean ? -1 : aClean > bClean ? 1 : 0;
      })
      .map((project) => ({ value: project, label: project }));
  }, [costSheets, propertyCategory]);

  // Filtered properties
  const filteredNewProperties = useMemo(() => {
    if (propertyCategory !== "New") return [];

    return costSheets.filter((sheet) => {
      // Check approval status first - only show approved properties to regular users
      const isApproved = sheet.isApproved === true || sheet.approvalStatus === "approved" || sheet.approvalWorkflow?.status === "approved";
      if (!isApproved) return false;

      const stationToCheck = sheet.station || sheet.location;

      if (appliedFilters.station) {
        const sheetStation = stationToCheck || "";
        if (
          sheetStation.toLowerCase().trim() !==
          appliedFilters.station.toLowerCase().trim()
        ) {
          return false;
        }
      }

      if (appliedFilters.subLocation.length > 0) {
        const fieldValue =
          locationFilterType === "subLocation"
            ? sheet.subLocation || sheet.road
            : sheet.projectName;
        if (
          !appliedFilters.subLocation.some(
            (loc) => loc.toLowerCase() === (fieldValue || "").toLowerCase()
          )
        ) {
          return false;
        }
      }

      let hasMatchingTypology = false;

      if (sheet.typologies && Array.isArray(sheet.typologies)) {
        hasMatchingTypology = sheet.typologies.some((typology) => {
          if (typology.availability === "Sold Out") return false;
          if (appliedFilters.bhkType) {
            return (
              typology.typology?.toLowerCase() ===
              appliedFilters.bhkType.toLowerCase()
            );
          }
          return true;
        });
      }

      if (!hasMatchingTypology && sheet.subTabData) {
        Object.values(sheet.subTabData).forEach((tabData: any) => {
          if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
            const hasMatch = tabData.pricingConfigs.some((config: any) => {
              if (config.availability === "Sold Out") return false;
              if (appliedFilters.bhkType) {
                return (
                  config.typology?.toLowerCase() ===
                  appliedFilters.bhkType.toLowerCase()
                );
              }
              return true;
            });
            if (hasMatch) hasMatchingTypology = true;
          }
        });
      }

      if (!hasMatchingTypology) {
        const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
        const availability =
          sheet.availability || sheet.typologies?.[0]?.availability;

        if (availability === "Sold Out") return false;

        if (appliedFilters.bhkType) {
          hasMatchingTypology =
            flatType?.toLowerCase() === appliedFilters.bhkType.toLowerCase();
        } else {
          hasMatchingTypology = true;
        }
      }

      if (!hasMatchingTypology) return false;

      // Budget filter for New properties - check the lowest package that matches criteria
      if (appliedFilters.minBudget || appliedFilters.maxBudget) {
        let lowestPackage = Infinity;
        
        // Find the lowest package that matches BHK filter
        if (sheet.typologies && Array.isArray(sheet.typologies)) {
          sheet.typologies.forEach((typology) => {
            if (typology.availability !== "Sold Out") {
              if (appliedFilters.bhkType && typology.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                return;
              }
              
              const pkgValue = typology.totalPackage;
              const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
              
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
              }
            }
          });
        }
        
        if (sheet.subTabData) {
          Object.values(sheet.subTabData).forEach((tabData: any) => {
            if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
              tabData.pricingConfigs.forEach((config: any) => {
                if (config.availability !== "Sold Out") {
                  if (appliedFilters.bhkType && config.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                    return;
                  }
                  
                  const pkgValue = config.totalPackage;
                  const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                  
                  if (pkg > 0 && pkg < lowestPackage) {
                    lowestPackage = pkg;
                  }
                }
              });
            }
          });
        }
        
        // Apply budget filter to the lowest package
        if (lowestPackage !== Infinity) {
          if (appliedFilters.minBudget && lowestPackage < Number(appliedFilters.minBudget)) {
            return false;
          }
          if (appliedFilters.maxBudget && lowestPackage > Number(appliedFilters.maxBudget)) {
            return false;
          }
        }
      }

      // Possession filter - check the possession of the config that gives lowest package
      if (appliedFilters.possession) {
        let lowestPackage = Infinity;
        let matchingPossession = "";
        
        // Find the config with lowest package and get its possession
        if (sheet.typologies && Array.isArray(sheet.typologies)) {
          sheet.typologies.forEach((typology) => {
            if (typology.availability !== "Sold Out") {
              if (appliedFilters.bhkType && typology.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                return;
              }
              
              const pkgValue = typology.totalPackage;
              const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
              
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
                matchingPossession = typology.developerPossession || sheet.possession || "";
              }
            }
          });
        }
        
        if (sheet.subTabData) {
          Object.values(sheet.subTabData).forEach((tabData: any) => {
            if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
              tabData.pricingConfigs.forEach((config: any) => {
                if (config.availability !== "Sold Out") {
                  if (appliedFilters.bhkType && config.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                    return;
                  }
                  
                  const pkgValue = config.totalPackage;
                  const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                  
                  if (pkg > 0 && pkg < lowestPackage) {
                    lowestPackage = pkg;
                    matchingPossession = config.developerPossession || sheet.possession || "";
                  }
                }
              });
            }
          });
        }
        
        const filterPossession = appliedFilters.possession;
        
        if (filterPossession === "Ready to Move") {
          let lowestPackage = Infinity;
          let matchingDeveloperPossession = "";
          let matchingProjectStatus = "";
          
          if (sheet.subTabData) {
            Object.values(sheet.subTabData).forEach((tabData: any) => {
              if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
                tabData.pricingConfigs.forEach((config: any) => {
                  if (config.availability !== "Sold Out") {
                    if (appliedFilters.bhkType && config.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                      return;
                    }
                    
                    const pkgValue = config.totalPackage;
                    const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                    
                    if (pkg > 0 && pkg < lowestPackage) {
                      lowestPackage = pkg;
                      matchingDeveloperPossession = config.developerPossession || tabData.developerPossession || "";
                      matchingProjectStatus = tabData.projectStatus || "";
                    }
                  }
                });
              }
            });
          }
          
          if (lowestPackage === Infinity && sheet.subTabData) {
            const firstTabData = Object.values(sheet.subTabData)[0] as any;
            matchingDeveloperPossession = firstTabData?.developerPossession || "";
            matchingProjectStatus = firstTabData?.projectStatus || "";
          }
          
          const developerPossessionLower = matchingDeveloperPossession.toLowerCase();
          const projectStatusLower = matchingProjectStatus.toLowerCase();
          
          if (developerPossessionLower === "ready to move" || developerPossessionLower.includes("ready") ||
              projectStatusLower === "ready to move" || projectStatusLower.includes("ready")) {
            return true;
          }
          
          if (!matchingDeveloperPossession || matchingDeveloperPossession.trim() === "") {
            return false;
          }
          
          const possessionDate = new Date(matchingDeveloperPossession);
          if (isNaN(possessionDate.getTime())) {
            return false;
          }
          
          const currentDate = new Date();
          const threeMonthsFromNow = new Date();
          threeMonthsFromNow.setMonth(currentDate.getMonth() + 3);
          
          return possessionDate <= currentDate || possessionDate <= threeMonthsFromNow;
        } else {
          // For date-based filters, exclude "Ready to Move" properties
          const isReadyToMove = matchingPossession === "Ready to Move" || 
                              matchingPossession?.toLowerCase() === "ready to move" ||
                              matchingPossession?.toLowerCase().includes("ready");
          
          if (isReadyToMove) {
            return false;
          }
          
          // If no possession data found, exclude the property
          if (!matchingPossession || matchingPossession.trim() === "") {
            return false;
          }
          
          // Apply month-based range filters
          const currentDate = new Date();
          const possessionDate = new Date(matchingPossession);
          
          if (isNaN(possessionDate.getTime())) {
            return false;
          }
          
          // Calculate months from current date
          const monthsDiff = (possessionDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                           (possessionDate.getMonth() - currentDate.getMonth());
          
          if (filterPossession === "1-2yrs") {
            // Current month to 24th month
            if (monthsDiff < 0 || monthsDiff > 24) {
              return false;
            }
          } else if (filterPossession === "2-3yrs") {
            // 13th month to 36th month
            if (monthsDiff < 13 || monthsDiff > 36) {
              return false;
            }
          } else if (filterPossession === "3-4yrs") {
            // 25th month to 48th month
            if (monthsDiff < 25 || monthsDiff > 48) {
              return false;
            }
          } else if (filterPossession === "4+yrs") {
            // 37th month and above
            if (monthsDiff < 37) {
              return false;
            }
          }
        }
      }

      // Schemes filter
      if (appliedFilters.schemes.length > 0) {
        const sheetSchemes = sheet.paymentSchemes ? sheet.paymentSchemes.map((scheme: any) => scheme.schemeName).filter(Boolean) : [];
        const hasMatchingScheme = appliedFilters.schemes.some(scheme => 
          sheetSchemes.includes(scheme)
        );
        if (!hasMatchingScheme) {
          return false;
        }
      }

      // Cosmo filter for New properties
      if (appliedFilters.lookingForCosmo !== undefined) {
        // Check sheet-level isCosmo field first
        const sheetCosmo = sheet.isCosmo === "Yes" || sheet.isCosmo === true;
        
        if (sheetCosmo !== appliedFilters.lookingForCosmo) {
          return false;
        }
      }

      // Balcony/Terrace filter for New properties
      if (appliedFilters.BalconyorTerrace) {
        let lowestPackage = Infinity;
        let matchingHasBalcony = false;
        let matchingHasTerrace = false;
        
        // Check subTabData first as it has the hasBalcony/hasTerrace fields
        if (sheet.subTabData) {
          Object.values(sheet.subTabData).forEach((tabData: any) => {
            if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
              tabData.pricingConfigs.forEach((config: any) => {
                if (config.availability !== "Sold Out") {
                  if (appliedFilters.bhkType && config.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                    return;
                  }
                  
                  const pkgValue = config.totalPackage;
                  const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                  
                  if (pkg > 0 && pkg < lowestPackage) {
                    lowestPackage = pkg;
                    matchingHasBalcony = config.hasBalcony || false;
                    matchingHasTerrace = config.hasTerrace || false;
                  }
                }
              });
            }
          });
        }
        
        // Only check typologies if no subTabData found
        if (lowestPackage === Infinity && sheet.typologies && Array.isArray(sheet.typologies)) {
          sheet.typologies.forEach((typology) => {
            if (typology.availability !== "Sold Out") {
              if (appliedFilters.bhkType && typology.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                return;
              }
              
              const pkgValue = typology.totalPackage;
              const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
              
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
                matchingHasBalcony = typology.hasBalcony || false;
                matchingHasTerrace = typology.hasTerrace || false;
              }
            }
          });
        }
        
        if (appliedFilters.BalconyorTerrace === "Balcony" && !matchingHasBalcony) {
          return false;
        }
        if (appliedFilters.BalconyorTerrace === "Terrace" && !matchingHasTerrace) {
          return false;
        }
      }

      // Amenities filter for New properties
      if (appliedFilters.amenities.length > 0) {
        const apartmentAmenities = sheet.apartmentAmenities || [];
        const projectAmenities = sheet.projectAmenities || [];
        const allAmenities = [...apartmentAmenities, ...projectAmenities];
        
        const hasAllAmenities = appliedFilters.amenities.every(amenity => 
          allAmenities.some(sheetAmenity => 
            sheetAmenity.toLowerCase().includes(amenity.toLowerCase()) ||
            amenity.toLowerCase().includes(sheetAmenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      // Carpet Area filter for New properties - check the same config that gives lowest package
      if (appliedFilters.minCarpetArea || appliedFilters.maxCarpetArea) {
        let lowestPackage = Infinity;
        let matchingSaleableArea = "";
        
        // Find the config with lowest package and get its saleable area
        if (sheet.typologies && Array.isArray(sheet.typologies)) {
          sheet.typologies.forEach((typology) => {
            if (typology.availability !== "Sold Out") {
              if (appliedFilters.bhkType && typology.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                return;
              }
              
              const pkgValue = typology.totalPackage;
              const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
              
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
                matchingSaleableArea = typology.saleableArea || "";
              }
            }
          });
        }
        
        if (sheet.subTabData) {
          Object.values(sheet.subTabData).forEach((tabData: any) => {
            if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
              tabData.pricingConfigs.forEach((config: any) => {
                if (config.availability !== "Sold Out") {
                  if (appliedFilters.bhkType && config.typology?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()) {
                    return;
                  }
                  
                  const pkgValue = config.totalPackage;
                  const pkg = typeof pkgValue === "string" ? Number(pkgValue.replace(/[^0-9]/g, "")) : pkgValue || 0;
                  
                  if (pkg > 0 && pkg < lowestPackage) {
                    lowestPackage = pkg;
                    matchingSaleableArea = config.saleableArea || "";
                  }
                }
              });
            }
          });
        }
        
        // Apply carpet area filter to the matching saleable area
        if (matchingSaleableArea) {
          const area = typeof matchingSaleableArea === "string" ? Number(matchingSaleableArea.replace(/[^0-9]/g, "")) : matchingSaleableArea || 0;
          
          if (appliedFilters.minCarpetArea && area < Number(appliedFilters.minCarpetArea)) {
            return false;
          }
          if (appliedFilters.maxCarpetArea && area > Number(appliedFilters.maxCarpetArea)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [costSheets, appliedFilters, locationFilterType]);

  const filteredResaleRentalProperties = useMemo(() => {
    if (propertyCategory === "New") return [];

    const properties =
      propertyCategory === "Rental"
        ? subscriptionFilteredProperties.rental
        : subscriptionFilteredProperties.resale;

    return properties.filter((property: any) => {
      if (
        property.listingState === "Hold" ||
        property.listingState === "Sold Out"
      ) {
        return false;
      }

      if (appliedFilters.bhkType && property.type !== appliedFilters.bhkType) {
        return false;
      }

      if (appliedFilters.station) {
        const propertyStation = property.station || "";
        if (
          propertyStation.toLowerCase().trim() !==
          appliedFilters.station.toLowerCase().trim()
        ) {
          return false;
        }
      }

      if (appliedFilters.subLocation.length > 0) {
        const fieldValue =
          locationFilterType === "subLocation"
            ? property.sublocation
            : property.society;
        if (
          !appliedFilters.subLocation.some(
            (loc) =>
              loc.toLowerCase() === (fieldValue || "").toString().toLowerCase()
          )
        ) {
          return false;
        }
      }

      const budget =
        propertyCategory === "Rental" ? property.rent : property.expectedPrice;
      if (
        appliedFilters.minBudget &&
        Number(budget ?? 0) < Number(appliedFilters.minBudget)
      ) {
        return false;
      }
      if (
        appliedFilters.maxBudget &&
        Number(budget ?? 0) > Number(appliedFilters.maxBudget)
      ) {
        return false;
      }

      // Carpet Area filter
      if (appliedFilters.minCarpetArea || appliedFilters.maxCarpetArea) {
        const carpetArea = property.carpetArea || 0;
        if (appliedFilters.minCarpetArea && carpetArea < Number(appliedFilters.minCarpetArea)) {
          return false;
        }
        if (appliedFilters.maxCarpetArea && carpetArea > Number(appliedFilters.maxCarpetArea)) {
          return false;
        }
      }

      // Cosmo filter
      if (appliedFilters.lookingForCosmo !== undefined) {
        const propertyCosmo = property.cosmoSociety === "true" || property.cosmo === true;
        if (propertyCosmo !== appliedFilters.lookingForCosmo) {
          return false;
        }
      }

      // Balcony/Terrace filter
      if (appliedFilters.BalconyorTerrace) {
        if (appliedFilters.BalconyorTerrace === "Balcony") {
          if (property.terraceGallery !== "Gallery") {
            return false;
          }
        }
        if (appliedFilters.BalconyorTerrace === "Terrace") {
          if (property.terraceGallery !== "Terrace") {
            return false;
          }
        }
      }

      // Pet Friendly filter (for Rental)
      if (propertyCategory === "Rental" && appliedFilters.petFriendly !== undefined) {
        if (property.petFriendly !== appliedFilters.petFriendly) {
          return false;
        }
      }

      // Furnishing filter (for Resale)
      if (propertyCategory === "Resale" && appliedFilters.furnishing) {
        if (property.furnishing !== appliedFilters.furnishing) {
          return false;
        }
      }

      // Parking filter
      if (appliedFilters.parking !== undefined) {
        if (propertyCategory === "Resale") {
          const hasParking = property.parking === "Open" || property.parking === "Covered";
          if (hasParking !== appliedFilters.parking) {
            return false;
          }
        } else {
          const hasParking = property.parking && property.parking !== "No Parking";
          if (hasParking !== appliedFilters.parking) {
            return false;
          }
        }
      }

      // OC/Red filter (for Resale)
      if (propertyCategory === "Resale" && appliedFilters.ocRed) {
        const ocStatus = property.ocAvailable === "true" || property.ocStatus === "Available";
        if (appliedFilters.ocRed === "OC" && !ocStatus) {
          return false;
        }
        if (appliedFilters.ocRed === "Red" && ocStatus) {
          return false;
        }
      }

      // Amenities filter
      if (appliedFilters.amenities.length > 0) {
        const propertyAmenities = property.amenities || [];
        const hasAllAmenities = appliedFilters.amenities.every(amenity => 
          propertyAmenities.some(propAmenity => 
            propAmenity.toLowerCase().includes(amenity.toLowerCase()) ||
            amenity.toLowerCase().includes(propAmenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });
  }, [
    subscriptionFilteredProperties,
    appliedFilters,
    propertyCategory,
    locationFilterType,
  ]);

  // Keyboard navigation for full viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullViewer.isOpen) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateMedia("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateMedia("next");
      } else if (e.key === "Escape") {
        e.preventDefault();
        setFullViewer({
          isOpen: false,
          files: [],
          currentIndex: 0,
          type: "image",
        });
      }
    };

    if (fullViewer.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [fullViewer.isOpen]);
  const handleProjectClick = (sheet: CostSheet) => {
    let lowestPackage = Infinity;
    let lowestTypology = "";

    if (sheet.typologies && Array.isArray(sheet.typologies)) {
      sheet.typologies.forEach((typology) => {
        if (typology.availability !== "Sold Out") {
          if (
            appliedFilters.bhkType &&
            typology.typology?.toLowerCase() !==
              appliedFilters.bhkType.toLowerCase()
          ) {
            return;
          }

          const pkgValue = typology.totalPackage;
          const pkg =
            typeof pkgValue === "string"
              ? Number(pkgValue.replace(/[^0-9]/g, ""))
              : pkgValue || 0;
          if (pkg > 0 && pkg < lowestPackage) {
            lowestPackage = pkg;
            lowestTypology = typology.typology || "";
          }
        }
      });
    }

    if (sheet.subTabData) {
      Object.values(sheet.subTabData).forEach((tabData: any) => {
        if (tabData.pricingConfigs && Array.isArray(tabData.pricingConfigs)) {
          tabData.pricingConfigs.forEach((config: any) => {
            if (config.availability !== "Sold Out") {
              if (
                appliedFilters.bhkType &&
                config.typology?.toLowerCase() !==
                  appliedFilters.bhkType.toLowerCase()
              ) {
                return;
              }

              const pkgValue = config.totalPackage;
              const pkg =
                typeof pkgValue === "string"
                  ? Number(pkgValue.replace(/[^0-9]/g, ""))
                  : pkgValue || 0;
              if (pkg > 0 && pkg < lowestPackage) {
                lowestPackage = pkg;
                lowestTypology = config.typology || "";
              }
            }
          });
        }
      });
    }

    setSelectedProjectData(sheet);
    (sheet as any)._selectedTypology = lowestTypology;
    setOpenProjectModal(true);
  };

  const handlePropertyClick = (property: any) => {
    setSelectedPropertyData(property);
    setOpenPropertyModal(true);
  };

  const handleCompare = () => {
    console.log(
      "Dashboard: Starting compare with selected sheets:",
      selectedCostSheets.map((sheet) => ({
        id: sheet.id,
        projectName: sheet.projectName,
      }))
    );

    // Expand selected deduplicated entries to include all configurations for those projects
    const selectedProjectNames = selectedCostSheets.map(sheet => sheet.projectName);
    const allConfigsForSelectedProjects = filteredNewProperties.filter(sheet => 
      selectedProjectNames.includes(sheet.projectName)
    );

    const compareData = {
      selectedProperties: allConfigsForSelectedProjects, // Pass all configs, not just deduplicated ones
      filters: {
        bhkType: appliedFilters.bhkType,
        station: appliedFilters.station,
      },
      propertyCategory,
      selectedCategory,
    };

    const storageKey = `compare_${Date.now()}`;
    sessionStorage.setItem(storageKey, JSON.stringify(compareData));

    const compareUrl = `/compare?data=${storageKey}`;
    window.open(compareUrl, "_blank");
  };

  const openMediaModal = (
    title: string,
    files: string[],
    type: "image" | "video" | "pdf" = "image"
  ) => {
    setMediaModal({ isOpen: true, title, files, type });
  };

  const openFullViewer = (
    files: string[],
    index: number,
    type: "image" | "video" | "pdf"
  ) => {
    setFullViewer({ isOpen: true, files, currentIndex: index, type });
  };

  const navigateMedia = (direction: "prev" | "next") => {
    setFullViewer((prev) => ({
      ...prev,
      currentIndex:
        direction === "prev"
          ? (prev.currentIndex - 1 + prev.files.length) % prev.files.length
          : (prev.currentIndex + 1) % prev.files.length,
    }));
  };

  const handleBrochureClick = (sheet: CostSheet) => {
    setSelectedMediaProjectData(sheet);
    setMediaModal({ isOpen: true, title: "Brochure", files: [], type: "pdf" });
  };

  const handleVideoClick = (sheet: CostSheet) => {
    setSelectedMediaProjectData(sheet);
    setMediaModal({ isOpen: true, title: "Videos", files: [], type: "video" });
  };

  const handleImageClick = (sheet: CostSheet) => {
    setSelectedMediaProjectData(sheet);
    setMediaModal({ isOpen: true, title: "Images", files: [], type: "image" });
  };

  const getFileName = (file: string | { url: string; name: string; isUnitPlan?: boolean }): string => {
    try {
      if (typeof file === 'object' && file.isUnitPlan) {
        return file.name;
      }
      
      const url = typeof file === 'string' ? file : file.url;
      if (url.includes("firebase") || url.includes("googleapis.com")) {
        const decodedUrl = decodeURIComponent(url);
        const pathMatch = decodedUrl.match(/\/([^/]+)\?/);
        if (pathMatch && pathMatch[1]) {
          const parts = pathMatch[1].split("/");
          const filename = parts[parts.length - 1];
          if (filename && !filename.match(/^\d+$/) && filename.includes(".")) {
            return filename;
          }
        }
        const altMatch = url.match(/[?&]alt=([^&]+)/);
        if (altMatch) {
          const altValue = decodeURIComponent(altMatch[1]);
          if (altValue !== "media" && altValue.includes(".")) {
            return altValue;
          }
        }
      }
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1].split("?")[0];
      const decodedFilename = decodeURIComponent(filename);
      if (
        decodedFilename &&
        decodedFilename.includes(".") &&
        !decodedFilename.match(/^\d+$/)
      ) {
        return decodedFilename;
      }
      return "Media File";
    } catch {
      return "Media File";
    }
  };



  const sendWhatsAppToInput = () => {
    let itemsToShare: any[] = [];
    let isCostSheet = false;

    if (propertyCategory === "New") {
      if (selectedCostSheets.length === 0) {
        toast.error("Please select at least one property.");
        return;
      }
      itemsToShare = selectedCostSheets;
      isCostSheet = true;
    } else {
      if (selectedProperties.length === 0) {
        toast.error("Please select at least one property.");
        return;
      }
      itemsToShare = selectedProperties;
    }

    sendWhatsAppMessage(
      itemsToShare,
      propertyCategory,
      propertyCategory === "New"
        ? filteredNewProperties.length
        : filteredResaleRentalProperties.length,
      isCostSheet,
      false
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Keyboard navigation for full viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullViewer.isOpen) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateMedia("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateMedia("next");
      } else if (e.key === "Escape") {
        e.preventDefault();
        setFullViewer({
          isOpen: false,
          files: [],
          currentIndex: 0,
          type: "image",
        });
      }
    };

    if (fullViewer.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [fullViewer.isOpen]);

  // Load banners
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadBanners = async () => {
      try {
        const locations =
          user.role === "admin"
            ? []
            : propertyCategory === "New"
            ? ndStationNames
            : rrStationNames;

        if (user.role !== "admin" && locations.length === 0) return;
        const data = await fetchBanners(locations);
        if (isMounted) setBanners(data);
      } catch (error) {}
    };

    if (
      user.role === "admin" ||
      user.role === "manager" ||
      user.role === "executive" ||
      user.freeTrialActivated ||
      (propertyCategory !== "New" && rrStationNames.length > 0) ||
      (propertyCategory === "New" && ndStationNames.length > 0)
    ) {
      loadBanners();
    }

    return () => {
      isMounted = false;
    };
  }, [user, propertyCategory, rrStationNames, ndStationNames]);

  // Reset selections when category changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.size === 0) {
      clearSelections();
    }
  }, [propertyCategory, location.search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, propertyCategory]);

  // Click outside handler for filters sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showFilters &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-property-category]')
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <div className="bg-white border-b border-neutral-200 py-4">
          <div className="container mx-auto px-4">
            <div className="overflow-x-auto">
              <div className="flex space-x-4 py-2">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex-shrink-0 w-64 h-32 relative rounded-lg overflow-hidden shadow-sm"
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                      <h3 className="text-white font-semibold text-sm">
                        {banner.title}
                      </h3>
                      <div className="flex items-center text-white/80 text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{banner.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />

        {/* Chrome-style Tabs */}
        <div className="mb-4">
          <Tabs
            variant="chrome"
            tabs={[
              { id: "residential", label: "Residential", content: null },
              { id: "commercial", label: "Commercial", content: null },
              { id: "plot", label: "Plot", content: null },
            ]}
            activeTab={selectedCategory}
            onTabChange={setSelectedCategory}
            className="mb-2"
          />
        </div>

        {/* Property Category and Quick Send Property section */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-end">
          <PropertyCategorySelector
            propertyCategory={propertyCategory}
            setPropertyCategory={setPropertyCategory}
          />

          {/* Quick Send Property section */}
          {propertyCategory === "New" && costSheets.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Quick Send Property
                </label>
                <div ref={quickSendRef} className="relative quick-send-dropdown">
                  <input
                    type="text"
                    className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search property to send..."
                    value={
                      selectedQuickSendProperty
                        ? selectedQuickSendProperty.projectName
                        : quickSendSearch
                    }
                    onChange={(e) => {
                      setQuickSendSearch(e.target.value);
                      setSelectedQuickSendProperty(null);
                      setShowQuickSendDropdown(true);
                      setSelectedQuickSendIndex(-1);
                    }}
                    onFocus={() => {
                      setShowQuickSendDropdown(true);
                      setSelectedQuickSendIndex(-1);
                    }}
                    onBlur={(e) => {
                      if (!quickSendRef.current?.contains(e.relatedTarget as Node)) {
                        setShowQuickSendDropdown(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape" || e.key === "Tab") {
                        setShowQuickSendDropdown(false);
                      }
                    }}
                  />
                  {showQuickSendDropdown && (
                    <div className="absolute z-[60] w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {quickSendPropertyOptions
                        .filter((option) =>
                          option.label
                            .toLowerCase()
                            .includes(quickSendSearch.toLowerCase())
                        )
                        .map((option, index) => {
                          const sheet = costSheets.find(
                            (s) => s.projectName === option.value
                          );
                          return (
                            <div
                              key={option.value}
                              className={`px-3 py-2 cursor-pointer ${
                                index === selectedQuickSendIndex
                                  ? "bg-primary text-white"
                                  : "hover:bg-neutral-100"
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedQuickSendProperty(sheet);
                                setQuickSendSearch("");
                                setShowQuickSendDropdown(false);
                                setSelectedQuickSendIndex(-1);
                              }}
                            >
                              {option.label}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
              {selectedQuickSendProperty && (
                <>
                  <Button
                    variant="outline"
                    icon={<Eye className="h-4 w-4 mr-1" />}
                    onClick={() => {
                      previewWhatsAppMessage(
                        [selectedQuickSendProperty],
                        "New",
                        undefined,
                        true,
                        true
                      );
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      sendWhatsAppMessage(
                        [selectedQuickSendProperty],
                        "New",
                        undefined,
                        true,
                        true
                      );
                      setSelectedQuickSendProperty(null);
                    }}
                  >
                    Send
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div ref={sidebarRef} className="flex-shrink-0">
            <FiltersSidebar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filters={filters}
            appliedFilters={appliedFilters}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
            locationFilterType={locationFilterType}
            setLocationFilterType={setLocationFilterType}
            propertyCategory={propertyCategory}
            selectedCategory={selectedCategory}
            handleFilterChange={handleFilterChange}
            resetFilters={resetFilters}
            applyFilters={() => {
              applyFilters();
              clearSelections();
              setShowFilters(false);
              if (location.search) {
                window.history.replaceState(
                  {},
                  "",
                  window.location.pathname
                );
              }
            }}
            receiverPrefix={receiverPrefix}
            setReceiverPrefix={setReceiverPrefix}
            receiverName={receiverName}
            setReceiverName={setReceiverName}
            receiverWhatsApp={receiverWhatsApp}
            setReceiverWhatsApp={setReceiverWhatsApp}
            nameError={nameError}
            setNameError={setNameError}
            whatsAppError={whatsAppError}
            setWhatsAppError={setWhatsAppError}
            locationOptions={locationOptions}
            subLocationOptions={subLocationOptions}
            dynamicPropertyTypeOptions={dynamicPropertyTypeOptions}
            costSheets={costSheets}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <DashboardContent
              selectedCategory={selectedCategory}
              propertyCategory={propertyCategory}
              hasFiltered={hasFiltered}
              everFiltered={everFiltered}
              inventoryLoaded={inventoryLoaded}
              filteredNewProperties={filteredNewProperties}
              filteredResaleRentalProperties={filteredResaleRentalProperties}
              selectedProperties={selectedProperties}
              selectedCostSheets={selectedCostSheets}
              appliedFilters={appliedFilters}
              currentPage={currentPage}
              user={user}
              rrStationNames={rrStationNames}
              ndStationNames={ndStationNames}
              setSelectedProperties={setSelectedProperties}
              setSelectedCostSheets={setSelectedCostSheets}
              togglePropertySelection={togglePropertySelection}
              toggleCostSheetSelection={toggleCostSheetSelection}
              isPropertySelected={isPropertySelected}
              handleProjectClick={handleProjectClick}
              handlePropertyClick={handlePropertyClick}
              handlePageChange={handlePageChange}
              handleCompare={handleCompare}
              sendWhatsAppToInput={sendWhatsAppToInput}
              resetFilters={resetFilters}
              setSelectedProjectData={setSelectedProjectData}
              openMediaModal={openMediaModal}
              getMediaSections={getMediaSections}
              handleImageClick={handleImageClick}
              handleVideoClick={handleVideoClick}
              handleBrochureClick={handleBrochureClick}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Preview Modal */}
      <WhatsAppPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        previewText={previewText}
        onSend={() => {
          if (selectedQuickSendProperty) {
            sendWhatsAppMessage(
              [selectedQuickSendProperty],
              "New",
              undefined,
              true,
              true
            );
            setSelectedQuickSendProperty(null);
          }
        }}
      />

      {/* New Property Modal */}
      {openProjectModal && selectedProjectData && (
        <NewPropertyModal
          Section={({ title, children }: { title: string; children: React.ReactNode }) => (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-neutral-800 border-b border-neutral-200 pb-2">
                {title}
              </h4>
              <div className="grid grid-cols-2 gap-4">{children}</div>
            </div>
          )}
          Field={({ label, value }: { label: string; value: any }) => (
            <div className="space-y-1">
              {label && <label className="text-sm font-medium text-neutral-700">{label}</label>}
              <div className="text-sm text-neutral-900">{value || "-"}</div>
            </div>
          )}
          selectedSheet={selectedProjectData}
          user={user}
          onClose={() => setOpenProjectModal(false)}
          fromDashboard={true}
          selectedTypology={(selectedProjectData as any)._selectedTypology}
        />
      )}

      {/* Property Details Modal */}
      <ResaleRentalPropertyModal
        isOpen={openPropertyModal}
        onClose={() => setOpenPropertyModal(false)}
        property={selectedPropertyData}
        propertyCategory={propertyCategory}
        user={user}
      />

      {/* Media Modal */}
      {mediaModal.isOpen && selectedMediaProjectData && (
        <MediaPreviewGridModal
          isOpen={mediaModal.isOpen}
          onClose={() => setMediaModal({ isOpen: false, title: "", files: [], type: "image" })}
          title={mediaModal.title}
          mediaSections={getMediaSections(selectedMediaProjectData.mediaFiles, selectedMediaProjectData).filter(
            (section) => section.type === mediaModal.type
          )}
          onFileClick={openFullViewer}
        />
      )}

      {fullViewer.isOpen && (
        <MediaDisplayComponent
          setFullViewer={setFullViewer}
          fullViewer={fullViewer}
          navigateMedia={navigateMedia}
        />
      )}
    </div>
  );
};

export default Dashboard;
