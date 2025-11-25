import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Check, X, Users, Briefcase, Eye, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tabs from "../components/ui/Tabs";
import FilterBar from "../components/FilterBar";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
  updatePropertyStatus,
  updateResaleProperty,
  updateRentalProperty,
  getPricing,
  setPricing,
  getStampDutyRates,
  updateUserRole,
  getUserResaleProperties,
  getUserRentalProperties,
} from "../utils/firestoreListings";
import { User } from "../types";
import { useAuth } from "../utils/authContext";
import CostSheetForm from "./CostSheetForm";
import Input from "../components/ui/Input";
import { useForm } from "react-hook-form";
import SearchableDropdown from "../components/ui/SearchableDropdown";
// import TagInput from "../utils/rrAmenitiesInput";
import {
  ResaleFormData,
  RentalFormData,
  fetchStates,
  fetchCities,
} from "../utils/api";
import { State, City } from "../types";
import {
  onSnapshot,
  collection,
  doc,
  setDoc,
  // getDoc,
  Timestamp,
  getDocs,
  deleteDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { StampDutyRate } from "../pages/Compare";
import { UserRole } from "../types";
import { usePermissions } from "../hooks/usePermissions";
import RoleBadge from "../components/ui/RoleBadge";
import { stations } from "../utils/stations";

const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const furnishingOptions = [
  { value: "Unfurnished", label: "Unfurnished" },
  { value: "Semi-Furnished", label: "Semi-Furnished" },
  { value: "Fully Furnished", label: "Fully Furnished" },
];

const parkingOptions = [
  { value: "None", label: "None" },
  { value: "Open", label: "Open" },
  { value: "Covered", label: "Covered" },
];

const propertyTypes = [
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

// Helper to safely convert Firestore timestamps to Date
const toDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === "number" || typeof timestamp === "string") {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) return date;
  }
  return new Date(); // Fallback to current date
};

// Define Property type for inventory items
interface Property {
  id: string;
  userId?: string;
  createdAt: Date | Timestamp; // Accept both Timestamp and Date
  type: string;
  society: string;
  roadLocation?: string;
  sublocation?: string;
  expectedPrice?: number;
  rent?: number;
  isApproved: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  // Additional properties
  station?: string;
  zone?: string;
  directBroker?: string;
  terrace?: boolean;
  cosmo?: boolean;
  floorNo?: string;
  flatNo?: string;
  deposit?: number;
  furnishing?: string;
  availableFrom?: string;
  propertyAge?: number;
  parking?: string;
  contactName?: string;
  contactNumber?: string;
  connectedPerson?: string;
  buildingNo?: string;
  totalFloors?: number;
  wing?: string;
  landmark?: string;
  amenities?: string[];
  // Frequently used optional fields in UI/filters
  docId?: string;
  submitterRole?: string;
  pincode?: string;
  pinCode?: string;
  district?: string;
  state?: string;
  ownerName?: string;
  ownerNumber?: string;
  ocAvailable?: boolean;
  terraceGallery?: string;
  cosmoSociety?: boolean;
  maintenance?: number;
  carpetArea?: number;
  builtUpArea?: number;
  negotiable?: boolean;
  masterBed?: string;
  imageUrl?: string;
  videoUrl?: string;
}

// SubscriptionInfo must be defined before use
interface SubscriptionInfo {
  id: string;
  type: string;
  status: string;
  amount?: number;
  discountedPrice?: number;
  locations?: string[] | string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
}
// Add this component above the Admin component
interface SubscriptionDisplayProps {
  subscription: SubscriptionInfo;
}

