import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import toast from "react-hot-toast";

// PDF.js for thumbnail generation with proper error handling
export const pdfjsLib = (() => {
  try {
    return (window as Window & { pdfjsLib?: unknown })?.pdfjsLib || null;
  } catch (error) {
    console.warn("PDF.js library not available:", error);
    return null;
  }
})();

if (pdfjsLib) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  } catch (error) {
    console.error("Failed to configure PDF.js worker:", error);
  }
}
import {
  getCostSheets,
  addCostSheet,
  updateCostSheet,
} from "../../utils/firestoreListings";
import { deleteMatchedPropertiesFromOldDB } from "../../utils/deleteMatchedProperties";
import { normalizeForEdit } from "../../utils/costSheetAdapter";

import { CostSheet } from "../../pages/Compare";
import {
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { useAuth } from "../../utils/authContext";
import { StampDutyRate } from "../../pages/Compare";
import { fetchCities, fetchStates } from "../../utils/api";
import { State, City } from "../../types";
import AmenityModal from "../AmenityModal";
import StampDutyDebugger from "../StampDutyDebugger";
import JurisdictionModal from "../JurisdictionModal";
import {
  getStampDutyRate,
  debugStampDutyLookup,
  findStampDutyRate,
} from "../../utils/stampDutyUtils";
import { costSheetFields } from "../../pages/costSheetFields";
import { useLocationData } from "../../hooks/useLocationData";
import {
  categories,
  CostSheetFormProps,
  fetchCostSheetStations,
  FormDataType,
  generatePdfThumbnailFromFile,
  getApprovedFlatTypes,
  requiredPerStep,
  toTitleCase,
} from "../../pages/CostSheetFormProps";
import { handleEditPropertyForm } from "../EditProperty/EditPropertyTabs";
import { handleNewEntryForm } from "../NewPropertyForm/NewPropertyTabs";
import { handleNewPropertyTable } from "../NewPropertyTables/NewPropertyTable";
import {
  cleanFileName,
  uploadFile,
  uploadFiles,
  convertReraPossession,
  removeUndefined,
  sanitizeInput,
} from "../../utils/formSubmissionUtils";

const CostSheetForm = ({ editProperty, onSave }: CostSheetFormProps = {}) => {
  const locationData = useLocationData();
  const [formData, setFormData] = useState<FormDataType>({
    locationHighlightTimes: {},
  });

  const formatIndianCurrency = (value: string | number) => {
    if (!value) return "";
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(/[^0-9.]/g, ""))
        : value;
    if (isNaN(num)) return "";
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const parseIndianCurrency = (value: string) => {
    return value.replace(/[^0-9.]/g, "");
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [costSheets, setCostSheets] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = categories.length;
  const activeCategory = categories[currentStep];
  const [showForm, setShowForm] = useState(false);

  // Reset all form states to initial values
  const resetFormStates = () => {
    setFormData({ locationHighlightTimes: {} });
    setCurrentStep(0);
    setSubTabs([{ id: 0, name: "RERA-1" }]);
    setActiveSubTab(0);
    setSubTabData({
      0: {
        wingBuildingNo: "",
        projectStatus: "",
        type: "",
        developerPossession: "",
        reraPossession: "",
        mahaReraNumber: "",
        mahaReraLink: "",
        pricingConfigs: [
          {
            typology: "",
            saleableArea: "",
            reraCarpet: "",
            psfRate: "",
            avRate: "",
            fixedComponent: "",
            possessionCharges: "",
            totalPackage: "",
            negotiationScope: "",
            availability: "",
            unitPlan: null,
          },
        ],
      },
    });
    setFloorRiseConfig({
      startsFrom: "",
      rate: "",
      fixedRateStartsFrom: "",
      typologyRates: {},
    });
    setFloorBandConfig([{ fromFloor: "", toFloor: "", rates: {} }]);
    setPaymentSchemes([
      { schemeName: "", description: "", fromDate: "", toDate: "" },
    ]);
    setLadderSections([
      {
        id: 1,
        startDate: "",
        endDate: "",
        rows: [{ units: "", ladder: "", additionalIncentive: "" }],
      },
    ]);
    setSiteHeads([{ name: "", contact: "" }]);
    setSourcingManagers([{ name: "", contact: "" }]);
    setMediaFiles({
      brochure: null,
      elevationImages: [],
      amenitiesImages: [],
      floorPlanImages: [],
      projectWalkthrough: [],
      typologyImages: {},
      typologyVideos: {},
    });
    setExistingMedia({
      brochure: null,
      elevationImages: [],
      amenitiesImages: [],
      floorPlanImages: [],
      projectWalkthrough: [],
      typologyImages: {},
      typologyVideos: {},
    });
    setPdfThumbnail(null);
    setSelectedStateCode("");
    setCities([]);
  };
  const [selectedSheet, setSelectedSheet] = useState<CostSheet | null>(null);
  const [preloadedStateData, setPreloadedStateData] = useState<{
    stateCode: string;
    cities: City[];
  } | null>(null);

  const [customAmenities, setCustomAmenities] = useState<
    Record<string, string[]>
  >({});
  const [expandedAmenities, setExpandedAmenities] = useState<
    Record<string, boolean>
  >({});
  const { user } = useAuth();
  const [stampRates, setStampRates] = useState<StampDutyRate[]>([]);
  const [duplicateProperty, setDuplicateProperty] = useState<CostSheet | null>(
    null
  );
  const [editingProperty, setEditingProperty] = useState<CostSheet | null>(
    null
  );
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [stationOptions, setStationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [stationSearchTerm, setStationSearchTerm] = useState("");
  const [selectedStationIndex, setSelectedStationIndex] = useState(-1);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [subTabs, setSubTabs] = useState([{ id: 0, name: "RERA-1" }]);
  const [subTabData, setSubTabData] = useState({
    0: {
      wingBuildingNo: "",
      projectStatus: "",
      type: "",
      developerPossession: "",
      reraPossession: "",
      mahaReraNumber: "",
      mahaReraLink: "",
      pricingConfigs: [
        {
          typology: "",
          saleableArea: "",
          reraCarpet: "",
          psfRate: "",
          avRate: "",
          fixedComponent: "",
          possessionCharges: "",
          totalPackage: "",
          negotiationScope: "",
          availability: "",
          unitPlan: null,
        },
      ],
    },
  });
  const [showJurisdictionModal, setShowJurisdictionModal] = useState(false);
  const [showStampDutyDebugger, setShowStampDutyDebugger] = useState(false);
  const [lastCheckedDistrict, setLastCheckedDistrict] = useState<string>("");
  const [floorRiseConfig, setFloorRiseConfig] = useState({
    startsFrom: "",
    rate: "",
    fixedRateStartsFrom: "",
    typologyRates: {} as Record<string, string>,
  });
  const [floorBandConfig, setFloorBandConfig] = useState([
    { fromFloor: "", toFloor: "", rates: {} as Record<string, string> },
  ]);
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);
  const [modalAmenityType, setModalAmenityType] = useState<string>("");
  const [modalAmenityInput, setModalAmenityInput] = useState("");
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [currentAmenityField, setCurrentAmenityField] = useState<string>("");
  const [customAmenityInput, setCustomAmenityInput] = useState<
    Record<string, string>
  >({});
  const [addingAmenityFor, setAddingAmenityFor] = useState<string | null>(null);
  const [paymentSchemes, setPaymentSchemes] = useState([
    { schemeName: "", description: "", fromDate: "", toDate: "" },
  ]);
  const [ladderSections, setLadderSections] = useState([
    {
      id: 1,
      startDate: "",
      endDate: "",
      rows: [{ units: "", ladder: "", additionalIncentive: "" }],
    },
  ]);
  const [mediaFiles, setMediaFiles] = useState({
    brochure: null as File | null,
    elevationImages: [] as File[],
    amenitiesImages: [] as File[],
    floorPlanImages: [] as File[],
    projectWalkthrough: [] as File[],
    typologyImages: {} as Record<string, File[]>,
    typologyVideos: {} as Record<string, File | null>,
  });
  const [existingMedia, setExistingMedia] = useState({
    brochure: null as string | null,
    elevationImages: [] as string[],
    amenitiesImages: [] as string[],
    floorPlanImages: [] as string[],
    projectWalkthrough: [] as string[],
    typologyImages: {} as Record<string, string[]>,
    typologyVideos: {} as Record<string, string | null>,
  });
  const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);

  const generatePdfThumbnail = generatePdfThumbnailFromFile();

  // Add minimalistic glow effect with blink
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes seamless-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.4; }
      }
      .tab-glow {
        color: #f97316;
        text-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
        font-weight: 600;
        animation: seamless-blink 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Set initial state code from formData when available
  useEffect(() => {
    if (formData.state && states.length > 0 && !selectedStateCode) {
      const stateObj = states.find((state) => state.name === formData.state);
      if (stateObj) {
        setSelectedStateCode(stateObj.iso2);
      } else {
        setSelectedStateCode(formData.state as string);
      }
    }
  }, [formData.state, states, selectedStateCode]);

  // Update station options when cost sheets data changes
  useEffect(() => {
    if (costSheets.length > 0) {
      const fetchOptions = fetchCostSheetStations(
        costSheets,
        setStationOptions
      );
      fetchOptions();
    }
  }, [costSheets]);

  // Toggle station dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".station-dropdown")) {
        setShowStationDropdown(false);
        setSelectedStationIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [sourcingManagers, setSourcingManagers] = useState<
    { name: string; contact: string }[]
  >([{ name: "", contact: "" }]);
  const [siteHeads, setSiteHeads] = useState<
    { name: string; contact: string }[]
  >([{ name: "", contact: "" }]);
  const [sortOrder, setSortOrder] = useState<{
    approved: { date: "desc" | "asc"; project: "asc" | "desc" };
    pending: { date: "desc" | "asc"; project: "asc" | "desc" };
    rejected: { date: "desc" | "asc"; project: "asc" | "desc" };
  }>({
    approved: { date: "desc", project: "asc" },
    pending: { date: "desc", project: "asc" },
    rejected: { date: "desc", project: "asc" },
  });
  const [sortBy, setSortBy] = useState<{
    approved: "date" | "project";
    pending: "date" | "project";
    rejected: "date" | "project";
  }>({ approved: "date", pending: "date", rejected: "date" });
  const [searchTerm, setSearchTerm] = useState("");
  const [bhkFilter, setBhkFilter] = useState("");
  const [reraRange, setReraRange] = useState({ min: "", max: "" });

  const availableBhkTypes = getApprovedFlatTypes(costSheets);

  // Initialize stamp rates and states
  useEffect(() => {
    const fetchStampDutyRates = async () => {
      try {
        const snapshot = await getDocs(collection(db, "stampDutyRates"));
        const rates: StampDutyRate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<StampDutyRate, "id">),
        }));
        setStampRates(rates);
      } catch (error) {
        console.error("Failed to fetch stamp duty rates:", error);
      }
    };

    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);

        const propertyToEdit = editProperty || editingProperty;
        if (propertyToEdit?.state && statesData.length > 0) {
          const stateObj = statesData.find(
            (state) => state.name === propertyToEdit.state
          );
          if (stateObj) {
            setSelectedStateCode(stateObj.iso2);
            fetchCities(stateObj.iso2)
              .then(setCities)
              .catch(() => {});
          }
        }
      } catch (error) {
        console.error("Failed to load states or cities:", error);
      }
    };

    fetchStampDutyRates();
    loadStates();
  }, [editProperty, editingProperty]);

  useEffect(() => {
    // Listen to both collections for real-time updates
    const unsubscribe = onSnapshot(
      collection(db, "TestingCostSheets"),
      async () => {
        try {
          const sheets = await getCostSheets();
          setCostSheets(sheets);
        } catch (error) {}
      },
      (error) => {
        toast.error(
          "Error syncing data - " +
            (error instanceof Error ? error.message : String(error))
        );
      }
    );

    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const userRef = doc(db, "users", user.id);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          setCustomAmenities(userData.customAmenities || {});
        } catch (error) {}
      }
    };

    fetchUserData();

    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      dateUpdateCostSheet: today,
    }));

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    if (duplicateProperty) {
      const duplicatedData = { ...duplicateProperty };

      const today = new Date().toISOString().split("T")[0];
      duplicatedData.dateUpdateCostSheet = today;

      delete duplicatedData.id;
      const locationHighlightTimes: { [key: string]: string } = {};
      const locationHighlightsArray: string[] = [];

      if (
        duplicatedData.locationHighlights &&
        Array.isArray(duplicatedData.locationHighlights)
      ) {
        duplicatedData.locationHighlights.forEach((highlight: string) => {
          const parts = highlight.split(" - ");
          if (parts.length > 1) {
            locationHighlightTimes[parts[0]] = parts[1];
            locationHighlightsArray.push(parts[0]);
          } else {
            locationHighlightsArray.push(highlight);
          }
        });
      }

      duplicatedData.locationHighlights = locationHighlightsArray;
      if (
        duplicatedData.reraPossession &&
        typeof duplicatedData.reraPossession === "string"
      ) {
        const monthYearMatch =
          duplicatedData.reraPossession.match(/^(\w{3})-(\d{4})$/);
        if (monthYearMatch) {
          const [, monthStr, year] = monthYearMatch;
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthIndex = monthNames.indexOf(monthStr);
          if (monthIndex !== -1) {
            duplicatedData.reraPossession = `${year}-${String(
              monthIndex + 1
            ).padStart(2, "0")}-01`;
          }
        }
      }

      setFormData({
        ...duplicatedData,
        locationHighlightTimes,
      });
      setShowForm(true);
      setCurrentStep(0);
      setDuplicateProperty(null);
      toast.success("Property duplicated! Please review and modify as needed.");
    }
  }, [duplicateProperty]);

  useEffect(() => {
    const propertyToEdit = editProperty || editingProperty;
    if (propertyToEdit) {
      // Use normalizeForEdit to ensure proper data structure for editing
      const editData = normalizeForEdit(propertyToEdit);

      const locationHighlightTimes: { [key: string]: string } = {};
      const locationHighlightsArray: string[] = [];

      if (
        editData.locationHighlights &&
        Array.isArray(editData.locationHighlights)
      ) {
        editData.locationHighlights.forEach((highlight: string) => {
          const parts = highlight.split(" - ");
          if (parts.length > 1) {
            locationHighlightTimes[parts[0]] = parts[1];
            locationHighlightsArray.push(parts[0]);
          } else {
            locationHighlightsArray.push(highlight);
          }
        });
      }

      editData.locationHighlights = locationHighlightsArray;

      if (
        editData.reraPossession &&
        typeof editData.reraPossession === "string"
      ) {
        const monthYearMatch =
          editData.reraPossession.match(/^(\w{3})-(\d{4})$/);
        if (monthYearMatch) {
          const [, monthStr, year] = monthYearMatch;
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const monthIndex = monthNames.indexOf(monthStr);
          if (monthIndex !== -1) {
            editData.reraPossession = `${year}-${String(
              monthIndex + 1
            ).padStart(2, "0")}-01`;
          }
        }
      }

      if (editData.state) {
        const stateObj = states.find((state) => state.name === editData.state);
        if (stateObj) {
          setSelectedStateCode(stateObj.iso2);

          fetchCities(stateObj.iso2)
            .then((citiesData) => {
              setCities(citiesData);
            })
            .catch((error) => {});
        }
      }

      // Handle sourcing managers (normalizeForEdit already handled conversion)
      if (
        editData.sourcingManagers &&
        Array.isArray(editData.sourcingManagers)
      ) {
        setSourcingManagers(editData.sourcingManagers);
      }

      // Handle site heads (normalizeForEdit already handled conversion)
      if (editData.siteHeads && Array.isArray(editData.siteHeads)) {
        setSiteHeads(editData.siteHeads);
      }

      // Populate all form structures (normalizeForEdit already handled data conversion)
      if (editData.subTabData) {
        setSubTabData(editData.subTabData);

        // Create sub-tabs based on subTabData keys
        const tabKeys = Object.keys(editData.subTabData);
        if (tabKeys.length > 0) {
          const newSubTabs = tabKeys.map((key, index) => {
            const tabData = editData.subTabData[key];
            return {
              id: parseInt(key),
              name: tabData?.mahaReraNumber || `RERA-${index + 1}`,
            };
          });
          setSubTabs(newSubTabs);
        }
      }

      // Handle floor rise config
      if (editData.floorRiseConfig) {
        setFloorRiseConfig(editData.floorRiseConfig);
      }

      // Handle floor band config
      if (editData.floorBandConfig && Array.isArray(editData.floorBandConfig)) {
        setFloorBandConfig(editData.floorBandConfig);
      }

      // Handle payment schemes
      if (editData.paymentSchemes && Array.isArray(editData.paymentSchemes)) {
        setPaymentSchemes(editData.paymentSchemes);
      }

      // Handle ladder sections
      if (editData.ladderSections && Array.isArray(editData.ladderSections)) {
        setLadderSections(editData.ladderSections);
      }

      // Handle existing media files for display (map into `existingMedia`)
      if (editData.mediaFiles) {
        try {
          setExistingMedia((prev) => ({
            brochure: editData.mediaFiles.brochure || null,
            elevationImages: editData.mediaFiles.elevationImages || [],
            amenitiesImages: editData.mediaFiles.amenitiesImages || [],
            floorPlanImages: editData.mediaFiles.floorPlanImages || [],
            projectWalkthrough: editData.mediaFiles.projectWalkthrough || [],
            typologyImages: editData.mediaFiles.typologyImages || {},
            typologyVideos: editData.mediaFiles.typologyVideos || {},
          }));
        } catch (err) {}
      }

      // Update the date when editing a property
      const today = new Date().toISOString().split("T")[0];

      setFormData({
        ...editData,
        locationHighlightTimes,
        dateUpdateCostSheet: today,
      });
      setCurrentStep(0);
      // Note: Toast message is handled in the render condition to avoid duplicates
    }
  }, [editProperty, editingProperty, states]);

  useEffect(() => {
    (async () => {
      try {
        const sheets = await getCostSheets();
        setCostSheets(sheets);

        const fetchOptions = fetchCostSheetStations(
          costSheets,
          setStationOptions
        );
        await fetchOptions();
      } catch (error) {
        toast.error(
          "Error fetching cost sheets - " +
            (error instanceof Error ? error.message : String(error))
        );
      }

      const today = new Date().toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        dateUpdateCostSheet: today,
      }));
    })();
  }, []);

  const numberFields = [
    "pinCode",
    "landParcel",
    "towers",
    "storey",
    "flatsPerFloor",
    "saleableArea",
    "reraCarpet",
    "psfRate",
    "avRate",
    "floorRise",
    "registration",
    "fixedComponent",
    "possessionCharges",
    "parkingCharge",
    "totalPackage",
  ];

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);

    const selectedState = states.find((state) => state.iso2 === stateCode);
    const stateName = selectedState ? selectedState.name : "";

    setFormData((prev) => ({
      ...prev,
      state: stateName,
      district: "", // Clear district when state changes
    }));

    if (stateCode) {
      try {
        const citiesData = await fetchCities(stateCode);
        setCities(citiesData);
      } catch (error) {
        setCities([]);
      }
    } else {
      setCities([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value, type } = e.target;
    if (type === "checkbox") return;

    const sanitizedValue = sanitizeInput(value);
    const processedValue =
      numberFields.includes(id) || type === "select-one" || type === "date"
        ? sanitizedValue
        : toTitleCase(sanitizedValue);

    setFormData((prev) => ({
      ...prev,
      [id]: processedValue,
    }));
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    if (numberFields.includes(id) || type === "date") {
      handleInputChange(e);
      return;
    }

    const processedValue = toTitleCase(value);
    const cursorPosition = e.target.selectionStart;

    setFormData((prev) => ({
      ...prev,
      [id]: processedValue,
    }));

    setTimeout(() => {
      if (e.target && cursorPosition !== null) {
        e.target.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const isStepValid = requiredPerStep[currentStep].every((fieldId) => {
    if (
      fieldId === "possessionYear" &&
      formData.possessionMonth === "Ready to move"
    ) {
      return true;
    }
    const val = formData[fieldId];
    return Array.isArray(val)
      ? val.length > 0
      : val !== undefined && val !== null && String(val).trim() !== "";
  });

  const allowedSteps = categories.map(() => true);

  const doneCount = categories.reduce((count, _, idx) => {
    return (
      count +
      (idx < currentStep || (idx === currentStep && isStepValid) ? 1 : 0)
    );
  }, 0);

  const propertyScore = Math.floor((doneCount / totalSteps) * 100);

  // Utility functions moved to separate file for better maintainability

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Create a copy of mediaFiles to avoid state mutation during upload
    const mediaFilesCopy = {
      brochure: mediaFiles.brochure,
      elevationImages: [...mediaFiles.elevationImages],
      amenitiesImages: [...mediaFiles.amenitiesImages],
      floorPlanImages: [...mediaFiles.floorPlanImages],
      projectWalkthrough: [...mediaFiles.projectWalkthrough],
      typologyImages: Object.fromEntries(
        Object.entries(mediaFiles.typologyImages).map(([key, files]) => [
          key,
          [...files],
        ])
      ),
      typologyVideos: { ...mediaFiles.typologyVideos },
    };

    const locationHighlightsRaw = formData.locationHighlights as string[];
    const locationHighlightTimes = formData.locationHighlightTimes || {};

    const locationHighlightsFormatted = locationHighlightsRaw?.map((item) => {
      const distance = locationHighlightTimes[item];
      return distance ? `${item} - ${distance}` : item;
    });

    const userRole = user?.role || "user";
    let isApproved = false;
    let approvalStatus = "pending";
    let nextApprovalLevel = null;

    if (formData.id && onSave) {
      isApproved = formData.isApproved || false;
      approvalStatus = formData.approvalStatus || "pending";
      nextApprovalLevel = formData.nextApprovalLevel;
    } else if (userRole === "admin") {
      isApproved = true;
      approvalStatus = "approved";
    } else if (userRole === "manager") {
      isApproved = false;
      approvalStatus = "pending";
      nextApprovalLevel = "admin";
    } else if (userRole === "executive") {
      isApproved = false;
      approvalStatus = "pending";
      nextApprovalLevel = "manager";
    }

    // convertReraPossession function moved to utils

    // Setup file upload path
    const projectId = Date.now().toString();
    const basePath = `costSheets/${projectId}`;

    // Extract and organize typologies from subTabData
    const typologies = [];
    for (const [tabId, tabData] of Object.entries(subTabData)) {
      if (tabData?.pricingConfigs) {
        for (const config of tabData.pricingConfigs) {
          if (config.typology) {
            // Calculate total package for this typology
            const saleableArea = parseFloat(config.saleableArea) || 0;
            const reraCarpet = parseFloat(config.reraCarpet) || 0;
            const psfRate =
              parseFloat(parseIndianCurrency(config.psfRate || "")) || 0;
            const avRate =
              parseFloat(parseIndianCurrency(config.avRate || "")) || 0;
            const fixedComponent =
              parseFloat(parseIndianCurrency(config.fixedComponent || "")) || 0;
            const possessionCharges =
              parseFloat(parseIndianCurrency(config.possessionCharges || "")) ||
              0;
            const negotiationScope =
              parseFloat(parseIndianCurrency(config.negotiationScope || "")) ||
              0;

            let calculatedTotalPackage = "";
            if (saleableArea && avRate) {
              const baseAmount = saleableArea * avRate - fixedComponent;
              // Use utility function for stamp duty rate lookup
              const stampDutyRatePercent = getStampDutyRate(
                stampRates,
                formData.district as string,
                undefined,
                7 // Default to 7%
              );

              const stampDutyRate = stampDutyRatePercent / 100;

              // Debug only if no matching rate found
              if (stampDutyRatePercent === 7 && formData.district) {
                const { rate } = findStampDutyRate(
                  stampRates,
                  formData.district as string
                );
                if (!rate) {
                  debugStampDutyLookup(stampRates, formData.district as string);
                }
              }
              const stampDuty = baseAmount * stampDutyRate;
              const gstRate = baseAmount > 4500000 ? 0.05 : 0.01;
              const gst = baseAmount * gstRate;
              const registrationFee = 30000;
              const legalCharges =
                parseFloat(
                  parseIndianCurrency(String(formData.registration || ""))
                ) || 0;
              const perSqFtDifference = saleableArea * (psfRate - avRate);

              const total =
                baseAmount +
                gst +
                stampDuty +
                registrationFee +
                legalCharges +
                possessionCharges +
                fixedComponent +
                perSqFtDifference;
              calculatedTotalPackage = Math.round(total).toString();
            }

            // Get floor band rates for this typology
            const floorBandRates = floorBandConfig
              .map((band) => ({
                fromFloor: band.fromFloor,
                toFloor: band.toFloor,
                rate: band.rates[config.typology] || "",
              }))
              .filter((band) => band.rate);

            // Upload unit plan if a new File is provided. If editing and an
            // existing URL is present, preserve it by default.
            let unitPlanUrl = config.unitPlanUrl || "";
            if (config.unitPlan && (config.unitPlan as any).name) {
              const cleanTypology = config.typology.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              );
              unitPlanUrl = await uploadFile(
                config.unitPlan as File,
                `${basePath}/unitPlans/${cleanTypology}/${cleanFileName(
                  (config.unitPlan as File).name
                )}`
              );
            }

            const typologyData = {
              // Basic typology info
              typology: config.typology || "",
              saleableArea: config.saleableArea || "",
              reraCarpet: config.reraCarpet || "",
              psfRate: config.psfRate || "",
              avRate: config.avRate || "",
              fixedComponent: config.fixedComponent || "",
              possessionCharges: config.possessionCharges || "",
              totalPackage: calculatedTotalPackage || "",
              negotiationScope: config.negotiationScope || "",
              availability: config.availability || "",
              unitPlanUrl: unitPlanUrl,

              // Building/Project context
              tabId: tabId || "",
              wingBuildingNo: tabData.wingBuildingNo || "",
              projectStatus: tabData.projectStatus || "",
              type: tabData.type || "",
              developerPossession: tabData.developerPossession || "",
              reraPossession: tabData.reraPossession || "",
              mahaReraNumber: tabData.mahaReraNumber || "",
              mahaReraLink: tabData.mahaReraLink || "",

              // Floor band configuration for this typology
              floorBandConfiguration: floorBandRates || [],
            };

            // Filter out any remaining undefined values
            const cleanTypologyData = Object.fromEntries(
              Object.entries(typologyData).filter(
                ([_, value]) => value !== undefined
              )
            );

            typologies.push(cleanTypologyData);
          }
        }
      }
    }

    // Upload media files to Firebase Storage and get URLs

    const cleanMediaFiles = {
      brochure: mediaFilesCopy.brochure
        ? await uploadFile(
            mediaFilesCopy.brochure,
            `${basePath}/brochure/${cleanFileName(
              mediaFilesCopy.brochure.name
            )}`
          )
        : null,
      elevationImages:
        mediaFilesCopy.elevationImages?.length > 0
          ? await uploadFiles(
              mediaFilesCopy.elevationImages,
              `${basePath}/elevation`
            )
          : [],
      amenitiesImages:
        mediaFilesCopy.amenitiesImages?.length > 0
          ? await uploadFiles(
              mediaFilesCopy.amenitiesImages,
              `${basePath}/amenities`
            )
          : [],
      floorPlanImages:
        mediaFilesCopy.floorPlanImages?.length > 0
          ? await uploadFiles(
              mediaFilesCopy.floorPlanImages,
              `${basePath}/floorPlans`
            )
          : [],
      projectWalkthrough:
        mediaFilesCopy.projectWalkthrough?.length > 0
          ? await uploadFiles(
              mediaFilesCopy.projectWalkthrough,
              `${basePath}/walkthrough`
            )
          : [],
      typologyImages: {},
      typologyVideos: {},
    };

    // Upload typology images
    for (const [typology, files] of Object.entries(
      mediaFilesCopy.typologyImages || {}
    )) {
      if (files?.length > 0) {
        const cleanTypology = typology.replace(/[^a-zA-Z0-9]/g, "_");
        cleanMediaFiles.typologyImages[typology] = await uploadFiles(
          files,
          `${basePath}/typology/${cleanTypology}/images`
        );
      }
    }

    // Upload typology videos
    for (const [typology, file] of Object.entries(
      mediaFilesCopy.typologyVideos || {}
    )) {
      if (file) {
        const cleanTypology = typology.replace(/[^a-zA-Z0-9]/g, "_");
        cleanMediaFiles.typologyVideos[typology] = await uploadFile(
          file,
          `${basePath}/typology/${cleanTypology}/video/${cleanFileName(
            file.name
          )}`
        );
      }
    }

    // Clean formData to remove undefined values
    const cleanFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined)
    );

    const fullForm = {
      ...cleanFormData,
      possession:
        formData.possessionMonth === "Ready to move"
          ? "Ready to move"
          : formData.possessionMonth && formData.possessionYear
          ? `${formData.possessionMonth}-${formData.possessionYear}`
          : "",
      reraPossession:
        formData.possessionMonth === "Ready to move"
          ? "Ready to move"
          : convertReraPossession(formData.reraPossession as string),
      locationHighlights: locationHighlightsFormatted || [],

      // Organized typologies data
      typologies: typologies || [],
      subTabData: subTabData || {},
      floorRiseConfig: floorRiseConfig || {},
      floorBandConfig: floorBandConfig || [],
      paymentSchemes: paymentSchemes || [],
      ladderSections: ladderSections || [],
      mediaFiles: cleanMediaFiles,
      siteHeads:
        siteHeads.filter((head) => head.name.trim() || head.contact.trim()) ||
        [],
      sourcingManagers:
        sourcingManagers.filter((sm) => sm.name.trim() || sm.contact.trim()) ||
        [],

      isApproved: isApproved || false,
      approvalStatus: approvalStatus || "pending",
      submittedBy: formData.id
        ? formData.submittedBy || user?.id
        : user?.id || "",
      submitterRole: formData.id
        ? formData.submitterRole || userRole
        : userRole || "user",
      ...(formData.id && {
        editedBy: user?.id || "",
        editedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dateUpdateCostSheet: new Date().toISOString().split("T")[0],
      }),
      nextApprovalLevel: nextApprovalLevel || null,
      createdAt: formData.id ? formData.createdAt : new Date().toISOString(),
    };

    // removeUndefined function moved to utils

    let cleanForm = removeUndefined(fullForm);

    // Final pass to ensure no undefined values remain
    const finalClean = JSON.parse(
      JSON.stringify(cleanForm, (key, value) => {
        return value === undefined ? null : value;
      })
    );

    try {
      // Show upload progress
      toast.success("Uploading files...");

      if (formData.id) {
        const existingSheet = costSheets.find(
          (sheet) => (sheet as any).id === formData.id
        );
        const isOldFormat =
          (existingSheet as any)?.dataVersion === "v1" ||
          (existingSheet as any)?.collection === "costSheets";

        // Always save as v2 format in TestingCostSheets
        const updatedData = { ...finalClean, dataVersion: "v2" };

        if (isOldFormat) {
          // Migration: Create new document in TestingCostSheets
          await addCostSheet(updatedData);
          // Delete old format data
          if (formData.projectName) {
            await deleteMatchedPropertiesFromOldDB(
              formData.projectName as string
            );
          }
        } else {
          // Update existing v2 document
          await updateCostSheet(formData.id as string, updatedData);
        }

        setCostSheets((prev) =>
          prev.map((sheet) =>
            (sheet as CostSheet).id === formData.id
              ? { ...updatedData, id: formData.id }
              : sheet
          )
        );

        if (onSave) {
          onSave({ ...finalClean, id: formData.id });
          toast.success(
            "Property updated! Status remains pending for approval."
          );
          return;
        }
        toast.success("Property updated!");
        setEditingProperty(null);
      } else {
        await addCostSheet(finalClean);
        setCostSheets((prev) => [
          ...prev,
          { ...finalClean, id: Date.now(), dataVersion: "v2" },
        ]);

        if (userRole === "admin") {
          toast.success("Property added and published!");
        } else {
          toast.success(
            `Property submitted for ${nextApprovalLevel} approval!`
          );
        }
      }

      if (!onSave) {
        // Clear form and media files
        setFormData({ locationHighlightTimes: {} });
        setMediaFiles({
          brochure: null,
          elevationImages: [],
          amenitiesImages: [],
          floorPlanImages: [],
          projectWalkthrough: [],
          typologyImages: {},
          typologyVideos: {},
        });
        setCurrentStep(0);
        setShowForm(false);
        setEditingProperty(null);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("storage")) {
        toast.error(
          "Failed to upload files. Please check your internet connection and try again."
        );
      } else {
        toast.error(
          `Failed to ${formData.id ? "update" : "add"} property - ` +
            (err instanceof Error ? err.message : String(err))
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({ label, value }: { label: string; value: unknown }) => {
    const displayValue =
      typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : React.isValidElement(value)
        ? value
        : String(value ?? "-");

    return (
      <div className="text-sm">
        <div className="text-neutral-500 font-medium">{label}</div>
        <div className="text-neutral-800">{displayValue}</div>
      </div>
    );
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div>
      <h4 className="text-md font-semibold text-neutral-700 mb-2">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
        {children}
      </div>
    </div>
  );

  const calculateTotalPackage = () => {
    const getNumberValue = (val: unknown) =>
      typeof val === "string" ? parseFloat(val) : 0;

    const saleableArea = getNumberValue(formData.saleableArea);
    const reraCarpet = getNumberValue(formData.reraCarpet);
    const psfRate = getNumberValue(formData.psfRate);
    const avRate = getNumberValue(formData.avRate);
    const registrationFee = 30000;
    const legalCharges =
      parseFloat(parseIndianCurrency(String(formData.registration || ""))) || 0;
    const possessionCharges = getNumberValue(formData.possessionCharges);
    const fixedComponent = getNumberValue(formData.fixedComponent) || 0;

    const baseArea = saleableArea > reraCarpet ? saleableArea : reraCarpet;
    const agreementValue = avRate * baseArea;

    // Use utility function for stamp duty rate lookup
    const stampDutyRatePercent = getStampDutyRate(
      stampRates,
      formData.district as string,
      undefined, // No station in this context
      7 // Default to 7%
    );

    const stampDutyRate = stampDutyRatePercent / 100;

    // Silent stamp duty lookup
    if (formData.district && stampRates.length > 0) {
      findStampDutyRate(stampRates, formData.district as string);
    }

    const stampDuty = agreementValue * stampDutyRate;
    const gst =
      agreementValue < 4500000 ? agreementValue * 0.01 : agreementValue * 0.05;
    const component = psfRate * baseArea - agreementValue;

    const total =
      agreementValue +
      stampDuty +
      gst +
      registrationFee +
      legalCharges +
      possessionCharges +
      fixedComponent +
      component;

    return isNaN(total) ? "" : Math.round(total).toString();
  };

  // Track toast display to avoid duplicates
  const toastShownRef = React.useRef<string | null>(null);

  // Reset form when switching between edit and new forms
  useEffect(() => {
    if (!editingProperty && !showForm) {
      resetFormStates();
    }
  }, [editingProperty, showForm]);

  // Show toast when entering edit mode
  React.useEffect(() => {
    if (
      editingProperty &&
      formData.id &&
      toastShownRef.current !== editingProperty.id
    ) {
      toast.success("Editing property. Make your changes and submit.");
      toastShownRef.current = editingProperty.id;
    }
  }, [editingProperty?.id, formData.id]);

  // Use EditPropertyTabs for any editing operation (both editProperty and editingProperty)
  if ((editProperty && onSave) || editingProperty) {
    return handleEditPropertyForm(
      allowedSteps,
      currentStep,
      formData,
      setFormData,
      states,
      selectedStateCode,
      handleStateChange,
      stampRates,
      setShowJurisdictionModal,
      cities,
      handleInputChange,
      subTabs,
      setActiveSubTab,
      activeSubTab,
      subTabData,
      setSubTabData,
      setSubTabs,
      formatIndianCurrency,
      parseIndianCurrency,
      setFloorRiseConfig,
      setFloorBandConfig,
      floorRiseConfig,
      floorBandConfig,
      paymentSchemes,
      setPaymentSchemes,
      ladderSections,
      setLadderSections,
      activeCategory,
      stationSearchTerm,
      setStationSearchTerm,
      setSelectedStationIndex,
      setShowStationDropdown,
      stationOptions,
      selectedStationIndex,
      showStationDropdown,
      customAmenities,
      expandedAmenities,
      setExpandedAmenities,
      addingAmenityFor,
      customAmenityInput,
      setCustomAmenityInput,
      user,
      setCustomAmenities,
      setAddingAmenityFor,
      setCurrentAmenityField,
      setShowAmenityModal,
      calculateTotalPackage,
      numberFields,
      siteHeads,
      setSiteHeads,
      sourcingManagers,
      setSourcingManagers,
      setMediaFiles,
      generatePdfThumbnail,
      setPdfThumbnail,
      mediaFiles,
      pdfThumbnail,
      existingMedia,
      setExistingMedia,
      setCurrentStep,
      totalSteps,
      isStepValid,
      isLoading,
      handleSubmitForm,
      setEditingProperty,
      showJurisdictionModal,
      locationData
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto max-w-full">
        <div className="mb-4">
          <Button
            size="sm"
            variant={showForm ? "outline" : "primary"}
            onClick={() => {
              setShowForm((prev) => !prev);
              resetFormStates();
            }}
          >
            {showForm ? "← Back" : "+ New"}
          </Button>
        </div>
        {(() => {
          if (editingProperty) {
            return handleEditPropertyForm(
              allowedSteps,
              currentStep,
              formData,
              setFormData,
              states,
              selectedStateCode,
              handleStateChange,
              stampRates,
              setShowJurisdictionModal,
              cities,
              handleInputChange,
              subTabs,
              setActiveSubTab,
              activeSubTab,
              subTabData,
              setSubTabData,
              setSubTabs,
              formatIndianCurrency,
              parseIndianCurrency,
              setFloorRiseConfig,
              setFloorBandConfig,
              floorRiseConfig,
              floorBandConfig,
              paymentSchemes,
              setPaymentSchemes,
              ladderSections,
              setLadderSections,
              activeCategory,
              stationSearchTerm,
              setStationSearchTerm,
              setSelectedStationIndex,
              setShowStationDropdown,
              stationOptions,
              selectedStationIndex,
              showStationDropdown,
              customAmenities,
              expandedAmenities,
              setExpandedAmenities,
              addingAmenityFor,
              customAmenityInput,
              setCustomAmenityInput,
              user,
              setCustomAmenities,
              setAddingAmenityFor,
              setCurrentAmenityField,
              setShowAmenityModal,
              calculateTotalPackage,
              numberFields,
              siteHeads,
              setSiteHeads,
              sourcingManagers,
              setSourcingManagers,
              setMediaFiles,
              generatePdfThumbnail,
              setPdfThumbnail,
              mediaFiles,
              pdfThumbnail,
              existingMedia,
              setExistingMedia,
              setCurrentStep,
              totalSteps,
              isStepValid,
              isLoading,
              handleSubmitForm,
              setEditingProperty,
              showJurisdictionModal,
              locationData
            );
          } else if (showForm) {
            return handleNewEntryForm(
              allowedSteps,
              currentStep,
              formData,
              setFormData,
              states,
              selectedStateCode,
              handleStateChange,
              stampRates,
              setShowJurisdictionModal,
              cities,
              handleInputChange,
              subTabs,
              setActiveSubTab,
              activeSubTab,
              subTabData,
              setSubTabData,
              setSubTabs,
              formatIndianCurrency,
              parseIndianCurrency,
              setFloorRiseConfig,
              setFloorBandConfig,
              floorRiseConfig,
              floorBandConfig,
              paymentSchemes,
              setPaymentSchemes,
              ladderSections,
              setLadderSections,
              activeCategory,
              stationSearchTerm,
              setStationSearchTerm,
              setSelectedStationIndex,
              setShowStationDropdown,
              stationOptions,
              selectedStationIndex,
              showStationDropdown,
              customAmenities,
              expandedAmenities,
              setExpandedAmenities,
              addingAmenityFor,
              customAmenityInput,
              setCustomAmenityInput,
              user,
              setCustomAmenities,
              setAddingAmenityFor,
              setCurrentAmenityField,
              setShowAmenityModal,
              calculateTotalPackage,
              numberFields,
              siteHeads,
              setSiteHeads,
              sourcingManagers,
              setSourcingManagers,
              setMediaFiles,
              generatePdfThumbnail,
              setPdfThumbnail,
              mediaFiles,
              pdfThumbnail,
              existingMedia,
              setExistingMedia,
              setCurrentStep,
              totalSteps,
              isStepValid,
              isLoading,
              handleSubmitForm,
              showJurisdictionModal,
              locationData
            );
          } else {
            return handleNewPropertyTable(
              costSheets,
              user,
              searchTerm,
              bhkFilter,
              reraRange,
              sortBy,
              sortOrder,
              setSearchTerm,
              setBhkFilter,
              setReraRange,
              availableBhkTypes,
              setSortBy,
              setSortOrder,
              states,
              setPreloadedStateData,
              setSelectedSheet,
              setEditingProperty,
              setShowForm,
              setCostSheets,
              selectedSheet,
              preloadedStateData,
              setSelectedStateCode,
              setCities,
              Section,
              Field
            );
          }
        })()}

        {/* Custom Amenity Modal */}
        {showCustomAmenityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-800">
                  Add Custom{" "}
                  {
                    costSheetFields
                      .find((f) => f.id === modalAmenityType)
                      ?.label.split(" ")[0]
                  }
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomAmenityModal(false);
                    setModalAmenityInput("");
                    setModalAmenityType("");
                  }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <svg
                    className="w-6 h-6"
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
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Amenity Name
                </label>
                <input
                  type="text"
                  value={modalAmenityInput}
                  onChange={(e) => setModalAmenityInput(e.target.value)}
                  placeholder={`Enter custom ${
                    costSheetFields
                      .find((f) => f.id === modalAmenityType)
                      ?.label.toLowerCase() || "amenity"
                  }`}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomAmenityModal(false);
                    setModalAmenityInput("");
                    setModalAmenityType("");
                  }}
                  className="px-4 py-2 text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const newAmenity = modalAmenityInput.trim();
                    if (!newAmenity || !user?.id || !modalAmenityType) return;

                    try {
                      const ref = doc(db, "users", user.id);
                      await updateDoc(ref, {
                        [`customAmenities.${modalAmenityType}`]:
                          arrayUnion(newAmenity),
                      });

                      // Use setTimeout to defer state updates to next tick
                      setTimeout(() => {
                        setFormData((prev) => ({
                          ...prev,
                          [modalAmenityType]: [
                            ...((prev[modalAmenityType] as string[]) || []),
                            newAmenity,
                          ],
                        }));

                        setExpandedAmenities((prev) => ({
                          ...prev,
                          [modalAmenityType]: true,
                        }));

                        setCustomAmenities((prev) => ({
                          ...prev,
                          [modalAmenityType]: [
                            ...(prev[modalAmenityType] || []),
                            newAmenity,
                          ],
                        }));

                        setShowCustomAmenityModal(false);
                        setModalAmenityInput("");
                        setModalAmenityType("");
                        toast.success("Custom amenity added!");
                      }, 0);
                    } catch (error) {
                      toast.error(
                        `Failed to add amenity ${
                          error instanceof Error ? error.message : String(error)
                        }`
                      );
                    }
                  }}
                  disabled={!modalAmenityInput.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Amenity
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Professional Custom Amenity Modal */}

      <AmenityModal
        isOpen={showAmenityModal}
        onClose={() => {
          setTimeout(() => {
            setShowAmenityModal(false);
            setCustomAmenityInput((prev) => ({
              ...prev,
              [currentAmenityField]: "",
            }));
            setCurrentAmenityField("");
          }, 0);
        }}
        fieldId={currentAmenityField}
        fieldLabel={
          costSheetFields.find((f) => f.id === currentAmenityField)?.label || ""
        }
        customAmenityInput={customAmenityInput[currentAmenityField] || ""}
        setCustomAmenityInput={(value: string) =>
          setCustomAmenityInput((prev) => ({
            ...prev,
            [currentAmenityField]: value,
          }))
        }
        setFormData={setFormData}
        setExpandedAmenities={setExpandedAmenities}
        setCustomAmenities={setCustomAmenities}
      />

      {/* Stamp Duty Debugger Modal */}
      {showStampDutyDebugger && (
        <StampDutyDebugger
          district={(formData.district as string) || "Thane"}
          onClose={() => setShowStampDutyDebugger(false)}
        />
      )}

      {/* Jurisdiction Missing Modal */}
      <JurisdictionModal
        isOpen={showJurisdictionModal}
        onClose={() => setShowJurisdictionModal(false)}
        district={(formData.district as string) || ""}
        availableRates={stampRates}
      />
    </div>
  );
};

export default CostSheetForm;
