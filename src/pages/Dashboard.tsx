import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building,
  Filter,
  Search,
  MapPin,
  X,
  CheckCheck,
  Share2,
  Eye,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../utils/authContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Tabs from "../components/ui/Tabs";
// import { Tooltip } from "react-tooltip";
import { fetchBanners } from "../utils/api";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
  getAllCostSheets,
  getUserActiveSubscriptions,
} from "../utils/firestoreListings";
import { normalizeForEdit } from "../utils/costSheetAdapter";
import { generateWhatsAppText } from "../utils/helper";
import { getWhatsAppUrl } from "../utils/deviceDetection";
import { stations } from "../utils/stations";
import { PropertyCategory } from "../types";
import { CostSheet } from "./Compare";
import toast from "react-hot-toast";
import ProjectDetailsModal from "../components/ProjectDetailsModal";

const formatPriceDisplay = (value: string): string => {
  const num = parseInt(value.replace(/[^0-9]/g, ''));
  if (isNaN(num) || num === 0) return '';
  
  if (num >= 10000000) { // 1 crore or more
    const crores = num / 10000000;
    return crores % 1 === 0 ? `₹${crores} Cr` : `₹${crores.toFixed(1)} Cr`;
  } else if (num >= 100000) { // 1 lakh or more
    const lakhs = num / 100000;
    return lakhs % 1 === 0 ? `₹${lakhs} Lac` : `₹${lakhs.toFixed(1)} Lac`;
  } else if (num >= 1000) { // 1 thousand or more
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `₹${thousands} K` : `₹${thousands.toFixed(1)} K`;
  }
  return '';
};

