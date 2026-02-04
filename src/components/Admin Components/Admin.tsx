import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Tabs from "../ui/Tabs";
import {
  getUsers,
  getResaleProperties,
  getRentalProperties,
  updatePropertyStatus,
  updateResaleProperty,
  updateRentalProperty,
  updateUserRole,
} from "../../utils/firestoreListings";
import { User } from "../../types";
import { useAuth } from "../../utils/authContext";
import CostSheetForm from "./CostSheetForm";
import { useForm } from "react-hook-form";
// import TagInput from "../utils/rrAmenitiesInput";
import {
  ResaleFormData,
  RentalFormData,
  fetchStates,
  fetchCities,
} from "../../utils/api";
import { State, City } from "../../types";
import {
  onSnapshot,
  collection,
  doc,
  // getDoc,
  Timestamp,
  getDocs,
  deleteDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../utils/firebase";

import { UserRole } from "../../types";
import { usePermissions } from "../../hooks/usePermissions";

import { manageRejectionModal } from "./manageRejectionModal";
import { showUserDetailsModal } from "./showUserDetailsModal";
import { handlePropertyDetails } from "./handlePropertyDetails";

import { manageUsersTab } from "./manageUsersTab";
import PricingManager from "./PricingComponents/PricingManager";
import { renderPropertyApprovalTabs } from "./PropertyApprovalTabs/renderPropertyApprovalTabs";
import { displaySubscriptionInfo } from "./displaySubscriptionInfo";
import { NewPropertyModal } from "../NewPropertyTables/NewPropertyModal";
import {
  Property,
  SubscriptionDisplayProps,
  SubscriptionInfo,
  toDate,
  toTitleCase,
} from "./helperFunctions";

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

  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const [userSubscriptions, setUserSubscriptions] = useState<
    SubscriptionInfo[]
  >([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

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
        import("../../utils/api").then(({ fetchCities }) => {
          fetchCities(stateObj.iso2)
            .then((citiesData) => {
              setCities(citiesData);
            })
            .catch((error) => {});
        });
      }
    }

    // Prefill form fields
    resetRental({
      society: property.society || "",
      sublocation: property.sublocation || "",
      sublocality: property.sublocation || "",
      landmark: property.landmark || "",
      pincode: property.pincode || property.pinCode || "",
      station: property.station || "",
      district: property.district || "",
      state: property.state || "",
      type: property.type || "",
      masterBed: property.masterBed ? "true" : "false",
      buildingNo: property.buildingNo || "",
      flatNo: Number(property.flatNo) || 0,
      floorNo: Number(property.floorNo) || 0,
      totalFloors: Number(property.totalFloors) || 0,
      propertyAge: Number(property.propertyAge) || 0,
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
        flatNo: Number(data.flatNo) || 0,
        floorNo: Number(data.floorNo) || 0,
        totalFloors: Number(data.totalFloors) || 0,
        propertyAge: Number(data.propertyAge) || 0,
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
        import("../../utils/api").then(({ fetchCities }) => {
          fetchCities(stateObj.iso2)
            .then((citiesData) => {
              setCities(citiesData);
            })
            .catch((error) => {});
        });
      }
    }

    // Prefill form fields
    resetResale({
      society: property.society || "",
      sublocation: property.sublocation || "",
      sublocality: property.sublocation || "",
      landmark: property.landmark || "",
      pincode: property.pincode || property.pinCode || "",
      station: property.station || "",
      district: property.district || "",
      state: property.state || "",
      type: property.type || "",
      masterBed: property.masterBed ? "true" : "false",
      buildingNo: property.buildingNo || "",
      flatNo: Number(property.flatNo) || 0,
      floorNo: Number(property.floorNo) || 0,
      totalFloors: Number(property.totalFloors) || 0,
      carpetArea: property.carpetArea?.toString() || "",
      builtUpArea: property.builtUpArea?.toString() || "",
      propertyAge: Number(property.propertyAge) || 0,
      amenities: property.amenities || [],
      furnishing: property.furnishing || "",
      parking: property.parking || "",
      terraceGallery: property.terraceGallery || "",
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
        flatNo: Number(data.flatNo) || 0,
        floorNo: Number(data.floorNo) || 0,
        totalFloors: Number(data.totalFloors) || 0,
        propertyAge: Number(data.propertyAge) || 0,
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

  // Helper function to get user info by ID
  const getUserInfo = (userId: string) => {
    return userDataMap[userId] || null;
  };







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
        const { getCostSheets } = await import("../../utils/firestoreListings");
        const allNewProperties = await getCostSheets();

        // Set up real-time listener for cost sheets
        costSheetsUnsubscribe = onSnapshot(
          collection(db, "TestingCostSheets"),
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
          (error) => {}
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
      } catch (error) {}
    };
    loadStates();
  }, []);




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
        const propertyRef = doc(db, "TestingCostSheets", docId);
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
      const { updateCostSheet } = await import("../../utils/firestoreListings");
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
        const propertyRef = doc(db, "TestingCostSheets", propertyId);
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

    return displaySubscriptionInfo(subscription, getLocationText);
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
        content: renderPropertyApprovalTabs(
          pendingProperties,
          pendingSearchTerms,
          setPendingSearchTerms,
          pendingFilters,
          setPendingFilters,
          getPendingResaleTypes,
          setShowPropertyDetails,
          handleApproveProperty,
          actionLoading,
          setRejectingProperty,
          setShowRejectModal,
          pendingNewPropertyReraRange,
          setPendingNewPropertyReraRange,
          getUserInfo as any,
          handleApproveNewProperty,
          setShowNewPropertyModal,
          approvedProperties,
          approvedSearchTerms,
          setApprovedSearchTerms,
          approvedFilters,
          setApprovedFilters,
          getAvailableResaleTypes,
          filteredApprovedProperties,
          getAvailableRentalTypes,
          getAvailableNewPropertyTypes,
          rejectedProperties,
          rejectedSearchTerms,
          setRejectedSearchTerms,
          rejectedFilters,
          setRejectedFilters,
          getRejectedResaleTypes,
          filteredRejectedProperties,
          user,
          handleApproveRejectedProperty,
          getRejectedRentalTypes,
          getRejectedNewPropertyTypes
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
        content: manageUsersTab(
          permissions,
          filteredUsers,
          users,
          searchTerm,
          setSearchTerm,
          roleFilter,
          setRoleFilter,
          setModalLoading,
          setShowPropertiesModal,
          setModalTitle,
          setModalProperties,
          viewUserDetails,
          showPropertiesModal,
          modalTitle,
          modalLoading,
          modalProperties
        ),
      });
    }

    // Pricing tab - admin only
    if (permissions.canManagePricing()) {
      baseTabs.push({
        id: "pricing",
        label: "Pricing",
        content: <PricingManager />,
      });
    }

    // Stamp Duty tab - admin only
    // if (permissions.canManageStampDuty()) {
    //   baseTabs.push({
    //     id: "stampDuty",
    //     label: "Stamp Duty",
    //     content: (
    //       <div className="p-6 text-center text-neutral-600">
    //         Stamp Duty management has been moved to separate components.
    //       </div>
    //     ),
    //   });
    // }

    return baseTabs;
  };

  // Add edit mode state for property modal
  const [editPropertyMode, setEditPropertyMode] = useState(false);
  const [editedProperty, setEditedProperty] =
    useState<ShowPropertyDetails | null>(null);

  // New Property Modal state
  const [showNewPropertyModal, setShowNewPropertyModal] = useState<any>(null);

  // Media modal states for property details
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

  // Keyboard navigation for full viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullViewer.isOpen) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFullViewer((prev) => ({
          ...prev,
          currentIndex:
            (prev.currentIndex - 1 + prev.files.length) % prev.files.length,
        }));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setFullViewer((prev) => ({
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.files.length,
        }));
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
      {showUserModal &&
        userDetails &&
        showUserDetailsModal(
          setShowUserModal,
          userDetails,
          editingRole,
          selectedRole,
          setSelectedRole,
          handleRoleUpdate,
          actionLoading,
          setEditingRole,
          permissions,
          userSubscriptions,
          loadingSubscriptions,
          SubscriptionDisplay
        )}

      {/* Property Details Modal */}
      {showPropertyDetails &&
        handlePropertyDetails(
          setShowPropertyDetails,
          cancelEditProperty,
          showPropertyDetails,
          editPropertyMode,
          setInventory,
          user,
          setEditPropertyMode,
          setEditedProperty,
          handleApproveNewProperty,
          setRejectingProperty,
          setShowRejectModal,
          Field,
          getUserInfo as any,
          startEditProperty,
          handleApproveProperty,
          setActionLoading,
          actionLoading,
          handleSubmitRental,
          errorsRental,
          registerRental,
          watchRental,
          setValueRental,
          handleSubmitResale,
          errorsResale,
          registerResale,
          watchResale,
          setValueResale,
          editedProperty,
          saveEditedProperty,
          mediaModal,
          setMediaModal,
          fullViewer,
          setFullViewer
        )}

      {/* Property Rejection Modal */}
      {showRejectModal &&
        rejectingProperty &&
        manageRejectionModal(
          rejectionReason,
          setRejectionReason,
          setShowRejectModal,
          setRejectingProperty,
          actionLoading,
          rejectingProperty,
          handleRejectProperty
        )}

      {/* New Property Modal */}
      {showNewPropertyModal && (
        <NewPropertyModal
          Section={({
            title,
            children,
          }: {
            title: string;
            children: React.ReactNode;
          }) => (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-neutral-800 border-b border-neutral-200 pb-2">
                {title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
              </div>
            </div>
          )}
          Field={Field}
          selectedSheet={showNewPropertyModal}
          user={user}
          onClose={() => setShowNewPropertyModal(null)}
        />
      )}
    </div>
  );
};

export default Admin;