const Admin = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  interface Inventory {
    resale: Property[];
    rental: Property[];
    newProperties?: any[];
  }
  const [inventory, setInventory] = useState<Inventory>({
    resale: [],
    rental: [],
    newProperties: [],
  });
  // const [loading, setLoading] = useState(true); // removed unused variable
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  interface ShowPropertyDetails extends Property {
    category?: string;
    [key: string]: any;
  }
  const [showPropertyDetails, setShowPropertyDetails] =
    useState<ShowPropertyDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  interface PricingState {
    rentalResalePrice: number;
    newPropertyPrice: number;
    resalePrice: number;
    rentalPrice: number;
    actualPrice?: number;
    discount?: number;
    offerPrice?: number;
    discountedPrice?: { [key: string]: number };
    newStationName?: string;
    selectedStationId?: string;
  }
  const [pricing, setPricingState] = useState<PricingState>({
    rentalResalePrice: 2500,
    newPropertyPrice: 1500,
    resalePrice: 2500,
    rentalPrice: 2500,
    actualPrice: undefined,
    discount: undefined,
    offerPrice: undefined,
    discountedPrice: {},
    newStationName: "",
    selectedStationId: "",
  });
  const [newStationPricing, setNewStationPricing] = useState({
    actual: 1500,
    offer: 1500,
  });
  const [currentPricing, setCurrentPricing] = useState<{
    actualPrice?: { RR: number };
    discountedPrice?: { RR: number };
  }>({});
  const [rates, setRates] = useState<StampDutyRate[]>([]);
  const [newRate, setNewRate] = useState({
    jurisdiction: "",
    rate: "",
  });
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const [userSubscriptions, setUserSubscriptions] = useState<
    SubscriptionInfo[]
  >([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  // Inside the Admin component
  interface StationPricing {
    actual: number;
    offer: number;
  }
  const [newPropertyPricing, setNewPropertyPricing] = useState<{
    [key: string]: StationPricing;
  }>({});
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [editingStationName, setEditingStationName] = useState<string>("");
  const [customStationNames, setCustomStationNames] = useState<{
    [key: string]: string;
  }>({});
  const [durationDiscounts, setDurationDiscounts] = useState<{
    3: number;
    6: number;
    12: number;
  }>({ 3: 10, 6: 20, 12: 40 });
  const [costSheetStationsCount, setCostSheetStationsCount] = useState(0);
  const [costSheetStationsLoaded, setCostSheetStationsLoaded] = useState(false);
  const [allMergedStations, setAllMergedStations] = useState<
    { id: string; name: string }[]
  >([]);
  const [stationSearchTerm, setStationSearchTerm] = useState("");
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [modalProperties, setModalProperties] = useState<any[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Approved properties search and filter states
  const [approvedSearchTerms, setApprovedSearchTerms] = useState({
    resale: "",
    rental: "",
    newProperty: "",
  });
  const [approvedFilters, setApprovedFilters] = useState({
    resale: { type: "", sort: "" },
    rental: { type: "", sort: "" },
    newProperty: { bhk: "", sort: "" },
  });

  // Pending properties search states
  const [pendingSearchTerms, setPendingSearchTerms] = useState({
    resale: "",
    rental: "",
    newProperty: "",
  });
  const [pendingFilters, setPendingFilters] = useState({
    resale: { type: "", sort: "" },
    rental: { type: "", sort: "" },
    newProperty: { bhk: "", sort: "" },
  });
  const [pendingNewPropertyReraRange, setPendingNewPropertyReraRange] =
    useState({ min: "", max: "" });

  // Rejected properties search and filter states
  const [rejectedSearchTerms, setRejectedSearchTerms] = useState({
    resale: "",
    rental: "",
    newProperty: "",
  });
  const [rejectedFilters, setRejectedFilters] = useState({
    resale: { type: "", sort: "" },
    rental: { type: "", sort: "" },
    newProperty: { bhk: "", sort: "" },
  });

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingProperty, setRejectingProperty] = useState<{
    id: string;
    category: "resale" | "rental" | "newProperty";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showEditRentalModal, setShowEditRentalModal] = useState(false);
  const [editingRentalProperty, setEditingRentalProperty] =
    useState<Property | null>(null);
  const [rentalCurrentStep, setRentalCurrentStep] = useState(0);

  // Add state for user data mapping
  const [userDataMap, setUserDataMap] = useState<{ [key: string]: User }>({});

  // Rental form states for edit mode
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [stationSide, setStationSide] = useState("");

  // Rental form
  const {
    register: registerRental,
    handleSubmit: handleSubmitRental,
    formState: { errors: errorsRental },
    reset: resetRental,
    watch: watchRental,
    setValue: setValueRental,
  } = useForm<RentalFormData>();

  // Resale form
  const {
    register: registerResale,
    handleSubmit: handleSubmitResale,
    formState: { errors: errorsResale },
    reset: resetResale,
    watch: watchResale,
    setValue: setValueResale,
  } = useForm<ResaleFormData>();

  const normalizeStationName = (name: string) => {
    return name.replace(/\s+(East|West)$/i, "").trim();
  };

  const Field = ({ label, value }: { label: string; value: unknown }) => {
    const displayValue =
      typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value ?? "-");

    return (
      <div className="text-sm">
        <div className="text-neutral-500 font-medium">{label}</div>
        <div className="text-neutral-800">{displayValue}</div>
      </div>
    );
  };

  const handleEditRental = (property: Property) => {
    setEditingRentalProperty(property);
    setRentalCurrentStep(0);

    // Parse station and direction
    const stationValue = property.station || "";
    const hasDir = /(East|West)$/i.test(stationValue);
    if (hasDir) {
      const dir = stationValue.match(/(East|West)$/i)![0];
      const base = stationValue.replace(/\s+(East|West)$/i, "").trim();
      setSelectedStation(base);
      setStationSide(dir);
      setValueRental("station", `${base} ${dir}`);
    } else {
      setSelectedStation(stationValue);
      setStationSide("");
      setValueRental("station", stationValue);
    }

    // Set state and district for editing
    if (property.state) {
      const stateObj = states.find((state) => state.name === property.state);
      if (stateObj) {
        setSelectedStateCode(stateObj.iso2);
        import("../utils/api").then(({ fetchCities }) => {
          fetchCities(stateObj.iso2)
            .then((citiesData) => {
              setCities(citiesData);
            })
            .catch((error) => {
              
            });
        });
      }
    }

    // Prefill form fields
    resetRental({
      society: property.society || "",
      sublocation: property.sublocation || "",
      landmark: property.landmark || "",
      pincode: property.pincode || property.pinCode || "",
      station: property.station || "",
      district: property.district || "",
      state: property.state || "",
      type: property.type || "",
      masterBed: property.masterBed ? "true" : "false",
      buildingNo: property.buildingNo || "",
      flatNo: property.flatNo?.toString() || "",
      floorNo: property.floorNo?.toString() || "",
      totalFloors: property.totalFloors?.toString() || "",
      propertyAge: property.propertyAge?.toString() || "",
      amenities: property.amenities || [],
      furnishing: property.furnishing || "",
      parking: property.parking || "",
      terraceGallery: property.terraceGallery || "",
      cosmoSociety: property.cosmo ? "true" : "false",
      expectedRent: property.rent?.toString() || "",
      securityDeposit: property.deposit?.toString() || "",
      negotiable: property.negotiable ? "true" : "false",
      ownerName: property.contactName || "",
      ownerNumber: property.contactNumber || "",
      connectedPerson: property.connectedPerson || "",
      imageUrl: property.imageUrl || "",
      videoUrl: property.videoUrl || "",
    } as RentalFormData);

    setShowEditRentalModal(true);
  };

  const handleRentalNext = async () => {
    const fieldsToValidate = {
      0: ["society", "pincode", "station", "district", "state"],
      1: [
        "type",
        "buildingNo",
        "flatNo",
        "floorNo",
        "totalFloors",
        "propertyAge",
        "furnishing",
        "parking",
        "terraceGallery",
        "cosmoSociety",
        "expectedRent",
        "securityDeposit",
        "negotiable",
      ],
      2: ["ownerName", "ownerNumber"],
    };
    const fields =
      fieldsToValidate[rentalCurrentStep as keyof typeof fieldsToValidate] ||
      [];
    const isValid = await triggerRental(fields as any);

    if (!isValid) {
      toast.error("Please fill all required fields in this step");
      return;
    }

    if (rentalCurrentStep < 2) {
      setRentalCurrentStep((s) => s + 1);
    }
  };

  const onSubmitRentalEdit = async (data: RentalFormData) => {
    if (!editingRentalProperty || !user) return;

    setActionLoading(true);
    try {
      const processedData = {
        ...data,
        rent: data.expectedRent ? Number(data.expectedRent) : undefined,
        deposit: data.securityDeposit
          ? Number(data.securityDeposit)
          : undefined,
        cosmo: data.cosmoSociety === "true",
        station: stationSide
          ? `${selectedStation} ${stationSide}`
          : selectedStation,
        amenities: data.amenities || [],
        masterBed: data.masterBed === "true",
        contactName: data.ownerName,
        contactNumber: data.ownerNumber,
        negotiable: data.negotiable === "true",
        flatNo: data.flatNo ? Number(data.flatNo) : undefined,
        floorNo: data.floorNo ? Number(data.floorNo) : undefined,
        totalFloors: data.totalFloors ? Number(data.totalFloors) : undefined,
        propertyAge: data.propertyAge ? Number(data.propertyAge) : undefined,
        isApproved: false,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
      };

      await updateRentalProperty(
        editingRentalProperty.userId!,
        editingRentalProperty.docId || editingRentalProperty.id,
        processedData
      );
      toast.success("Rental property updated successfully. Awaiting approval.");

      setShowEditRentalModal(false);
      setEditingRentalProperty(null);
      setRentalCurrentStep(0);

      // Refresh data
      window.location.reload();
    } catch (error) {
      
      toast.error("Failed to update property. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Resale form handling
  const [showEditResaleModal, setShowEditResaleModal] = useState(false);
  const [editingResaleProperty, setEditingResaleProperty] =
    useState<Property | null>(null);
  const [resaleCurrentStep, setResaleCurrentStep] = useState(0);

  const handleEditResale = (property: Property) => {
    setEditingResaleProperty(property);
    setResaleCurrentStep(0);

    // Parse station and direction
    const stationValue = property.station || "";
    const hasDir = /(East|West)$/i.test(stationValue);
    if (hasDir) {
      const dir = stationValue.match(/(East|West)$/i)![0];
      const base = stationValue.replace(/\s+(East|West)$/i, "").trim();
      setSelectedStation(base);
      setStationSide(dir);
      setValueResale("station", `${base} ${dir}`);
    } else {
      setSelectedStation(stationValue);
      setStationSide("");
      setValueResale("station", stationValue);
    }

    // Set state and district for editing
    if (property.state) {
      const stateObj = states.find((state) => state.name === property.state);
      if (stateObj) {
        setSelectedStateCode(stateObj.iso2);
        import("../utils/api").then(({ fetchCities }) => {
          fetchCities(stateObj.iso2)
            .then((citiesData) => {
              setCities(citiesData);
            })
            .catch((error) => {
              
            });
        });
      }
    }

    // Prefill form fields
    resetResale({
      society: property.society || "",
      sublocation: property.sublocation || "",
      landmark: property.landmark || "",
      pincode: property.pincode || property.pinCode || "",
      station: property.station || "",
      district: property.district || "",
      state: property.state || "",
      type: property.type || "",
      masterBed: property.masterBed ? "true" : "false",
      buildingNo: property.buildingNo || "",
      flatNo: property.flatNo?.toString() || "",
      floorNo: property.floorNo?.toString() || "",
      totalFloors: property.totalFloors?.toString() || "",
      carpetArea: property.carpetArea?.toString() || "",
      builtUpArea: property.builtUpArea?.toString() || "",
      propertyAge: property.propertyAge?.toString() || "",
      ocAvailable: property.ocAvailable ? "true" : "false",
      cosmoSociety: property.cosmo ? "true" : "false",
      expectedPrice: property.expectedPrice?.toString() || "",
      negotiable: property.negotiable ? "true" : "false",
      maintenance: property.maintenance?.toString() || "",
      ownerName: property.ownerName || "",
      ownerNumber: property.ownerNumber || "",
      connectedPerson: property.connectedPerson || "",
      imageUrl: property.imageUrl || "",
      videoUrl: property.videoUrl || "",
    } as ResaleFormData);

    setShowEditResaleModal(true);
  };

  const onSubmitResaleEdit = async (data: ResaleFormData) => {
    if (!editingResaleProperty || !user) return;

    setActionLoading(true);
    try {
      const processedData = {
        ...data,
        expectedPrice: data.expectedPrice
          ? Number(data.expectedPrice)
          : undefined,
        carpetArea: data.carpetArea ? Number(data.carpetArea) : undefined,
        builtUpArea: data.builtUpArea ? Number(data.builtUpArea) : undefined,
        maintenance: data.maintenance ? Number(data.maintenance) : undefined,
        terrace: data.terrace === "true",
        cosmoSociety: data.cosmoSociety,
        ocStatus: data.ocAvailable === "true" ? "Available" : "Not Available",
        station: stationSide
          ? `${selectedStation} ${stationSide}`
          : selectedStation,
        amenities: data.amenities || [],
        masterBed: data.masterBed === "true",
        flatNo: data.flatNo ? Number(data.flatNo) : undefined,
        floorNo: data.floorNo ? Number(data.floorNo) : undefined,
        totalFloors: data.totalFloors ? Number(data.totalFloors) : undefined,
        propertyAge: data.propertyAge ? Number(data.propertyAge) : undefined,
        negotiable: data.negotiable === "true",
        ocAvailable: data.ocAvailable === "true",
        cosmo: data.cosmoSociety === "true",
        contactName: data.ownerName,
        contactNumber: data.ownerNumber,
        isApproved: false,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
      };

      await updateResaleProperty(
        editingResaleProperty.userId!,
        editingResaleProperty.docId || editingResaleProperty.id,
        processedData
      );
      toast.success("Resale property updated successfully. Awaiting approval.");

      setShowEditResaleModal(false);
      setEditingResaleProperty(null);
      setResaleCurrentStep(0);

      // Refresh data
      window.location.reload();
    } catch (error) {
      
      toast.error("Failed to update property. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const rentalSteps = [
    {
      label: "Basic Details",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="society"
            label="Building/Society Name"
            error={errorsRental.society?.message}
            {...registerRental("society", {
              required: "Building/Society name is required",
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueRental("society", formatted);
                return formatted;
              },
            })}
          />
          <Input
            id="sublocation"
            label="Sublocation"
            error={errorsRental.sublocation?.message}
            {...registerRental("sublocation", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueRental("sublocation", formatted);
                return formatted;
              },
            })}
          />
          <Input
            id="landmark"
            label="Landmark"
            error={errorsRental.landmark?.message}
            {...registerRental("landmark", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueRental("landmark", formatted);
                return formatted;
              },
            })}
          />
          <Input
            id="pincode"
            label="PIN Code"
            type="text"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
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
            {...registerRental("pincode", {
              required: "PIN code is required",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Enter valid 6-digit PIN code",
              },
            })}
          />
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Station</label>
            <div className="relative">
              <input
                id="station"
                type="text"
                value={selectedStation}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedStation(val);
                  const fullStation =
                    stationSide && !val.includes(stationSide)
                      ? `${val} ${stationSide}`
                      : val;
                  setValueRental("station", fullStation);
                }}
                placeholder="Enter station name"
                className="w-full border border-neutral-300 rounded px-3 py-2 pr-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                {["East", "West"].map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => {
                      const newSide = stationSide === side ? "" : side;
                      setStationSide(newSide);
                      const fullStation = newSide
                        ? `${selectedStation} ${newSide}`
                        : selectedStation;
                      setValueRental("station", fullStation);
                    }}
                    className={`px-2 py-1 text-xs rounded-full transition-all ${
                      stationSide === side
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">
              State & District
            </label>
            <div className="flex gap-1">
              <select
                id="state"
                value={selectedStateCode}
                onChange={async (e) => {
                  const stateCode = e.target.value;
                  setSelectedStateCode(stateCode);
                  const selectedState = states.find(
                    (state) => state.iso2 === stateCode
                  );
                  const stateName = selectedState ? selectedState.name : "";
                  setValueRental("state", stateName);
                  setValueRental("district", "");
                  if (stateCode) {
                    try {
                      const { fetchCities } = await import("../utils/api");
                      const citiesData = await fetchCities(stateCode);
                      setCities(citiesData);
                    } catch (error) {
                      
                      setCities([]);
                    }
                  } else {
                    setCities([]);
                  }
                }}
                className="w-1/2 border border-neutral-300 rounded px-2 py-2 text-sm"
              >
                <option value="">State</option>
                {states.map((state) => (
                  <option key={state.iso2} value={state.iso2}>
                    {state.name}
                  </option>
                ))}
              </select>
              <select
                id="district"
                value={watchRental("district") || ""}
                onChange={(e) => setValueRental("district", e.target.value)}
                disabled={!selectedStateCode}
                className="w-1/2 border border-neutral-300 rounded px-2 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="">District</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Property Details",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableDropdown
            label="Configuration"
            value={watchRental("type")}
            onChange={(val) => setValueRental("type", val)}
            options={propertyTypes}
            error={errorsRental.type?.message}
          />
          {watchRental("type") === "1 BHK" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Master Bed
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...registerRental("masterBed")}
                    className="h-4 w-4 text-primary border-neutral-300"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...registerRental("masterBed")}
                    className="h-4 w-4 text-primary border-neutral-300"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          )}
          <Input
            id="buildingNo"
            label="Building No./Wing"
            error={errorsRental.buildingNo?.message}
            {...registerRental("buildingNo", {
              required: "Building No./Wing is required",
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueRental("buildingNo", formatted);
                return formatted;
              },
            })}
          />
          <Input
            id="flatNo"
            label="Flat No."
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
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
            {...registerRental("flatNo", {
              required: "Flat No. is required",
            })}
          />
          <Input
            id="floorNo"
            label="Floor No."
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
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
            {...registerRental("floorNo", {
              required: "Floor No. is required",
            })}
          />
          <Input
            id="totalFloors"
            label="Total Floors"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
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
            {...registerRental("totalFloors", {
              required: "Total floors is required",
            })}
          />
          <Input
            id="propertyAge"
            label="Property Age (years)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
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
            {...registerRental("propertyAge", {
              required: "Property age is required",
            })}
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amenities
            </label>
            <input
              type="text"
              placeholder="Enter amenities separated by commas"
              value={
                Array.isArray(watchRental("amenities"))
                  ? watchRental("amenities").join(", ")
                  : ""
              }
              onChange={(e) => {
                const amenities = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean);
                setValueRental("amenities", amenities);
              }}
              className="w-full border border-neutral-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <SearchableDropdown
            label="Furnishing"
            value={watchRental("furnishing")}
            onChange={(val) => setValueRental("furnishing", val)}
            options={furnishingOptions}
            error={errorsRental.furnishing?.message}
          />
          <SearchableDropdown
            label="Parking"
            value={watchRental("parking")}
            onChange={(val) => setValueRental("parking", val)}
            options={parkingOptions}
            error={errorsRental.parking?.message}
          />
          <SearchableDropdown
            label="Terrace/Gallery"
            value={watchRental("terraceGallery")}
            onChange={(val) => setValueRental("terraceGallery", val)}
            options={[
              { value: "Terrace", label: "Terrace" },
              { value: "Gallery", label: "Gallery" },
            ]}
            error={errorsRental.terraceGallery?.message}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Cosmo Society
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="true"
                  {...registerRental("cosmoSociety", {
                    required: "Please select Cosmo society",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="false"
                  {...registerRental("cosmoSociety", {
                    required: "Please select Cosmo society",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {errorsRental.cosmoSociety?.message && (
              <p className="text-error text-sm mt-1">
                {errorsRental.cosmoSociety.message}
              </p>
            )}
          </div>
          <Input
            id="expectedRent"
            label="Expected Rent (₹)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
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
            {...registerRental("expectedRent", {
              required: "Expected rent is required",
            })}
          />
          <Input
            id="securityDeposit"
            label="Security Deposit (₹)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
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
            {...registerRental("securityDeposit", {
              required: "Security deposit is required",
            })}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Negotiable
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="true"
                  {...registerRental("negotiable", {
                    required: "Please select negotiable option",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="false"
                  {...registerRental("negotiable", {
                    required: "Please select negotiable option",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {errorsRental.negotiable?.message && (
              <p className="text-error text-sm mt-1">
                {errorsRental.negotiable.message}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      label: "Others",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="ownerName"
            label="Owner Name"
            error={errorsRental.ownerName?.message}
            {...registerRental("ownerName", {
              required: "Owner name is required",
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueRental("ownerName", formatted);
                return formatted;
              },
            })}
          />
          <Input
            id="ownerNumber"
            label="Owner Number"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
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
            {...registerRental("ownerNumber", {
              required: "Owner number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter valid 10-digit number",
              },
            })}
          />
          <Input
            id="connectedPerson"
            label="Connected Person"
            placeholder="Employee name"
            error={errorsRental.connectedPerson?.message}
            {...registerRental("connectedPerson", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueRental("connectedPerson", formatted);
                return formatted;
              },
            })}
          />
          <Input
            id="imageUrl"
            label="Image URL"
            error={errorsRental.imageUrl?.message}
            {...registerRental("imageUrl")}
          />
          <Input
            id="videoUrl"
            label="Video URL"
            error={errorsRental.videoUrl?.message}
            {...registerRental("videoUrl")}
          />
        </div>
      ),
    },
  ];

  // Helper function to get user info by ID
  const getUserInfo = (userId: string) => {
    return userDataMap[userId] || null;
  };

  const fetchCostSheetStations = async () => {
    try {
      // Count available stations (normalized)
      const availableStations = new Set<string>();

      // Fetch from costSheets
      const costSheetsSnap = await getDocs(collection(db, "costSheets"));

      costSheetsSnap.forEach((doc) => {
        const data = doc.data();

        if (data.station) {
          const normalized = normalizeStationName(data.station).toLowerCase();
          availableStations.add(normalized);
        }

        if (data.availableStations?.length) {
          data.availableStations.forEach((station: string) => {
            const normalized = normalizeStationName(station).toLowerCase();

            availableStations.add(normalized);
          });
        }
      });

      const availableCount = availableStations.size;
      const staticCount = stations.length;

      // Show static stations if available < static, otherwise show only available stations
      if (availableCount < staticCount) {
        setCostSheetStationsCount(staticCount);
        setAllMergedStations(stations.map((s) => ({ id: s.id, name: s.name })));
      } else {
        setCostSheetStationsCount(availableCount);

        // Create list with only available stations from costSheets
        const availableStationsList: { id: string; name: string }[] = [];
        const seen = new Set<string>();

        // Add only costSheets stations
        costSheetsSnap.forEach((doc) => {
          const data = doc.data();

          if (data.station) {
            const normalized = normalizeStationName(data.station).toLowerCase();
            if (!seen.has(normalized)) {
              seen.add(normalized);
              availableStationsList.push({
                id: `costsheet-${data.station
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`,
                name: normalizeStationName(data.station),
              });
            }
          }

          if (data.availableStations?.length) {
            data.availableStations.forEach((station: string) => {
              const normalized = normalizeStationName(station).toLowerCase();
              if (!seen.has(normalized)) {
                seen.add(normalized);
                availableStationsList.push({
                  id: `costsheet-${station.toLowerCase().replace(/\s+/g, "-")}`,
                  name: normalizeStationName(station),
                });
              }
            });
          }
        });

        setAllMergedStations(availableStationsList);
      }

      setCostSheetStationsLoaded(true);
    } catch (error) {
      
      setCostSheetStationsLoaded(true);
    }
  };

  const getDynamicCostSheetStationCount = () => {
    if (!costSheetStationsLoaded) return stations.length;
    return costSheetStationsCount;
  };

  const isDisabled =
    !pricing.rentalResalePrice ||
    !pricing.newPropertyPrice ||
    !pricing.resalePrice ||
    !pricing.rentalPrice ||
    !pricing.actualPrice ||
    !pricing.offerPrice;

  const isAddStationDisabled = !pricing.newStationName?.trim();

  useEffect(() => {
    if (!user || !permissions.canViewUsers()) return;
    let costSheetsUnsubscribe: (() => void) | undefined;
    const fetchData = async () => {
      try {
        setLoading(true);
        const allUsers = await getUsers();

        // Fetch subscription counts for all users in parallel
        const usersWithCounts = await Promise.all(
          allUsers.map(async (user: User) => {
            // Get subscription count
            const subscriptionsRef = collection(
              db,
              `users/${user.id}/subscriptions`
            );
            const querySnapshot = await getDocs(subscriptionsRef);
            const subscriptionCount = querySnapshot.size;

            return {
              ...user,
              subscriptionCount,
              role: user.role || "user",
              id: user.id,
              fullName: user.fullName,
              phone: user.phone,
              email: user.email,
              city: user.city,
              state: user.state,
              reraNumber: user.reraNumber,
              isAdmin: user.role === "admin",
              password: "",
              location: { lat: 0, lng: 0 },
            };
          })
        );

        setUsers(usersWithCounts);

        // Create user data map for quick lookup
        const userMap: { [key: string]: User } = {};
        usersWithCounts.forEach((user) => {
          userMap[user.id] = user;
        });
        setUserDataMap(userMap);

        // Fetch all user properties in parallel
        const resalePromises = usersWithCounts.map((user) =>
          getResaleProperties(user.id)
        );
        const rentalPromises = usersWithCounts.map((user) =>
          getRentalProperties(user.id)
        );

        const allResaleResults = await Promise.all(resalePromises);
        const allRentalResults = await Promise.all(rentalPromises);

        // Fetch new properties (cost sheets) with real-time listener
        const { getCostSheets } = await import("../utils/firestoreListings");
        const allNewProperties = await getCostSheets();

        // Set up real-time listener for cost sheets
        costSheetsUnsubscribe = onSnapshot(
          collection(db, "costSheets"),
          (snapshot) => {
            const updatedNewProperties = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setInventory((prev) => ({
              ...prev,
              newProperties: updatedNewProperties,
            }));
          },
          (error) => {
            
          }
        );

        // Convert Firestore timestamps to Date objects
        const allResale = allResaleResults.flat().map((prop: Property) => ({
          ...prop,
          createdAt: prop.createdAt, // keep as Timestamp for Firestore compatibility
        }));

        const allRental = allRentalResults.flat().map((prop: Property) => ({
          ...prop,
          createdAt: prop.createdAt, // keep as Timestamp for Firestore compatibility
        }));

        setInventory({
          resale: allResale,
          rental: allRental,
          newProperties: allNewProperties,
        });
      } catch (error) {
        
        toast.error("Failed to fetch admin data. Please try again later.");
      } finally {
        setLoading(false);
      }

      // Cleanup function will be returned by useEffect
      return () => {
        if (typeof costSheetsUnsubscribe === "function") {
          costSheetsUnsubscribe();
        }
      };
    };

    fetchData();
  }, [user]);

  const triggerRental = async (fields: string[]) => {
    // Simple validation trigger for rental form
    return true; // Implement proper validation if needed
  };

  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    getPricing().then((data) => {
      setPricingState({
        rentalResalePrice: data.rentalResalePrice || 2500,
        newPropertyPrice: data.newPropertyPrice || 1500,
        resalePrice: data.resalePrice || 2500,
        rentalPrice: data.rentalPrice || 2500,
      });

      // Set current pricing for reference
      setCurrentPricing({
        actualPrice: data.actualPrice,
        discountedPrice: data.discountedPrice,
      });

      // Initialize new property pricing
      if (data.newPropertyPricing) {
        setNewPropertyPricing(
          data.newPropertyPricing as { [key: string]: StationPricing }
        );
      } else {
        // Create default pricing for all stations
        const defaultPricing: { [key: string]: StationPricing } = {};
        stations.forEach((station) => {
          defaultPricing[station.id] = {
            actual: data.newPropertyPrice || 1500,
            offer: data.newPropertyPrice || 1500,
          };
        });
        setNewPropertyPricing(defaultPricing);
      }

      // Initialize custom station names
      if (data.newPropertyStationNames) {
        setCustomStationNames(data.newPropertyStationNames);
      }

      // Initialize duration discounts
      if (data.durationDiscounts) {
        setDurationDiscounts(data.durationDiscounts);
      }
    });

    // Fetch cost sheet stations count
    fetchCostSheetStations();
  }, []);

  // Removed unused handleNewPropertyPriceChange

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "stampDutyRates"),
      (snapshot) => {
        const liveRates: StampDutyRate[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<StampDutyRate, "id">;
          return {
            id: doc.id,
            ...data,
          };
        });
        setRates(liveRates);
      }
    );

    return () => unsubscribe(); // Clean up listener
  }, []);

  // Categorize properties based on isApproved and user role
  const getFilteredProperties = () => {
    const userRole = user?.role;

    // Helper function to sort properties by createdAt (newest first)
    const sortByCreatedAt = (properties: Property[]) => {
      return properties.sort(
        (a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
      );
    };

    // Helper function to sort new properties by createdAt (newest first)
    const sortNewPropertiesByCreatedAt = (properties: any[]) => {
      return properties.sort((a, b) => {
        const aDate = a.createdAt || a.dateUpdateCostSheet;
        const bDate = b.createdAt || b.dateUpdateCostSheet;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
    };

    if (userRole === "admin") {
      // Admin sees all properties
      return {
        pending: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) => !p.isApproved && !p.isRejected
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) => !p.isApproved && !p.isRejected
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) => !p.isApproved && !p.isRejected
            ) || []
          ),
        },
        approved: {
          resale: sortByCreatedAt(
            inventory.resale.filter((p: Property) => p.isApproved)
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter((p: Property) => p.isApproved)
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter((p: any) => p.isApproved) || []
          ),
        },
        rejected: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) => p.isRejected || p.rejectedAt
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) => p.isRejected || p.rejectedAt
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter((p: any) => p.isRejected) || []
          ),
        },
      };
    } else if (userRole === "manager") {
      // Manager sees executive submissions and their own
      return {
        pending: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) =>
                !p.isApproved &&
                !p.isRejected &&
                (p.submitterRole === "executive" || p.userId === user?.id)
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) =>
                !p.isApproved &&
                !p.isRejected &&
                (p.submitterRole === "executive" || p.userId === user?.id)
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) =>
                !p.isApproved &&
                !p.isRejected &&
                (p.submitterRole === "executive" || p.submittedBy === user?.id)
            ) || []
          ),
        },
        approved: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) =>
                p.isApproved &&
                (p.submitterRole === "executive" || p.userId === user?.id)
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) =>
                p.isApproved &&
                (p.submitterRole === "executive" || p.userId === user?.id)
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) =>
                p.isApproved &&
                (p.submitterRole === "executive" || p.submittedBy === user?.id)
            ) || []
          ),
        },
        rejected: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) =>
                (p.isRejected || p.rejectedAt) &&
                (p.submitterRole === "executive" || p.userId === user?.id)
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) =>
                (p.isRejected || p.rejectedAt) &&
                (p.submitterRole === "executive" || p.userId === user?.id)
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) =>
                p.isRejected &&
                (p.submitterRole === "executive" || p.submittedBy === user?.id)
            ) || []
          ),
        },
      };
    } else if (userRole === "executive") {
      // Executive sees only their own properties
      return {
        pending: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) =>
                !p.isApproved && !p.isRejected && p.userId === user?.id
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) =>
                !p.isApproved && !p.isRejected && p.userId === user?.id
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) =>
                !p.isApproved && !p.isRejected && p.submittedBy === user?.id
            ) || []
          ),
        },
        approved: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) => p.isApproved && p.userId === user?.id
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) => p.isApproved && p.userId === user?.id
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) => p.isApproved && p.submittedBy === user?.id
            ) || []
          ),
        },
        rejected: {
          resale: sortByCreatedAt(
            inventory.resale.filter(
              (p: Property) =>
                (p.isRejected || p.rejectedAt) && p.userId === user?.id
            )
          ),
          rental: sortByCreatedAt(
            inventory.rental.filter(
              (p: Property) =>
                (p.isRejected || p.rejectedAt) && p.userId === user?.id
            )
          ),
          newProperties: sortNewPropertiesByCreatedAt(
            inventory.newProperties?.filter(
              (p: any) => p.isRejected && p.submittedBy === user?.id
            ) || []
          ),
        },
      };
    }

    return {
      pending: { resale: [], rental: [], newProperties: [] },
      approved: { resale: [], rental: [], newProperties: [] },
      rejected: { resale: [], rental: [], newProperties: [] },
    };
  };

  const {
    pending: pendingProperties,
    approved: approvedProperties,
    rejected: rejectedProperties,
  } = getFilteredProperties();

  // Helper function to filter and sort approved properties
  const getFilteredApprovedProperties = () => {
    const filterResale = (properties: Property[]) => {
      let filtered = properties.filter((property) => {
        const searchTerm = approvedSearchTerms.resale.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          property.society?.toLowerCase().includes(searchTerm) ||
          property.roadLocation?.toLowerCase().includes(searchTerm) ||
          property.sublocation?.toLowerCase().includes(searchTerm) ||
          property.type?.toLowerCase().includes(searchTerm) ||
          property.station?.toLowerCase().includes(searchTerm);

        const matchesType =
          !approvedFilters.resale.type ||
          property.type === approvedFilters.resale.type;

        return matchesSearch && matchesType;
      });

      // Sort properties
      if (approvedFilters.resale.sort) {
        filtered.sort((a, b) => {
          switch (approvedFilters.resale.sort) {
            case "date-desc":
              return (
                toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
              );
            case "date-asc":
              return (
                toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
              );
            case "price-desc":
              return (b.expectedPrice || 0) - (a.expectedPrice || 0);
            case "price-asc":
              return (a.expectedPrice || 0) - (b.expectedPrice || 0);
            default:
              return 0;
          }
        });
      }

      return filtered;
    };

    const filterRental = (properties: Property[]) => {
      let filtered = properties.filter((property) => {
        const searchTerm = approvedSearchTerms.rental.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          property.society?.toLowerCase().includes(searchTerm) ||
          property.roadLocation?.toLowerCase().includes(searchTerm) ||
          property.sublocation?.toLowerCase().includes(searchTerm) ||
          property.type?.toLowerCase().includes(searchTerm) ||
          property.station?.toLowerCase().includes(searchTerm);

        const matchesType =
          !approvedFilters.rental.type ||
          property.type === approvedFilters.rental.type;

        return matchesSearch && matchesType;
      });

      // Sort properties
      if (approvedFilters.rental.sort) {
        filtered.sort((a, b) => {
          switch (approvedFilters.rental.sort) {
            case "date-desc":
              return (
                toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
              );
            case "date-asc":
              return (
                toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
              );
            case "rent-desc":
              return (b.rent || 0) - (a.rent || 0);
            case "rent-asc":
              return (a.rent || 0) - (b.rent || 0);
            default:
              return 0;
          }
        });
      }

      return filtered;
    };

    const filterNewProperties = (properties: any[]) => {
      let filtered = properties.filter((property) => {
        const searchTerm = approvedSearchTerms.newProperty.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          property.projectName?.toLowerCase().includes(searchTerm) ||
          property.developerName?.toLowerCase().includes(searchTerm) ||
          property.station?.toLowerCase().includes(searchTerm) ||
          property.subLocation?.toLowerCase().includes(searchTerm);

        const matchesBHK =
          !approvedFilters.newProperty.bhk ||
          property.flatType === approvedFilters.newProperty.bhk;

        return matchesSearch && matchesBHK;
      });

      // Sort properties
      if (approvedFilters.newProperty.sort) {
        filtered.sort((a, b) => {
          switch (approvedFilters.newProperty.sort) {
            case "date-desc":
              const aDate = a.createdAt || a.dateUpdateCostSheet;
              const bDate = b.createdAt || b.dateUpdateCostSheet;
              return new Date(bDate).getTime() - new Date(aDate).getTime();
            case "date-asc":
              const aDateAsc = a.createdAt || a.dateUpdateCostSheet;
              const bDateAsc = b.createdAt || b.dateUpdateCostSheet;
              return (
                new Date(aDateAsc).getTime() - new Date(bDateAsc).getTime()
              );
            case "carpet-desc":
              return (
                (parseFloat(b.reraCarpet) || 0) -
                (parseFloat(a.reraCarpet) || 0)
              );
            case "carpet-asc":
              return (
                (parseFloat(a.reraCarpet) || 0) -
                (parseFloat(b.reraCarpet) || 0)
              );
            default:
              return 0;
          }
        });
      }

      return filtered;
    };

    return {
      resale: filterResale(approvedProperties.resale),
      rental: filterRental(approvedProperties.rental),
      newProperties: filterNewProperties(
        approvedProperties.newProperties || []
      ),
    };
  };

  const filteredApprovedProperties = getFilteredApprovedProperties();

  // Helper functions to get available property types from actual data
  const getAvailableResaleTypes = () => {
    const types = new Set<string>();
    approvedProperties.resale.forEach((property) => {
      if (property.type) {
        types.add(property.type);
      }
    });
    return Array.from(types).sort();
  };

  const getAvailableRentalTypes = () => {
    const types = new Set<string>();
    approvedProperties.rental.forEach((property) => {
      if (property.type) {
        types.add(property.type);
      }
    });
    return Array.from(types).sort();
  };

  const getAvailableNewPropertyTypes = () => {
    const types = new Set<string>();
    (approvedProperties.newProperties || []).forEach((property) => {
      if (property.flatType) {
        types.add(property.flatType);
      }
    });
    return Array.from(types).sort();
  };

  // Helper functions for pending properties
  const getPendingResaleTypes = () => {
    const types = new Set<string>();
    pendingProperties.resale.forEach((property) => {
      if (property.type) {
        types.add(property.type);
      }
    });
    return Array.from(types).sort();
  };

  const getDeduplicatedPendingResaleCount = () => {
    const uniqueProperties = new Map();
    pendingProperties.resale.forEach((property) => {
      const uniqueKey = `${property.id}-${property.userId || "no-user"}`;
      if (!uniqueProperties.has(uniqueKey)) {
        uniqueProperties.set(uniqueKey, property);
      }
    });
    return uniqueProperties.size;
  };

  // Helper functions for rejected properties
  const getRejectedResaleTypes = () => {
    const types = new Set<string>();
    rejectedProperties.resale.forEach((property) => {
      if (property.type) {
        types.add(property.type);
      }
    });
    return Array.from(types).sort();
  };

  const getRejectedRentalTypes = () => {
    const types = new Set<string>();
    rejectedProperties.rental.forEach((property) => {
      if (property.type) {
        types.add(property.type);
      }
    });
    return Array.from(types).sort();
  };

  const getRejectedNewPropertyTypes = () => {
    const types = new Set<string>();
    (rejectedProperties.newProperties || []).forEach((property) => {
      if (property.flatType) {
        types.add(property.flatType);
      }
    });
    return Array.from(types).sort();
  };

  // Helper function to filter and sort rejected properties
  const getFilteredRejectedProperties = () => {
    const filterResale = (properties: Property[]) => {
      let filtered = properties.filter((property) => {
        const searchTerm = rejectedSearchTerms.resale.toLowerCase().trim();
        const matchesSearch =
          !searchTerm ||
          property.society?.toLowerCase().includes(searchTerm) ||
          property.roadLocation?.toLowerCase().includes(searchTerm) ||
          property.sublocation?.toLowerCase().includes(searchTerm) ||
          property.type?.toLowerCase().includes(searchTerm) ||
          property.station?.toLowerCase().includes(searchTerm);

        const matchesType =
          !rejectedFilters.resale.type ||
          rejectedFilters.resale.type === "" ||
          property.type === rejectedFilters.resale.type;

        return matchesSearch && matchesType;
      });

      if (rejectedFilters.resale.sort) {
        filtered.sort((a, b) => {
          switch (rejectedFilters.resale.sort) {
            case "date-desc":
              return (
                toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
              );
            case "date-asc":
              return (
                toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
              );
            case "price-desc":
              return (b.expectedPrice || 0) - (a.expectedPrice || 0);
            case "price-asc":
              return (a.expectedPrice || 0) - (b.expectedPrice || 0);
            default:
              return 0;
          }
        });
      }

      return filtered;
    };

    const filterRental = (properties: Property[]) => {
      let filtered = properties.filter((property) => {
        const searchTerm = rejectedSearchTerms.rental.toLowerCase().trim();
        const matchesSearch =
          !searchTerm ||
          property.society?.toLowerCase().includes(searchTerm) ||
          property.roadLocation?.toLowerCase().includes(searchTerm) ||
          property.sublocation?.toLowerCase().includes(searchTerm) ||
          property.type?.toLowerCase().includes(searchTerm) ||
          property.station?.toLowerCase().includes(searchTerm);

        const matchesType =
          !rejectedFilters.rental.type ||
          rejectedFilters.rental.type === "" ||
          property.type === rejectedFilters.rental.type;

        return matchesSearch && matchesType;
      });

      if (rejectedFilters.rental.sort) {
        filtered.sort((a, b) => {
          switch (rejectedFilters.rental.sort) {
            case "date-desc":
              return (
                toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
              );
            case "date-asc":
              return (
                toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
              );
            case "rent-desc":
              return (b.rent || 0) - (a.rent || 0);
            case "rent-asc":
              return (a.rent || 0) - (b.rent || 0);
            default:
              return 0;
          }
        });
      }

      return filtered;
    };

    const filterNewProperties = (properties: any[]) => {
      let filtered = properties.filter((property) => {
        const searchTerm = rejectedSearchTerms.newProperty.toLowerCase().trim();
        const matchesSearch =
          !searchTerm ||
          property.projectName?.toLowerCase().includes(searchTerm) ||
          property.developerName?.toLowerCase().includes(searchTerm) ||
          property.station?.toLowerCase().includes(searchTerm) ||
          property.subLocation?.toLowerCase().includes(searchTerm);

        const matchesBHK =
          !rejectedFilters.newProperty.bhk ||
          rejectedFilters.newProperty.bhk === "" ||
          property.flatType === rejectedFilters.newProperty.bhk;

        return matchesSearch && matchesBHK;
      });

      if (rejectedFilters.newProperty.sort) {
        filtered.sort((a, b) => {
          switch (rejectedFilters.newProperty.sort) {
            case "date-desc":
              const aDate = a.createdAt || a.dateUpdateCostSheet;
              const bDate = b.createdAt || b.dateUpdateCostSheet;
              return new Date(bDate).getTime() - new Date(aDate).getTime();
            case "date-asc":
              const aDateAsc = a.createdAt || a.dateUpdateCostSheet;
              const bDateAsc = b.createdAt || b.dateUpdateCostSheet;
              return (
                new Date(aDateAsc).getTime() - new Date(bDateAsc).getTime()
              );
            case "carpet-desc":
              return (
                (parseFloat(b.reraCarpet) || 0) -
                (parseFloat(a.reraCarpet) || 0)
              );
            case "carpet-asc":
              return (
                (parseFloat(a.reraCarpet) || 0) -
                (parseFloat(b.reraCarpet) || 0)
              );
            default:
              return 0;
          }
        });
      }

      return filtered;
    };

    return {
      resale: filterResale(rejectedProperties.resale),
      rental: filterRental(rejectedProperties.rental),
      newProperties: filterNewProperties(
        rejectedProperties.newProperties || []
      ),
    };
  };

  const filteredRejectedProperties = getFilteredRejectedProperties();

  const handleApproveProperty = async (
    docId: string,
    category: "resale" | "rental"
  ) => {
    try {
      setActionLoading(true);

      // Find the property in pending list using document ID
      const property = pendingProperties[category]?.find(
        (p: Property) => p.docId === docId || p.id === docId
      );

      if (!property) {
        toast.error("Property not found in pending list");
        setActionLoading(false);
        return;
      }

      if (!property.userId) {
        toast.error("Property missing user information");
        setActionLoading(false);
        return;
      }

      // Use the actual Firestore document ID, not the internal id field
      await updatePropertyStatus(property.userId, category, docId, {
        isApproved: true,
      });

      // Update local state to remove from pending and add to approved list
      setInventory((prev) => {
        const approvedProperty = { ...property, isApproved: true };
        return {
          ...prev,
          [category]: [
            ...prev[category].filter((p) => (p.docId || p.id) !== docId),
            approvedProperty,
          ],
        };
      });

      toast.success("Property approved!");
    } catch (error) {
      
      toast.error("Failed to approve property - " + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProperty = async (
    docId: string,
    category: "resale" | "rental" | "newProperty",
    reason: string
  ) => {
    try {
      setActionLoading(true);

      if (category === "newProperty") {
        // Update costSheets document for new properties
        const propertyRef = doc(db, "costSheets", docId);
        await updateDoc(propertyRef, {
          isApproved: false,
          isRejected: true,
          rejectedAt: serverTimestamp(),
          rejectedBy: user?.id || null,
          rejectorRole: user?.role || null,
          rejectionReason: reason,
          updatedAt: serverTimestamp(),
        });

        // Update local state
        setInventory((prev) => ({
          ...prev,
          newProperties:
            prev.newProperties?.map((p: any) =>
              p.id === docId
                ? {
                    ...p,
                    isApproved: false,
                    isRejected: true,
                    rejectionReason: reason,
                  }
                : p
            ) || [],
        }));
        toast.success("Property rejected!");
      } else {
        // Find the property in pending list using document ID
        const property = pendingProperties[category]?.find(
          (p: Property) => p.docId === docId || p.id === docId
        );

        if (!property) {
          toast.error("Property not found in pending list");
          setActionLoading(false);
          return;
        }

        if (!property.userId) {
          toast.error("Property missing user information");
          setActionLoading(false);
          return;
        }

        // Use the actual Firestore document ID, not the internal id field
        await updatePropertyStatus(property.userId, category, docId, {
          isApproved: false,
          isRejected: true,
          rejectedAt: serverTimestamp(),
          rejectedBy: user?.id || null,
          rejectorRole: user?.role || null,
          rejectionReason: reason,
        });

        // Update local state to remove from pending and add to rejected list
        setInventory((prev) => {
          const rejectedProperty = {
            ...property,
            isApproved: false,
            isRejected: true,
            rejectedAt: new Date(),
            rejectedBy: user?.id || null,
            rejectorRole: user?.role || null,
            rejectionReason: reason,
          };
          return {
            ...prev,
            [category]: [
              ...prev[category].filter((p) => (p.docId || p.id) !== docId),
              rejectedProperty,
            ],
          };
        });

        toast.success("Property rejected!");
      }
    } catch (error) {
      
      toast.error("Failed to reject property - " + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveNewProperty = async (id: string) => {
    try {
      setActionLoading(true);
      const property = inventory.newProperties?.find((p: any) => p.id === id);
      if (!property) {
        toast.error("Property not found");
        setActionLoading(false);
        return;
      }

      // Check if user has permission to approve new properties
      if (!permissions.canApproveNewProperty()) {
        toast.error("You do not have permission to approve new properties.");
        setActionLoading(false);
        return;
      }

      // Update property approval status
      const { updateCostSheet } = await import("../utils/firestoreListings");
      const updatedProperty = {
        ...property,
        isApproved: true,
        approvalStatus: "approved",
        approvedBy: user!.id,
        approvedAt: new Date().toISOString(),
        nextApprovalLevel: null,
      };

      await updateCostSheet(id, updatedProperty);

      // Update local UI state
      setInventory((prevInventory) => {
        const updatedNewProperties =
          prevInventory.newProperties?.map((p: any) =>
            p.id === id ? updatedProperty : p
          ) || [];

        return {
          ...prevInventory,
          newProperties: updatedNewProperties,
        };
      });

      toast.success("New property approved successfully!");
    } catch (error) {
      toast.error(
        "Failed to approve new property - " + (error as Error).message
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRejectedProperty = async (
    propertyId: string,
    category: "resale" | "rental" | "newProperty"
  ) => {
    try {
      setActionLoading(true);

      // Declare property variable outside if-else block
      let property: any = null;

      if (category === "newProperty") {
        // Handle new property approval
        const propertyRef = doc(db, "costSheets", propertyId);
        await updateDoc(propertyRef, {
          isApproved: true,
          isRejected: false,
          rejectedAt: deleteField(),
          rejectedBy: deleteField(),
          rejectorRole: deleteField(),
          rejectionReason: deleteField(),
          approvedAt: serverTimestamp(),
          approvedBy: user?.id,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Handle resale/rental property approval - need to find property first to get userId
        if (category === "resale") {
          property = rejectedProperties.resale?.find(
            (p: Property) => (p.docId || p.id) === propertyId
          );
        } else {
          property = rejectedProperties.rental?.find(
            (p: Property) => (p.docId || p.id) === propertyId
          );
        }

        if (!property) {

          toast.error("Property not found");
          return;
        }

        if (!property.userId) {

          toast.error("Property missing user information");
          return;
        }

        const collectionName =
          category === "resale" ? "resaleProperties" : "rentalProperties";
        const documentId = property.docId || property.id;
        const propertyRef = doc(
          db,
          "users",
          property.userId,
          collectionName,
          documentId
        );

        await updateDoc(propertyRef, {
          isApproved: true,
          isRejected: false,
          rejectedAt: deleteField(),
          rejectedBy: deleteField(),
          rejectorRole: deleteField(),
          rejectionReason: deleteField(),
          approvedAt: serverTimestamp(),
          approvedBy: user?.id,
          updatedAt: serverTimestamp(),
        });
      }

      // Update local state immediately for real-time UI update - remove from rejected list
      setInventory((prevInventory) => {
        if (category === "newProperty") {
          const updatedNewProperties =
            prevInventory.newProperties?.map((p: any) =>
              p.id === propertyId
                ? { ...p, isApproved: true, isRejected: false }
                : p
            ) || [];
          return { ...prevInventory, newProperties: updatedNewProperties };
        } else {
          const categoryKey = category as "resale" | "rental";
          // Remove from rejected list and add approved property
          const approvedProperty = {
            ...property,
            isApproved: true,
            isRejected: false,
            rejectedAt: null,
            rejectedBy: null,
            rejectorRole: null,
            rejectionReason: null,
          };
          const updatedCategory = [
            ...(prevInventory[categoryKey] || []).filter(
              (p: Property) => (p.docId || p.id) !== propertyId
            ),
            approvedProperty,
          ];
          return { ...prevInventory, [categoryKey]: updatedCategory };
        }
      });

      toast.success("Property approved successfully");
    } catch (error) {
      
      toast.error("Failed to approve property");
    } finally {
      setActionLoading(false);
    }
  };

  const viewUserDetails = async (user: User) => {
    setUserDetails(user);
    setSelectedRole(user.role);
    setEditingRole(false);
    setShowUserModal(true);

    // Fetch subscriptions for this user
    await fetchUserSubscriptions(user.id as string);
  };

  // Add role update handler
  const handleRoleUpdate = async () => {
    if (!userDetails) return;

    try {
      setActionLoading(true);
      await updateUserRole(userDetails.id, selectedRole);

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userDetails.id ? { ...u, role: selectedRole } : u
        )
      );

      setUserDetails({ ...userDetails, role: selectedRole });
      toast.success("Role updated successfully!");
      setEditingRole(false);
    } catch (error) {
      toast.error("Failed to update role: " + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // const makeUserAdmin = async (user: User) => {
  //   try {
  //     setActionLoading(true);
  //     if (user.role === 'admin') {
  //       // Remove admin rights
  //       await removeAdmin(user.id);
  //       toast.success("Admin rights removed!");
  //       setUsers((prev) =>
  //         prev.map((u) => (u.id === user.id ? { ...u, isAdmin: false } : u))
  //       );
  //     } else {
  //       // Promote to admin
  //       await makeAdmin(user.id);
  //       toast.success("User promoted to admin!");
  //       setUsers((prev) =>
  //         prev.map((u) => (u.id === user.id ? { ...u, isAdmin: true } : u))
  //       );
  //     }
  //     setShowUserModal(false);
  //   } catch (error) {
  //     toast.error(
  //       "Failed to update admin status  - " + (error as Error).message
  //     );
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  // Removed unused handlePriceChange

  // Removed unused savePricing function

  const handleAddRate = async () => {
    if (!newRate.jurisdiction || !newRate.rate) {
      toast.error("All fields are required");
      return;
    }

    try {
      const allDocs = await getDocs(collection(db, "stampDutyRates"));

      const inputJurisdiction = newRate.jurisdiction.trim().toLowerCase();
      const inputRate = newRate.rate.trim();

      const existingDoc = allDocs.docs.find((doc) => {
        const data = doc.data();
        const existingJurisdiction = data.jurisdiction?.toLowerCase().trim();
        return existingJurisdiction === inputJurisdiction;
      });

      const formattedJurisdiction = toTitleCase(newRate.jurisdiction.trim());

      if (existingDoc) {
        const existingData = existingDoc.data();
        const existingRate = existingData.rate?.toString().trim();

        if (existingRate === inputRate) {
          toast.error("Jurisdiction already exists with the same rate.");
          return;
        }

        // ✏️ Update only if rate differs
        await updateDoc(doc(db, "stampDutyRates", existingDoc.id), {
          jurisdiction: formattedJurisdiction,
          rate: newRate.rate,
        });
        toast.success("Stamp Duty rate updated!");
      } else {
        // ➕ Add new
        const ref = doc(collection(db, "stampDutyRates"));
        await setDoc(ref, {
          jurisdiction: formattedJurisdiction,
          rate: newRate.rate,
        });
        toast.success("Stamp Duty rate added!");
      }

      setNewRate({ jurisdiction: "", rate: "" });
      const updatedRates = await getStampDutyRates();
      setRates(updatedRates);
    } catch (err) {
      toast.error("Failed to save rate");
      
    }
  };

  // removed duplicate toTitleCase (already defined at top-level)

  const handleDeleteRate = async (id: string) => {
    try {
      await deleteDoc(doc(db, "stampDutyRates", id));
      toast.success("Stamp Duty rate deleted!");

      // Refresh the list after deletion
      const updatedRates = await getStampDutyRates();
      setRates(updatedRates);
    } catch (error) {
      
      toast.error("Failed to delete stamp duty rate");
    }
  };

  // Instant search with optimized filtering
  const filteredUsers = useMemo(() => {
    if (!searchTerm && roleFilter === "all") return users;

    const searchLower = searchTerm.toLowerCase();

    return users.filter((user) => {
      const roleMatch = roleFilter === "all" || user.role === roleFilter;

      if (!searchTerm) return roleMatch;

      const searchMatch =
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchTerm);

      return roleMatch && searchMatch;
    });
  }, [users, searchTerm, roleFilter]);

  const SubscriptionDisplay: React.FC<SubscriptionDisplayProps> = ({
    subscription,
  }) => {
    const getLocationText = () => {
      if (subscription.locations === "ALL") return "All Locations";
      if (Array.isArray(subscription.locations)) {
        return `${subscription.locations.length} Selected Locations`;
      }
      return "No Locations Specified";
    };

    return (
      <div className="p-3 bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium text-neutral-700">Type:</div>
          <div className="font-semibold">
            {subscription.type === "RR"
              ? "Rental/Resale"
              : subscription.type === "ND"
              ? "New Development"
              : "Unknown"}
          </div>

          <div className="font-medium text-neutral-700">Status:</div>
          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                subscription.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className="font-medium text-neutral-700">Amount:</div>
          <div>₹{subscription.amount?.toLocaleString("en-IN")}</div>

          {subscription.discountedPrice && (
            <>
              <div className="font-medium text-neutral-700">
                Discounted Price:
              </div>
              <div>₹{subscription.discountedPrice.toLocaleString("en-IN")}</div>
            </>
          )}

          <div className="font-medium text-neutral-700">Locations:</div>
          <div>{getLocationText()}</div>

          <div className="font-medium text-neutral-700">Start Date:</div>
          <div>{format(toDate(subscription.startDate), "dd MMM yyyy")}</div>

          <div className="font-medium text-neutral-700">End Date:</div>
          <div>{format(toDate(subscription.endDate), "dd MMM yyyy")}</div>
        </div>
      </div>
    );
  };

  const fetchUserSubscriptions = async (userId: string) => {
    try {
      setLoadingSubscriptions(true);

      // 🔥 Correct subcollection path
      const subscriptionsRef = collection(db, `users/${userId}/subscriptions`);
      const querySnapshot = await getDocs(subscriptionsRef);

      const subscriptions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Only pass Timestamp, not Date
        return {
          id: doc.id,
          ...data,
          startDate:
            data.startDate instanceof Timestamp
              ? data.startDate
              : Timestamp.fromDate(new Date(data.startDate)),
          endDate:
            data.endDate instanceof Timestamp
              ? data.endDate
              : Timestamp.fromDate(new Date(data.endDate)),
        };
      }) as SubscriptionInfo[];

      setUserSubscriptions(subscriptions as SubscriptionInfo[]);
    } catch (error) {
      
      toast.error("Failed to load subscriptions");
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // Prepare tabs based on user role
  const getTabs = () => {
    const baseTabs = [];

    // Properties tab - only for roles that can approve properties
    if (
      permissions.canApproveNewProperty() ||
      permissions.canApproveResaleRental()
    ) {
      baseTabs.push({
        id: "properties",
        label: "Properties",
        content: (
          <Card>
            <Tabs
              variant="underline"
              tabs={[
                {
                  id: "pending",
                  label: "Pending Approval",
                  content: (
                    <div className="overflow-x-auto">
                      <h3 className="text-lg font-semibold mb-4">
                        Pending Properties
                      </h3>

                      <Tabs
                        variant="underline"
                        tabs={[
                          {
                            id: "resale",
                            label: `Resale (${pendingProperties.resale.length})`,
                            content: (
                              <div className="space-y-4">
                                {/* Premium Search & Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search properties..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white"
                                        value={pendingSearchTerms.resale}
                                        onChange={(e) =>
                                          setPendingSearchTerms((prev) => ({
                                            ...prev,
                                            resale: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={pendingFilters.resale.type}
                                          onChange={(e) =>
                                            setPendingFilters((prev) => ({
                                              ...prev,
                                              resale: {
                                                ...prev.resale,
                                                type: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {getPendingResaleTypes().map(
                                            (type) => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            )
                                          )}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={pendingFilters.resale.sort}
                                          onChange={(e) =>
                                            setPendingFilters((prev) => ({
                                              ...prev,
                                              resale: {
                                                ...prev.resale,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="price-desc">
                                            Price: High to Low
                                          </option>
                                          <option value="price-asc">
                                            Price: Low to High
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(pendingSearchTerms.resale ||
                                        pendingFilters.resale.type ||
                                        pendingFilters.resale.sort) && (
                                        <button
                                          onClick={() => {
                                            setPendingSearchTerms((prev) => ({
                                              ...prev,
                                              resale: "",
                                            }));
                                            setPendingFilters((prev) => ({
                                              ...prev,
                                              resale: { type: "", sort: "" },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                  {(() => {
                                    // Filter and sort pending resale properties
                                    let filteredPendingResale =
                                      pendingProperties.resale.filter(
                                        (property) => {
                                          const searchTerm =
                                            pendingSearchTerms.resale.toLowerCase();
                                          const matchesSearch =
                                            !searchTerm ||
                                            property.society
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.sublocation
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.roadLocation
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.type
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.station
                                              ?.toLowerCase()
                                              .includes(searchTerm);

                                          const matchesType =
                                            !pendingFilters.resale.type ||
                                            property.type ===
                                              pendingFilters.resale.type;

                                          return matchesSearch && matchesType;
                                        }
                                      );

                                    // Sort properties
                                    if (pendingFilters.resale.sort) {
                                      filteredPendingResale.sort((a, b) => {
                                        switch (pendingFilters.resale.sort) {
                                          case "date-desc":
                                            return (
                                              toDate(b.createdAt).getTime() -
                                              toDate(a.createdAt).getTime()
                                            );
                                          case "date-asc":
                                            return (
                                              toDate(a.createdAt).getTime() -
                                              toDate(b.createdAt).getTime()
                                            );
                                          case "price-desc":
                                            return (
                                              (b.expectedPrice || 0) -
                                              (a.expectedPrice || 0)
                                            );
                                          case "price-asc":
                                            return (
                                              (a.expectedPrice || 0) -
                                              (b.expectedPrice || 0)
                                            );
                                          default:
                                            return 0;
                                        }
                                      });
                                    }

                                    return filteredPendingResale.length ===
                                      0 ? (
                                      <div className="text-center py-12">
                                        <p className="text-neutral-500">
                                          {pendingSearchTerms.resale
                                            ? "No matching resale properties found"
                                            : "No pending resale properties"}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-200">
                                          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                            <tr>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                                Date
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                                Property
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                                Location
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                                Price
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                                Type
                                              </th>
                                              <th className="px-3 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-neutral-100">
                                            {filteredPendingResale.map(
                                              (property, index) => (
                                                <tr
                                                  key={`pending-resale-${
                                                    property.id
                                                  }-${index}-${
                                                    property.createdAt ||
                                                    Date.now()
                                                  }`}
                                                  className={`hover:bg-blue-50 transition-colors ${
                                                    index % 2 === 0
                                                      ? "bg-white"
                                                      : "bg-blue-25"
                                                  }`}
                                                >
                                                  <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                    {format(
                                                      toDate(
                                                        property.createdAt
                                                      ),
                                                      "dd/MM/yy"
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      <div className="text-sm font-medium text-neutral-900 truncate">
                                                        {property.society}
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      <div className="text-sm text-neutral-900 truncate">
                                                        {property.sublocation}
                                                      </div>
                                                      {property.station && (
                                                        <div className="text-xs text-neutral-500">
                                                          In {property.station}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                    <div className="text-sm font-semibold text-neutral-900">
                                                      ₹{property.expectedPrice?.toLocaleString(
                                                        "en-IN"
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                    <div className="text-sm text-neutral-900">
                                                      {property.type}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-1">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                          setShowPropertyDetails(
                                                            {
                                                              ...property,
                                                              category:
                                                                "resale",
                                                            }
                                                          )
                                                        }
                                                        className="p-1"
                                                      >
                                                        <Eye className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                          handleApproveProperty(
                                                            property.docId ||
                                                              property.id,
                                                            "resale"
                                                          )
                                                        }
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <Check className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => {
                                                          setRejectingProperty({
                                                            id:
                                                              property.docId ||
                                                              property.id,
                                                            category: "resale",
                                                          });
                                                          setShowRejectModal(
                                                            true
                                                          );
                                                        }}
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <X className="w-3 h-3" />
                                                      </Button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            ),
                          },
                          {
                            id: "rental",
                            label: `Rental (${pendingProperties.rental.length})`,
                            content: (
                              <div className="space-y-4">
                                {/* Premium Search & Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-green-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search properties..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white"
                                        value={pendingSearchTerms.rental}
                                        onChange={(e) =>
                                          setPendingSearchTerms((prev) => ({
                                            ...prev,
                                            rental: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={pendingFilters.rental.type}
                                          onChange={(e) =>
                                            setPendingFilters((prev) => ({
                                              ...prev,
                                              rental: {
                                                ...prev.rental,
                                                type: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {(() => {
                                            const types = new Set<string>();
                                            pendingProperties.rental.forEach(
                                              (property) => {
                                                if (property.type) {
                                                  types.add(property.type);
                                                }
                                              }
                                            );
                                            return Array.from(types)
                                              .sort()
                                              .map((type) => (
                                                <option key={type} value={type}>
                                                  {type}
                                                </option>
                                              ));
                                          })()}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={pendingFilters.rental.sort}
                                          onChange={(e) =>
                                            setPendingFilters((prev) => ({
                                              ...prev,
                                              rental: {
                                                ...prev.rental,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="rent-desc">
                                            Rent: High to Low
                                          </option>
                                          <option value="rent-asc">
                                            Rent: Low to High
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(pendingSearchTerms.rental ||
                                        pendingFilters.rental.type ||
                                        pendingFilters.rental.sort) && (
                                        <button
                                          onClick={() => {
                                            setPendingSearchTerms((prev) => ({
                                              ...prev,
                                              rental: "",
                                            }));
                                            setPendingFilters((prev) => ({
                                              ...prev,
                                              rental: { type: "", sort: "" },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                  {(() => {
                                    // Filter and sort pending rental properties
                                    let filteredPendingRental =
                                      pendingProperties.rental.filter(
                                        (property) => {
                                          const searchTerm =
                                            pendingSearchTerms.rental.toLowerCase();
                                          const matchesSearch =
                                            !searchTerm ||
                                            property.society
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.sublocation
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.roadLocation
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.type
                                              ?.toLowerCase()
                                              .includes(searchTerm) ||
                                            property.station
                                              ?.toLowerCase()
                                              .includes(searchTerm);

                                          const matchesType =
                                            !pendingFilters.rental.type ||
                                            property.type ===
                                              pendingFilters.rental.type;

                                          return matchesSearch && matchesType;
                                        }
                                      );

                                    // Sort properties
                                    if (pendingFilters.rental.sort) {
                                      filteredPendingRental.sort((a, b) => {
                                        switch (pendingFilters.rental.sort) {
                                          case "date-desc":
                                            return (
                                              toDate(b.createdAt).getTime() -
                                              toDate(a.createdAt).getTime()
                                            );
                                          case "date-asc":
                                            return (
                                              toDate(a.createdAt).getTime() -
                                              toDate(b.createdAt).getTime()
                                            );
                                          case "rent-desc":
                                            return (
                                              (b.rent || 0) - (a.rent || 0)
                                            );
                                          case "rent-asc":
                                            return (
                                              (a.rent || 0) - (b.rent || 0)
                                            );
                                          default:
                                            return 0;
                                        }
                                      });
                                    }

                                    return filteredPendingRental.length ===
                                      0 ? (
                                      <div className="text-center py-12">
                                        <p className="text-neutral-500">
                                          {pendingSearchTerms.rental
                                            ? "No matching rental properties found"
                                            : "No pending rental properties"}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-200">
                                          <thead className="bg-gradient-to-r from-green-50 to-green-100">
                                            <tr>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                                Date
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                                Property
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                                Location
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                                Rent
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                                Type
                                              </th>
                                              <th className="px-3 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-neutral-100">
                                            {filteredPendingRental.map(
                                              (property, index) => (
                                                <tr
                                                  key={`pending-rental-${
                                                    property.id
                                                  }-${index}-${
                                                    property.createdAt ||
                                                    Date.now()
                                                  }`}
                                                  className={`hover:bg-green-50 transition-colors ${
                                                    index % 2 === 0
                                                      ? "bg-white"
                                                      : "bg-green-25"
                                                  }`}
                                                >
                                                  <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                    {format(
                                                      toDate(
                                                        property.createdAt
                                                      ),
                                                      "dd/MM/yy"
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      <div className="text-sm font-medium text-neutral-900 truncate">
                                                        {property.society}
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      <div className="text-sm text-neutral-900 truncate">
                                                        {property.sublocation}
                                                      </div>
                                                      {property.station && (
                                                        <div className="text-xs text-neutral-500">
                                                          In {property.station}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                    <div className="text-sm font-semibold text-neutral-900">
                                                      ₹{property.rent?.toLocaleString(
                                                        "en-IN"
                                                      )}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      /month
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                    <div className="text-sm text-neutral-900">
                                                      {property.type}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-1">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                          setShowPropertyDetails(
                                                            {
                                                              ...property,
                                                              category:
                                                                "rental",
                                                            }
                                                          )
                                                        }
                                                        className="p-1"
                                                      >
                                                        <Eye className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                          handleApproveProperty(
                                                            property.docId ||
                                                              property.id,
                                                            "rental"
                                                          )
                                                        }
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <Check className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => {
                                                          setRejectingProperty({
                                                            id:
                                                              property.docId ||
                                                              property.id,
                                                            category: "rental",
                                                          });
                                                          setShowRejectModal(
                                                            true
                                                          );
                                                        }}
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <X className="w-3 h-3" />
                                                      </Button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            ),
                          },
                          {
                            id: "newProperty",
                            label: `New Properties (${
                              pendingProperties.newProperties?.length || 0
                            })`,
                            content: (
                              <div className="space-y-4">
                                <FilterBar
                                  searchTerm={pendingSearchTerms.newProperty}
                                  setSearchTerm={(term) =>
                                    setPendingSearchTerms((prev) => ({
                                      ...prev,
                                      newProperty: term,
                                    }))
                                  }
                                  bhkFilter={pendingFilters.newProperty.bhk}
                                  setBhkFilter={(bhk) =>
                                    setPendingFilters((prev) => ({
                                      ...prev,
                                      newProperty: { ...prev.newProperty, bhk },
                                    }))
                                  }
                                  reraRange={pendingNewPropertyReraRange}
                                  setReraRange={setPendingNewPropertyReraRange}
                                  availableBhkTypes={(() => {
                                    const types = new Set<string>();
                                    (
                                      pendingProperties.newProperties || []
                                    ).forEach((property) => {
                                      if (property.flatType) {
                                        types.add(property.flatType);
                                      }
                                    });
                                    return Array.from(types).sort();
                                  })()}
                                />
                                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                  {(() => {
                                    // Filter and sort pending new properties
                                    let filteredPendingNewProperties = (
                                      pendingProperties.newProperties || []
                                    ).filter((property) => {
                                      const searchTerm =
                                        pendingSearchTerms.newProperty.toLowerCase();
                                      const matchesSearch =
                                        !searchTerm ||
                                        property.projectName
                                          ?.toLowerCase()
                                          .includes(searchTerm) ||
                                        property.developerName
                                          ?.toLowerCase()
                                          .includes(searchTerm) ||
                                        property.station
                                          ?.toLowerCase()
                                          .includes(searchTerm) ||
                                        property.subLocation
                                          ?.toLowerCase()
                                          .includes(searchTerm);

                                      const matchesBHK =
                                        !pendingFilters.newProperty.bhk ||
                                        property.flatType ===
                                          pendingFilters.newProperty.bhk;

                                      const reraCarpet =
                                        parseFloat(property.reraCarpet) || 0;
                                      const minRera =
                                        pendingNewPropertyReraRange.min
                                          ? parseFloat(
                                              pendingNewPropertyReraRange.min
                                            )
                                          : 0;
                                      const maxRera =
                                        pendingNewPropertyReraRange.max
                                          ? parseFloat(
                                              pendingNewPropertyReraRange.max
                                            )
                                          : Infinity;
                                      const matchesReraRange =
                                        reraCarpet >= minRera &&
                                        reraCarpet <= maxRera;

                                      return (
                                        matchesSearch &&
                                        matchesBHK &&
                                        matchesReraRange
                                      );
                                    });

                                    return filteredPendingNewProperties.length ===
                                      0 ? (
                                      <div className="text-center py-12">
                                        <p className="text-neutral-500">
                                          {pendingSearchTerms.newProperty ||
                                          pendingFilters.newProperty.bhk ||
                                          pendingNewPropertyReraRange.min ||
                                          pendingNewPropertyReraRange.max
                                            ? "No matching new properties found"
                                            : "No pending new properties"}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-200">
                                          <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                                            <tr>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                                Date
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                                Project
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                                Station
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                                Type
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                                Rera Carpet
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                                Submitted by
                                              </th>
                                              <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                                Edited by
                                              </th>
                                              <th className="px-3 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-neutral-100">
                                            {filteredPendingNewProperties.map(
                                              (property, index) => (
                                                <tr
                                                  key={`pending-new-${
                                                    property.id
                                                  }-${index}-${
                                                    property.createdAt ||
                                                    Date.now()
                                                  }`}
                                                  className={`group relative hover:bg-purple-50 transition-colors cursor-pointer border-r-4 border-transparent hover:border-purple-400 ${
                                                    index % 2 === 0
                                                      ? "bg-white"
                                                      : "bg-purple-25"
                                                  }`}
                                                >
                                                  <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                    {format(
                                                      toDate(
                                                        property.createdAt ||
                                                          property.dateUpdateCostSheet
                                                      ),
                                                      "dd/MM/yy"
                                                    )}
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      <div className="text-sm font-medium text-neutral-900 truncate">
                                                        {property.projectName}
                                                      </div>
                                                      <div className="text-xs text-neutral-500">
                                                        by{" "}
                                                        {property.developerName}
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      <div className="text-sm text-neutral-900 truncate">
                                                        {property.subLocation}
                                                      </div>
                                                      {
                                                        <div className="text-xs text-neutral-500">
                                                          In {property.station}
                                                        </div>
                                                      }
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                    <div className="text-sm text-neutral-900">
                                                      {property.flatType}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                    <div className="text-sm text-neutral-900">
                                                      {property.reraCarpet} Sq
                                                      ft
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      {(() => {
                                                        const submitter =
                                                          getUserInfo(
                                                            property.submittedBy
                                                          );
                                                        const getValidDate = (
                                                          value: any
                                                        ) => {
                                                          if (!value)
                                                            return null;

                                                          // If it's a Firestore Timestamp
                                                          if (value?.seconds) {
                                                            return new Date(
                                                              value.seconds *
                                                                1000
                                                            );
                                                          }

                                                          // If it's already a Date object
                                                          if (
                                                            value instanceof
                                                            Date
                                                          ) {
                                                            return value;
                                                          }

                                                          // If it's a string (ISO)
                                                          const d = new Date(
                                                            value
                                                          );
                                                          return isNaN(
                                                            d.getTime()
                                                          )
                                                            ? null
                                                            : d;
                                                        };

                                                        const createdAtDate =
                                                          getValidDate(
                                                            property.createdAt
                                                          );

                                                        if (submitter) {
                                                          return (
                                                            <div className="flex items-start gap-3 py-2 border-b border-neutral-100">
                                                              <div className="flex flex-col items-start space-y-1">
                                                                {/* Role */}
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-700">
                                                                  {
                                                                    submitter.role
                                                                  }
                                                                </span>

                                                                {/* Time */}
                                                                {createdAtDate && (
                                                                  <span className="text-[10px] text-neutral-400">
                                                                    {format(
                                                                      createdAtDate,
                                                                      "dd MMM yy - hh:mm a"
                                                                    )}
                                                                  </span>
                                                                )}

                                                                {/* Email */}
                                                                <div className="text-xs text-neutral-600 truncate">
                                                                  {
                                                                    submitter.email
                                                                  }
                                                                </div>

                                                                {/* Name */}
                                                                <div className="text-xs text-neutral-400 truncate">
                                                                  {
                                                                    submitter.fullName
                                                                  }
                                                                </div>
                                                              </div>
                                                            </div>
                                                          );
                                                        }
                                                        return (
                                                          <div className="text-xs text-neutral-500">
                                                            -
                                                          </div>
                                                        );
                                                      })()}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 border-r border-neutral-100">
                                                    <div className="max-w-xs">
                                                      {(() => {
                                                        if (property.editedBy) {
                                                          const editor =
                                                            getUserInfo(
                                                              property.editedBy
                                                            );
                                                          if (editor) {
                                                            return (
                                                              <div className="flex items-start gap-3 py-2 border-b border-neutral-100">
                                                                <div className="flex flex-col items-start space-y-1">
                                                                  {/* Role */}
                                                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-green-100 text-green-700">
                                                                    {
                                                                      editor.role
                                                                    }
                                                                  </span>

                                                                  {/* Time */}
                                                                  {property.editedAt && (
                                                                    <span className="text-[10px] text-neutral-400">
                                                                      {format(
                                                                        new Date(
                                                                          property.editedAt
                                                                        ),
                                                                        "dd MMM yy - hh:mm a"
                                                                      )}
                                                                    </span>
                                                                  )}

                                                                  {/* Email */}
                                                                  <div className="text-xs text-neutral-600">
                                                                    {
                                                                      editor.email
                                                                    }
                                                                  </div>

                                                                  {/* Name */}
                                                                  <div className="text-xs text-neutral-400 truncate">
                                                                    {
                                                                      editor.fullName
                                                                    }
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          }
                                                        }
                                                        return (
                                                          <div className="text-xs text-neutral-500">
                                                            -
                                                          </div>
                                                        );
                                                      })()}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <div className="flex justify-center space-x-1">
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                          setShowPropertyDetails(
                                                            {
                                                              ...property,
                                                              category:
                                                                "newProperty",
                                                            }
                                                          )
                                                        }
                                                        className="p-1"
                                                      >
                                                        <Eye className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                          handleApproveNewProperty(
                                                            property.id
                                                          )
                                                        }
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <Check className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => {
                                                          setRejectingProperty({
                                                            id: property.id,
                                                            category:
                                                              "newProperty",
                                                          });
                                                          setShowRejectModal(
                                                            true
                                                          );
                                                        }}
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <X className="w-3 h-3" />
                                                      </Button>
                                                    </div>
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  id: "approved",
                  label: "Approved",
                  content: (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">
                          Approved Properties
                        </h3>
                        <p className="text-neutral-600">
                          Browse and manage all approved properties across
                          categories
                        </p>
                      </div>

                      <Tabs
                        variant="underline"
                        tabs={[
                          {
                            id: "resale-approved",
                            label: `Resale (${approvedProperties.resale.length})`,
                            content: (
                              <div className="space-y-4">
                                {/* Search and Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search properties..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white"
                                        value={approvedSearchTerms.resale}
                                        onChange={(e) =>
                                          setApprovedSearchTerms((prev) => ({
                                            ...prev,
                                            resale: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={approvedFilters.resale.type}
                                          onChange={(e) =>
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              resale: {
                                                ...prev.resale,
                                                type: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {getAvailableResaleTypes().map(
                                            (type) => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            )
                                          )}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={approvedFilters.resale.sort}
                                          onChange={(e) =>
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              resale: {
                                                ...prev.resale,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="price-desc">
                                            Price: High to Low
                                          </option>
                                          <option value="price-asc">
                                            Price: Low to High
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(approvedSearchTerms.resale ||
                                        approvedFilters.resale.type ||
                                        approvedFilters.resale.sort) && (
                                        <button
                                          onClick={() => {
                                            setApprovedSearchTerms((prev) => ({
                                              ...prev,
                                              resale: "",
                                            }));
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              resale: { type: "", sort: "" },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {filteredApprovedProperties.resale.length ===
                                0 ? (
                                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                                    <div className="text-neutral-400 mb-2">
                                      <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <p className="text-neutral-500 text-lg font-medium">
                                      No approved resale properties
                                    </p>
                                    <p className="text-neutral-400 text-sm mt-1">
                                      Approved properties will appear here
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                          <tr>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                              Date
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                              Property
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                              Location
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                              Price
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-blue-200">
                                              Type
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-100">
                                          {filteredApprovedProperties.resale.map(
                                            (property: Property, index) => (
                                              <tr
                                                key={`approved-resale-${
                                                  property.docId || property.id
                                                }`}
                                                className={`hover:bg-blue-50 transition-colors ${
                                                  index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-blue-25"
                                                }`}
                                              >
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                  {format(
                                                    toDate(property.createdAt),
                                                    "dd/MM/yy"
                                                  )}
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">
                                                      {property.society}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      {property.roadLocation}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-neutral-900 truncate">
                                                      {property.sublocation}
                                                    </div>
                                                    {property.station && (
                                                      <div className="text-xs text-neutral-500">
                                                        In {property.station}
                                                      </div>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm font-semibold text-green-600">
                                                    ₹{property.expectedPrice?.toLocaleString(
                                                      "en-IN"
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.type}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                      setShowPropertyDetails({
                                                        ...property,
                                                        category: "resale",
                                                      })
                                                    }
                                                    className="p-1"
                                                  >
                                                    <Eye className="w-3 h-3" />
                                                  </Button>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                          },

                          {
                            id: "rental-approved",
                            label: `Rental (${approvedProperties.rental.length})`,
                            content: (
                              <div className="space-y-4">
                                {/* Search and Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-green-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-green-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search properties..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white"
                                        value={approvedSearchTerms.rental}
                                        onChange={(e) =>
                                          setApprovedSearchTerms((prev) => ({
                                            ...prev,
                                            rental: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={approvedFilters.rental.type}
                                          onChange={(e) =>
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              rental: {
                                                ...prev.rental,
                                                type: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {getAvailableRentalTypes().map(
                                            (type) => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            )
                                          )}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={approvedFilters.rental.sort}
                                          onChange={(e) =>
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              rental: {
                                                ...prev.rental,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="rent-desc">
                                            Rent: High to Low
                                          </option>
                                          <option value="rent-asc">
                                            Rent: Low to High
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(approvedSearchTerms.rental ||
                                        approvedFilters.rental.type ||
                                        approvedFilters.rental.sort) && (
                                        <button
                                          onClick={() => {
                                            setApprovedSearchTerms((prev) => ({
                                              ...prev,
                                              rental: "",
                                            }));
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              rental: { type: "", sort: "" },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {filteredApprovedProperties.rental.length ===
                                0 ? (
                                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                                    <div className="text-neutral-400 mb-2">
                                      <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
                                      </svg>
                                    </div>
                                    <p className="text-neutral-500 text-lg font-medium">
                                      No approved rental properties
                                    </p>
                                    <p className="text-neutral-400 text-sm mt-1">
                                      Approved rental properties will appear
                                      here
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-gradient-to-r from-green-50 to-green-100">
                                          <tr>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                              Date
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                              Property
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                              Location
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                              Rent
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider border-r border-green-200">
                                              Type
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-100">
                                          {filteredApprovedProperties.rental.map(
                                            (property: Property, index) => (
                                              <tr
                                                key={`approved-rental-${
                                                  property.docId || property.id
                                                }`}
                                                className={`hover:bg-green-50 transition-colors ${
                                                  index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-green-25"
                                                }`}
                                              >
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                  {format(
                                                    toDate(property.createdAt),
                                                    "dd/MM/yy"
                                                  )}
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">
                                                      {property.society}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      {property.roadLocation}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-neutral-900 truncate">
                                                      {property.sublocation}
                                                    </div>
                                                    {property.station && (
                                                      <div className="text-xs text-neutral-500">
                                                        In {property.station}
                                                      </div>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm font-semibold text-green-600">
                                                    ?
                                                    {property.rent?.toLocaleString(
                                                      "en-IN"
                                                    )}
                                                  </div>
                                                  <div className="text-xs text-neutral-500">
                                                    /month
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.type}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                      setShowPropertyDetails({
                                                        ...property,
                                                        category: "rental",
                                                      })
                                                    }
                                                    className="p-1"
                                                  >
                                                    <Eye className="w-3 h-3" />
                                                  </Button>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                          },

                          {
                            id: "new-approved",
                            label: `New Properties (${
                              approvedProperties.newProperties?.length || 0
                            })`,
                            content: (
                              <div className="space-y-4">
                                {/* Search and Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-purple-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-purple-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search by project, developer, station..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 hover:bg-white"
                                        value={approvedSearchTerms.newProperty}
                                        onChange={(e) =>
                                          setApprovedSearchTerms((prev) => ({
                                            ...prev,
                                            newProperty: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={
                                            approvedFilters.newProperty.bhk
                                          }
                                          onChange={(e) =>
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              newProperty: {
                                                ...prev.newProperty,
                                                bhk: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {getAvailableNewPropertyTypes().map(
                                            (type) => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            )
                                          )}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={
                                            approvedFilters.newProperty.sort
                                          }
                                          onChange={(e) =>
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              newProperty: {
                                                ...prev.newProperty,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="carpet-desc">
                                            Carpet: Large to Small
                                          </option>
                                          <option value="carpet-asc">
                                            Carpet: Small to Large
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(approvedSearchTerms.newProperty ||
                                        approvedFilters.newProperty.bhk ||
                                        approvedFilters.newProperty.sort) && (
                                        <button
                                          onClick={() => {
                                            setApprovedSearchTerms((prev) => ({
                                              ...prev,
                                              newProperty: "",
                                            }));
                                            setApprovedFilters((prev) => ({
                                              ...prev,
                                              newProperty: {
                                                bhk: "",
                                                sort: "",
                                              },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {filteredApprovedProperties.newProperties
                                  .length === 0 ? (
                                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                                    <div className="text-neutral-400 mb-2">
                                      <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                      </svg>
                                    </div>
                                    <p className="text-neutral-500 text-lg font-medium">
                                      No approved new properties
                                    </p>
                                    <p className="text-neutral-400 text-sm mt-1">
                                      Approved new developments will appear here
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                                          <tr>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                              Date
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                              Project
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                              Station
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                              Type
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider border-r border-purple-200">
                                              RERA Carpet
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-100">
                                          {filteredApprovedProperties.newProperties.map(
                                            (property: any, index) => (
                                              <tr
                                                key={`approved-new-${property.id}`}
                                                className={`hover:bg-purple-50 transition-colors ${
                                                  index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-purple-25"
                                                }`}
                                              >
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                  {(() => {
                                                    const dateValue =
                                                      property.createdAt ||
                                                      property.dateUpdateCostSheet;
                                                    if (!dateValue) return "-";
                                                    try {
                                                      let date;
                                                      if (
                                                        typeof dateValue ===
                                                        "string"
                                                      ) {
                                                        date = new Date(
                                                          dateValue
                                                        );
                                                      } else if (
                                                        dateValue.toDate
                                                      ) {
                                                        date =
                                                          dateValue.toDate();
                                                      } else {
                                                        date = dateValue;
                                                      }
                                                      return isNaN(
                                                        date.getTime()
                                                      )
                                                        ? "-"
                                                        : format(
                                                            date,
                                                            "dd/MM/yy"
                                                          );
                                                    } catch {
                                                      return "-";
                                                    }
                                                  })()}
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">
                                                      {property.projectName}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      by{" "}
                                                      {property.developerName}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-neutral-900 truncate">
                                                      {property.subLocation}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      {property.station}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.flatType || "-"}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.reraCarpet || "-"}{" "}
                                                    sq ft
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                      setShowPropertyDetails({
                                                        ...property,
                                                        category: "newProperty",
                                                      })
                                                    }
                                                    className="p-1"
                                                  >
                                                    <Eye className="w-3 h-3" />
                                                  </Button>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  id: "rejected",
                  label: "Rejected",
                  content: (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-neutral-800 mb-2">
                          Rejected Properties
                        </h3>
                        <p className="text-neutral-600">
                          Browse and manage all rejected properties across
                          categories
                        </p>
                      </div>

                      <Tabs
                        variant="underline"
                        tabs={[
                          {
                            id: "resale-rejected",
                            label: `Resale (${rejectedProperties.resale.length})`,
                            content: (
                              <div className="space-y-4">
                                {/* Search and Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-red-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search by society, location, type..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white"
                                        value={rejectedSearchTerms.resale}
                                        onChange={(e) =>
                                          setRejectedSearchTerms((prev) => ({
                                            ...prev,
                                            resale: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={rejectedFilters.resale.type}
                                          onChange={(e) =>
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              resale: {
                                                ...prev.resale,
                                                type: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {getRejectedResaleTypes().map(
                                            (type) => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            )
                                          )}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={rejectedFilters.resale.sort}
                                          onChange={(e) =>
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              resale: {
                                                ...prev.resale,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="price-desc">
                                            Price: High to Low
                                          </option>
                                          <option value="price-asc">
                                            Price: Low to High
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(rejectedSearchTerms.resale ||
                                        rejectedFilters.resale.type ||
                                        rejectedFilters.resale.sort) && (
                                        <button
                                          onClick={() => {
                                            setRejectedSearchTerms((prev) => ({
                                              ...prev,
                                              resale: "",
                                            }));
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              resale: { type: "", sort: "" },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {filteredRejectedProperties.resale.length ===
                                0 ? (
                                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                                    <div className="text-neutral-400 mb-2">
                                      <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <p className="text-neutral-500 text-lg font-medium">
                                      No rejected resale properties
                                    </p>
                                    <p className="text-neutral-400 text-sm mt-1">
                                      Rejected properties will appear here
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-gradient-to-r from-red-50 to-red-100">
                                          <tr>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Date
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Property
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Location
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Price
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Type
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Rejection Reason
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-100">
                                          {filteredRejectedProperties.resale.map(
                                            (property: Property, index) => (
                                              <tr
                                                key={`rejected-resale-${
                                                  property.docId || property.id
                                                }`}
                                                className={`hover:bg-red-50 transition-colors ${
                                                  index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-red-25"
                                                }`}
                                              >
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                  {format(
                                                    toDate(property.createdAt),
                                                    "dd/MM/yy"
                                                  )}
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">
                                                      {property.society}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      {property.roadLocation}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-neutral-900 truncate">
                                                      {property.sublocation}
                                                    </div>
                                                    {property.station && (
                                                      <div className="text-xs text-neutral-500">
                                                        In {property.station}
                                                      </div>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm font-semibold text-neutral-900">
                                                    ?
                                                    {property.expectedPrice?.toLocaleString(
                                                      "en-IN"
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.type}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-red-600 truncate">
                                                      {property.rejectionReason ||
                                                        "No reason provided"}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                  <div className="flex justify-center space-x-1">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                        setShowPropertyDetails({
                                                          ...property,
                                                          category: "resale",
                                                        })
                                                      }
                                                      className="p-1"
                                                    >
                                                      <Eye className="w-3 h-3" />
                                                    </Button>
                                                    {user?.role === "admin" && (
                                                      <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                          handleApproveRejectedProperty(
                                                            property.docId ||
                                                              property.id,
                                                            "resale"
                                                          )
                                                        }
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <Check className="w-3 h-3" />
                                                      </Button>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                          },
                          {
                            id: "rental-rejected",
                            label: `Rental (${rejectedProperties.rental.length})`,
                            content: (
                              <div className="space-y-4">
                                {/* Search and Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-red-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search by society, location, type..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white"
                                        value={rejectedSearchTerms.rental}
                                        onChange={(e) =>
                                          setRejectedSearchTerms((prev) => ({
                                            ...prev,
                                            rental: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={rejectedFilters.rental.type}
                                          onChange={(e) =>
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              rental: {
                                                ...prev.rental,
                                                type: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {getRejectedRentalTypes().map(
                                            (type) => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            )
                                          )}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={rejectedFilters.rental.sort}
                                          onChange={(e) =>
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              rental: {
                                                ...prev.rental,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="rent-desc">
                                            Rent: High to Low
                                          </option>
                                          <option value="rent-asc">
                                            Rent: Low to High
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(rejectedSearchTerms.rental ||
                                        rejectedFilters.rental.type ||
                                        rejectedFilters.rental.sort) && (
                                        <button
                                          onClick={() => {
                                            setRejectedSearchTerms((prev) => ({
                                              ...prev,
                                              rental: "",
                                            }));
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              rental: { type: "", sort: "" },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {filteredRejectedProperties.rental.length ===
                                0 ? (
                                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                                    <div className="text-neutral-400 mb-2">
                                      <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <p className="text-neutral-500 text-lg font-medium">
                                      No rejected rental properties
                                    </p>
                                    <p className="text-neutral-400 text-sm mt-1">
                                      Rejected rental properties will appear
                                      here
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-gradient-to-r from-red-50 to-red-100">
                                          <tr>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Date
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Property
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Location
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Rent
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Type
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Rejection Reason
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-100">
                                          {filteredRejectedProperties.rental.map(
                                            (property: Property, index) => (
                                              <tr
                                                key={`rejected-rental-${
                                                  property.docId || property.id
                                                }`}
                                                className={`hover:bg-red-50 transition-colors ${
                                                  index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-red-25"
                                                }`}
                                              >
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                  {format(
                                                    toDate(property.createdAt),
                                                    "dd/MM/yy"
                                                  )}
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">
                                                      {property.society}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      {property.roadLocation}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-neutral-900 truncate">
                                                      {property.sublocation}
                                                    </div>
                                                    {property.station && (
                                                      <div className="text-xs text-neutral-500">
                                                        In {property.station}
                                                      </div>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm font-semibold text-neutral-900">
                                                    ?
                                                    {property.rent?.toLocaleString(
                                                      "en-IN"
                                                    )}
                                                  </div>
                                                  <div className="text-xs text-neutral-500">
                                                    /month
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.type}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-red-600 truncate">
                                                      {property.rejectionReason ||
                                                        "No reason provided"}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                  <div className="flex justify-center space-x-1">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                        setShowPropertyDetails({
                                                          ...property,
                                                          category: "rental",
                                                        })
                                                      }
                                                      className="p-1"
                                                    >
                                                      <Eye className="w-3 h-3" />
                                                    </Button>
                                                    {user?.role === "admin" && (
                                                      <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                          handleApproveRejectedProperty(
                                                            property.docId ||
                                                              property.id,
                                                            "rental"
                                                          )
                                                        }
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <Check className="w-3 h-3" />
                                                      </Button>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                          },
                          {
                            id: "new-rejected",
                            label: `New Properties (${
                              rejectedProperties.newProperties?.length || 0
                            })`,
                            content: (
                              <div className="space-y-4">
                                {/* Search and Filter Bar */}
                                <div className="bg-gradient-to-r from-slate-50 via-red-50 to-slate-50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm">
                                  <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                                    {/* Search Input */}
                                    <div className="flex-1 relative group">
                                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                          className="w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                          />
                                        </svg>
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Search by project, developer, station..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200/60 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white"
                                        value={rejectedSearchTerms.newProperty}
                                        onChange={(e) =>
                                          setRejectedSearchTerms((prev) => ({
                                            ...prev,
                                            newProperty: e.target.value,
                                          }))
                                        }
                                      />
                                    </div>

                                    {/* Filter Controls */}
                                    <div className="flex gap-2 lg:gap-3">
                                      {/* Type Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[120px]"
                                          value={
                                            rejectedFilters.newProperty.bhk
                                          }
                                          onChange={(e) =>
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              newProperty: {
                                                ...prev.newProperty,
                                                bhk: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">All Types</option>
                                          {getRejectedNewPropertyTypes().map(
                                            (type) => (
                                              <option key={type} value={type}>
                                                {type}
                                              </option>
                                            )
                                          )}
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Sort Filter */}
                                      <div className="relative">
                                        <select
                                          className="appearance-none bg-white/80 border border-slate-200/60 rounded-lg px-4 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200 hover:bg-white cursor-pointer min-w-[140px]"
                                          value={
                                            rejectedFilters.newProperty.sort
                                          }
                                          onChange={(e) =>
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              newProperty: {
                                                ...prev.newProperty,
                                                sort: e.target.value,
                                              },
                                            }))
                                          }
                                        >
                                          <option value="">Sort by</option>
                                          <option value="date-desc">
                                            Latest First
                                          </option>
                                          <option value="date-asc">
                                            Oldest First
                                          </option>
                                          <option value="carpet-desc">
                                            Carpet: Large to Small
                                          </option>
                                          <option value="carpet-asc">
                                            Carpet: Small to Large
                                          </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                                          <svg
                                            className="w-4 h-4 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </div>
                                      </div>

                                      {/* Clear Filters Button */}
                                      {(rejectedSearchTerms.newProperty ||
                                        rejectedFilters.newProperty.bhk ||
                                        rejectedFilters.newProperty.sort) && (
                                        <button
                                          onClick={() => {
                                            setRejectedSearchTerms((prev) => ({
                                              ...prev,
                                              newProperty: "",
                                            }));
                                            setRejectedFilters((prev) => ({
                                              ...prev,
                                              newProperty: {
                                                bhk: "",
                                                sort: "",
                                              },
                                            }));
                                          }}
                                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-lg text-sm font-medium text-slate-600 transition-all duration-200 flex items-center gap-1.5"
                                        >
                                          <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Clear
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {filteredRejectedProperties.newProperties
                                  .length === 0 ? (
                                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                                    <div className="text-neutral-400 mb-2">
                                      <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                      </svg>
                                    </div>
                                    <p className="text-neutral-500 text-lg font-medium">
                                      No rejected new properties
                                    </p>
                                    <p className="text-neutral-400 text-sm mt-1">
                                      Rejected new developments will appear here
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-gradient-to-r from-red-50 to-red-100">
                                          <tr>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Date
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Project
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Station
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Type
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Rera Carpet
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-red-700 uppercase tracking-wider border-r border-red-200">
                                              Rejection Reason
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-100">
                                          {filteredRejectedProperties.newProperties.map(
                                            (property: any, index) => (
                                              <tr
                                                key={`rejected-new-${property.id}`}
                                                className={`hover:bg-red-50 transition-colors ${
                                                  index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-red-25"
                                                }`}
                                              >
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600 border-r border-neutral-100">
                                                  {(() => {
                                                    const dateValue =
                                                      property.createdAt ||
                                                      property.dateUpdateCostSheet;
                                                    if (!dateValue) return "-";
                                                    try {
                                                      let date;
                                                      if (
                                                        typeof dateValue ===
                                                        "string"
                                                      ) {
                                                        date = new Date(
                                                          dateValue
                                                        );
                                                      } else if (
                                                        dateValue.toDate
                                                      ) {
                                                        date =
                                                          dateValue.toDate();
                                                      } else {
                                                        date = dateValue;
                                                      }
                                                      return isNaN(
                                                        date.getTime()
                                                      )
                                                        ? "-"
                                                        : format(
                                                            date,
                                                            "dd/MM/yy"
                                                          );
                                                    } catch {
                                                      return "-";
                                                    }
                                                  })()}
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm font-medium text-neutral-900 truncate">
                                                      {property.projectName}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      by{" "}
                                                      {property.developerName}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-neutral-900 truncate">
                                                      {property.subLocation}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">
                                                      In {property.station}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.flatType || "-"}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap border-r border-neutral-100">
                                                  <div className="text-sm text-neutral-900">
                                                    {property.reraCarpet || "-"}{" "}
                                                    Sq ft
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 border-r border-neutral-100">
                                                  <div className="max-w-xs">
                                                    <div className="text-sm text-red-600 truncate">
                                                      {property.rejectionReason ||
                                                        "No reason provided"}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                  <div className="flex justify-center space-x-1">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                        setShowPropertyDetails({
                                                          ...property,
                                                          category:
                                                            "newProperty",
                                                        })
                                                      }
                                                      className="p-1"
                                                    >
                                                      <Eye className="w-3 h-3" />
                                                    </Button>
                                                    {user?.role === "admin" && (
                                                      <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() =>
                                                          handleApproveRejectedProperty(
                                                            property.id,
                                                            "newProperty"
                                                          )
                                                        }
                                                        disabled={actionLoading}
                                                        className="p-1"
                                                      >
                                                        <Check className="w-3 h-3" />
                                                      </Button>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        ),
      });
    }

    // New Property tab - available to users who can create new properties
    if (permissions.canCreateNewProperty()) {
      baseTabs.push({
        id: "costsheet",
        label: "New Property",
        content: (
          <div className="w-full max-w-none">
            <CostSheetForm />
          </div>
        ),
      });
    }

    // Users tab - admin can modify, manager can view only
    if (permissions.canViewUsers()) {
      baseTabs.push({
        id: "users",
        label: "Users",
        content: (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Registered Users</h3>
              <div className="flex items-center gap-4">
                {!permissions.canModifyUsers() && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    View Only Access
                  </span>
                )}
                <div className="text-sm text-neutral-500">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>
            </div>

            {/* ADD FILTER BAR */}
            <div className="flex flex-col lg:flex-row gap-3 p-3 bg-neutral-50 rounded-lg border">
              <div className="flex-1">
                <input
                  id="search-users"
                  type="text"
                  placeholder="Search by name, email, phone, RERA, city or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 rounded-md border border-neutral-300 focus:border-primary focus:ring-primary px-4 py-2 focus:outline-none focus:ring-1"
                />
              </div>
              <div className="w-full lg:w-40">
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value as UserRole | "all")
                  }
                  className="w-full h-9 border border-neutral-300 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="executive">Executive</option>
                  <option value="user">User</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSearchTerm("");
                  setRoleFilter("all");
                }}
                className="h-9 px-4"
              >
                Clear
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-100">
                  <tr>
                    {[
                      "Date",
                      "Name",
                      "Email / Phone",
                      "Location",
                      "Resale Listings",
                      "Rental Listings",
                      "Subscriptions",
                      "Role",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {filteredUsers
                    .sort((a, b) => {
                      const aDate = a.createdAt
                        ? new Date(a.createdAt)
                        : new Date(0);
                      const bDate = b.createdAt
                        ? new Date(b.createdAt)
                        : new Date(0);
                      return bDate.getTime() - aDate.getTime();
                    })
                    .map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-neutral-50 transition-colors even:bg-neutral-50/50"
                      >
                        {/* Date */}
                        <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                          {user.createdAt
                            ? format(
                                user.createdAt instanceof Date
                                  ? user.createdAt
                                  : new Date(user.createdAt),
                                "dd/MM/yyyy"
                              )
                            : "-"}
                        </td>

                        {/* Name & RERA */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-neutral-500">
                              RERA: {user.reraNumber || "-"}
                            </p>
                          </div>
                        </td>

                        {/* Email / Phone */}
                        <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                          <div>
                            <div>{user.email || "-"}</div>
                            <div>{user.phone || "-"}</div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap">
                          {user.city || "-"}, {user.state || "-"}
                        </td>

                        {/* Resale Listings */}
                        <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap text-center">
                          <button
                            onClick={async () => {
                              if (user.resalePropertiesCount > 0) {
                                setModalLoading(true);
                                setShowPropertiesModal(true);
                                setModalTitle(
                                  `${user.fullName}'s Resale Properties`
                                );
                                try {
                                  const properties =
                                    await getUserResaleProperties(user.id);
                                  setModalProperties(properties);
                                } catch (error) {
                                  
                                  setModalProperties([]);
                                } finally {
                                  setModalLoading(false);
                                }
                              }
                            }}
                            className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
                            disabled={user.resalePropertiesCount === 0}
                          >
                            {user.resalePropertiesCount || 0}
                          </button>
                        </td>

                        {/* Rental Listings */}
                        <td className="px-4 py-4 text-sm text-neutral-800 whitespace-nowrap text-center">
                          <button
                            onClick={async () => {
                              if (user.rentalPropertiesCount > 0) {
                                setModalLoading(true);
                                setShowPropertiesModal(true);
                                setModalTitle(
                                  `${user.fullName}'s Rental Properties`
                                );
                                try {
                                  const properties =
                                    await getUserRentalProperties(user.id);
                                  setModalProperties(properties);
                                } catch (error) {
                                  
                                  setModalProperties([]);
                                } finally {
                                  setModalLoading(false);
                                }
                              }
                            }}
                            className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer"
                            disabled={user.rentalPropertiesCount === 0}
                          >
                            {user.rentalPropertiesCount || 0}
                          </button>
                        </td>

                        {/* Subscriptions */}
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          {user.subscriptionCount ? (
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                              {user.subscriptionCount} subscription
                              {user.subscriptionCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-neutral-200 text-neutral-600">
                              No Subscriptions
                            </span>
                          )}
                        </td>

                        {/* User Roles */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <RoleBadge role={user.role} size="sm" showIcon />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm flex items-center gap-2">
                          <Button
                            variant="text"
                            size="sm"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => viewUserDetails(user)}
                          >
                            {permissions.canModifyUsers() ? "Update" : "View"}
                          </Button>
                          {/* <Button
                            variant="text"
                            size="sm"
                            icon={<Shield className="h-4 w-4" />}
                            onClick={() => makeUserAdmin(user)}
                          >
                            {user.role === 'admin' ? "Remove Admin" : "Make Admin"}
                          </Button> */}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Properties Modal */}
            {showPropertiesModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">{modalTitle}</h3>
                    <button
                      onClick={() => {
                        setShowPropertiesModal(false);
                        setModalProperties([]);
                        setModalTitle("");
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ?
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {modalLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="text-neutral-500">
                          Loading properties...
                        </div>
                      </div>
                    ) : modalProperties.length === 0 ? (
                      <div className="text-center text-neutral-500 py-8">
                        No properties found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {(() => {
                          const showAreaColumn = modalProperties.length > 0 && modalProperties.some(p => p.expectedPrice !== undefined);
                          
                          return (
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                              <thead className="bg-neutral-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Society
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Type
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Station
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Price
                                  </th>
                                  {showAreaColumn && (
                                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                      Area
                                    </th>
                                  )}
                                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Status
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {modalProperties.map((property, index) => {
                                  const isResale = property.expectedPrice !== undefined;
                                  return (
                                    <tr
                                      key={property.docId || index}
                                      className="hover:bg-neutral-50"
                                    >
                                      <td className="px-3 py-2 text-neutral-900">
                                        <div className="font-medium">
                                          {property.society || "-"}
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                          {property.sublocation || ""}
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-neutral-700">
                                        {property.type || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-neutral-700">
                                        {property.station || "-"}
                                      </td>
                                      <td className="px-3 py-2 text-neutral-700">
                                        {isResale ? (
                                          <div>
                                            <div className="font-medium">
                                              ?
                                              {(
                                                property.expectedPrice / 100000
                                              ).toFixed(1)}
                                              L
                                            </div>
                                            {property.maintenance && (
                                              <div className="text-xs text-neutral-500">
                                                ₹{property.maintenance}/m
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div>
                                            <div className="font-medium">
                                              ₹{property.rent || "-"}
                                            </div>
                                            {property.deposit && (
                                              <div className="text-xs text-neutral-500">
                                                Dep: ₹{property.deposit}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </td>
                                      {showAreaColumn && (
                                        <td className="px-3 py-2 text-neutral-700">
                                          {isResale ? (
                                            <div>
                                              <div>
                                                {property.carpetArea || "-"} sq ft
                                              </div>
                                              {property.builtUpArea && (
                                                <div className="text-xs text-neutral-500">
                                                  Built: {property.builtUpArea}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div>-</div>
                                          )}
                                        </td>
                                      )}
                                      <td className="px-3 py-2">
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${
                                            property.isApproved
                                              ? "bg-green-100 text-green-700"
                                              : property.isRejected
                                              ? "bg-red-100 text-red-700"
                                              : "bg-yellow-100 text-yellow-700"
                                          }`}
                                        >
                                          {property.isApproved
                                            ? "Approved"
                                            : property.isRejected
                                            ? "Rejected"
                                            : "Pending"}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-neutral-700">
                                        {property.createdAt
                                          ? format(
                                              property.createdAt.toDate
                                                ? property.createdAt.toDate()
                                                : new Date(property.createdAt),
                                              "dd/MM/yyyy"
                                            )
                                          : "-"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ),
      });
    }

    // Pricing tab - admin only
    if (permissions.canManagePricing()) {
      baseTabs.push({
        id: "pricing",
        label: "Pricing",
        content: (
          <div>
            {/* Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₹</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">
                    Subscription Pricing Management
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Configure pricing for all subscription plans
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <Tabs
                variant="underline"
                tabs={[
                  {
                    id: "rental-resale",
                    label: "₹₹ Rental & Resale",
                    content: (
                      <div>
                        <div className="border-l-4 border-green-500 pl-4 mb-6">
                          <h4 className="text-lg font-semibold text-neutral-800 mb-2">
                            Rental & Resale Package (Annual Subscription)
                          </h4>
                          <p className="text-sm text-neutral-600">
                            All-access package covering all 29 stations for
                            rental and resale properties
                          </p>

                          {currentPricing.actualPrice?.RR &&
                            currentPricing.discountedPrice?.RR && (
                              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                                      Current Live Pricing
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-lg font-bold text-neutral-700 line-through">
                                        ?
                                        {currentPricing.actualPrice.RR.toLocaleString(
                                          "en-IN"
                                        )}
                                      </span>
                                      <span className="text-xl font-bold text-green-600">
                                        ?
                                        {currentPricing.discountedPrice.RR.toLocaleString(
                                          "en-IN"
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                      {Math.round(
                                        ((currentPricing.actualPrice.RR -
                                          currentPricing.discountedPrice.RR) /
                                          currentPricing.actualPrice.RR) *
                                          100
                                      )}
                                      % OFF
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-1">
                                      You save ₹
                                      {(
                                        currentPricing.actualPrice.RR -
                                        currentPricing.discountedPrice.RR
                                      ).toLocaleString("en-IN")}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-700">
                                Actual Price (₹/year)
                              </label>
                              <Input
                                id="actualPrice"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g., 5000"
                                value={
                                  pricing.actualPrice === undefined ||
                                  pricing.actualPrice === null
                                    ? ""
                                    : pricing.actualPrice
                                }
                                className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPricingState((prev) => ({
                                    ...prev,
                                    actualPrice:
                                      val === "" ? undefined : Number(val),
                                  }));
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-700">
                                Discount (%)
                              </label>
                              <Input
                                id="discount"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g., 50"
                                value={
                                  pricing.discount === undefined ||
                                  pricing.discount === null
                                    ? ""
                                    : pricing.discount
                                }
                                className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPricingState((prev) => ({
                                    ...prev,
                                    discount:
                                      val === "" ? undefined : Number(val),
                                    offerPrice:
                                      prev.actualPrice && val !== ""
                                        ? prev.actualPrice -
                                          Math.round(
                                            (Number(val) / 100) *
                                              prev.actualPrice
                                          )
                                        : prev.offerPrice,
                                  }));
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-neutral-700">
                                Final Offer Price (₹/year)
                              </label>
                              <Input
                                id="offerPrice"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g., 2500"
                                value={
                                  pricing.offerPrice === undefined ||
                                  pricing.offerPrice === null
                                    ? ""
                                    : pricing.offerPrice
                                }
                                className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] font-semibold text-green-600"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPricingState((prev) => ({
                                    ...prev,
                                    offerPrice:
                                      val === "" ? undefined : Number(val),
                                    discount:
                                      prev.actualPrice && val !== ""
                                        ? Math.round(
                                            ((prev.actualPrice - Number(val)) /
                                              prev.actualPrice) *
                                              100
                                          )
                                        : prev.discount,
                                  }));
                                }}
                              />
                            </div>
                          </div>

                          {pricing.actualPrice && pricing.offerPrice && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-800">
                                <strong>Preview:</strong> Customers will see "₹
                                {pricing.offerPrice.toLocaleString("en-IN")} per
                                year"
                                {pricing.discount &&
                                  ` (${
                                    pricing.discount
                                  }% off from ₹${pricing.actualPrice.toLocaleString(
                                    "en-IN"
                                  )})`}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          disabled={!pricing.actualPrice || !pricing.offerPrice}
                          onClick={async () => {
                            const payload: any = {
                              actualPrice: {
                                RR: pricing.actualPrice ?? 2500,
                                ND: pricing.newPropertyPrice ?? 1500,
                              },
                              discountedPrice: {
                                RR: pricing.offerPrice ?? 2500,
                                ND: pricing.newPropertyPrice ?? 1500,
                              },
                            };
                            await setPricing(payload);
                            setCurrentPricing({
                              actualPrice: {
                                RR: pricing.actualPrice ?? 2500,
                              },
                              discountedPrice: {
                                RR: pricing.offerPrice ?? 2500,
                              },
                            });
                            toast.success(
                              "Rental & Resale pricing updated successfully!"
                            );
                          }}
                          className="w-full md:w-auto"
                        >
                          ₹₹ Save Rental & Resale Pricing
                        </Button>
                      </div>
                    ),
                  },
                  {
                    id: "new-property",
                    label: "₹₹ New Property",
                    content: (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column - Management */}
                          <div className="space-y-4">
                            {/* Add New Station */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                              <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                  +
                                </span>
                                Add New Station
                              </h5>
                              <div className="space-y-3">
                                <Input
                                  id="newStationName"
                                  placeholder="Enter station name"
                                  value={pricing.newStationName || ""}
                                  onChange={(e) =>
                                    setPricingState({
                                      ...pricing,
                                      newStationName: e.target.value,
                                    })
                                  }
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <Input
                                    id="newStationActual"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Actual price"
                                    value={newStationPricing.actual}
                                    onChange={(e) =>
                                      setNewStationPricing((prev) => ({
                                        ...prev,
                                        actual: Number(e.target.value) || 0,
                                      }))
                                    }
                                  />
                                  <Input
                                    id="newStationOffer"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Offer price"
                                    value={newStationPricing.offer}
                                    onChange={(e) =>
                                      setNewStationPricing((prev) => ({
                                        ...prev,
                                        offer: Number(e.target.value) || 0,
                                      }))
                                    }
                                  />
                                </div>
                                <Button
                                  variant="primary"
                                  disabled={!pricing.newStationName?.trim()}
                                  onClick={async () => {
                                    const name = (
                                      pricing.newStationName || ""
                                    ).trim();
                                    if (!name)
                                      return toast.error(
                                        "Station name required"
                                      );

                                    try {
                                      const newStationId =
                                        "custom-" +
                                        name.toLowerCase().replace(/\s+/g, "-");
                                      const updatedPricing = {
                                        ...newPropertyPricing,
                                        [newStationId]: newStationPricing,
                                      };

                                      const updatedStationNames = {
                                        ...customStationNames,
                                        [newStationId]: name,
                                      };
                                      await setDoc(
                                        doc(db, "settings", "pricing"),
                                        {
                                          newPropertyPricing: updatedPricing,
                                          newPropertyStationNames:
                                            updatedStationNames,
                                        },
                                        { merge: true }
                                      );

                                      setCustomStationNames(
                                        updatedStationNames
                                      );
                                      setNewPropertyPricing(updatedPricing);
                                      setPricingState((prev) => ({
                                        ...prev,
                                        newStationName: "",
                                      }));
                                      setNewStationPricing({
                                        actual: 1500,
                                        offer: 1500,
                                      });
                                      toast.success(
                                        `Station "${name}" added successfully!`
                                      );
                                    } catch (error) {
                                      toast.error("Failed to add station");
                                    }
                                  }}
                                  className="w-full"
                                >
                                  Add Station
                                </Button>
                              </div>
                            </div>

                            {/* Quick Edit */}
                            <div className="bg-neutral-50 rounded-lg p-4 border">
                              <h5 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-neutral-600 rounded-full flex items-center justify-center text-white text-xs">
                                  ??
                                </span>
                                Quick Edit Pricing
                              </h5>
                              <div className="relative mb-3">
                                <input
                                  type="text"
                                  placeholder="Search station to edit..."
                                  value={stationSearchTerm}
                                  onChange={(e) =>
                                    setStationSearchTerm(e.target.value)
                                  }
                                  onFocus={() => setShowStationDropdown(true)}
                                  className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {showStationDropdown && (
                                  <div className="absolute z-10 w-full bg-white border border-neutral-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {allMergedStations
                                      .filter((station) =>
                                        station.name
                                          .toLowerCase()
                                          .includes(
                                            stationSearchTerm.toLowerCase()
                                          )
                                      )
                                      .map((station) => (
                                        <div
                                          key={station.id}
                                          className="px-3 py-2 hover:bg-neutral-100 cursor-pointer text-sm"
                                          onClick={() => {
                                            setPricingState({
                                              ...pricing,
                                              selectedStationId: station.id,
                                            });
                                            setStationSearchTerm(station.name);
                                            setShowStationDropdown(false);
                                          }}
                                        >
                                          {station.name}
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>

                              {pricing.selectedStationId && (
                                <div className="mb-2">
                                  <button
                                    onClick={() => {
                                      setPricingState({
                                        ...pricing,
                                        selectedStationId: "",
                                      });
                                      setStationSearchTerm("");
                                    }}
                                    className="text-xs text-neutral-500 hover:text-neutral-700"
                                  >
                                    Clear selection
                                  </button>
                                </div>
                              )}
                              {pricing.selectedStationId && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium text-neutral-600 mb-1 block">
                                        Actual Price
                                      </label>
                                      <Input
                                        id="editStationActual"
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                          newPropertyPricing[
                                            pricing.selectedStationId
                                          ]?.actual || 0
                                        }
                                        onChange={(e) => {
                                          const actual = Number(e.target.value);
                                          setNewPropertyPricing((prev) => ({
                                            ...prev,
                                            [pricing.selectedStationId!]: {
                                              ...prev[
                                                pricing.selectedStationId!
                                              ],
                                              actual,
                                            },
                                          }));
                                        }}
                                        className="text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-neutral-600 mb-1 block">
                                        Offer Price
                                      </label>
                                      <Input
                                        id="editStationOffer"
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                          newPropertyPricing[
                                            pricing.selectedStationId
                                          ]?.offer || 0
                                        }
                                        onChange={(e) => {
                                          const offer = Number(e.target.value);
                                          setNewPropertyPricing((prev) => ({
                                            ...prev,
                                            [pricing.selectedStationId!]: {
                                              ...prev[
                                                pricing.selectedStationId!
                                              ],
                                              offer,
                                            },
                                          }));
                                        }}
                                        className="text-sm font-semibold text-green-600"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={async () => {
                                      await setPricing({
                                        newPropertyPricing,
                                      } as any);
                                      toast.success("Pricing updated!");
                                    }}
                                    className="w-full"
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Duration Discounts Section */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                              <h5 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                                  %
                                </span>
                                Duration-based Discounts
                              </h5>
                              <p className="text-xs text-purple-700 mb-3">
                                Set additional discounts for longer subscription
                                durations
                              </p>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-purple-700 mb-1 block">
                                    3 Months (%)
                                  </label>
                                  <Input
                                    id="discount3m"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    value={durationDiscounts[3]}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (
                                        val === "" ||
                                        /^\d*\.?\d*$/.test(val)
                                      ) {
                                        const value =
                                          val === ""
                                            ? 0
                                            : Math.max(
                                                0,
                                                Math.min(100, Number(val))
                                              );
                                        setDurationDiscounts((prev) => ({
                                          ...prev,
                                          3: value,
                                        }));
                                      }
                                    }}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    className="text-xs h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-purple-700 mb-1 block">
                                    6 Months (%)
                                  </label>
                                  <Input
                                    id="discount6m"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    value={durationDiscounts[6]}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (
                                        val === "" ||
                                        /^\d*\.?\d*$/.test(val)
                                      ) {
                                        const value =
                                          val === ""
                                            ? 0
                                            : Math.max(
                                                0,
                                                Math.min(100, Number(val))
                                              );
                                        setDurationDiscounts((prev) => ({
                                          ...prev,
                                          6: value,
                                        }));
                                      }
                                    }}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    className="text-xs h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-purple-700 mb-1 block">
                                    1 Year (%)
                                  </label>
                                  <Input
                                    id="discount12m"
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    value={durationDiscounts[12]}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (
                                        val === "" ||
                                        /^\d*\.?\d*$/.test(val)
                                      ) {
                                        const value =
                                          val === ""
                                            ? 0
                                            : Math.max(
                                                0,
                                                Math.min(100, Number(val))
                                              );
                                        setDurationDiscounts((prev) => ({
                                          ...prev,
                                          12: value,
                                        }));
                                      }
                                    }}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    className="text-xs h-8 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={async () => {
                                  try {
                                    await setDoc(
                                      doc(db, "settings", "additionalOff"),
                                      {
                                        durationDiscounts,
                                      },
                                      { merge: true }
                                    );
                                    toast.success(
                                      "Duration discounts updated!"
                                    );
                                  } catch (error) {
                                    toast.error(`Failed to update discounts`);
                                    
                                  }
                                }}
                                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs py-2"
                              >
                                Save Discounts
                              </Button>
                            </div>
                          </div>

                          {/* Right Column - Overview */}
                          <div>
                            <div className="bg-white rounded-lg border border-neutral-200">
                              <div className="p-4 border-b border-neutral-200">
                                <h5 className="font-semibold text-neutral-800 flex items-center gap-2">
                                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                                    ??
                                  </span>
                                  All {getDynamicCostSheetStationCount()}{" "}
                                  Stations
                                </h5>
                              </div>
                              <div className="max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-neutral-200">
                                  <thead className="bg-neutral-50 sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                        Station
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                        Actual
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                        Offer
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-neutral-200">
                                    {allMergedStations.map((station) => {
                                      const stationPricing =
                                        newPropertyPricing[station.id];
                                      const hasDiscount =
                                        stationPricing &&
                                        stationPricing.actual >
                                          stationPricing.offer;
                                      const isCustomStation =
                                        station.id.startsWith("custom-");
                                      return (
                                        <tr
                                          key={station.id}
                                          className="hover:bg-neutral-50"
                                        >
                                          <td className="px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              {editingStationId ===
                                              station.id ? (
                                                <input
                                                  type="text"
                                                  value={editingStationName}
                                                  onChange={(e) =>
                                                    setEditingStationName(
                                                      e.target.value
                                                    )
                                                  }
                                                  onBlur={() => {
                                                    if (
                                                      editingStationName.trim() &&
                                                      editingStationName !==
                                                        station.name
                                                    ) {
                                                      const updatedStationNames =
                                                        {
                                                          ...customStationNames,
                                                          [station.id]:
                                                            editingStationName.trim(),
                                                        };
                                                      setDoc(
                                                        doc(
                                                          db,
                                                          "settings",
                                                          "pricing"
                                                        ),
                                                        {
                                                          newPropertyStationNames:
                                                            updatedStationNames,
                                                        },
                                                        { merge: true }
                                                      );
                                                      setCustomStationNames(
                                                        updatedStationNames
                                                      );
                                                      toast.success(
                                                        "Station renamed!"
                                                      );
                                                    }
                                                    setEditingStationId(null);
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                      e.currentTarget.blur();
                                                    if (e.key === "Escape") {
                                                      setEditingStationId(null);
                                                      setEditingStationName(
                                                        station.name
                                                      );
                                                    }
                                                  }}
                                                  className="border rounded px-2 py-1 text-xs w-full"
                                                  autoFocus
                                                />
                                              ) : (
                                                <>
                                                  <span className="font-medium">
                                                    {station.name}
                                                  </span>
                                                  {isCustomStation && (
                                                    <div className="flex items-center gap-1">
                                                      <button
                                                        onClick={() => {
                                                          setEditingStationId(
                                                            station.id
                                                          );
                                                          setEditingStationName(
                                                            station.name
                                                          );
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                      >
                                                        <Edit className="h-3 w-3" />
                                                      </button>
                                                      <button
                                                        onClick={async () => {
                                                          if (
                                                            confirm(
                                                              `Delete station "${station.name}"? This action cannot be undone.`
                                                            )
                                                          ) {
                                                            try {
                                                              const updatedPricing =
                                                                {
                                                                  ...newPropertyPricing,
                                                                };
                                                              delete updatedPricing[
                                                                station.id
                                                              ];

                                                              const updatedStationNames =
                                                                {
                                                                  ...customStationNames,
                                                                };
                                                              delete updatedStationNames[
                                                                station.id
                                                              ];

                                                              await setPricing({
                                                                newPropertyPricing:
                                                                  updatedPricing,
                                                                newPropertyStationNames:
                                                                  updatedStationNames,
                                                              });

                                                              setNewPropertyPricing(
                                                                updatedPricing
                                                              );
                                                              setCustomStationNames(
                                                                updatedStationNames
                                                              );
                                                              toast.success(
                                                                `Station "${station.name}" deleted successfully!`
                                                              );
                                                            } catch (error) {
                                                              toast.error(
                                                                "Failed to delete station"
                                                              );
                                                            }
                                                          }
                                                        }}
                                                        className="text-red-600 hover:text-red-800"
                                                      >
                                                        <Trash2 className="h-3 w-3" />
                                                      </button>
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                              {isCustomStation && (
                                                <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                                                  Custom
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-sm text-neutral-600">
                                            ₹{stationPricing?.actual?.toLocaleString(
                                              "en-IN"
                                            ) || 0}
                                          </td>
                                          <td className="px-3 py-2 text-sm font-semibold text-green-600">
                                            ₹{stationPricing?.offer?.toLocaleString(
                                              "en-IN"
                                            ) || 0}
                                          </td>
                                          <td className="px-3 py-2 text-sm">
                                            {hasDiscount ? (
                                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                {Math.round(
                                                  ((stationPricing.actual -
                                                    stationPricing.offer) /
                                                    stationPricing.actual) *
                                                    100
                                                )}
                                                % OFF
                                              </span>
                                            ) : (
                                              <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full">
                                                Regular
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        ),
      });
    }

    // Stamp Duty tab - admin only
    if (permissions.canManageStampDuty()) {
      baseTabs.push({
        id: "stampDuty",
        label: "Stamp Duty",
        content: (
          <Card className="p-6 rounded-2xl shadow-md border border-neutral-200 bg-white">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-neutral-800">
                ₹₹ Manage Stamp Duty Rates
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                Add or update stamp duty rates based on station-wise
                jurisdiction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* <Input
                  id="stampDutyLocation"
                  label="Location"
                  placeholder="e.g., Mira Road"
                  value={newRate.location}
                  onChange={(e) =>
                    setNewRate({ ...newRate, location: e.target.value })
                  }
                /> */}
              <Input
                id="stampDutyJurisdiction"
                label="Jurisdiction"
                placeholder="e.g., Thane"
                value={newRate.jurisdiction}
                onChange={(e) =>
                  setNewRate({ ...newRate, jurisdiction: e.target.value })
                }
              />
              <Input
                id="stampDutyRate"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                label="Stamp Duty Rate (%)"
                placeholder="e.g., 6"
                value={newRate.rate}
                onChange={(e) =>
                  setNewRate({ ...newRate, rate: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAddRate}
                className="px-6 py-2 text-sm font-medium rounded-lg"
              >
                ₹ Add / Update Rate
              </Button>
            </div>

            {rates.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-neutral-700 mb-3">
                  ₹₹ Existing Rates
                </h4>
                <ul className="space-y-2">
                  {rates.map((rate) => (
                    <li
                      key={rate.id}
                      className="flex items-center justify-between px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <span className="font-medium">{rate.jurisdiction}</span>
                        <span className="text-primary font-semibold">
                          {rate.rate}%
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setNewRate({
                              jurisdiction: rate.jurisdiction,
                              rate: String(rate.rate),
                            })
                          }
                          className="text-blue-500 hover:underline text-xs"
                        >
                          ₹₹ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRate(rate.id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          ₹₹₹ Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ),
      });
    }

    return baseTabs;
  };

  // Add edit mode state for property modal
  const [editPropertyMode, setEditPropertyMode] = useState(false);
  const [editedProperty, setEditedProperty] =
    useState<ShowPropertyDetails | null>(null);

  // Helper to start editing
  const startEditProperty = () => {
    if (!showPropertyDetails) return;
    setEditPropertyMode(true);
    setEditedProperty(showPropertyDetails);

    // Initialize form based on property type
    if (showPropertyDetails.category === "rental") {
      handleEditRental(showPropertyDetails as Property);
    } else if (showPropertyDetails.category === "resale") {
      handleEditResale(showPropertyDetails as Property);
    }
  };

  // Legacy rental form initialization (keeping for compatibility)
  const startEditRentalProperty = () => {
    if (!showPropertyDetails || showPropertyDetails.category !== "rental")
      return;

    resetRental({
      society: showPropertyDetails.society || "",
      sublocation: showPropertyDetails.sublocation || "",
      landmark: showPropertyDetails.landmark || "",
      pincode: showPropertyDetails.pincode || "",
      station: showPropertyDetails.station || "",
      district: showPropertyDetails.district || "",
      state: showPropertyDetails.state || "",
      type: showPropertyDetails.type || "",
      buildingNo: showPropertyDetails.buildingNo || "",
      flatNo: showPropertyDetails.flatNo?.toString() || "",
      floorNo: showPropertyDetails.floorNo?.toString() || "",
      totalFloors: showPropertyDetails.totalFloors?.toString() || "",
      expectedRent: showPropertyDetails.rent?.toString() || "",
      securityDeposit: showPropertyDetails.deposit?.toString() || "",
      furnishing: showPropertyDetails.furnishing || "",
      parking: showPropertyDetails.parking || "",
      ownerName: showPropertyDetails.contactName || "",
      ownerNumber: showPropertyDetails.contactNumber || "",
      connectedPerson: showPropertyDetails.connectedPerson || "",
      imageUrl: showPropertyDetails.imageUrl || "",
      videoUrl: showPropertyDetails.videoUrl || "",
    });
  };

  // Helper to cancel editing
  const cancelEditProperty = () => {
    setEditPropertyMode(false);
    setEditedProperty(null);
  };

  // Helper to save edited property
  const saveEditedProperty = async () => {
    if (!editedProperty || !editedProperty.userId || !editedProperty.category)
      return;
    setActionLoading(true);
    try {
      // Ensure array fields are properly initialized
      const safeProperty = {
        ...editedProperty,
        amenities: editedProperty.amenities || [],
      };

      // Use the appropriate update function based on category
      if (editedProperty.category === "resale") {
        await updateResaleProperty(
          editedProperty.userId,
          editedProperty.docId || editedProperty.id,
          safeProperty,
          { skipApprovalReset: true }
        );
      } else if (editedProperty.category === "rental") {
        await updateRentalProperty(
          editedProperty.userId,
          editedProperty.docId || editedProperty.id,
          safeProperty,
          { skipApprovalReset: true }
        );
      }

      // Move property to correct section based on isApproved
      setInventory((prev) => {
        const category = editedProperty.category as "resale" | "rental";
        // Remove property from the category array
        const updatedCategory = prev[category].filter(
          (p) => p.id !== editedProperty.id
        );
        // Add property back to the array
        const newCategoryArray = [...updatedCategory, { ...editedProperty }];
        return {
          ...prev,
          [category]: newCategoryArray,
        };
      });

      // Update modal details
      setShowPropertyDetails(editedProperty);
      toast.success("Property updated successfully!");
      cancelEditProperty();
    } catch (error) {
      toast.error(
        `Failed to update property ${
          error && typeof error === "object" && "message" in error
            ? (error as { message?: string }).message
            : "unknown error"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="container mx-auto max-w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-800 mb-2 tracking-tight">
              Admin Panel
            </h1>
            <p className="text-lg text-neutral-500">
              Manage users, properties, pricing, and more
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/contact-settings")}
            >
              Contact Settings
            </Button>
          </div>
        </div>
        <Card className="shadow-xl rounded-2xl p-0 mb-8">
          <Tabs tabs={getTabs()} />
        </Card>
      </div>

      {/* User Details Modal */}
      {showUserModal && userDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button
                className="text-neutral-500 hover:text-neutral-700"
                onClick={() => setShowUserModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Info */}
                <div>
                  <h4 className="font-medium text-neutral-600 mb-2">
                    Personal Information
                  </h4>
                  <div className="bg-neutral-50 rounded-md p-4">
                    <div className="flex items-center mb-3">
                      <Users className="h-10 w-10 text-primary bg-primary/10 p-2 rounded-full mr-3" />
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {userDetails.fullName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {userDetails.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Phone:</span>
                        <span className="font-medium text-neutral-900">
                          {userDetails.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">RERA Number:</span>
                        <span className="font-medium text-neutral-900">
                          {userDetails.reraNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Location:</span>
                        <span className="font-medium text-neutral-900">
                          {userDetails.city}, {userDetails.state}
                        </span>
                      </div>

                      {/* Role Selector */}
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Role:</span>
                        {editingRole ? (
                          <div className="flex gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) =>
                                setSelectedRole(e.target.value as UserRole)
                              }
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="executive">Executive</option>
                              <option value="user">User</option>
                            </select>
                            <Button
                              size="sm"
                              onClick={handleRoleUpdate}
                              isLoading={actionLoading}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRole(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <RoleBadge role={userDetails.role} size="sm" />
                            {permissions.canModifyUsers() && (
                              <Button
                                variant="text"
                                size="sm"
                                onClick={() => setEditingRole(true)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subscription Info */}
                  <div>
                    <h4 className="font-medium text-neutral-600 mb-2">
                      Subscription Information
                    </h4>
                    <div className="bg-neutral-50 rounded-md p-4 shadow-sm">
                      <div className="flex items-center mb-4">
                        <Briefcase className="h-10 w-10 text-accent bg-accent/10 p-2 rounded-full mr-3" />
                        <div>
                          <p className="font-semibold text-neutral-900">
                            Active Subscriptions
                          </p>
                          <p className="text-sm text-neutral-500">
                            {userSubscriptions.length} active subscriptions
                          </p>
                        </div>
                      </div>

                      {loadingSubscriptions ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-neutral-500">
                            Loading subscriptions...
                          </p>
                        </div>
                      ) : userSubscriptions.length > 0 ? (
                        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
                          {userSubscriptions.map((subscription) => (
                            <SubscriptionDisplay
                              key={subscription.id}
                              subscription={subscription}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-neutral-500">
                          <p>No active subscriptions</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-200 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyDetails && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col relative">
            <button
              onClick={() => {
                setShowPropertyDetails(null);
                cancelEditProperty();
              }}
              className="absolute top-6 right-6 text-gray-500 hover:text-red-500 text-xl z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            >
              �
            </button>

            {showPropertyDetails &&
            showPropertyDetails.category === "newProperty" ? (
              editPropertyMode ? (
                // Edit mode - use CostSheetForm
                <>
                  {/* Sticky Header for Edit Mode */}
                  <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 pr-10 z-10">
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold pr-8">
                        Edit Property
                      </h3>
                    </div>
                    <div className="flex gap-2 flex-wrap pr-8">
                      <Button variant="outline" onClick={cancelEditProperty}>
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <CostSheetForm
                      editProperty={showPropertyDetails}
                      onSave={(updatedProperty) => {
                        setInventory((prev) => ({
                          ...prev,
                          newProperties:
                            prev.newProperties?.map((p) =>
                              p.id === updatedProperty.id ? updatedProperty : p
                            ) || [],
                        }));
                        setShowPropertyDetails(updatedProperty);
                        cancelEditProperty();
                      }}
                    />
                  </div>
                </>
              ) : (
                // View mode
                <>
                  {/* Sticky Header */}
                  <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 pr-10 z-10">
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold pr-8">
                        Property Details: {showPropertyDetails.projectName} by{" "}
                        {showPropertyDetails.developerName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Status:{" "}
                        {showPropertyDetails.isApproved
                          ? "Approved"
                          : showPropertyDetails.isRejected
                          ? "Rejected"
                          : "Pending"}
                        {user?.role === "admin" && (
                          <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
                            Admin View
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap pr-8">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => {
                          setEditPropertyMode(true);
                          setEditedProperty(showPropertyDetails);
                        }}
                      >
                        Edit
                      </Button>
                      {user?.role === "admin" && (
                        <>
                          {showPropertyDetails.isApproved ? (
                            // APPROVED NEW PROPERTIES MODAL: Only show Edit and Unapprove buttons
                            // This ensures approved new properties viewing modal shows only relevant actions
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const { updateCostSheet } = await import(
                                    "../utils/firestoreListings"
                                  );
                                  await updateCostSheet(
                                    showPropertyDetails.id,
                                    {
                                      isApproved: false,
                                      approvalStatus: "pending",
                                      unapprovedBy: user.id,
                                      unapprovedAt: new Date().toISOString(),
                                    }
                                  );
                                  setInventory((prev) => ({
                                    ...prev,
                                    newProperties:
                                      prev.newProperties?.map((p) =>
                                        p.id === showPropertyDetails.id
                                          ? {
                                              ...p,
                                              isApproved: false,
                                              approvalStatus: "pending",
                                            }
                                          : p
                                      ) || [],
                                  }));
                                  setShowPropertyDetails(null);
                                  toast.success(
                                    "Property unapproved successfully!"
                                  );
                                } catch (error) {
                                  toast.error("Failed to unapprove property");
                                }
                              }}
                            >
                              Unapprove
                            </Button>
                          ) : (
                            // PENDING/REJECTED NEW PROPERTIES MODAL: Show Approve and Reject buttons
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={async () => {
                                  try {
                                    await handleApproveNewProperty(
                                      showPropertyDetails.id
                                    );
                                    setShowPropertyDetails(null);
                                  } catch (error) {
                                    // Error already handled in handleApproveNewProperty
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectingProperty({
                                    id: showPropertyDetails.id,
                                    category: "newProperty",
                                  });
                                  setShowRejectModal(true);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Section 1: Basic Details */}
                    <div>
                      <h4 className="text-md font-semibold text-neutral-700 mb-2">
                        Basic Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                        <Field
                          label="Update date"
                          value={showPropertyDetails.dateUpdateCostSheet}
                        />
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Location
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.station ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Developer Name
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.developerName ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Project Name
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.projectName ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Sub-Location
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.subLocation ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Landmark
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.landmark ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Pin Code
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.pinCode ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            District
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.district ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            State
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.state ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Land Parcel
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.landParcel ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Total Towers
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.towers ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Total Storey
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.storey ?? "-")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Pricing Details */}
                    <div>
                      <h4 className="text-md font-semibold text-neutral-700 mb-2">
                        Pricing Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Wing/Building No.
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.wingBuildingNo ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            BHK Type
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.flatType ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Saleable Area
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.saleableArea ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            RERA Carpet / Usable Carpet
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.reraCarpet ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Per Sq. ft. Rate
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.psfRate ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Agreement Value Rate
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.avRate ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Floor Rise Rate
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.floorRise ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Registration Fee/ Charge
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.registration ?? "-")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Other charges & Payment Plans */}
                    <div>
                      <h4 className="text-md font-semibold text-neutral-700 mb-2">
                        Other charges & Payment Plans
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Fixed Component
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.fixedComponent ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Possession Charges
                          </div>
                          <div className="text-neutral-800">
                            {String(
                              showPropertyDetails.possessionCharges ?? "-"
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Parking Charges
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.parkingCharge ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Total Package
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.totalPackage ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm col-span-2">
                          <div className="text-neutral-500 font-medium">
                            Payment Schemes
                          </div>
                          <div className="text-neutral-800">
                            {Array.isArray(showPropertyDetails.paymentScheme)
                              ? showPropertyDetails.paymentScheme.join(", ")
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Amenities */}
                    <div>
                      <h4 className="text-md font-semibold text-neutral-700 mb-2">
                        Amenities
                      </h4>
                      <div className="grid grid-cols-1 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium mb-2">
                            Apartment Amenities
                          </div>
                          <div className="text-neutral-800">
                            {Array.isArray(
                              showPropertyDetails.apartmentAmenities
                            )
                              ? showPropertyDetails.apartmentAmenities.join(
                                  ", "
                                )
                              : "-"}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium mb-2">
                            Project Amenities
                          </div>
                          <div className="text-neutral-800">
                            {Array.isArray(showPropertyDetails.projectAmenities)
                              ? showPropertyDetails.projectAmenities.join(", ")
                              : "-"}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium mb-2">
                            Location Highlights
                          </div>
                          <div className="text-neutral-800">
                            {Array.isArray(
                              showPropertyDetails.locationHighlights
                            )
                              ? showPropertyDetails.locationHighlights.join(
                                  ", "
                                )
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Others */}
                    <div>
                      <h4 className="text-md font-semibold text-neutral-700 mb-2">
                        Others
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Project Type
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.type ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Maha RERA Number
                          </div>
                          <div className="text-neutral-800">
                            {showPropertyDetails.mahaReraNumber ? (
                              showPropertyDetails.mahaReraLink ? (
                                <a
                                  href={showPropertyDetails.mahaReraLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {showPropertyDetails.mahaReraNumber}
                                </a>
                              ) : (
                                showPropertyDetails.mahaReraNumber
                              )
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Possession
                          </div>
                          <div className="text-neutral-800">
                            {`${showPropertyDetails.possessionMonth || "-"} ${
                              showPropertyDetails.possessionYear || ""
                            }`}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Is Cosmo?
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.isCosmo ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Availability
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.availibility ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Image URL
                          </div>
                          <div className="text-neutral-800">
                            {showPropertyDetails.imageUrl ? (
                              <a
                                href={showPropertyDetails.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                View Images
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Video URL
                          </div>
                          <div className="text-neutral-800">
                            {showPropertyDetails.videoUrl ? (
                              <a
                                href={showPropertyDetails.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                View Video
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Site Head Name
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.siteHeadName ?? "-")}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-500 font-medium">
                            Site Head Number
                          </div>
                          <div className="text-neutral-800">
                            {String(showPropertyDetails.siteHeadNumber ?? "-")}
                          </div>
                        </div>
                        {/* Sourcing Managers */}
                        <div className="col-span-2">
                          <div className="text-neutral-500 font-medium mb-2">
                            Sourcing Managers
                          </div>
                          {showPropertyDetails.sourcingManagers &&
                          Array.isArray(showPropertyDetails.sourcingManagers) &&
                          showPropertyDetails.sourcingManagers.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-neutral-200">
                              <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                      #
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                      Name
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                      Contact
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-neutral-200">
                                  {showPropertyDetails.sourcingManagers.map(
                                    (manager: any, index: number) => (
                                      <tr
                                        key={index}
                                        className="hover:bg-neutral-50"
                                      >
                                        <td className="px-3 py-2 text-sm font-medium text-neutral-900">
                                          {index + 1}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-neutral-800">
                                          {manager.name || "-"}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-neutral-800">
                                          {manager.contact || "-"}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            // Fallback to legacy single manager format
                            <div className="overflow-hidden rounded-lg border border-neutral-200">
                              <table className="min-w-full divide-y divide-neutral-200">
                                <thead className="bg-neutral-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                      Name
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase">
                                      Contact
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  <tr className="hover:bg-neutral-50">
                                    <td className="px-3 py-2 text-sm text-neutral-800">
                                      {String(
                                        showPropertyDetails.smName ?? "-"
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-neutral-800">
                                      {String(
                                        showPropertyDetails.smContact ?? "-"
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submitter Information */}
                    {(() => {
                      const submitter = getUserInfo(
                        showPropertyDetails.submittedBy
                      );
                      if (submitter) {
                        return (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="text-md font-semibold text-blue-800 mb-2">
                              Submitted by
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="text-sm">
                                <div className="text-blue-600 font-medium">
                                  Full Name
                                </div>
                                <div className="text-blue-800">
                                  {submitter.fullName}
                                </div>
                              </div>
                              <div className="text-sm">
                                <div className="text-blue-600 font-medium">
                                  Email
                                </div>
                                <div className="text-blue-800">
                                  {submitter.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </>
              )
            ) : showPropertyDetails ? (
              // Existing resale/rental property details
              <>
                {/* Sticky Header */}
                <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6 z-10">
                  <h3 className="text-lg font-semibold mb-4">
                    {showPropertyDetails.category === "resale"
                      ? `Resale Property - ${showPropertyDetails.society}`
                      : `Rental Property - ${showPropertyDetails.society}`}
                  </h3>

                  <div className="mb-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        showPropertyDetails.isApproved
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {showPropertyDetails.isApproved
                        ? "Approved"
                        : "Pending Approval"}
                    </span>
                    <span className="ml-2 text-sm text-neutral-500">
                      Created on{" "}
                      {format(
                        toDate(showPropertyDetails.createdAt),
                        "dd MMM yyyy"
                      )}
                    </span>
                  </div>

                  {/* Action buttons for resale and rental properties */}
                  {(showPropertyDetails.category === "resale" ||
                    showPropertyDetails.category === "rental") && (
                    <div className="flex gap-2 mt-3">
                      {/* Modify button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startEditProperty}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modify
                      </Button>

                      <div>
                        {!showPropertyDetails.isApproved &&
                          !editPropertyMode && (
                            <Button
                              variant="primary"
                              icon={<Check className="h-4 w-4 mr-1" />}
                              onClick={async () => {
                                if (
                                  showPropertyDetails.category === "resale" ||
                                  showPropertyDetails.category === "rental"
                                ) {
                                  await handleApproveProperty(
                                    showPropertyDetails.id,
                                    showPropertyDetails.category
                                  );
                                }
                                setShowPropertyDetails(null);
                                cancelEditProperty();
                              }}
                            >
                              Approve
                            </Button>
                          )}
                      </div>

                      {/* Unapprove button for approved properties */}
                      {showPropertyDetails.isApproved &&
                        user?.role === "admin" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                setActionLoading(true);
                                // Update property status to unapproved
                                await updatePropertyStatus(
                                  showPropertyDetails.userId!,
                                  showPropertyDetails.category,
                                  showPropertyDetails.docId ||
                                    showPropertyDetails.id,
                                  {
                                    isApproved: false,
                                    approvedAt: null,
                                    approvedBy: null,
                                  }
                                );

                                // Update local state
                                const propertyId =
                                  showPropertyDetails.docId ||
                                  showPropertyDetails.id;
                                setInventory((prev) => ({
                                  ...prev,
                                  [showPropertyDetails.category]: prev[
                                    showPropertyDetails.category as
                                      | "resale"
                                      | "rental"
                                  ].map((p) =>
                                    (p.docId || p.id) === propertyId
                                      ? { ...p, isApproved: false }
                                      : p
                                  ),
                                }));

                                setShowPropertyDetails(null);
                                toast.success(
                                  "Property unapproved successfully!"
                                );
                              } catch (error) {
                                
                                toast.error("Failed to unapprove property");
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            disabled={actionLoading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Unapprove
                          </Button>
                        )}
                    </div>
                  )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {editPropertyMode &&
                  showPropertyDetails.category === "rental" ? (
                    <form
                      onSubmit={handleSubmitRental((data) => {
                        const processedData = {
                          ...data,
                          rent: data.expectedRent
                            ? Number(data.expectedRent)
                            : undefined,
                          deposit: data.securityDeposit
                            ? Number(data.securityDeposit)
                            : undefined,
                          contactName: data.ownerName,
                          contactNumber: data.ownerNumber,
                          flatNo: data.flatNo ? Number(data.flatNo) : undefined,
                          floorNo: data.floorNo
                            ? Number(data.floorNo)
                            : undefined,
                          totalFloors: data.totalFloors
                            ? Number(data.totalFloors)
                            : undefined,
                        };

                        updateRentalProperty(
                          showPropertyDetails.userId!,
                          showPropertyDetails.docId || showPropertyDetails.id,
                          processedData,
                          { skipApprovalReset: true }
                        )
                          .then(() => {
                            toast.success("Property updated successfully!");
                            cancelEditProperty();
                          })
                          .catch(() => {
                            toast.error("Failed to update property");
                          });
                      })}
                      className="space-y-6"
                    >
                      <h4 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2 border-neutral-200">
                        Edit Rental Property
                      </h4>

                      {/* Basic Details */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="font-semibold text-neutral-700 mb-3">
                          Basic Details
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            id="society"
                            label="Building/Society Name"
                            error={errorsRental.society?.message}
                            {...registerRental("society", {
                              required: "Building/Society name is required",
                            })}
                          />
                          <Input
                            id="sublocation"
                            label="Sublocation"
                            {...registerRental("sublocation")}
                          />
                          <Input
                            id="landmark"
                            label="Landmark"
                            {...registerRental("landmark")}
                          />
                          <Input
                            id="pincode"
                            label="PIN Code"
                            type="text"
                            maxLength={6}
                            {...registerRental("pincode", {
                              required: "PIN code is required",
                              pattern: {
                                value: /^[0-9]{6}$/,
                                message: "Enter valid 6-digit PIN code",
                              },
                            })}
                          />
                          <Input
                            id="station"
                            label="Station"
                            {...registerRental("station")}
                          />
                          <Input
                            id="district"
                            label="District"
                            {...registerRental("district")}
                          />
                          <Input
                            id="state"
                            label="State"
                            {...registerRental("state")}
                          />
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="font-semibold text-neutral-700 mb-3">
                          Property Details
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SearchableDropdown
                            label="Configuration"
                            value={watchRental("type")}
                            onChange={(val) => setValueRental("type", val)}
                            options={propertyTypes}
                            error={errorsRental.type?.message}
                          />
                          <Input
                            id="buildingNo"
                            label="Building No./Wing"
                            {...registerRental("buildingNo", {
                              required: "Building No./Wing is required",
                            })}
                          />
                          <Input
                            id="flatNo"
                            label="Flat No."
                            type="text"
                            {...registerRental("flatNo", {
                              required: "Flat No. is required",
                            })}
                          />
                          <Input
                            id="floorNo"
                            label="Floor No."
                            type="text"
                            {...registerRental("floorNo", {
                              required: "Floor No. is required",
                            })}
                          />
                          <Input
                            id="totalFloors"
                            label="Total Floors"
                            type="text"
                            {...registerRental("totalFloors", {
                              required: "Total floors is required",
                            })}
                          />
                          <Input
                            id="expectedRent"
                            label="Expected Rent (?)"
                            type="text"
                            {...registerRental("expectedRent", {
                              required: "Expected rent is required",
                            })}
                          />
                          <Input
                            id="securityDeposit"
                            label="Security Deposit (?)"
                            type="text"
                            {...registerRental("securityDeposit", {
                              required: "Security deposit is required",
                            })}
                          />
                          <SearchableDropdown
                            label="Furnishing"
                            value={watchRental("furnishing")}
                            onChange={(val) =>
                              setValueRental("furnishing", val)
                            }
                            options={furnishingOptions}
                          />
                          <SearchableDropdown
                            label="Parking"
                            value={watchRental("parking")}
                            onChange={(val) => setValueRental("parking", val)}
                            options={parkingOptions}
                          />
                        </div>
                      </div>

                      {/* Others */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="font-semibold text-neutral-700 mb-3">
                          Others
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            id="ownerName"
                            label="Owner Name"
                            {...registerRental("ownerName", {
                              required: "Owner name is required",
                            })}
                          />
                          <Input
                            id="ownerNumber"
                            label="Owner Number"
                            type="text"
                            maxLength={10}
                            {...registerRental("ownerNumber", {
                              required: "Owner number is required",
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: "Enter valid 10-digit number",
                              },
                            })}
                          />
                          <Input
                            id="connectedPerson"
                            label="Connected Person"
                            placeholder="Employee name"
                            {...registerRental("connectedPerson")}
                          />
                          <Input
                            id="imageUrl"
                            label="Image URL"
                            {...registerRental("imageUrl")}
                          />
                          <Input
                            id="videoUrl"
                            label="Video URL"
                            {...registerRental("videoUrl")}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={actionLoading}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditProperty}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : editPropertyMode &&
                    showPropertyDetails.category === "resale" ? (
                    <form
                      onSubmit={handleSubmitResale((data) => {
                        const processedData = {
                          ...data,
                          expectedPrice: data.expectedPrice
                            ? Number(data.expectedPrice)
                            : undefined,
                          carpetArea: data.carpetArea
                            ? Number(data.carpetArea)
                            : undefined,
                          builtUpArea: data.builtUpArea
                            ? Number(data.builtUpArea)
                            : undefined,
                          maintenance: data.maintenance
                            ? Number(data.maintenance)
                            : undefined,
                          contactName: data.ownerName,
                          contactNumber: data.ownerNumber,
                          flatNo: data.flatNo ? Number(data.flatNo) : undefined,
                          floorNo: data.floorNo
                            ? Number(data.floorNo)
                            : undefined,
                          totalFloors: data.totalFloors
                            ? Number(data.totalFloors)
                            : undefined,
                          propertyAge: data.propertyAge
                            ? Number(data.propertyAge)
                            : undefined,
                          negotiable: data.negotiable === "true",
                          ocAvailable: data.ocAvailable === "true",
                          cosmo: data.cosmoSociety === "true",
                          masterBed: data.masterBed === "true",
                        };

                        updateResaleProperty(
                          showPropertyDetails.userId!,
                          showPropertyDetails.docId || showPropertyDetails.id,
                          processedData,
                          { skipApprovalReset: true }
                        )
                          .then(() => {
                            toast.success("Property updated successfully!");
                            cancelEditProperty();
                          })
                          .catch(() => {
                            toast.error("Failed to update property");
                          });
                      })}
                      className="space-y-6"
                    >
                      <h4 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2 border-neutral-200">
                        Edit Resale Property
                      </h4>

                      {/* Basic Details */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="font-semibold text-neutral-700 mb-3">
                          Basic Details
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            id="society"
                            label="Building/Society Name"
                            error={errorsResale.society?.message}
                            {...registerResale("society", {
                              required: "Building/Society name is required",
                            })}
                          />
                          <Input
                            id="sublocation"
                            label="Sublocation"
                            {...registerResale("sublocation")}
                          />
                          <Input
                            id="landmark"
                            label="Landmark"
                            {...registerResale("landmark")}
                          />
                          <Input
                            id="pincode"
                            label="PIN Code"
                            type="text"
                            maxLength={6}
                            {...registerResale("pincode", {
                              required: "PIN code is required",
                              pattern: {
                                value: /^[0-9]{6}$/,
                                message: "Enter valid 6-digit PIN code",
                              },
                            })}
                          />
                          <Input
                            id="station"
                            label="Station"
                            {...registerResale("station")}
                          />
                          <Input
                            id="district"
                            label="District"
                            {...registerResale("district")}
                          />
                          <Input
                            id="state"
                            label="State"
                            {...registerResale("state")}
                          />
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="font-semibold text-neutral-700 mb-3">
                          Property Details
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <SearchableDropdown
                            label="Configuration"
                            value={watchResale("type")}
                            onChange={(val) => setValueResale("type", val)}
                            options={propertyTypes}
                            error={errorsResale.type?.message}
                          />
                          <Input
                            id="buildingNo"
                            label="Building No./Wing"
                            {...registerResale("buildingNo", {
                              required: "Building No./Wing is required",
                            })}
                          />
                          <Input
                            id="flatNo"
                            label="Flat No."
                            type="text"
                            {...registerResale("flatNo", {
                              required: "Flat No. is required",
                            })}
                          />
                          <Input
                            id="floorNo"
                            label="Floor No."
                            type="text"
                            {...registerResale("floorNo", {
                              required: "Floor No. is required",
                            })}
                          />
                          <Input
                            id="totalFloors"
                            label="Total Floors"
                            type="text"
                            {...registerResale("totalFloors", {
                              required: "Total floors is required",
                            })}
                          />
                          <Input
                            id="expectedPrice"
                            label="Expected Price (?)"
                            type="text"
                            {...registerResale("expectedPrice", {
                              required: "Expected price is required",
                            })}
                          />
                          <Input
                            id="carpetArea"
                            label="Carpet Area (sq ft)"
                            type="text"
                            {...registerResale("carpetArea", {
                              required: "Carpet area is required",
                            })}
                          />
                          <Input
                            id="builtUpArea"
                            label="Built-up Area (sq ft)"
                            type="text"
                            {...registerResale("builtUpArea", {
                              required: "Built-up area is required",
                            })}
                          />
                          <Input
                            id="propertyAge"
                            label="Property Age (years)"
                            type="text"
                            {...registerResale("propertyAge", {
                              required: "Property age is required",
                            })}
                          />
                          <Input
                            id="maintenance"
                            label="Maintenance (?)"
                            type="text"
                            {...registerResale("maintenance")}
                          />
                        </div>
                      </div>

                      {/* Others */}
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <h5 className="font-semibold text-neutral-700 mb-3">
                          Others
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            id="ownerName"
                            label="Owner Name"
                            {...registerResale("ownerName", {
                              required: "Owner name is required",
                            })}
                          />
                          <Input
                            id="ownerNumber"
                            label="Owner Number"
                            type="text"
                            {...registerResale("ownerNumber", {
                              required: "Owner number is required",
                            })}
                          />
                          <Input
                            id="connectedPerson"
                            label="Connected Person"
                            {...registerResale("connectedPerson")}
                          />
                          <Input
                            id="imageUrl"
                            label="Image URL"
                            {...registerResale("imageUrl")}
                          />
                          <Input
                            id="videoUrl"
                            label="Video URL"
                            {...registerResale("videoUrl")}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditProperty}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={actionLoading}
                        >
                          Update Property
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h4 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2 border-neutral-200">
                        Property Details
                      </h4>

                      <div className="space-y-6">
                        {/* Basic Details */}
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <h5 className="font-semibold text-neutral-700 mb-3">
                            Basic Details
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editPropertyMode ? (
                              <>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Building/Society Name
                                  </label>
                                  <Input
                                    id="editSociety"
                                    value={editedProperty?.society ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? { ...prev, society: e.target.value }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Sublocation
                                  </label>
                                  <Input
                                    id="editSublocation"
                                    value={editedProperty?.sublocation ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              sublocation: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Landmark
                                  </label>
                                  <Input
                                    id="editLandmark"
                                    value={editedProperty?.landmark ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              landmark: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    PIN Code
                                  </label>
                                  <Input
                                    id="editPincode"
                                    value={editedProperty?.pincode ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? { ...prev, pincode: e.target.value }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Station
                                  </label>
                                  <Input
                                    id="editStation"
                                    value={editedProperty?.station ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? { ...prev, station: e.target.value }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    District
                                  </label>
                                  <Input
                                    id="editDistrict"
                                    value={editedProperty?.district ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              district: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    State
                                  </label>
                                  <Input
                                    id="editState"
                                    value={editedProperty?.state ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? { ...prev, state: e.target.value }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <Field
                                  label="Building/Society Name"
                                  value={showPropertyDetails.society}
                                />
                                <Field
                                  label="Sublocation"
                                  value={showPropertyDetails.sublocation}
                                />
                                <Field
                                  label="Landmark"
                                  value={showPropertyDetails.landmark}
                                />
                                <Field
                                  label="PIN Code"
                                  value={showPropertyDetails.pincode}
                                />
                                <Field
                                  label="Station"
                                  value={showPropertyDetails.station}
                                />
                                <Field
                                  label="District"
                                  value={showPropertyDetails.district}
                                />
                                <Field
                                  label="State"
                                  value={showPropertyDetails.state}
                                />
                              </>
                            )}
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <h5 className="font-semibold text-neutral-700 mb-3">
                            Property Details
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editPropertyMode ? (
                              <>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Configuration
                                  </label>
                                  <Input
                                    id="editType"
                                    value={editedProperty?.type ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? { ...prev, type: e.target.value }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Building No./Wing
                                  </label>
                                  <Input
                                    id="editBuildingNo"
                                    value={editedProperty?.buildingNo ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              buildingNo: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Flat No.
                                  </label>
                                  <Input
                                    id="editFlatNo"
                                    value={editedProperty?.flatNo ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? { ...prev, flatNo: e.target.value }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Floor No.
                                  </label>
                                  <Input
                                    id="editFloorNo"
                                    value={editedProperty?.floorNo ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? { ...prev, floorNo: e.target.value }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Total Floors
                                  </label>
                                  <Input
                                    id="editTotalFloors"
                                    value={editedProperty?.totalFloors ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              totalFloors:
                                                Number(e.target.value) || 0,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                {showPropertyDetails &&
                                showPropertyDetails.category === "resale" ? (
                                  <div>
                                    <label className="text-sm text-neutral-500">
                                      Expected Price (₹)
                                    </label>
                                    <Input
                                      id="editExpectedPrice"
                                      value={
                                        editedProperty?.expectedPrice ?? ""
                                      }
                                      onChange={(e) =>
                                        setEditedProperty((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                expectedPrice:
                                                  Number(e.target.value) || 0,
                                              }
                                            : prev
                                        )
                                      }
                                    />
                                  </div>
                                ) : showPropertyDetails ? (
                                  <>
                                    <div>
                                      <label className="text-sm text-neutral-500">
                                        Monthly Rent (₹)
                                      </label>
                                      <Input
                                        id="editRent"
                                        value={editedProperty?.rent ?? ""}
                                        onChange={(e) =>
                                          setEditedProperty((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  rent:
                                                    Number(e.target.value) || 0,
                                                }
                                              : prev
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-neutral-500">
                                        Deposit (₹)
                                      </label>
                                      <Input
                                        id="editDeposit"
                                        value={editedProperty?.deposit ?? ""}
                                        onChange={(e) =>
                                          setEditedProperty((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  deposit:
                                                    Number(e.target.value) || 0,
                                                }
                                              : prev
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-neutral-500">
                                        Furnishing
                                      </label>
                                      <Input
                                        id="editFurnishing"
                                        value={editedProperty?.furnishing ?? ""}
                                        onChange={(e) =>
                                          setEditedProperty((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  furnishing: e.target.value,
                                                }
                                              : prev
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm text-neutral-500">
                                        Available From
                                      </label>
                                      <Input
                                        id="editAvailableFrom"
                                        value={
                                          editedProperty?.availableFrom ?? ""
                                        }
                                        onChange={(e) =>
                                          setEditedProperty((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  availableFrom: e.target.value,
                                                }
                                              : prev
                                          )
                                        }
                                      />
                                    </div>
                                  </>
                                ) : null}
                              </>
                            ) : (
                              <>
                                <Field
                                  label="Configuration"
                                  value={showPropertyDetails.type}
                                />
                                {showPropertyDetails.type === "1 BHK" && (
                                  <Field
                                    label="Master Bed"
                                    value={showPropertyDetails.masterBed}
                                  />
                                )}
                                <Field
                                  label="Building No./Wing"
                                  value={showPropertyDetails.buildingNo}
                                />
                                <Field
                                  label="Flat No."
                                  value={showPropertyDetails.flatNo}
                                />
                                <Field
                                  label="Floor No."
                                  value={showPropertyDetails.floorNo}
                                />
                                <Field
                                  label="Total Floors"
                                  value={showPropertyDetails.totalFloors}
                                />
                                <Field
                                  label="Carpet Area (sq ft)"
                                  value={showPropertyDetails.carpetArea}
                                />
                                <Field
                                  label="Built-up Area (sq ft)"
                                  value={showPropertyDetails.builtUpArea}
                                />
                                <Field
                                  label="Property Age (years)"
                                  value={showPropertyDetails.propertyAge}
                                />
                                <Field
                                  label="OC Available"
                                  value={
                                    showPropertyDetails.ocAvailable === "true"
                                      ? "Yes"
                                      : "No"
                                  }
                                />
                                <Field
                                  label="Amenities"
                                  value={
                                    Array.isArray(showPropertyDetails.amenities)
                                      ? showPropertyDetails.amenities.join(", ")
                                      : showPropertyDetails.amenities
                                  }
                                />
                                <Field
                                  label="Furnishing"
                                  value={showPropertyDetails.furnishing}
                                />
                                <Field
                                  label="Parking"
                                  value={showPropertyDetails.parking}
                                />
                                <Field
                                  label="Terrace/Gallery"
                                  value={showPropertyDetails.terraceGallery}
                                />
                                <Field
                                  label="Cosmo Society"
                                  value={
                                    showPropertyDetails.cosmoSociety === "true"
                                      ? "Yes"
                                      : "No"
                                  }
                                />
                                <Field
                                  label="Expected Price (₹)"
                                  value={showPropertyDetails.expectedPrice?.toLocaleString(
                                    "en-IN"
                                  )}
                                />
                                <Field
                                  label="Negotiable"
                                  value={
                                    showPropertyDetails.negotiable === "true"
                                      ? "Yes"
                                      : "No"
                                  }
                                />
                                <Field
                                  label="Maintenance per Month (₹)"
                                  value={showPropertyDetails.maintenance?.toLocaleString(
                                    "en-IN"
                                  )}
                                />
                              </>
                            )}
                          </div>
                        </div>

                        {/* Others */}
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <h5 className="font-semibold text-neutral-700 mb-3">
                            Others
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editPropertyMode ? (
                              <>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Owner Name
                                  </label>
                                  <Input
                                    id="editOwnerName"
                                    value={editedProperty?.ownerName ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              ownerName: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Owner Number
                                  </label>
                                  <Input
                                    id="editOwnerNumber"
                                    value={editedProperty?.ownerNumber ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              ownerNumber: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Connected Person
                                  </label>
                                  <Input
                                    id="editConnectedPerson"
                                    value={
                                      editedProperty?.connectedPerson ?? ""
                                    }
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              connectedPerson: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Image URL
                                  </label>
                                  <Input
                                    id="editImageUrl"
                                    value={editedProperty?.imageUrl ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              imageUrl: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-neutral-500">
                                    Video URL
                                  </label>
                                  <Input
                                    id="editVideoUrl"
                                    value={editedProperty?.videoUrl ?? ""}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              videoUrl: e.target.value,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <Field
                                  label="Owner Name"
                                  value={showPropertyDetails.ownerName}
                                />
                                <Field
                                  label="Owner Number"
                                  value={showPropertyDetails.ownerNumber}
                                />
                                <Field
                                  label="Connected Person"
                                  value={showPropertyDetails.connectedPerson}
                                />
                                <Field
                                  label="Image URL"
                                  value={showPropertyDetails.imageUrl}
                                />
                                <Field
                                  label="Video URL"
                                  value={showPropertyDetails.videoUrl}
                                />
                              </>
                            )}
                          </div>
                        </div>

                        {/* Submitter Information */}
                        {(() => {
                          const submitter = getUserInfo(
                            showPropertyDetails.userId
                          );
                          if (submitter) {
                            return (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h5 className="font-semibold text-blue-800 mb-3">
                                  Submitted by
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="text-sm">
                                    <div className="text-blue-600 font-medium">
                                      Full Name
                                    </div>
                                    <div className="text-blue-800">
                                      {submitter.fullName}
                                    </div>
                                  </div>
                                  <div className="text-sm">
                                    <div className="text-blue-600 font-medium">
                                      Email
                                    </div>
                                    <div className="text-blue-800">
                                      {submitter.email}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Status */}
                        <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4">
                          <h5 className="font-semibold text-neutral-700 mb-3">
                            Status
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editPropertyMode ? (
                              <div>
                                <label className="text-sm text-neutral-500">
                                  Approval Status
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={!!editedProperty?.isApproved}
                                    onChange={(e) =>
                                      setEditedProperty((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              isApproved: e.target.checked,
                                            }
                                          : prev
                                      )
                                    }
                                  />
                                  <span>
                                    {editedProperty?.isApproved
                                      ? "Approved"
                                      : "Pending"}
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <>
                                <Field
                                  label="Approval Status"
                                  value={
                                    showPropertyDetails.isApproved
                                      ? "Approved"
                                      : "Pending"
                                  }
                                />
                                <Field
                                  label="Created At"
                                  value={
                                    showPropertyDetails.createdAt
                                      ? format(
                                          toDate(
                                            showPropertyDetails.createdAt as Timestamp
                                          ),
                                          "dd MMM yyyy"
                                        )
                                      : "N/A"
                                  }
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between">
                        {editPropertyMode && (
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              isLoading={actionLoading}
                              onClick={saveEditedProperty}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={cancelEditProperty}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Property Rejection Modal */}
      {showRejectModal && rejectingProperty && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-red-600">
                Reject Property
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Please provide a reason for rejecting this property.
              </p>
            </div>

            <div className="p-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                required
              />
            </div>

            <div className="p-4 border-t border-neutral-200 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingProperty(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={actionLoading}
                disabled={!rejectionReason.trim()}
                onClick={async () => {
                  if (rejectingProperty && rejectionReason.trim()) {
                    await handleRejectProperty(
                      rejectingProperty.id,
                      rejectingProperty.category,
                      rejectionReason.trim()
                    );
                    setShowRejectModal(false);
                    setRejectingProperty(null);
                    setRejectionReason("");
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Property
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