const bhkOptions = [
  { value: "1 RK", label: "1 RK" },
  { value: "1 BHK", label: "1 BHK" },
  { value: "1.5 BHK", label: "1.5 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "2.5 BHK", label: "2.5 BHK" },
  { value: "3 BHK", label: "3 BHK" },
  { value: "3.5 BHK", label: "3.5 BHK" },
  { value: "4 BHK", label: "4 BHK" },
  { value: "4.5 BHK", label: "4.5 BHK" },
  { value: "5 BHK", label: "5 BHK" },
  { value: "Row House", label: "Row House" },
  { value: "Bunglow", label: "Bunglow" },
  { value: "Villa", label: "Villa" },
  { value: "Penthouse", label: "Penthouse" },
];

// Dynamic location options will be generated based on category

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

interface RentalProperty {
  id: string;
  userId?: string;

  // Core info
  createdAt: string;
  isApproved?: boolean;

  // Location & Identification
  society?: string;
  roadLocation?: string;
  station?: string;
  zone?: string;
  landmark?: string;
  propertyId?: string;

  // Property Details
  type?: string;
  terrace?: boolean;
  wing?: string;
  buildingNo?: string | number;
  floorNo?: string | number;
  totalFloors?: string | number;
  flatNo?: string | number;
  cosmo?: boolean;
  masterBed?: boolean;

  // Amenities & Features
  furnishing?: string;
  amenities?: string[];
  parking?: string;
  ownership?: string;
  propertyAge?: string | number;
  availableFrom?: string;

  // Pricing
  rent?: number;
  deposit?: number;

  // Contact & Access
  connectedPerson?: string;
  contactName?: string;
  contactNumber?: string;
  contact?: string;

  // Extra
  directBroker?: string;
  listingState?: string;
  userListingState?: string;
}

// interface CostSheet is now imported from ../types
const currentYear = new Date().getFullYear();

const possessionOptions = [
  { value: "Ready to Move", label: "Ready to Move" },
  // generate the next 7 years:
  ...Array.from({ length: 7 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  }),
];

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("residential");
  const [propertyCategory, setPropertyCategory] =
    useState<PropertyCategory>("Resale");
  const [inventory, setInventory] = useState<{
    resale: ResaleProperty[];
    rental: ResaleProperty[];
  }>({
    resale: [],
    rental: [],
  });
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<
    ResaleProperty[]
  >([]);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [everFiltered, setEverFiltered] = useState(false);
  interface Banner {
    id: string;
    imageUrl: string;
    title: string;
    location: string;
  }

  const [banners, setBanners] = useState<Banner[]>([]);
  const [filters, setFilters] = useState({
    bhkType: "",
    station: "",
    minBudget: "",
    maxBudget: "",
    subLocation: [] as string[],
    possession: "",
    lookingForCosmo: undefined as boolean | undefined,
    GalleryorTerrace: undefined as string | undefined,
    parking: undefined as boolean | undefined,
    amenities: [] as string[],
    petFriendly: undefined as boolean | undefined,
    furnishing: undefined as string | undefined,
  });
  const [appliedFilters, setAppliedFilters] = useState({
    bhkType: "",
    station: "",
    minBudget: "",
    maxBudget: "",
    subLocation: [] as string[],
    possession: "",
    lookingForCosmo: undefined as boolean | undefined,
    GalleryorTerrace: undefined as string | undefined,
    parking: undefined as boolean | undefined,
    amenities: [] as string[],
    petFriendly: undefined as boolean | undefined,
    furnishing: undefined as string | undefined,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // WhatsApp fields
  const [receiverPrefix, setReceiverPrefix] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverWhatsApp, setReceiverWhatsApp] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [nameError, setNameError] = useState("");

  const [costSheets, setCostSheets] = useState<CostSheet[]>([]);
  const [filteredCostSheets, setFilteredCostSheets] = useState<CostSheet[]>([]);
  const [selectedCostSheets, setSelectedCostSheets] = useState<CostSheet[]>([]);
  const [selectedQuickSendProperty, setSelectedQuickSendProperty] =
    useState<CostSheet | null>(null);
  const [quickSendSearch, setQuickSendSearch] = useState("");
  const [showQuickSendDropdown, setShowQuickSendDropdown] = useState(false);
  const [selectedQuickSendIndex, setSelectedQuickSendIndex] = useState(-1);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);

  const [showSubLocationDropdown, setShowSubLocationDropdown] = useState(false);
  const [subLocationSearchTerm, setSubLocationSearchTerm] = useState("");
  const [selectedSubLocationIndex, setSelectedSubLocationIndex] = useState(-1);
  const [locationFilterType, setLocationFilterType] = useState<
    "subLocation" | "society"
  >("subLocation");
  const [isFiltering, setIsFiltering] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewText, setPreviewText] = useState("");

  const navigate = useNavigate();

  // State declarations that need to be available for useMemo hooks
  const [rrStationNames, setRRStationNames] = useState<string[]>([]);
  const [ndStationNames, setNDStationNames] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [stationsLoaded, setStationsLoaded] = useState(false);

  // Filter inventory based on subscriptions
  const subscriptionFilteredProperties = useMemo(() => {
    if (!inventoryLoaded) {
      return { resale: [], rental: [] };
    }

    if (
      user?.role === "admin" ||
      user?.role === "manager" ||
      user?.role === "executive" ||
      user?.freeTrialActivated
    ) {
      return inventory;
    }

    const subscriptionLocs = rrStationNames.map((name) => name.toLowerCase());

    const filterBySubscription = (properties: any[]) => {
      return properties.filter((property) => {
        if (!property.station) return false;

        const propertyStation = property.station.toLowerCase().trim();
        const hasMatch = subscriptionLocs.some((subLoc) => {
          const normalizedSubLoc = subLoc.toLowerCase().trim();
          const baseSubLoc = normalizedSubLoc.replace(/\s+(east|west)$/i, "");
          const basePropStation = propertyStation.replace(
            /\s+(east|west)$/i,
            ""
          );

          return (
            normalizedSubLoc === propertyStation ||
            baseSubLoc === basePropStation ||
            propertyStation.includes(baseSubLoc) ||
            normalizedSubLoc.includes(basePropStation)
          );
        });

        return hasMatch;
      });
    };

    return {
      resale: filterBySubscription(inventory.resale),
      rental: filterBySubscription(inventory.rental),
    };
  }, [inventory, inventoryLoaded, user, rrStationNames]);

  // Dynamic property type options based on available listings and selected location
  const dynamicPropertyTypeOptions = useMemo(() => {
    const typeSet = new Set<string>();

    if (propertyCategory === "New") {
      costSheets.forEach((sheet) => {
        const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
        const availability = sheet.availability || sheet.typologies?.[0]?.availability;
        const stationToCheck = sheet.station || sheet.location;
        
        const isApproved = sheet.isApproved === true || sheet.approvalStatus === 'approved';
        
        if (flatType && isApproved && availability !== "Sold Out") {
          // Filter by location if selected
          if (filters.station && stationToCheck?.toLowerCase().trim() !== filters.station.toLowerCase().trim()) {
            return;
          }
          typeSet.add(flatType.trim());
        }
      });
    } else {
      const properties = propertyCategory === "Rental"
        ? subscriptionFilteredProperties.rental
        : subscriptionFilteredProperties.resale;
      
      properties.forEach((property) => {
        if (property.type && property.listingState !== "Hold") {
          // Filter by location if selected
          if (filters.station && property.station?.toLowerCase().trim() !== filters.station.toLowerCase().trim()) {
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
  }, [subscriptionFilteredProperties, costSheets, propertyCategory, filters.station]);

  // Dynamic filter configuration based on selected category
  const getFilterConfig = () => {
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
      // case "shops":
      //   return {
      //     showPropertyType: false,
      //     propertyTypeOptions: [],
      //     showPossession: propertyCategory === "New",
      //     showCosmo: false,
      //     showGalleryTerrace: false,
      //     budgetLabel: "Budget",
      //     showArea: false,
      //   };
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

  const filterConfig = getFilterConfig();

  // Use useMemo for instant sublocation/society filtering from existing inventory
  const subLocationOptions = useMemo(() => {
    const locationSet = new Set<string>();

    if (propertyCategory === "New") {
      costSheets.forEach((sheet) => {
        const fieldValue =
          locationFilterType === "subLocation"
            ? (sheet.subLocation || sheet.road)
            : sheet.projectName;
        const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
        const availability = sheet.availability || sheet.typologies?.[0]?.availability;
        const stationToCheck = sheet.station || sheet.location;
        
        const isApproved = sheet.isApproved === true || sheet.approvalStatus === 'approved';
        
        if (
          fieldValue &&
          isApproved &&
          availability !== "Sold Out"
        ) {
          // Filter by property type if selected
          if (
            filters.bhkType &&
            flatType?.toLowerCase() !== filters.bhkType.toLowerCase()
          ) {
            return;
          }
          // Filter by location if selected
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
          // Filter by property type if selected
          if (filters.bhkType && property.type !== filters.bhkType) {
            return;
          }
          // Filter by location if selected
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

  const fetchAvailableStations = async () => {
    try {
      // Use static stations as default to avoid delay
      const stationNames = stations.map((s) => s.name);
      const defaultLocationOptions = stationNames.flatMap((name) => [
        { value: `${name} East`, label: `${name} East` },
        { value: `${name} West`, label: `${name} West` },
      ]);

      // Collect unique location names from property listings based on category
      const additionalLocations = new Set<string>();
      
      if (propertyCategory === "Resale") {
        subscriptionFilteredProperties.resale.forEach((property) => {
          if (property.station) {
            const stationName = property.station.trim();
            if (stationName && !defaultLocationOptions.some(opt => opt.value.toLowerCase() === stationName.toLowerCase())) {
              additionalLocations.add(stationName);
            }
          }
        });
      } else if (propertyCategory === "Rental") {
        subscriptionFilteredProperties.rental.forEach((property) => {
          if (property.station) {
            const stationName = property.station.trim();
            if (stationName && !defaultLocationOptions.some(opt => opt.value.toLowerCase() === stationName.toLowerCase())) {
              additionalLocations.add(stationName);
            }
          }
        });
      } else if (propertyCategory === "New") {
        costSheets.forEach((sheet) => {
          const stationToCheck = sheet.station || sheet.location;
          if (stationToCheck) {
            const stationName = stationToCheck.trim();
            if (stationName && !defaultLocationOptions.some(opt => opt.value.toLowerCase() === stationName.toLowerCase())) {
              additionalLocations.add(stationName);
            }
          }
        });
      }
      
      // Convert additional locations to options format
      const additionalLocationOptions = Array.from(additionalLocations)
        .sort()
        .map(location => ({ value: location, label: location }));
      
      // Combine default and additional locations
      const allLocationOptions = [...defaultLocationOptions, ...additionalLocationOptions];
      
      setLocationOptions(allLocationOptions);
      setStationsLoaded(true);
    } catch (error) {
      console.error("Error fetching available stations:", error);
      setStationsLoaded(true);
    }
  };

  // Subscription locations
  // const [subscribedLocations, setSubscribedLocations] = useState<string[]>([]);
  // const [subsLoading, setSubsLoading] = useState(true); // <-- add this
  // const [rrLocations, setRRLocations] = useState<string[]>([]);
  // const [ndLocations, setNDLocations] = useState<string[]>([]);

  const [openProjectModal, setOpenProjectModal] = useState(false);
  const [selectedProjectData, setSelectedProjectData] =
    useState<CostSheet | null>(null);
  const [openPropertyModal, setOpenPropertyModal] = useState(false);
  const [selectedPropertyData, setSelectedPropertyData] =
    useState<ResaleProperty | null>(null);

  const handleProjectClick = (sheet: CostSheet) => {
    setSelectedProjectData(sheet);
    setOpenProjectModal(true);
  };

  const handlePropertyClick = (property: ResaleProperty) => {
    setSelectedPropertyData(property);
    setOpenPropertyModal(true);
  };

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchSubscriptions = async () => {
      try {
        if (user.role === "admin") {
          setRRStationNames([]);
          setNDStationNames([]);
          return;
        }

        const { rrLocations, ndLocations } = await getUserActiveSubscriptions(
          user.id
        );

        console.log("Raw subscription data:", { rrLocations, ndLocations });

        // Handle station names directly (new format) or map IDs to names (old format)
        const rrNames = rrLocations
          .map((loc) => {
            // If it's already a full station name with East/West, use it directly
            if (
              typeof loc === "string" &&
              (loc.includes(" East") || loc.includes(" West"))
            ) {
              return loc;
            }
            // If it's a base station name without East/West, return both variants
            if (typeof loc === "string" && isNaN(Number(loc))) {
              return [loc + " East", loc + " West"];
            }
            // Otherwise, find by ID and return both East/West variants
            const stationName = stations.find(
              (s) => s.id === String(loc)
            )?.name;
            return stationName
              ? [stationName + " East", stationName + " West"]
              : [];
          })
          .flat()
          .filter((name) => name);

        const ndNames = ndLocations
          .map((loc) => {
            // If it's already a full station name with East/West, use it directly
            if (
              typeof loc === "string" &&
              (loc.includes(" East") || loc.includes(" West"))
            ) {
              return loc;
            }
            // If it's a base station name without East/West, return both variants
            if (typeof loc === "string" && isNaN(Number(loc))) {
              return [loc + " East", loc + " West"];
            }
            // Otherwise, find by ID and return both East/West variants
            const stationName = stations.find(
              (s) => s.id === String(loc)
            )?.name;
            return stationName
              ? [stationName + " East", stationName + " West"]
              : [];
          })
          .flat()
          .filter((name) => name);

        console.log("Mapped station names:", { rrNames, ndNames });

        if (isMounted) {
          setRRStationNames(rrNames);
          setNDStationNames(ndNames);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        if (isMounted) {
          setRRStationNames([]);
          setNDStationNames([]);
        }
      }
    };

    // Load subscriptions first, then stations
    fetchSubscriptions().then(() => {
      if (isMounted) {
        fetchAvailableStations();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user, propertyCategory]);

  // Update location options when property data changes
  useEffect(() => {
    if (stationsLoaded && (subscriptionFilteredProperties.resale.length > 0 || subscriptionFilteredProperties.rental.length > 0 || costSheets.length > 0)) {
      fetchAvailableStations();
    }
  }, [subscriptionFilteredProperties, costSheets, stationsLoaded, propertyCategory]);

  // Load inventory data silently in background
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    // Set loaded immediately for consistent UX
    setInventoryLoaded(true);

    const fetchInventoryData = async () => {
      try {
        const allUsers = await getUsers();

        // Fetch all properties in parallel for maximum performance
        const propertyPromises = allUsers.map(async (u) => {
          const [resale, rental] = await Promise.all([
            getResaleProperties(u.id),
            getRentalProperties(u.id),
          ]);
          return { resale, rental };
        });

        const results = await Promise.all(propertyPromises);

        // Process results
        const allResale: ResaleProperty[] = [];
        const allRental: RentalProperty[] = [];

        results.forEach(({ resale, rental }) => {
          allResale.push(...resale.filter((p) => p.isApproved));
          allRental.push(...rental.filter((p) => p.isApproved));
        });

        if (isMounted) {
          setInventory({
            resale: allResale,
            rental: allRental as unknown as ResaleProperty[],
          });
        }
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    };

    // Load data silently without blocking UI
    fetchInventoryData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Load banners based on current category and subscriptions
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
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
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

  useEffect(() => {
    const fetchCostSheets = async () => {
      const allSheets = await getAllCostSheets();
      // Filter to only show approved properties and normalize data
      const approvedSheets = allSheets
        .filter((sheet) => {
          // Handle both approval field names
          return sheet.isApproved === true || sheet.approvalStatus === 'approved';
        })
        .map((sheet) => {
          // Normalize data for consistent handling
          const normalized = normalizeForEdit(sheet);
          
          // Handle old structure fields for backward compatibility
          if (normalized.dataVersion === 'v1') {
            return {
              ...normalized,
              // Map old structure fields to expected properties
              station: normalized.station || normalized.location,
              subLocation: normalized.subLocation || normalized.location,
              possession: normalized.possession || normalized.reraPossession,
              availability: normalized.availibility || normalized.availability || 'Available',
              brochureUrl: normalized.brochureUrl || normalized.mediaFiles?.brochure,
              imageUrl: normalized.imageUrl || (normalized.mediaFiles?.elevationImages?.[0]),
              videoUrl: normalized.videoUrl || (normalized.mediaFiles?.projectWalkthrough?.[0]),
              // Ensure isApproved is set for consistency
              isApproved: true
            };
          } else {
            // Handle new structure
            return {
              ...normalized,
              // Map new structure fields
              station: normalized.location,
              subLocation: normalized.subLocation || normalized.road,
              possession: normalized.possession || normalized.typologies?.[0]?.developerPossession,
              availability: normalized.typologies?.[0]?.availability || 'Available',
              brochureUrl: normalized.mediaFiles?.brochure,
              imageUrl: normalized.mediaFiles?.elevationImages?.[0],
              videoUrl: normalized.mediaFiles?.projectWalkthrough?.[0],
              // For new structure, use first typology's totalPackage if main totalPackage is not available
              totalPackage: normalized.totalPackage || normalized.typologies?.[0]?.totalPackage,
              flatType: normalized.typologies?.[0]?.typology,
              // Ensure isApproved is set for consistency
              isApproved: true
            };
          }
        });

      if (
        user &&
        (user.role === "admin" ||
          user.role === "manager" ||
          user.role === "executive" ||
          user.freeTrialActivated)
      ) {
        setCostSheets(approvedSheets);
      } else if (user) {
        // Use station names for filtering (same logic as resale/rental)
        const subscriptionLocs = ndStationNames.map((name) =>
          name.toLowerCase()
        );

        setCostSheets(
          approvedSheets.filter((sheet) => {
            const stationToCheck = sheet.station || sheet.location;
            if (!stationToCheck) return false;

            const propertyStation = stationToCheck.toLowerCase().trim();
            const hasMatch = subscriptionLocs.some((subLoc) => {
              const normalizedSubLoc = subLoc.toLowerCase().trim();
              const baseSubLoc = normalizedSubLoc.replace(
                /\s+(east|west)$/i,
                ""
              );
              const basePropStation = propertyStation.replace(
                /\s+(east|west)$/i,
                ""
              );

              return (
                normalizedSubLoc === propertyStation ||
                baseSubLoc === basePropStation ||
                propertyStation.includes(baseSubLoc) ||
                normalizedSubLoc.includes(basePropStation)
              );
            });

            if (hasMatch) {
              console.log(
                "Matched new property:",
                stationToCheck,
                "with subscriptions:",
                subscriptionLocs
              );
            }
            return hasMatch;
          })
        );
      }
    };

    if (
      user &&
      (user.role === "admin" ||
        user.role === "manager" ||
        user.role === "executive" ||
        user.freeTrialActivated ||
        ndStationNames.length > 0)
    ) {
      fetchCostSheets();
    }
  }, [user, ndStationNames]);

  // Toggle selection for cost sheets
  const toggleCostSheetSelection = (costSheet: CostSheet) => {
    const isAlreadySelected = selectedCostSheets.some(
      (cs) => cs.id === costSheet.id
    );

    if (isAlreadySelected) {
      // Remove from selection
      setSelectedCostSheets((prev) =>
        prev.filter((cs) => cs.id !== costSheet.id)
      );
    } else {
      // Add to selection
      setSelectedCostSheets((prev) => [...prev, costSheet]);
    }
  };

  const handleFilterChange = (
    name: string,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (propertyCategory !== "New") {
      setHasFiltered(false);
    }
  };

  // Clean filtering for all property categories - based on New properties structure
  const filteredResaleRentalProperties = useMemo(() => {
    if (propertyCategory === "New") return [];

    const properties =
      propertyCategory === "Rental"
        ? subscriptionFilteredProperties.rental
        : subscriptionFilteredProperties.resale;

    return properties.filter((property: any) => {
      // Filter out "Hold" or "Sold Out" properties
      if (
        property.listingState === "Hold" ||
        property.listingState === "Sold Out"
      ) {
        return false;
      }

      // BHK filter
      if (appliedFilters.bhkType && property.type !== appliedFilters.bhkType) {
        return false;
      }

      // Station filter
      if (appliedFilters.station) {
        const propertyStation = property.station || "";
        if (
          propertyStation.toLowerCase().trim() !==
          appliedFilters.station.toLowerCase().trim()
        ) {
          return false;
        }
      }

      // Sub Location/Society filter
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

      // Budget filter
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

      // Cosmo filter
      if (appliedFilters.lookingForCosmo !== undefined) {
        const isCosmo =
          property.cosmoSociety === "true" || property.cosmo === true;
        if (isCosmo !== appliedFilters.lookingForCosmo) {
          return false;
        }
      }

      // Gallery/Terrace filter
      if (appliedFilters.GalleryorTerrace !== undefined) {
        const terraceGalleryValue =
          property.terraceGallery || (property.terrace ? "Terrace" : "");
        if (terraceGalleryValue !== appliedFilters.GalleryorTerrace) {
          return false;
        }
      }

      // Possession filter
      if (
        appliedFilters.possession &&
        String(property.possession || "") !== appliedFilters.possession
      ) {
        return false;
      }

      // Amenities filter
      if (appliedFilters.amenities.length > 0) {
        const propertyAmenities = property.amenities || [];
        const hasAllSelectedAmenities = appliedFilters.amenities.every(
          (selectedAmenity) =>
            propertyAmenities.some((propertyAmenity) =>
              propertyAmenity
                .toLowerCase()
                .includes(selectedAmenity.toLowerCase())
            )
        );
        if (!hasAllSelectedAmenities) {
          return false;
        }
      }

      // Parking filter
      if (appliedFilters.parking !== undefined) {
        const hasParking = property.parking === "Open" || property.parking === "Covered";
        if (hasParking !== appliedFilters.parking) {
          return false;
        }
      }

      // Pet friendly filter
      if (appliedFilters.petFriendly !== undefined) {
        const isPetFriendly = property.petFriendly === true;
        if (isPetFriendly !== appliedFilters.petFriendly) {
          return false;
        }
      }

      // Furnishing filter
      if (appliedFilters.furnishing !== undefined) {
        if (property.furnishing !== appliedFilters.furnishing) {
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

  // Clean filtering for New properties (unchanged)
  const filteredNewProperties = useMemo(() => {
    if (propertyCategory !== "New") return [];

    return costSheets.filter((sheet) => {
      // Handle both old and new data structures
      const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
      const availability = sheet.availability || sheet.typologies?.[0]?.availability;
      const stationToCheck = sheet.station || sheet.location;
      const totalPackage = sheet.totalPackage || sheet.typologies?.[0]?.totalPackage;
      const possession = sheet.possession || sheet.typologies?.[0]?.developerPossession;
      
      // Filter out "Sold Out" properties
      if (availability === "Sold Out") return false;

      // BHK filter
      if (
        appliedFilters.bhkType &&
        flatType?.toLowerCase() !== appliedFilters.bhkType.toLowerCase()
      ) {
        return false;
      }

      // Station filter
      if (appliedFilters.station) {
        const sheetStation = stationToCheck || "";
        if (
          sheetStation.toLowerCase().trim() !==
          appliedFilters.station.toLowerCase().trim()
        ) {
          return false;
        }
      }

      // Sub Location/Society filter
      if (appliedFilters.subLocation.length > 0) {
        const fieldValue =
          locationFilterType === "subLocation"
            ? (sheet.subLocation || sheet.road)
            : sheet.projectName;
        if (
          !appliedFilters.subLocation.some(
            (loc) => loc.toLowerCase() === (fieldValue || "").toLowerCase()
          )
        ) {
          return false;
        }
      }

      // Possession filter
      if (appliedFilters.possession) {
        if (appliedFilters.possession === "Ready to Move") {
          if (possession?.toLowerCase() !== "ready to move") {
            return false;
          }
        } else {
          if (!possession?.endsWith(appliedFilters.possession)) {
            return false;
          }
        }
      }

      // Cosmo filter
      if (appliedFilters.lookingForCosmo !== undefined) {
        const isCosmo = sheet.isCosmo === "Yes";
        if (isCosmo !== appliedFilters.lookingForCosmo) {
          return false;
        }
      }

      // Amenities filter
      if (appliedFilters.amenities.length > 0) {
        const allAmenities = [
          ...(sheet.apartmentAmenities || []),
          ...(sheet.projectAmenities || []),
        ];
        const hasAllSelectedAmenities = appliedFilters.amenities.every(
          (selectedAmenity) =>
            allAmenities.some((amenity) =>
              amenity.toLowerCase().includes(selectedAmenity.toLowerCase())
            )
        );
        if (!hasAllSelectedAmenities) {
          return false;
        }
      }

      // Budget filter
      const pkg = totalPackage || 0;
      if (appliedFilters.minBudget && pkg < Number(appliedFilters.minBudget)) {
        return false;
      }
      if (appliedFilters.maxBudget && pkg > Number(appliedFilters.maxBudget)) {
        return false;
      }

      // Pet friendly filter
      if (appliedFilters.petFriendly !== undefined) {
        const isPetFriendly = sheet.petFriendly === true;
        if (isPetFriendly !== appliedFilters.petFriendly) {
          return false;
        }
      }

      return true;
    });
  }, [costSheets, appliedFilters, locationFilterType]);

  // Clear selected properties when filtered data changes
  useEffect(() => {
    if (propertyCategory !== "New") {
      const currentFilteredIds = new Set(filteredResaleRentalProperties.map(p => p.docId));
      setSelectedProperties(prev => prev.filter(p => currentFilteredIds.has(p.docId)));
    }
  }, [filteredResaleRentalProperties, propertyCategory]);

  const applyFilters = useCallback(
    (ignoreSubscriptionFilter = false, currentFilters = filters) => {
      if (!user || isFiltering) return;

      setIsFiltering(true);

      // Clear selected properties when applying filters
      setSelectedProperties([]);
      setSelectedCostSheets([]);

      // Only proceed if data is already loaded
      if (propertyCategory === "New" && costSheets.length === 0) {
        setIsFiltering(false);
        return;
      }

      if (propertyCategory !== "New" && !inventoryLoaded) {
        setIsFiltering(false);
        return;
      }

      if (propertyCategory === "New") {
        const filtered = costSheets.filter((sheet) => {
          // Handle both old and new data structures
          const flatType = sheet.flatType || sheet.typologies?.[0]?.typology;
          const availability = sheet.availability || sheet.typologies?.[0]?.availability;
          const stationToCheck = sheet.station || sheet.location;
          const totalPackage = sheet.totalPackage || sheet.typologies?.[0]?.totalPackage;
          const possession = sheet.possession || sheet.typologies?.[0]?.developerPossession;
          
          // Filter out "Sold Out" properties
          if (availability === "Sold Out") return false;

          // Subscription check - already filtered in fetchCostSheets for non-admin users
          const isSubscribedStation = user.role === "admin" || true; // Already filtered

          // 1) BHK filter (unchanged)
          const matchesBHK =
            !currentFilters.bhkType ||
            flatType?.toLowerCase() ===
              currentFilters.bhkType.toLowerCase();

          // 2) Station filter (location dropdown)
          let matchesStation = true;
          if (currentFilters.station) {
            const sheetStation = stationToCheck || "";
            const filterStation = currentFilters.station;

            matchesStation =
              sheetStation.toLowerCase().trim() ===
              filterStation.toLowerCase().trim();
          }

          // 3) Possession filter (as before)
          let matchesPossession = true;
          if (currentFilters.possession) {
            if (currentFilters.possession === "Ready to Move") {
              matchesPossession =
                possession?.toLowerCase() === "ready to move";
            } else {
              matchesPossession =
                possession?.endsWith(currentFilters.possession) ?? false;
            }
          }

          // 4) Sub Location/Society filter
          let matchesSubLocation = true;
          if (currentFilters.subLocation.length > 0) {
            const fieldValue =
              locationFilterType === "subLocation"
                ? (sheet.subLocation || sheet.road)
                : sheet.projectName;
            matchesSubLocation = currentFilters.subLocation.some(
              (loc) => loc.toLowerCase() === (fieldValue || "").toLowerCase()
            );
          }

          // 5) Cosmo filter for New properties
          let matchesCosmo = true;
          if (currentFilters.lookingForCosmo !== undefined) {
            const isCosmo = sheet.isCosmo === "Yes";
            matchesCosmo = isCosmo === currentFilters.lookingForCosmo;
          }

          // 6) Amenities filter for New properties
          let matchesAmenities = true;
          if (currentFilters.amenities.length > 0) {
            const allAmenities = [
              ...(sheet.apartmentAmenities || []),
              ...(sheet.projectAmenities || []),
            ];
            const hasAllSelectedAmenities = currentFilters.amenities.every(
              (selectedAmenity) =>
                allAmenities.some((amenity) =>
                  amenity.toLowerCase().includes(selectedAmenity.toLowerCase())
                )
            );
            matchesAmenities = hasAllSelectedAmenities;
          }

          // 7) **Budget filter for New**: use totalPackage
          let matchesBudget = true;
          const min = Number(currentFilters.minBudget || 0);
          const max = Number(currentFilters.maxBudget || Infinity);
          const pkg = totalPackage || 0;
          if (currentFilters.minBudget && pkg < min) matchesBudget = false;
          if (currentFilters.maxBudget && pkg > max) matchesBudget = false;

          // 8) Pet friendly filter for New properties
          let matchesPetFriendly = true;
          if (currentFilters.petFriendly !== undefined) {
            const isPetFriendly = sheet.petFriendly === true;
            matchesPetFriendly = isPetFriendly === currentFilters.petFriendly;
          }

          return (
            isSubscribedStation &&
            matchesBHK &&
            matchesStation &&
            matchesSubLocation &&
            matchesPossession &&
            matchesCosmo &&
            matchesAmenities &&
            matchesBudget &&
            matchesPetFriendly
          );
        });

        setFilteredCostSheets(filtered);
        setHasFiltered(true);
        setIsFiltering(false);
        return;
      }

      // Use subscription-filtered inventory data
      const properties =
        propertyCategory === "Rental"
          ? subscriptionFilteredProperties.rental
          : subscriptionFilteredProperties.resale;

      const filtered = properties.filter((property: any) => {
        // 1) Hide “Hold” or “Sold Out”
        if (
          property.listingState === "Hold" ||
          property.listingState === "Sold Out"
        ) {
          return false;
        }

        // Skip subscription filtering - data is already filtered in useEffect

        // 3) BHK filter
        if (
          currentFilters.bhkType &&
          property.type !== currentFilters.bhkType
        ) {
          return false;
        }

        // 4) Station / subLocation filters
        if (currentFilters.station) {
          const stationField =
            propertyCategory === "Rental" ? property.station : property.station;
          if (
            (stationField || "").toLowerCase().trim() !==
            currentFilters.station.toLowerCase().trim()
          ) {
            return false;
          }
        }
        if (currentFilters.subLocation.length > 0) {
          const fieldValue =
            locationFilterType === "subLocation"
              ? property.sublocation
              : property.society;
          if (
            !currentFilters.subLocation.some(
              (loc) =>
                loc.toLowerCase() ===
                (fieldValue || "").toString().toLowerCase()
            )
          ) {
            return false;
          }
        }

        // 5) Budget
        const budget =
          propertyCategory === "Rental"
            ? property.rent
            : property.expectedPrice;
        if (
          currentFilters.minBudget &&
          Number(budget ?? 0) < Number(currentFilters.minBudget)
        ) {
          return false;
        }
        if (
          currentFilters.maxBudget &&
          Number(budget ?? 0) > Number(currentFilters.maxBudget)
        ) {
          return false;
        }

        // 6) Cosmo toggle
        if (currentFilters.lookingForCosmo !== undefined) {
          const isCosmo =
            property.cosmoSociety === "true" || property.cosmo === true;
          if (isCosmo !== currentFilters.lookingForCosmo) {
            return false;
          }
        }

        // 7) Gallery or Terrace toggle
        if (currentFilters.GalleryorTerrace !== undefined) {
          const terraceGalleryValue =
            property.terraceGallery || (property.terrace ? "Terrace" : "");
          if (terraceGalleryValue !== currentFilters.GalleryorTerrace) {
            return false;
          }
        }

        // 8) Possession filter (if you added that)
        if (
          currentFilters.possession &&
          String(property.possession || "") !== currentFilters.possession
        ) {
          return false;
        }

        // 9) Amenities filter
        if (currentFilters.amenities.length > 0) {
          const propertyAmenities = property.amenities || [];
          const hasAllSelectedAmenities = currentFilters.amenities.every(
            (selectedAmenity) =>
              propertyAmenities.some((propertyAmenity) =>
                propertyAmenity
                  .toLowerCase()
                  .includes(selectedAmenity.toLowerCase())
              )
          );
          if (!hasAllSelectedAmenities) {
            return false;
          }
        }

        // 10) Parking filter
        if (currentFilters.parking !== undefined) {
          const hasParking = property.parking === "Open" || property.parking === "Covered";
          if (hasParking !== currentFilters.parking) {
            return false;
          }
        }

        // 11) Pet friendly filter
        if (currentFilters.petFriendly !== undefined) {
          const isPetFriendly = property.petFriendly === true;
          if (isPetFriendly !== currentFilters.petFriendly) {
            return false;
          }
        }

        // 12) Furnishing filter
        if (currentFilters.furnishing !== undefined) {
          if (property.furnishing !== currentFilters.furnishing) {
            return false;
          }
        }

        return true;
      });

      setHasFiltered(true);
      setIsFiltering(false);
    },
    [
      user,
      propertyCategory,
      costSheets,
      subscriptionFilteredProperties,
      rrStationNames,
      filters,
    ]
  );

  // Add this useEffect hook right after your existing useEffect hooks
  useEffect(() => {
    // Reset table data when switching categories
    setHasFiltered(false);
    setEverFiltered(false);
    setSelectedProperties([]);
    setSelectedCostSheets([]);
    // Refetch location options when category changes
    if (stationsLoaded) {
      fetchAvailableStations();
    }
  }, [propertyCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".quick-send-dropdown")) {
        setShowQuickSendDropdown(false);
        setSelectedQuickSendIndex(-1);
      }
      if (!target.closest(".location-dropdown")) {
        setShowLocationDropdown(false);
      }
      if (!target.closest(".sublocation-dropdown")) {
        setShowSubLocationDropdown(false);
      }
      // Close sidebar when clicking outside
      if (showFilters && !target.closest(".sidebar-container")) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  // Handle ESC key for property modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openPropertyModal) {
        setOpenPropertyModal(false);
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [openPropertyModal]);

  const resetFilters = () => {
    const emptyFilters = {
      bhkType: "",
      station: "",
      minBudget: "",
      maxBudget: "",
      subLocation: [],
      possession: "",
      GalleryorTerrace: undefined,
      lookingForCosmo: undefined,
      parking: undefined,
      amenities: [],
      petFriendly: undefined,
      furnishing: undefined,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setHasFiltered(false);
    setEverFiltered(false);
    setSelectedProperties([]);
    setSelectedCostSheets([]);
  };

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

  const isPropertySelected = (property: ResaleProperty) => {
    return selectedProperties.some((p) => p.docId === property.docId);
  };

  // WhatsApp send handler for sidebar
  // Update the sendWhatsAppToInput function in Dashboard.tsx
  const sendWhatsAppToInput = () => {
    if (!receiverName.trim() || !receiverWhatsApp.trim()) {
      alert("Please enter both name and WhatsApp number.");
      return;
    }

    let itemsToShare: any[] = [];
    let isCostSheet = false;

    if (propertyCategory === "New") {
      if (selectedCostSheets.length === 0) {
        alert("Please select at least one property.");
        return;
      }
      itemsToShare = selectedCostSheets;
      isCostSheet = true;
    } else {
      if (selectedProperties.length === 0) {
        alert("Please select at least one property.");
        return;
      }
      itemsToShare = selectedProperties;
    }

    const text = generateWhatsAppText(
      itemsToShare,
      receiverPrefix,
      receiverName,
      receiverWhatsApp,
      user || undefined, // pass the full user object, never null
      propertyCategory === "New"
        ? filteredNewProperties.length
        : filteredResaleRentalProperties.length, // totalResaleCount
      isCostSheet, // isCostSheet flag
      false, // isQuickSend - this is table selection, not quick send
      propertyCategory // pass the property category
    );

    const whatsappUrl = getWhatsAppUrl(receiverWhatsApp, text);
    window.open(whatsappUrl, "_blank");
  };

  // const shareOnWhatsApp = () => {
  //   if (selectedProperties.length === 0) return;

  //   const text = generateWhatsAppText(
  //     selectedProperties,
  //     "Mr./Ms.", // ✅ prefix (or leave empty string "")
  //     user?.fullName || "Customer", // ✅ name
  //     user?.phone || "9876543210", // ✅ phone
  //     user ?? undefined // ✅ pass the full user object, never null
  //   );

  //   const encodedText = encodeURIComponent(text);
  //   window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  // };

  const getFloorCategory = (
    floorNo: string | number | undefined,
    totalFloors: string | number | undefined
  ): string => {
    const floor = Number(floorNo);
    const total = Number(totalFloors);

    if (!floor || !total || floor <= 0 || total <= 0) return "--";

    const percentage = (floor / total) * 100;

    if (percentage < 40) return "Lower Floor";
    if (percentage > 65) return "Higher Floor";
    return "Middle Floor";
  };

  const noActiveSubscription =
    !user ||
    (user.role !== "admin" &&
      user.role !== "manager" &&
      user.role !== "executive" &&
      !user.freeTrialActivated &&
      ((propertyCategory === "New" && ndStationNames.length === 0) ||
        (propertyCategory !== "New" && rrStationNames.length === 0)));

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Property Dashboard
            </h1>
            <p className="text-neutral-500">
              Find and manage properties across your subscribed locations
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {/* Removed Add New Property button as per user request */}
            {/* {user?.isAdmin && (
              <Link to="/inventory">
                <Button variant="primary">Add New Property</Button>
              </Link>
            )} */}
          </div>
        </div>

        {/* Chrome-style Tabs just below heading */}
        <div className="mb-4">
          <div
            className="relative"
            onMouseLeave={() => {
              const tooltip = document.getElementById("coming-soon-tooltip");
              if (tooltip) {
                tooltip.style.opacity = "0";
                tooltip.style.pointerEvents = "none";
              }
            }}
          >
            <Tabs
              variant="chrome"
              tabs={[
                { id: "residential", label: "Residential", content: null },
                { id: "commercial", label: "Commercial", content: null },
                // { id: "shops", label: "Shops", content: null },
                { id: "plot", label: "Plot", content: null },
              ]}
              activeTab={selectedCategory}
              onTabChange={setSelectedCategory}
              className="mb-2"
            />
            <div
              className="absolute top-full left-0 mt-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 pointer-events-none transition-opacity duration-200"
              id="coming-soon-tooltip"
            >
              Coming Soon
            </div>
          </div>
        </div>

        {/* Property Category and Quick Send Property section */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-end">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Property Category
            </label>
            <div className="flex border border-neutral-300 rounded-md overflow-hidden w-full max-w-xs">
              <button
                className={`flex-1 py-2 ${
                  propertyCategory === "Resale"
                    ? "bg-primary text-white"
                    : "bg-white text-neutral-700"
                }`}
                onClick={() => setPropertyCategory("Resale")}
              >
                Resale
              </button>
              <button
                className={`flex-1 py-2 ${
                  propertyCategory === "Rental"
                    ? "bg-primary text-white"
                    : "bg-white text-neutral-700"
                }`}
                onClick={() => setPropertyCategory("Rental")}
              >
                Rental
              </button>
              <button
                className={`flex-1 py-2 ${
                  propertyCategory === "New"
                    ? "bg-primary text-white"
                    : "bg-white text-neutral-700"
                }`}
                onClick={() => setPropertyCategory("New")}
              >
                New
              </button>
            </div>
          </div>

          {/* Quick Send Property section */}
          {propertyCategory === "New" && costSheets.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Quick Send Property
                </label>
                <div className="relative quick-send-dropdown">
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
                    onKeyDown={(e) => {
                      const filteredProjects = [...new Set(
                          costSheets
                            .filter(
                              (sheet) => {
                                const availability = sheet.availability || sheet.typologies?.[0]?.availability;
                                return availability !== "Sold Out";
                              }
                            )
                            .map((sheet) => sheet.projectName?.trim())
                            .filter(
                              (projectName) =>
                                projectName &&
                                projectName
                                  .toLowerCase()
                                  .includes(quickSendSearch.toLowerCase())
                            )
                        )].sort((a, b) => {
                        const aStartsWithNumber = /^\d/.test(a);
                        const bStartsWithNumber = /^\d/.test(b);
                        if (aStartsWithNumber && !bStartsWithNumber) return -1;
                        if (!aStartsWithNumber && bStartsWithNumber) return 1;
                        const aClean = a.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const bClean = b.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return aClean < bClean ? -1 : aClean > bClean ? 1 : 0;
                      });

                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectedQuickSendIndex((prev) => {
                          const newIndex =
                            prev < filteredProjects.length - 1
                              ? prev + 1
                              : prev;
                          // Scroll to selected item
                          setTimeout(() => {
                            const dropdown = document.querySelector(
                              ".quick-send-dropdown .absolute"
                            );
                            const selectedItem = dropdown?.children[
                              newIndex
                            ] as HTMLElement;
                            if (selectedItem && dropdown) {
                              selectedItem.scrollIntoView({
                                block: "nearest",
                                behavior: "smooth",
                              });
                            }
                          }, 0);
                          return newIndex;
                        });
                        if (!showQuickSendDropdown)
                          setShowQuickSendDropdown(true);
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSelectedQuickSendIndex((prev) => {
                          const newIndex = prev > 0 ? prev - 1 : -1;
                          // Scroll to selected item
                          setTimeout(() => {
                            const dropdown = document.querySelector(
                              ".quick-send-dropdown .absolute"
                            );
                            const selectedItem = dropdown?.children[
                              newIndex
                            ] as HTMLElement;
                            if (selectedItem && dropdown && newIndex >= 0) {
                              selectedItem.scrollIntoView({
                                block: "nearest",
                                behavior: "smooth",
                              });
                            }
                          }, 0);
                          return newIndex;
                        });
                        if (!showQuickSendDropdown)
                          setShowQuickSendDropdown(true);
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        if (
                          selectedQuickSendIndex >= 0 &&
                          filteredProjects[selectedQuickSendIndex]
                        ) {
                          const projectName =
                            filteredProjects[selectedQuickSendIndex];
                          const sheet = costSheets.find(
                            (s) => s.projectName === projectName
                          );
                          setSelectedQuickSendProperty(sheet);
                          setQuickSendSearch("");
                          setShowQuickSendDropdown(false);
                          setSelectedQuickSendIndex(-1);
                        }
                      } else if (e.key === "Escape") {
                        setShowQuickSendDropdown(false);
                        setSelectedQuickSendIndex(-1);
                      }
                    }}
                  />
                  {showQuickSendDropdown && (
                    <div className="absolute z-[60] w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {[...new Set(
                          costSheets
                            .filter(
                              (sheet) => {
                                const availability = sheet.availability || sheet.typologies?.[0]?.availability;
                                return availability !== "Sold Out";
                              }
                            )
                            .map((sheet) => sheet.projectName?.trim())
                            .filter(
                              (projectName) =>
                                projectName &&
                                projectName
                                  .toLowerCase()
                                  .includes(quickSendSearch.toLowerCase())
                            )
                        )]
                        .sort((a, b) => {
                          const aStartsWithNumber = /^\d/.test(a);
                          const bStartsWithNumber = /^\d/.test(b);
                          if (aStartsWithNumber && !bStartsWithNumber) return -1;
                          if (!aStartsWithNumber && bStartsWithNumber) return 1;
                          const aClean = a.toLowerCase().replace(/[^a-z0-9]/g, '');
                          const bClean = b.toLowerCase().replace(/[^a-z0-9]/g, '');
                          return aClean < bClean ? -1 : aClean > bClean ? 1 : 0;
                        })
                        .map((projectName, index) => {
                          const sheet = costSheets.find(
                            (s) => s.projectName === projectName
                          );
                          return (
                            <div
                              key={projectName}
                              className={`px-3 py-2 cursor-pointer ${
                                index === selectedQuickSendIndex
                                  ? "bg-primary text-white"
                                  : "hover:bg-neutral-100"
                              }`}
                              onClick={() => {
                                setSelectedQuickSendProperty(sheet);
                                setQuickSendSearch("");
                                setShowQuickSendDropdown(false);
                                setSelectedQuickSendIndex(-1);
                              }}
                            >
                              {projectName}
                            </div>
                          );
                        })}
                      {[...new Set(
                          costSheets
                            .filter(
                              (sheet) => {
                                const availability = sheet.availability || sheet.typologies?.[0]?.availability;
                                return availability !== "Sold Out";
                              }
                            )
                            .map((sheet) => sheet.projectName?.trim())
                            .filter(
                              (projectName) =>
                                projectName &&
                                projectName
                                  .toLowerCase()
                                  .includes(quickSendSearch.toLowerCase())
                            )
                        )].sort((a, b) => {
                        const aStartsWithNumber = /^\d/.test(a);
                        const bStartsWithNumber = /^\d/.test(b);
                        if (aStartsWithNumber && !bStartsWithNumber) return -1;
                        if (!aStartsWithNumber && bStartsWithNumber) return 1;
                        const aClean = a.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const bClean = b.toLowerCase().replace(/[^a-z0-9]/g, '');
                        return aClean < bClean ? -1 : aClean > bClean ? 1 : 0;
                      }).length === 0 && (
                        <div className="px-3 py-2 text-neutral-500">
                          No properties found
                        </div>
                      )}
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
                      const nameEmpty = !receiverName.trim();
                      const whatsAppEmpty = !receiverWhatsApp.trim();

                      if (nameEmpty || whatsAppEmpty) {
                        if (nameEmpty && whatsAppEmpty) {
                          toast.error(
                            "Please enter name and WhatsApp number in filters first."
                          );
                        } else if (nameEmpty) {
                          toast.error("Please enter name in filters first.");
                        } else {
                          toast.error(
                            "Please enter WhatsApp number in filters first."
                          );
                        }
                        return;
                      }

                      // Get all properties with the same project name
                      const allSameProject = costSheets.filter(
                        (sheet) =>
                          sheet.projectName?.trim() ===
                            selectedQuickSendProperty.projectName?.trim() &&
                          sheet.availability !== "Sold Out"
                      );

                      const text = generateWhatsAppText(
                        allSameProject,
                        receiverPrefix,
                        receiverName || "Customer",
                        receiverWhatsApp,
                        user || undefined,
                        undefined,
                        true, // isCostSheet
                        true, // isQuickSend
                        "New" // propertyCategory for quick send
                      );

                      setPreviewText(text);
                      setShowPreviewModal(true);
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const nameEmpty = !receiverName.trim();
                      const whatsAppEmpty = !receiverWhatsApp.trim();

                      if (nameEmpty || whatsAppEmpty) {
                        if (nameEmpty && whatsAppEmpty) {
                          toast.error(
                            "Please enter name and WhatsApp number in filters first."
                          );
                        } else if (nameEmpty) {
                          toast.error("Please enter name in filters first.");
                        } else {
                          toast.error(
                            "Please enter WhatsApp number in filters first."
                          );
                        }

                        if (nameEmpty) setNameError("Name is required");
                        if (whatsAppEmpty)
                          setWhatsAppError("WhatsApp number is required");
                        return;
                      }
                      setNameError("");
                      setWhatsAppError("");

                      // Get all properties with the same project name
                      const allSameProject = costSheets.filter(
                        (sheet) =>
                          sheet.projectName?.trim() ===
                            selectedQuickSendProperty.projectName?.trim() &&
                          sheet.availability !== "Sold Out"
                      );

                      const text = generateWhatsAppText(
                        allSameProject,
                        receiverPrefix,
                        receiverName || "Customer",
                        receiverWhatsApp,
                        user || undefined,
                        undefined,
                        true, // isCostSheet
                        true, // isQuickSend
                        "New" // propertyCategory for quick send
                      );

                      const whatsappUrl = getWhatsAppUrl(
                        receiverWhatsApp,
                        text
                      );
                      window.open(whatsappUrl, "_blank");

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
          {/* Sidebar Filters */}
          <div className="relative sidebar-container">
            {!showFilters && (
              <div
                className={`group w-10 hover:w-14 sticky top-24 bg-gray-300 hover:bg-white hover:border hover:border-gray-300 rounded-l-md rounded-r-md hover:rounded-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center justify-start pt-2 ${
                  hasFiltered ? "h-screen" : "h-96"
                }`}
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
              className={`transition-all duration-300 ease-in-out ${
                showFilters
                  ? "w-80 opacity-100"
                  : "w-0 opacity-0 overflow-hidden"
              }`}
            >
              {showFilters && (
                <Card className="sticky top-4 h-fit">
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
                    <Select
                      id="receiverPrefix"
                      label="Prefix"
                      options={[
                        { value: "Mr", label: "Mr" },
                        { value: "Mrs", label: "Mrs" },
                        { value: "Ms", label: "Ms" },
                        { value: "Dr", label: "Dr" },
                        { value: "Prof", label: "Prof" },
                      ]}
                      value={receiverPrefix}
                      onChange={(e) => setReceiverPrefix(e.target.value)}
                      // error={errors.receiverPrefix?.message}
                    />

                    <Input
                      id="receiverName"
                      label="Client Name"
                      placeholder="Enter client name"
                      value={receiverName}
                      onChange={(e) => {
                        setReceiverName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      error={nameError}
                    />
                    <Input
                      id="receiverWhatsApp"
                      label="Client WhatsApp Number"
                      placeholder="Enter client WhatsApp number"
                      value={receiverWhatsApp}
                      onChange={(e) => {
                        setReceiverWhatsApp(e.target.value);
                        if (whatsAppError) setWhatsAppError("");
                      }}
                      error={whatsAppError}
                    />
                    {/* <Button
                  variant="primary"
                  fullWidth
                  icon={<Share2 className="h-4 w-4 mr-1" />}
                  onClick={sendWhatsAppToInput}
                >
                  Send on WhatsApp
                </Button> */}
                    <div className="location-dropdown">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Search location..."
                          value={filters.station || locationSearchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setLocationSearchTerm(value);
                            setSelectedLocationIndex(-1);
                            setShowLocationDropdown(true);

                            // If user is editing a selected station, clear the filter to allow search
                            if (filters.station && value !== filters.station) {
                              handleFilterChange("station", "");
                            }
                          }}
                          onFocus={() => {
                            setShowLocationDropdown(true);
                            setSelectedLocationIndex(-1);
                          }}
                          onKeyDown={(e) => {
                            const searchValue =
                              filters.station || locationSearchTerm;
                            const filteredOptions = locationOptions.filter(
                              (option) =>
                                option.label
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase())
                            );

                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setSelectedLocationIndex((prev) =>
                                prev < filteredOptions.length - 1
                                  ? prev + 1
                                  : prev
                              );
                              if (!showLocationDropdown)
                                setShowLocationDropdown(true);
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setSelectedLocationIndex((prev) =>
                                prev > 0 ? prev - 1 : -1
                              );
                              if (!showLocationDropdown)
                                setShowLocationDropdown(true);
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                selectedLocationIndex >= 0 &&
                                filteredOptions[selectedLocationIndex]
                              ) {
                                handleFilterChange(
                                  "station",
                                  filteredOptions[selectedLocationIndex].value
                                );
                                setLocationSearchTerm("");
                                setShowLocationDropdown(false);
                                setSelectedLocationIndex(-1);
                              }
                            } else if (e.key === "Escape") {
                              setShowLocationDropdown(false);
                              setSelectedLocationIndex(-1);
                            } else if (
                              e.key === "Backspace" &&
                              filters.station
                            ) {
                              // Allow backspace to edit selected station
                              setShowLocationDropdown(true);
                            }
                          }}
                        />
                        {showLocationDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {locationOptions
                              .filter((option) => {
                                const searchValue =
                                  filters.station || locationSearchTerm;
                                return option.label
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase());
                              })
                              .map((option, index) => (
                                <div
                                  key={option.value}
                                  className={`px-3 py-2 cursor-pointer ${
                                    index === selectedLocationIndex
                                      ? "bg-primary text-white"
                                      : "hover:bg-neutral-100"
                                  }`}
                                  onClick={() => {
                                    handleFilterChange("station", option.value);
                                    setLocationSearchTerm("");
                                    setShowLocationDropdown(false);
                                    setSelectedLocationIndex(-1);
                                  }}
                                >
                                  {option.label}
                                </div>
                              ))}
                            {locationOptions.filter((option) =>
                              option.label
                                .toLowerCase()
                                .includes(
                                  (
                                    filters.station || locationSearchTerm
                                  ).toLowerCase()
                                )
                            ).length === 0 && (
                              <div className="px-3 py-2 text-neutral-500">
                                No locations found
                              </div>
                            )}
                            {filters.station && (
                              <div
                                className="px-3 py-2 hover:bg-neutral-100 cursor-pointer border-t border-neutral-200 text-red-600"
                                onClick={() => {
                                  handleFilterChange("station", "");
                                  setLocationSearchTerm("");
                                  setShowLocationDropdown(false);
                                  setSelectedLocationIndex(-1);
                                }}
                              >
                                Clear selection
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {filterConfig.showPropertyType && (
                      <Select
                        id="bhkType"
                        label="Property Type"
                        options={filterConfig.propertyTypeOptions}
                        value={filters.bhkType}
                        onChange={(e) =>
                          handleFilterChange("bhkType", e.target.value)
                        }
                      />
                    )}
                    {filterConfig.showArea && (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          id="minArea"
                          label="Min. Area"
                          value={filters.minBudget}
                          onChange={(e) =>
                            handleFilterChange("minBudget", e.target.value)
                          }
                        />
                        <Input
                          id="maxArea"
                          label="Max. Area"
                          value={filters.maxBudget}
                          onChange={(e) =>
                            handleFilterChange("maxBudget", e.target.value)
                          }
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          id="minBudget"
                          label={`Min. ${filterConfig.budgetLabel}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={filters.minBudget}
                          onChange={(e) =>
                            handleFilterChange("minBudget", e.target.value)
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
                        />
                        {filters.minBudget && (
                          <div className="text-right text-xs text-gray-600 font-bold -mt-3">
                            {formatPriceDisplay(filters.minBudget)}
                          </div>
                        )}
                      </div>
                      <div>
                        <Input
                          id="maxBudget"
                          label={`Max. ${filterConfig.budgetLabel}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={filters.maxBudget}
                          onChange={(e) =>
                            handleFilterChange("maxBudget", e.target.value)
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
                        />
                        {filters.maxBudget && (
                          <div className="text-right text-xs text-gray-600 font-bold -mt-3">
                            {formatPriceDisplay(filters.maxBudget)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sublocation-dropdown">
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
                            <span className="text-sm font-medium text-neutral-700">
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
                            <span className="text-sm font-medium text-neutral-700">
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
                                  const newSubLocations =
                                    filters.subLocation.filter(
                                      (loc) => loc !== location
                                    );
                                  handleFilterChange(
                                    "subLocation",
                                    newSubLocations
                                  );
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={`Search ${
                            locationFilterType === "subLocation"
                              ? "sub location"
                              : "building/society"
                          }...`}
                          value={subLocationSearchTerm}
                          onChange={(e) => {
                            setSubLocationSearchTerm(e.target.value);
                            setSelectedSubLocationIndex(-1);
                            setShowSubLocationDropdown(true);
                          }}
                          onFocus={() => {
                            setShowSubLocationDropdown(true);
                            setSelectedSubLocationIndex(-1);
                          }}
                          onKeyDown={(e) => {
                            const filteredOptions = subLocationOptions.filter(
                              (option) =>
                                option.label
                                  .toLowerCase()
                                  .includes(
                                    subLocationSearchTerm.toLowerCase()
                                  ) &&
                                !filters.subLocation.includes(option.value)
                            );
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setSelectedSubLocationIndex((prev) =>
                                prev < filteredOptions.length - 1
                                  ? prev + 1
                                  : prev
                              );
                              if (!showSubLocationDropdown)
                                setShowSubLocationDropdown(true);
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              setSelectedSubLocationIndex((prev) =>
                                prev > 0 ? prev - 1 : -1
                              );
                              if (!showSubLocationDropdown)
                                setShowSubLocationDropdown(true);
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                selectedSubLocationIndex >= 0 &&
                                filteredOptions[selectedSubLocationIndex]
                              ) {
                                const newSubLocations = [
                                  ...filters.subLocation,
                                  filteredOptions[selectedSubLocationIndex]
                                    .value,
                                ];
                                handleFilterChange(
                                  "subLocation",
                                  newSubLocations
                                );
                                setSubLocationSearchTerm("");
                                setSelectedSubLocationIndex(-1);
                              }
                            } else if (e.key === "Escape") {
                              setShowSubLocationDropdown(false);
                              setSelectedSubLocationIndex(-1);
                            }
                          }}
                        />
                        {showSubLocationDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {subLocationOptions
                              .filter(
                                (option) =>
                                  option.label
                                    .toLowerCase()
                                    .includes(
                                      subLocationSearchTerm.toLowerCase()
                                    ) &&
                                  !filters.subLocation.includes(option.value)
                              )
                              .map((option, index) => (
                                <div
                                  key={option.value}
                                  className={`px-3 py-2 cursor-pointer ${
                                    index === selectedSubLocationIndex
                                      ? "bg-primary text-white"
                                      : "hover:bg-neutral-100"
                                  }`}
                                  onClick={() => {
                                    const newSubLocations = [
                                      ...filters.subLocation,
                                      option.value,
                                    ];
                                    handleFilterChange(
                                      "subLocation",
                                      newSubLocations
                                    );
                                    setSubLocationSearchTerm("");
                                    setSelectedSubLocationIndex(-1);
                                  }}
                                >
                                  {option.label}
                                </div>
                              ))}
                            {subLocationOptions.filter(
                              (option) =>
                                option.label
                                  .toLowerCase()
                                  .includes(
                                    subLocationSearchTerm.toLowerCase()
                                  ) &&
                                !filters.subLocation.includes(option.value)
                            ).length === 0 && (
                              <div className="px-3 py-2 text-neutral-500">
                                {filters.subLocation.length ===
                                subLocationOptions.length
                                  ? "All locations selected"
                                  : "No sub locations found"}
                              </div>
                            )}
                            {filters.subLocation.length > 0 && (
                              <div
                                className="px-3 py-2 hover:bg-neutral-100 cursor-pointer border-t border-neutral-200 text-red-600"
                                onClick={() => {
                                  handleFilterChange("subLocation", []);
                                  setSubLocationSearchTerm("");
                                  setShowSubLocationDropdown(false);
                                  setSelectedSubLocationIndex(-1);
                                }}
                              >
                                Clear all selections
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {filterConfig.showPossession && (
                      <Select
                        id="possession"
                        label="Possession by"
                        options={possessionOptions}
                        value={filters.possession}
                        onChange={(e) =>
                          handleFilterChange("possession", e.target.value)
                        }
                      />
                    )}
                    {filterConfig.showCosmo && (
                      <div>
                        <p className="block text-sm font-medium text-neutral-700 mb-1">
                          Looking for Cosmo?
                        </p>
                        <div className="flex space-x-4">
                          <div
                            className={`px-3 py-2 border rounded-md cursor-pointer ${
                              filters.lookingForCosmo === true
                                ? "bg-primary text-white border-primary"
                                : "border-neutral-300"
                            }`}
                            onClick={() =>
                              handleFilterChange(
                                "lookingForCosmo",
                                filters.lookingForCosmo === true
                                  ? undefined
                                  : true
                              )
                            }
                          >
                            Yes
                          </div>
                          <div
                            className={`px-3 py-2 border rounded-md cursor-pointer ${
                              filters.lookingForCosmo === false
                                ? "bg-primary text-white border-primary"
                                : "border-neutral-300"
                            }`}
                            onClick={() =>
                              handleFilterChange(
                                "lookingForCosmo",
                                filters.lookingForCosmo === false
                                  ? undefined
                                  : false
                              )
                            }
                          >
                            No
                          </div>
                        </div>
                      </div>
                    )}

                    {filterConfig.showGalleryTerrace && (
                      <div>
                        <p className="block text-sm font-medium text-neutral-700 mb-1">
                          Gallery / Terrace?
                        </p>
                        <div className="flex space-x-4">
                          <div
                            className={`px-3 py-2 border rounded-md cursor-pointer ${
                              filters.GalleryorTerrace === "Gallery"
                                ? "bg-primary text-white border-primary"
                                : "border-neutral-300"
                            }`}
                            onClick={() =>
                              handleFilterChange(
                                "GalleryorTerrace",
                                filters.GalleryorTerrace === "Gallery"
                                  ? undefined
                                  : "Gallery"
                              )
                            }
                          >
                            Gallery
                          </div>
                          <div
                            className={`px-3 py-2 border rounded-md cursor-pointer ${
                              filters.GalleryorTerrace === "Terrace"
                                ? "bg-primary text-white border-primary"
                                : "border-neutral-300"
                            }`}
                            onClick={() =>
                              handleFilterChange(
                                "GalleryorTerrace",
                                filters.GalleryorTerrace === "Terrace"
                                  ? undefined
                                  : "Terrace"
                              )
                            }
                          >
                            Terrace
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className="text-sm text-primary hover:text-primary-dark font-medium"
                    >
                      {showAdvancedFilters
                        ? "- Hide Advanced Filters"
                        : "+ Show Advanced Filters"}
                    </button>

                    {showAdvancedFilters && (
                      <>
                        {propertyCategory !== "New" && (
                          <div>
                            <p className="block text-sm font-medium text-neutral-700 mb-1">
                              Furnishing
                            </p>
                            <div className="flex space-x-4">
                              <div
                                className={`px-3 py-2 border rounded-md cursor-pointer text-sm ${
                                  filters.furnishing === "Fully Furnished"
                                    ? "bg-primary text-white border-primary"
                                    : "border-neutral-300"
                                }`}
                                onClick={() =>
                                  handleFilterChange(
                                    "furnishing",
                                    filters.furnishing === "Fully Furnished"
                                      ? undefined
                                      : "Fully Furnished"
                                  )
                                }
                              >
                                Fully Furnished
                              </div>
                              <div
                                className={`px-3 py-2 border rounded-md cursor-pointer text-sm ${
                                  filters.furnishing === "Semi-Furnished"
                                    ? "bg-primary text-white border-primary"
                                    : "border-neutral-300"
                                }`}
                                onClick={() =>
                                  handleFilterChange(
                                    "furnishing",
                                    filters.furnishing === "Semi-Furnished"
                                      ? undefined
                                      : "Semi-Furnished"
                                  )
                                }
                              >
                                Semi-Furnished
                              </div>
                            </div>
                          </div>
                        )}
                        {propertyCategory !== "New" && (
                          <div>
                            <p className="block text-sm font-medium text-neutral-700 mb-1">
                              Parking
                            </p>
                            <div className="flex space-x-4">
                              <div
                                className={`px-3 py-2 border rounded-md cursor-pointer ${
                                  filters.parking === true
                                    ? "bg-primary text-white border-primary"
                                    : "border-neutral-300"
                                }`}
                                onClick={() =>
                                  handleFilterChange(
                                    "parking",
                                    filters.parking === true
                                      ? undefined
                                      : true
                                  )
                                }
                              >
                                Yes
                              </div>
                              <div
                                className={`px-3 py-2 border rounded-md cursor-pointer ${
                                  filters.parking === false
                                    ? "bg-primary text-white border-primary"
                                    : "border-neutral-300"
                                }`}
                                onClick={() =>
                                  handleFilterChange(
                                    "parking",
                                    filters.parking === false
                                      ? undefined
                                      : false
                                  )
                                }
                              >
                                No
                              </div>
                            </div>
                          </div>
                        )}
                        {propertyCategory === "Rental" && (
                          <div>
                            <p className="block text-sm font-medium text-neutral-700 mb-1">
                              Pet friendly
                            </p>
                            <div className="flex space-x-4">
                              <div
                                className={`px-3 py-2 border rounded-md cursor-pointer ${
                                  filters.petFriendly === true
                                    ? "bg-primary text-white border-primary"
                                    : "border-neutral-300"
                                }`}
                                onClick={() =>
                                  handleFilterChange(
                                    "petFriendly",
                                    filters.petFriendly === true
                                      ? undefined
                                      : true
                                  )
                                }
                              >
                                Yes
                              </div>
                              <div
                                className={`px-3 py-2 border rounded-md cursor-pointer ${
                                  filters.petFriendly === false
                                    ? "bg-primary text-white border-primary"
                                    : "border-neutral-300"
                                }`}
                                onClick={() =>
                                  handleFilterChange(
                                    "petFriendly",
                                    filters.petFriendly === false
                                      ? undefined
                                      : false
                                  )
                                }
                              >
                                No
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="block text-sm font-medium text-neutral-700 mb-1">
                            Amenities
                          </p>
                          <div className="space-y-2">
                            {[
                              "Swimming Pool",
                              "Gymnasium",
                              "Club House",
                              "Kid's Play Area",
                              "Modular Kitchen",
                              ...(propertyCategory !== "New" ? ["Gas Pipeline"] : []),
                            ].map((amenity) => (
                              <label
                                key={amenity}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.amenities.includes(amenity)}
                                  onChange={(e) => {
                                    const currentAmenities = filters.amenities;
                                    const newAmenities = e.target.checked
                                      ? [...currentAmenities, amenity]
                                      : currentAmenities.filter(
                                          (a) => a !== amenity
                                        );
                                    handleFilterChange(
                                      "amenities",
                                      newAmenities
                                    );
                                  }}
                                  className="rounded border-neutral-300"
                                />
                                <span className="text-sm">{amenity}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        setAppliedFilters({ ...filters });
                        setHasFiltered(true);
                        setEverFiltered(true);
                        setSelectedProperties([]);
                        if (propertyCategory === "New") {
                          setSelectedCostSheets([]);
                        }
                        setShowFilters(false);
                      }}
                      disabled={selectedCategory !== "residential"}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {selectedCategory !== "residential" ? (
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
            ) : noActiveSubscription ? (
              <Card>
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                    No Active Subscriptions
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    You need to subscribe for Resale & Rental package to view
                    {propertyCategory === "New"
                      ? " new properties"
                      : " properties"}
                    .
                  </p>
                  <Link to="/subscription">
                    <Button variant="primary">Add Subscription</Button>
                  </Link>
                </div>
              </Card>
            ) : propertyCategory === "New" ? (
              !hasFiltered ? (
                <Card>
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                      Apply Filters to See Properties
                    </h2>
                    <p className="text-neutral-600">
                      Use the filters to narrow down your search and find the
                      perfect property.
                    </p>
                  </div>
                </Card>
              ) : filteredNewProperties.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <X className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">
                      No new properties added yet
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Action Bar for New Properties */}
                  {selectedCostSheets.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <CheckCheck className="h-5 w-5 text-primary mr-2" />
                          <span className="font-medium">
                            {selectedCostSheets.length} properties selected
                          </span>
                        </div>
                        {selectedCostSheets.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCostSheets([])}
                          >
                            Clear selection
                          </Button>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!filters.bhkType) {
                              toast.error(
                                "Please select a Configuration (BHK type) first."
                              );
                              return;
                            }

                            if (!hasFiltered) {
                              toast.error(
                                "Please apply filters before comparing."
                              );
                              return;
                            }

                            if (selectedCostSheets.length < 1) {
                              toast.error(
                                "Please select at least one property to compare."
                              );
                              return;
                            }

                            if (selectedCostSheets.length > 5) {
                              toast.error(
                                "You can compare only up to 5 properties. Please deselect some properties."
                              );
                              return;
                            }

                            const flatTypes = filteredNewProperties
                              .map((cs) => cs.flatType?.toLowerCase())
                              .filter(Boolean); // remove undefined/null

                            const allSameFlatType =
                              flatTypes.length > 0 &&
                              flatTypes.every((ft) => ft === flatTypes[0]);

                            if (!allSameFlatType) {
                              toast.error(
                                "The visible properties have different configurations. Please filter to a single configuration."
                              );
                              return;
                            }

                            navigate("/compare", {
                              state: { selectedItems: selectedCostSheets },
                            });
                          }}
                        >
                          Compare
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Share2 className="h-4 w-4 mr-1" />}
                          onClick={sendWhatsAppToInput}
                        >
                          Share on WhatsApp
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Updated Cost Sheets Table */}
                  <div className="overflow-x-auto max-w-full max-h-screen overflow-y-auto sticky top-0 z-40 bg-white">
                    <table
                      className="min-w-full divide-y divide-neutral-200 table-auto select-none"
                      style={{
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                      }}
                    >
                      <thead className="bg-blue-100 border-b-2 border-blue-200 sticky top-0 z-50">
                        <tr>
                          <th className="px-4 py-4 text-center text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Sr. No.
                          </th>
                          <th className="px-4 py-4 text-center text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Select
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Building / Society name
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Road / Location
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Total Package
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Possession Date
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Brochure
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Image
                          </th>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Video
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {Object.values(
                          filteredNewProperties.reduce((acc, sheet) => {
                            const projectName = sheet.projectName;
                            const totalPackage = sheet.totalPackage || sheet.typologies?.[0]?.totalPackage || 0;
                            if (
                              !acc[projectName] ||
                              totalPackage < (acc[projectName].totalPackage || acc[projectName].typologies?.[0]?.totalPackage || 0)
                            ) {
                              acc[projectName] = sheet;
                            }
                            return acc;
                          }, {} as Record<string, (typeof filteredCostSheets)[0]>)
                        )
                          .sort((a, b) => {
                            const packageA = a.totalPackage || a.typologies?.[0]?.totalPackage || 0;
                            const packageB = b.totalPackage || b.typologies?.[0]?.totalPackage || 0;
                            return packageA - packageB;
                          })
                          .map((sheet, idx) => {
                            // Handle both data structures for display
                            const totalPackage = sheet.totalPackage || sheet.typologies?.[0]?.totalPackage;
                            const subLocation = sheet.subLocation || sheet.road;
                            const possession = sheet.possession || sheet.typologies?.[0]?.developerPossession;
                            
                            return (
                            <tr key={sheet.id} className="hover:bg-neutral-50">
                              <td className="px-4 py-4 text-center text-sm text-neutral-500">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                  checked={selectedCostSheets.some(
                                    (cs) => cs.id === sheet.id
                                  )}
                                  onChange={() =>
                                    toggleCostSheetSelection(sheet)
                                  }
                                />
                              </td>
                              <td
                                className="px-4 py-4 whitespace-nowrap text-sm text-primary cursor-pointer hover:underline"
                                onClick={() => handleProjectClick(sheet)}
                              >
                                {sheet.projectName}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {subLocation}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">
                                ₹{" "}
                                {totalPackage
                                  ? Number(totalPackage).toLocaleString(
                                      "en-IN"
                                    )
                                  : "N/A"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {possession || "N/A"}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {sheet.brochureUrl ? (
                                  <a
                                    href={sheet.brochureUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Available
                                  </a>
                                ) : (
                                  "–"
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {sheet.imageUrl ? (
                                  <a
                                    href={sheet.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Available
                                  </a>
                                ) : (
                                  "–"
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                                {sheet.videoUrl ? (
                                  <a
                                    href={sheet.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Available
                                  </a>
                                ) : (
                                  "–"
                                )}
                              </td>
                            </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            ) : !inventoryLoaded ? (
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
            ) : !everFiltered ? (
              <Card>
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                    Apply Filters to See Properties
                  </h2>
                  <p className="text-neutral-600">
                    Use the filters to narrow down your search and find the
                    perfect property.
                  </p>
                </div>
              </Card>
            ) : filteredResaleRentalProperties.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <X className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                    No Properties Found
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    No properties match your current filter criteria. Try
                    adjusting your filters.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* Action Bar */}
                {selectedProperties.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <CheckCheck className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">
                          {selectedProperties.length} properties selected
                        </span>
                      </div>
                      {selectedProperties.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProperties([])}
                        >
                          Clear selection
                        </Button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate("/compare", {
                            state: { selectedProperties },
                          })
                        }
                      >
                        Compare
                      </Button> */}
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Share2 className="h-4 w-4 mr-1" />}
                        onClick={sendWhatsAppToInput}
                      >
                        Share on WhatsApp
                      </Button>
                    </div>
                  </div>
                )}

                {/* Properties Table */}
                <Card className="sticky top-0 z-40 bg-white">
                  <div className="overflow-x-auto">
                    <table
                      className="min-w-full divide-y divide-neutral-200 table-auto select-none"
                      style={{
                        tableLayout: "auto",
                        transition: "all 0.3s ease",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                      }}
                    >
                      <thead className="bg-blue-100 border-b-2 border-blue-200 sticky top-0 z-50">
                        <tr>
                          <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Select
                          </th>
                          <th className="px-4 py-4 text-center text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Sr. No
                          </th>
                          {propertyCategory === "Resale" && (
                            <>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Direct / Broker
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Building / Society
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Road / Location
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Expected Price
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                FLR No
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                FLAT No
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Name
                              </th>
                            </>
                          )}
                          {propertyCategory === "Rental" && (
                            <>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Direct / Broker
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Building / Society
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Road / Location
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Rent
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Deposit
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                FLAT No
                              </th>
                              <th className="px-4 py-4 text-left text-sm font-bold text-blue-900 uppercase tracking-wide">
                                Name
                              </th>
                            </>
                          )}
                          <th className="px-4 py-4 text-center text-sm font-bold text-blue-900 uppercase tracking-wide">
                            Contact
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-neutral-200">
                        {filteredResaleRentalProperties
                          .sort((a, b) => {
                            const aIsOwn = a.userId === user?.id;
                            const bIsOwn = b.userId === user?.id;
                            if (aIsOwn && !bIsOwn) return -1;
                            if (!aIsOwn && bIsOwn) return 1;

                            if (propertyCategory === "Resale") {
                              const priceA = a.expectedPrice || 0;
                              const priceB = b.expectedPrice || 0;
                              return priceA - priceB;
                            }
                            if (propertyCategory === "Rental") {
                              const rentA = a.rent || 0;
                              const rentB = b.rent || 0;
                              return rentA - rentB;
                            }
                            return 0;
                          })
                          .map((property, index) => {
                            const hasSubForLocation = rrStationNames.some(
                              (loc) =>
                                loc.toLowerCase() ===
                                (property.roadLocation || "")
                                  ?.trim()
                                  ?.toLowerCase()
                            );

                            // Create a unique identifier for each property row
                            const uniquePropertyKey = `${property.id}-${
                              property.userId || "no-user"
                            }-${index}`;

                            return (
                              <tr
                                key={uniquePropertyKey}
                                className={`hover:bg-neutral-50 ${
                                  isPropertySelected(property)
                                    ? "bg-primary/5"
                                    : property.userId === user?.id
                                    ? "bg-green-50"
                                    : ""
                                }`}
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-left">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                    checked={isPropertySelected(property)}
                                    onChange={() =>
                                      togglePropertySelection(property)
                                    }
                                  />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-500">
                                  {index + 1}
                                </td>
                                {propertyCategory === "Resale" && (
                                  <>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-medium text-neutral-900">
                                      {property.userId === user?.id
                                        ? "Direct"
                                        : "Broker"}
                                    </td>
                                    <td
                                      className="px-4 py-4 whitespace-nowrap text-left text-sm text-primary cursor-pointer hover:underline"
                                      onClick={() =>
                                        handlePropertyClick(property)
                                      }
                                    >
                                      <div className="relative">
                                        <div>{property.society}</div>
                                        {property.plusProperty && (
                                          <div className="absolute -top-3 right-0 text-[9px] font-semibold text-white leading-none bg-amber-500 px-1 py-0.5 rounded-full">
                                            {property.plusProperty}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      {property.sublocation}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900 font-semibold">
                                      ₹
                                      {property.expectedPrice?.toLocaleString(
                                        "en-IN"
                                      )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      {getFloorCategory(
                                        property.floorNo,
                                        property.totalFloors
                                      )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      {property.userId !== user?.id
                                        ? "--"
                                        : property.flatNo || "N/A"}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      {property.userId === user?.id
                                        ? property.ownerName
                                        : property.userFullName}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-neutral-900">
                                      {property.userId === user?.id
                                        ? property.ownerNumber
                                        : property.userMarketingPhoneNumber}
                                    </td>
                                  </>
                                )}
                                {propertyCategory === "Rental" && (
                                  <>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm font-medium text-neutral-900">
                                      {property.userId === user?.id
                                        ? "Direct"
                                        : "Broker"}
                                    </td>
                                    <td
                                      className="px-4 py-4 whitespace-nowrap text-left text-sm text-primary cursor-pointer hover:underline"
                                      onClick={() =>
                                        handlePropertyClick(property)
                                      }
                                    >
                                      {property.society}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      {property.sublocation}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900 font-semibold">
                                      ₹
                                      {property.rent
                                        ? property.rent.toLocaleString("en-IN")
                                        : "N/A"}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      ₹
                                      {property.deposit
                                        ? property.deposit.toLocaleString(
                                            "en-IN"
                                          )
                                        : "N/A"}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      {property.userId !== user?.id
                                        ? "--"
                                        : property.flatNo || "N/A"}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left text-sm text-neutral-900">
                                      {property.userId === user?.id
                                        ? property.ownerName
                                        : property.userFullName}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-neutral-900">
                                      {property.userId === user?.id
                                        ? property.ownerNumber
                                        : property.userMarketingPhoneNumber}
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
      <ProjectDetailsModal
        open={openProjectModal}
        onClose={() => setOpenProjectModal(false)}
        data={selectedProjectData}
      />
      {openPropertyModal && selectedPropertyData && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setOpenPropertyModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[70vh] flex flex-col select-none"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">
                {selectedPropertyData.society}
              </h2>
              <button onClick={() => setOpenPropertyModal(false)}>
                <X className="h-6 w-6 text-neutral-500" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain p-6 pt-4">
              {[
                {
                  title: "Basic Details",
                  fields: [
                    "society",
                    "sublocation",
                    "landmark",
                    "pincode",
                    "station",
                    "district",
                    "state",
                  ],
                },
                {
                  title: "Property Details",
                  fields: [
                    "type",
                    "masterBed",
                    "totalFloors",
                    "carpetArea",
                    "builtUpArea",
                    "propertyAge",
                    "ocAvailable",
                    "amenities",
                    "furnishing",
                    "parking",
                    "terraceGallery",
                    "cosmoSociety",
                    "expectedPrice",
                    "negotiable",
                    "maintenance",
                  ],
                },
                {
                  title: "Others",
                  fields: [
                    "connectedPerson",
                    "imageUrl",
                    "videoUrl",
                    ...(selectedPropertyData.userId === user?.id
                      ? ["ownerName", "ownerNumber"]
                      : ["userFullName", "userMarketingPhoneNumber"]),
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="mb-10">
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <h3 className="text-lg font-semibold text-blue-700 whitespace-nowrap">
                      {section.title}
                    </h3>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {section.fields
                      .filter(
                        (field) =>
                          (selectedPropertyData as any)[field] !== undefined &&
                          (selectedPropertyData as any)[field] !== null &&
                          (selectedPropertyData as any)[field] !== ""
                      )
                      .map((field) => (
                        <div key={field}>
                          <div className="text-sm text-neutral-500">
                            {field === "userFullName"
                              ? "Broker Name"
                              : field === "userMarketingPhoneNumber"
                              ? "Broker Number"
                              : field
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div className="text-sm font-medium text-neutral-900">
                            {field === "imageUrl" || field === "videoUrl" ? (
                              (selectedPropertyData as any)[field] ? (
                                <a
                                  href={(selectedPropertyData as any)[field]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline hover:text-blue-800"
                                >
                                  {field === "imageUrl"
                                    ? "View Images"
                                    : "View Video"}
                                </a>
                              ) : (
                                "—"
                              )
                            ) : Array.isArray(
                                (selectedPropertyData as any)[field]
                              ) ? (
                              (selectedPropertyData as any)[field].join(", ")
                            ) : typeof (selectedPropertyData as any)[field] ===
                              "boolean" ? (
                              (selectedPropertyData as any)[field] ? (
                                "Yes"
                              ) : (
                                "No"
                              )
                            ) : (selectedPropertyData as any)[field] ===
                                "true" ||
                              (selectedPropertyData as any)[field] === true ? (
                              "Yes"
                            ) : (selectedPropertyData as any)[field] ===
                                "false" ||
                              (selectedPropertyData as any)[field] === false ? (
                              "No"
                            ) : (
                              (selectedPropertyData as any)[
                                field
                              ]?.toString() || "—"
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col mx-4 select-none"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Message Preview
                </h2>
                <p className="text-sm text-gray-500">
                  To: {receiverName || "Customer"}
                </p>
              </div>
              <button onClick={() => setShowPreviewModal(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                  {previewText}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowPreviewModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const whatsappUrl = getWhatsAppUrl(
                    receiverWhatsApp,
                    previewText
                  );
                  window.open(whatsappUrl, "_blank");
                  setShowPreviewModal(false);
                  setSelectedQuickSendProperty(null);
                }}
                className="flex-1"
              >
                Send to WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
