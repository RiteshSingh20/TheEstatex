import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Building, Plus, Pencil, Eye } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../utils/authContext";
import {
  addResaleProperty,
  updateResaleProperty,
  addAdminApproval,
  getResaleProperties,
  deleteResaleProperty,
  addRentalProperty,
  updateRentalProperty,
  getRentalProperties,
  deleteRentalProperty,
  getCostSheets,
} from "../utils/firestoreListings";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import SearchableDropdown from "../components/ui/SearchableDropdown";
import { ListingState, ResaleProperty, RentalProperty } from "../types";
import Tabs from "../types/tab";
import TagInput from "../utils/rrAmenitiesInput";
import {
  ResaleFormData,
  RentalFormData,
  fetchStates,
  fetchCities,
} from "../utils/api";
import { State, City } from "../types";
import { stations } from "../utils/stations";

const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const formatPriceDisplay = (value: string | number): string => {
  const stringValue = typeof value === "string" ? value : String(value || "");
  const num = parseInt(stringValue.replace(/[^0-9]/g, ""));
  if (isNaN(num) || num === 0) return "";

  if (num >= 10000000) {
    // 1 crore or more
    const crores = num / 10000000;
    return crores % 1 === 0 ? `₹${crores} Cr` : `₹${crores.toFixed(1)} Cr`;
  } else if (num >= 100000) {
    // 1 lakh or more
    const lakhs = num / 100000;
    return lakhs % 1 === 0 ? `₹${lakhs} Lac` : `₹${lakhs.toFixed(1)} Lac`;
  } else if (num >= 1000) {
    // 1 thousand or more
    const thousands = num / 1000;
    return thousands % 1 === 0
      ? `₹${thousands} K`
      : `₹${thousands.toFixed(1)} K`;
  }
  return "";
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

const plusPropertyOptions = [
  { value: "+1", label: "+1" },
  { value: "+2", label: "+2" },
  { value: "Goodluck", label: "Goodluck" },
];

const Inventory = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("resale");
  const [isLoading, setIsLoading] = useState(false);
  const [editProperty, setEditProperty] = useState<ResaleProperty | null>(null);
  const [editRentalProperty, setEditRentalProperty] =
    useState<RentalProperty | null>(null);
  const [showPropertyList, setShowPropertyList] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStation, setSelectedStation] = useState("");
  const [isPremiumResale, setIsPremiumResale] = useState(false);
  const [isPremiumRental, setIsPremiumRental] = useState(false);
  const [viewProperty, setViewProperty] = useState<ResaleProperty | null>(null);
  const [viewRentalProperty, setViewRentalProperty] =
    useState<RentalProperty | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [stationOptions, setStationOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [stationSearchTerm, setStationSearchTerm] = useState("");
  const [selectedStationIndex, setSelectedStationIndex] = useState(-1);

  // Search and filter states
  const [resaleSearchTerm, setResaleSearchTerm] = useState("");
  const [resaleFilters, setResaleFilters] = useState({
    type: "",
    sort: "",
  });
  const [rentalSearchTerm, setRentalSearchTerm] = useState("");
  const [rentalFilters, setRentalFilters] = useState({
    type: "",
    sort: "",
  });

  // Resale form
  const {
    register: registerResale,
    handleSubmit: handleSubmitResale,
    formState: { errors: errorsResale },
    reset: resetResale,
    watch: watchResale,
    setValue: setValueResale,
    trigger,
  } = useForm<ResaleFormData>({
    defaultValues: {
      society: "",
      sublocation: "",
      landmark: "",
      pincode: "",
      station: "",
      district: "",
      state: "",
      type: "",
      masterBed: "",
      buildingNo: "",
      flatNo: "",
      floorNo: "",
      totalFloors: "",
      carpetArea: "",
      builtUpArea: "",
      propertyAge: "",
      ocAvailable: "",
      amenities: [],
      furnishing: "",
      parking: "",
      terraceGallery: "",
      cosmoSociety: "",
      expectedPrice: "",
      negotiable: "",
      maintenance: "",
      ownerName: "",
      ownerNumber: "",
      connectedPerson: "",
      imageUrl: "",
      videoUrl: "",
    },
  });

  // Rental form
  const {
    register: registerRental,
    handleSubmit: handleSubmitRental,
    formState: { errors: errorsRental },
    reset: resetRental,
    watch: watchRental,
    setValue: setValueRental,
    trigger: triggerRental,
  } = useForm<RentalFormData>({
    defaultValues: {
      society: "",
      sublocation: "",
      landmark: "",
      pincode: "",
      station: "",
      district: "",
      state: "",
      type: "",
      masterBed: "",
      buildingNo: "",
      flatNo: "",
      floorNo: "",
      totalFloors: "",
      propertyAge: "",
      amenities: [],
      furnishing: "",
      parking: "",
      terraceGallery: "",
      cosmoSociety: "",
      expectedRent: "",
      securityDeposit: "",
      negotiable: "",
      ownerName: "",
      ownerNumber: "",
      connectedPerson: "",
      imageUrl: "",
      videoUrl: "",
    },
  });

  // Close dropdown when clicking outside
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

  // Enhanced validation for each step
  const validateCurrentStep = useCallback(async () => {
    if (activeTab === "resale") {
      const fieldsToValidate = {
        0: ["society", "pincode", "station", "district", "state"],
        1: [
          "type",
          "buildingNo",
          "flatNo",
          "floorNo",
          "totalFloors",
          "carpetArea",
          "builtUpArea",
          "propertyAge",
          "ocAvailable",
          "furnishing",
          "parking",
          "terraceGallery",
          "cosmoSociety",
          "expectedPrice",
          "negotiable",
        ],
        2: ["ownerName", "ownerNumber"],
      };
      const fields =
        fieldsToValidate[currentStep as keyof typeof fieldsToValidate] || [];
      return await trigger(fields as any);
    } else {
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
        fieldsToValidate[currentStep as keyof typeof fieldsToValidate] || [];
      return await triggerRental(fields as any);
    }
  }, [currentStep, trigger, triggerRental, activeTab]);

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      toast.error("Please fill all required fields in this step");
      return;
    }
    const steps = activeTab === "resale" ? resaleSteps : rentalSteps;
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  // const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
  //   // Prevent form submission on Enter in multi-step form
  //   if (e.key === "Enter") {
  //     // Don't submit if not last step
  //     if (!isLastStep) {
  //       e.preventDefault();
  //       handleNext(); // Trigger field validation and move to next step
  //     } else {
  //       // On last step, do nothing — let form submit normally
  //     }
  //   }
  // };

  // Fetch suggestions from existing properties
  // const fetchSuggestions = useCallback(async () => {
  //   if (!user) return;
  //   try {
  //     const resaleProps = await getResaleProperties(user.id);
  //     const buildings = Array.from(
  //       new Set(resaleProps.map((p) => p.society || "").filter(Boolean))
  //     );
  //     const roads = Array.from(
  //       new Set(resaleProps.map((p) => p.roadLocation || "").filter(Boolean))
  //     );
  //     const zones = Array.from(
  //       new Set(resaleProps.map((p) => p.zone || "").filter(Boolean))
  //     );

  //     setBuildingSuggestions(buildings);
  //     setRoadSuggestions(roads);
  //     setZoneSuggestions(zones);
  //   } catch (error) {
  //     
  //   }
  // }, [user]);

  // useEffect(() => {
  //   fetchSuggestions();
  // }, [fetchSuggestions]);

  // Reset form function
  const resetAllForms = useCallback(() => {
    resetResale();
    resetRental();
    setCurrentStep(0);
    setEditProperty(null);
    setEditRentalProperty(null);
    setSelectedStation("");
    setSelectedStateCode("");
    setCities([]);

    setIsPremiumResale(false);
    setIsPremiumRental(false);
  }, [resetResale, resetRental]);

  // Enhanced edit handler with proper type conversion
  const handleEdit = (property: ResaleProperty) => {
    setShowPropertyList(false);
    setActiveTab("resale");
    setEditProperty(property);
    setCurrentStep(0);

    // Set station value
    const stationValue = property.station || "";
    setSelectedStation(stationValue);
    setValueResale("station", stationValue);

    // Set state and district for editing
    if (property.state) {
      const stateObj = states.find((state) => state.name === property.state);
      if (stateObj) {
        setSelectedStateCode(stateObj.iso2);
        fetchCities(stateObj.iso2)
          .then((citiesData) => {
            setCities(citiesData);
          })
          .catch((error) => {
            
          });
      }
    }

    // Prefill all form fields with proper type conversion
    resetResale({
      ...property,
      terrace: property.terrace ? "true" : "false",
      cosmoSociety: property.cosmoSociety ? "true" : "false",
      ocAvailable: property.ocStatus === "Available" ? "true" : "false", // Map ocStatus to ocAvailable
      negotiable: property.negotiable ? "true" : "false",
      amenities: property.amenities || [],
      masterBed: property.masterBed ? "true" : "false",
      plusProperty: property.plusProperty || "",
    } as unknown as ResaleFormData);

    // Set premium checkbox state based on existing plusProperty value
    setIsPremiumResale(!!property.plusProperty);
  };

  const handleEditRental = (property: RentalProperty) => {
    setShowPropertyList(false);
    setActiveTab("rental");
    setEditRentalProperty(property);
    setCurrentStep(0);

    // Set station value
    const stationValue = property.station || "";
    setSelectedStation(stationValue);
    setValueRental("station", stationValue);

    // Set state and district for editing
    if (property.state) {
      const stateObj = states.find((state) => state.name === property.state);
      if (stateObj) {
        setSelectedStateCode(stateObj.iso2);
        fetchCities(stateObj.iso2)
          .then((citiesData) => {
            setCities(citiesData);
          })
          .catch((error) => {
            
          });
      }
    }

    // Prefill all form fields with proper type conversion
    resetRental({
      ...property,
      expectedRent: property.rent,
      securityDeposit: property.deposit,
      cosmoSociety: property.cosmo ? "true" : "false",
      negotiable: property.negotiable ? "true" : "false",
      amenities: property.amenities || [],
      masterBed: property.masterBed ? "true" : "false",
      district: property.district || "",
      state: property.state || "",
      terraceGallery: property.terraceGallery || "",
      ownerName: property.contactName || "",
      ownerNumber: property.contactNumber || "",
      availableImmediately: property.availableImmediately ? "true" : "false",
      plusProperty: property.plusProperty || "",
    } as RentalFormData);

    // Set premium checkbox state based on existing plusProperty value
    setIsPremiumRental(!!property.plusProperty);
  };

  const handleDelete = async (
    propertyId: string,
    type: "resale" | "rental" = "resale"
  ) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      if (type === "resale") {
        await deleteResaleProperty(user.id, propertyId);
        setInventory((prev) => ({
          ...prev,
          resale: prev.resale.filter((p) => p.docId !== propertyId),
        }));
      } else {
        await deleteRentalProperty(user.id, propertyId);
        setInventory((prev) => ({
          ...prev,
          rental: prev.rental.filter((p) => p.docId !== propertyId),
        }));
      }
      toast.success("Property deleted successfully");
    } catch (error) {
      
      toast.error("Failed to delete property. Please try again.");
    }
  };

  // Enhanced submit handler with proper type conversion
  const onSubmitResale: SubmitHandler<ResaleFormData> = async (data) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast.error("You must be logged in to add a property");
        return;
      }

      const processedData: Partial<ResaleProperty> = {
        ...data,
        terrace: data.terrace === "true",
        cosmoSociety: data.cosmoSociety,
        ocStatus: data.ocAvailable === "true" ? "Available" : "Not Available",
        pincode: data.pincode,
        station: data.station || selectedStation,
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        ...(data.masterBed && { masterBed: data.masterBed === "true" }),
        plusProperty: data.plusProperty || null,
        // Convert string values to numbers
        flatNo:
          data.flatNo && String(data.flatNo).trim() !== ""
            ? Number(data.flatNo)
            : null,
        floorNo:
          data.floorNo && String(data.floorNo).trim() !== ""
            ? Number(data.floorNo)
            : null,
        totalFloors:
          data.totalFloors && String(data.totalFloors).trim() !== ""
            ? Number(data.totalFloors)
            : null,
        carpetArea:
          data.carpetArea && String(data.carpetArea).trim() !== ""
            ? Number(data.carpetArea)
            : null,
        builtUpArea:
          data.builtUpArea && String(data.builtUpArea).trim() !== ""
            ? Number(data.builtUpArea)
            : null,
        propertyAge:
          data.propertyAge && String(data.propertyAge).trim() !== ""
            ? Number(data.propertyAge)
            : null,
        expectedPrice:
          data.expectedPrice && String(data.expectedPrice).trim() !== ""
            ? Number(data.expectedPrice)
            : null,
        ...(data.maintenance &&
          String(data.maintenance).trim() !== "" && {
            maintenance: Number(data.maintenance),
          }),
      };

      if (editProperty) {
        // Reset rejection status and approval when updating
        const updateData = {
          ...processedData,
          isApproved: false,
          rejectedAt: null,
          rejectedBy: null,
          rejectorRole: null,
          rejectionReason: null,
        };

        const propertyId = editProperty.id || editProperty.docId;
        if (!propertyId) {
          throw new Error("Property ID is missing");
        }
        await updateResaleProperty(user.id, propertyId, updateData);
        toast.success(
          "Resale property updated successfully. Awaiting approval."
        );
      } else {
        const newProperty = {
          ...processedData,
          createdAt: new Date().toISOString(),
          userId: user.id,
          status: "Pending Approval",
          isApproved: false,
          listingState: "Available" as ListingState,
          userFullName: user.fullName,
          userMarketingPhoneNumber: user.marketingPhoneNumber || user.phone,
        };
        await addResaleProperty(user.id, newProperty as ResaleProperty);
        await addAdminApproval("resale", newProperty);
        toast.success("Resale property added successfully. Awaiting approval.");
      }

      resetAllForms();
      setShowPropertyList(true);
      fetchInventory();
    } catch (error) {
      
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Rental submit handler
  const onSubmitRental: SubmitHandler<RentalFormData> = async (data) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast.error("You must be logged in to add a property");
        return;
      }

      const processedData: Partial<RentalProperty> = {
        ...data,
        rent:
          data.expectedRent && String(data.expectedRent).trim() !== ""
            ? Number(data.expectedRent)
            : null,
        deposit:
          data.securityDeposit && String(data.securityDeposit).trim() !== ""
            ? Number(data.securityDeposit)
            : null,
        cosmo: data.cosmoSociety === "true",
        pincode: data.pincode,
        station: data.station || selectedStation,
        amenities: data.amenities || [],
        ...(data.masterBed && { masterBed: data.masterBed === "true" }),
        contactName: data.ownerName,
        contactNumber: data.ownerNumber,
        furnishing: data.furnishing as
          | "Unfurnished"
          | "Semi-Furnished"
          | "Fully Furnished",
        parking: data.parking as "Open" | "Covered" | "None",
        negotiable: data.negotiable === "true",
        availableImmediately: data.availableImmediately === "true",
        plusProperty: data.plusProperty || null,
        // Convert string values to numbers
        flatNo:
          data.flatNo && String(data.flatNo).trim() !== ""
            ? Number(data.flatNo)
            : null,
        floorNo:
          data.floorNo && String(data.floorNo).trim() !== ""
            ? Number(data.floorNo)
            : null,
        totalFloors:
          data.totalFloors && String(data.totalFloors).trim() !== ""
            ? Number(data.totalFloors)
            : null,
        propertyAge:
          data.propertyAge && String(data.propertyAge).trim() !== ""
            ? Number(data.propertyAge)
            : null,
      };

      if (editRentalProperty) {
        // Reset rejection status and approval when updating
        const updateData = {
          ...processedData,
          isApproved: false,
          rejectedAt: null,
          rejectedBy: null,
          rejectorRole: null,
          rejectionReason: null,
        };

        const propertyId = editRentalProperty.id || editRentalProperty.docId;
        if (!propertyId) {
          throw new Error("Rental property ID is missing");
        }
        await updateRentalProperty(user.id, propertyId, updateData);
        toast.success(
          "Rental property updated successfully. Awaiting approval."
        );
      } else {
        const newProperty = {
          ...processedData,
          createdAt: new Date().toISOString(),
          userId: user.id,
          status: "Pending Approval",
          isApproved: false,
          listingState: "Available" as ListingState,
          userFullName: user.fullName,
          userMarketingPhoneNumber: user.marketingPhoneNumber || user.phone,
        };
        await addRentalProperty(user.id, newProperty as RentalProperty);
        await addAdminApproval("rental", newProperty);
        toast.success("Rental property added successfully. Awaiting approval.");
      }

      resetAllForms();
      setShowPropertyList(true);
      fetchInventory();
    } catch (error) {
      
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);

    // Find state name from code
    const selectedState = states.find((state) => state.iso2 === stateCode);
    const stateName = selectedState ? selectedState.name : "";

    if (activeTab === "resale") {
      setValueResale("state", stateName);
      setValueResale("district", ""); // Clear district when state changes
    } else {
      setValueRental("state", stateName);
      setValueRental("district", ""); // Clear district when state changes
    }

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

  const handleStationChange = (val: string) => {
    setSelectedStation(val);
    if (activeTab === "resale") {
      setValueResale("station", val);
    } else {
      setValueRental("station", val);
    }
  };

  const resaleSteps = [
    {
      label: "Basic Details",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="society"
            label={
              <>
                Building/Society Name{" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
            error={errorsResale.society?.message}
            {...registerResale("society", {
              required: "Building/Society name is required",
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueResale("society", formatted);
                return formatted;
              },
            })}
          />

          <Input
            id="sublocation"
            label={
              <>
                Sublocation <span className="text-red-500 font-bold">*</span>
              </>
            }
            error={errorsResale.sublocation?.message}
            {...registerResale("sublocation", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueResale("sublocation", formatted);
                return formatted;
              },
            })}
          />

          <Input
            id="landmark"
            label={
              <>
                Landmark <span className="text-red-500 font-bold">*</span>
              </>
            }
            error={errorsResale.landmark?.message}
            {...registerResale("landmark", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueResale("landmark", formatted);
                return formatted;
              },
            })}
          />

          <Input
            id="pincode"
            label={
              <>
                PIN Code <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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
            {...registerResale("pincode", {
              required: "PIN code is required",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Enter valid 6-digit PIN code",
              },
            })}
          />

          <div className="relative station-dropdown">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Station <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Search or enter station name..."
              value={watchResale("station") || stationSearchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setStationSearchTerm(value);
                setSelectedStationIndex(-1);
                setShowStationDropdown(true);

                // If user is editing a selected station, clear the form data to allow search
                if (
                  watchResale("station") &&
                  value !== watchResale("station")
                ) {
                  setValueResale("station", "");
                }
              }}
              onFocus={() => {
                setShowStationDropdown(true);
                setSelectedStationIndex(-1);
              }}
              onKeyDown={(e) => {
                const searchValue = watchResale("station") || stationSearchTerm;
                const filteredOptions = stationOptions.filter((option) =>
                  option.label.toLowerCase().includes(searchValue.toLowerCase())
                );

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const newIndex =
                    selectedStationIndex < filteredOptions.length - 1
                      ? selectedStationIndex + 1
                      : selectedStationIndex;
                  setSelectedStationIndex(newIndex);
                  if (!showStationDropdown) setShowStationDropdown(true);

                  // Auto-scroll to keep selected item visible
                  setTimeout(() => {
                    const dropdown = document.querySelector(
                      ".station-dropdown .absolute"
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
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const newIndex =
                    selectedStationIndex > 0 ? selectedStationIndex - 1 : -1;
                  setSelectedStationIndex(newIndex);
                  if (!showStationDropdown) setShowStationDropdown(true);

                  // Auto-scroll to keep selected item visible
                  setTimeout(() => {
                    const dropdown = document.querySelector(
                      ".station-dropdown .absolute"
                    );
                    const selectedItem = dropdown?.children[
                      newIndex >= 0 ? newIndex : 0
                    ] as HTMLElement;
                    if (selectedItem && dropdown) {
                      selectedItem.scrollIntoView({
                        block: "nearest",
                        behavior: "smooth",
                      });
                    }
                  }, 0);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (
                    selectedStationIndex >= 0 &&
                    filteredOptions[selectedStationIndex]
                  ) {
                    const stationValue =
                      filteredOptions[selectedStationIndex].value;
                    setValueResale("station", stationValue);
                    setSelectedStation(stationValue);
                    setStationSearchTerm("");
                    setShowStationDropdown(false);
                    setSelectedStationIndex(-1);
                  } else if (searchValue.trim()) {
                    // Allow manual entry of new station
                    setValueResale("station", searchValue.trim());
                    setSelectedStation(searchValue.trim());
                    setStationSearchTerm("");
                    setShowStationDropdown(false);
                  }
                } else if (e.key === "Escape") {
                  setShowStationDropdown(false);
                  setSelectedStationIndex(-1);
                }
              }}
            />
            {showStationDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {stationOptions
                  .filter((option) => {
                    const searchValue =
                      watchResale("station") || stationSearchTerm;
                    return option.label
                      .toLowerCase()
                      .includes(searchValue.toLowerCase());
                  })
                  .map((option, index) => (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer ${
                        index === selectedStationIndex
                          ? "bg-blue-500 text-white"
                          : "hover:bg-neutral-100"
                      }`}
                      onClick={() => {
                        setValueResale("station", option.value);
                        setSelectedStation(option.value);
                        setStationSearchTerm("");
                        setShowStationDropdown(false);
                        setSelectedStationIndex(-1);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                {stationOptions.filter((option) => {
                  const searchValue =
                    watchResale("station") || stationSearchTerm;
                  return option.label
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
                }).length === 0 && (
                  <div className="px-3 py-2 text-neutral-500">
                    No stations found. You can type to add a new station.
                  </div>
                )}
                {watchResale("station") && (
                  <div
                    className="px-3 py-2 hover:bg-neutral-100 cursor-pointer border-t border-neutral-200 text-red-600"
                    onClick={() => {
                      setValueResale("station", "");
                      setStationSearchTerm("");
                      setShowStationDropdown(false);
                      setSelectedStationIndex(-1);
                    }}
                  >
                    Clear selection
                  </div>
                )}
              </div>
            )}
            {errorsResale.station?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errorsResale.station.message}
              </p>
            )}
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              value={watchResale("station") || ""}
              {...registerResale("station", {
                required: "Station is required",
              })}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">
              State & District <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="flex gap-1">
              <select
                id="state"
                value={selectedStateCode}
                onChange={handleStateChange}
                className="w-1/2 border border-neutral-300 rounded px-2 py-2 text-sm"
              >
                <option value="">State</option>
                {states.map((state, index) => (
                  <option key={state.iso2} value={state.iso2}>
                    {state.name}
                  </option>
                ))}
              </select>
              <select
                id="district"
                value={watchResale("district") || ""}
                onChange={(e) => setValueResale("district", e.target.value)}
                disabled={!selectedStateCode}
                className="w-1/2 border border-neutral-300 rounded px-2 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="">District</option>
                {cities.map((city, index) => (
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
            label={
              <>
                Configuration <span className="text-red-500 font-bold">*</span>
              </>
            }
            value={watchResale("type")}
            onChange={(val) => setValueResale("type", val)}
            options={propertyTypes}
            error={errorsResale.type?.message}
          />

          {watchResale("type") === "1 BHK" && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Master Bed
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...registerResale("masterBed")}
                    className="h-4 w-4 text-primary border-neutral-300"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="false"
                    {...registerResale("masterBed")}
                    className="h-4 w-4 text-primary border-neutral-300"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          )}

          <Input
            id="resale-buildingNo"
            label={
              <>
                Building No./Wing{" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
            autoComplete="off"
            error={errorsResale.buildingNo?.message}
            {...registerResale("buildingNo", {
              required: "Building No./Wing is required",
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueResale("buildingNo", formatted);
                return formatted;
              },
            })}
          />

          <Input
            id="resale-flatNo"
            label="Flat No (Optional)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.flatNo?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("flatNo")}
          />

          <Input
            id="resale-floorNo"
            label={
              <>
                Floor No. <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.floorNo?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("floorNo", {
              required: "Floor No. is required",
            })}
          />

          <Input
            id="resale-totalFloors"
            label={
              <>
                Total Floors <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.totalFloors?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("totalFloors", {
              required: "Total floors is required",
            })}
          />

          <Input
            id="resale-carpetArea"
            label={
              <>
                Carpet Area (sq ft){" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.carpetArea?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("carpetArea", {
              required: "Carpet area is required",
            })}
          />

          <Input
            id="resale-builtUpArea"
            label="Built-up Area (sq ft)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.builtUpArea?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("builtUpArea")}
          />

          <Input
            id="resale-propertyAge"
            label={
              <>
                Property Age (years){" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.propertyAge?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("propertyAge", {
              required: "Property age is required",
            })}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {
                <>
                  OC Available <span className="text-red-500 font-bold">*</span>
                </>
              }
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="true"
                  {...registerResale("ocAvailable", {
                    required: "Please select OC availability",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="false"
                  {...registerResale("ocAvailable", {
                    required: "Please select OC availability",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {errorsResale.ocAvailable?.message && (
              <p className="text-error text-sm mt-1">
                {errorsResale.ocAvailable.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amenities <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                "Swimming Pool",
                "Gymnasium",
                "Club House",
                "Kid's Play Area",
                "Modular Kitchen",
                "Gas Pipeline",
              ].map((amenity, index) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(watchResale("amenities") || []).includes(amenity)}
                    onChange={(e) => {
                      const currentAmenities = watchResale("amenities") || [];
                      const newAmenities = e.target.checked
                        ? [...currentAmenities, amenity]
                        : currentAmenities.filter((a) => a !== amenity);
                      setValueResale("amenities", newAmenities);
                    }}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
            <TagInput
              label="Additional Amenities (Comma separated)"
              value={watchResale("amenities") || []}
              onChange={(updated) => setValueResale("amenities", updated)}
            />
          </div>

          <SearchableDropdown
            label={
              <>
                Furnishing <span className="text-red-500 font-bold">*</span>
              </>
            }
            value={watchResale("furnishing")}
            onChange={(val) => setValueResale("furnishing", val)}
            options={furnishingOptions}
            error={errorsResale.furnishing?.message}
          />

          <SearchableDropdown
            label={
              <>
                Parking <span className="text-red-500 font-bold">*</span>
              </>
            }
            value={watchResale("parking")}
            onChange={(val) => setValueResale("parking", val)}
            options={parkingOptions}
            error={errorsResale.parking?.message}
          />

          <SearchableDropdown
            label={
              <>
                Terrace/Gallery{" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
            value={watchResale("terraceGallery")}
            onChange={(val) => setValueResale("terraceGallery", val)}
            options={[
              { value: "Terrace", label: "Terrace" },
              { value: "Gallery", label: "Gallery" },
            ]}
            error={errorsResale.terraceGallery?.message}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {
                <>
                  Cosmo Society{" "}
                  <span className="text-red-500 font-bold">*</span>
                </>
              }
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="true"
                  {...registerResale("cosmoSociety", {
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
                  {...registerResale("cosmoSociety", {
                    required: "Please select Cosmo society",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {errorsResale.cosmoSociety?.message && (
              <p className="text-error text-sm mt-1">
                {errorsResale.cosmoSociety.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                id="resale-expectedPrice"
                label={
                  <>
                    Expected Price (₹){" "}
                    <span className="text-red-500 font-bold">*</span>
                  </>
                }
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] pr-16"
                error={errorsResale.expectedPrice?.message}
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
                onWheel={(e) => e.currentTarget.blur()}
                {...registerResale("expectedPrice", {
                  required: "Expected price is required",
                })}
              />
              {watchResale("expectedPrice") && (
                <div className="absolute right-3 top-9 text-sm text-gray-600 font-medium">
                  {formatPriceDisplay(watchResale("expectedPrice") || "")}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {
                  <>
                    Negotiable <span className="text-red-500 font-bold">*</span>
                  </>
                }
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="true"
                    {...registerResale("negotiable", {
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
                    {...registerResale("negotiable", {
                      required: "Please select negotiable option",
                    })}
                    className="h-4 w-4 text-primary border-neutral-300"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
              {errorsResale.negotiable?.message && (
                <p className="text-error text-sm mt-1">
                  {errorsResale.negotiable.message}
                </p>
              )}
            </div>
          </div>

          <Input
            id="resale-maintenance"
            label="Maintenance per Month (₹)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.maintenance?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("maintenance")}
          />

          {/* Plus Property */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="plus-property-resale"
                checked={isPremiumResale}
                onChange={(e) => {
                  setIsPremiumResale(e.target.checked);
                  if (!e.target.checked) {
                    setValueResale("plusProperty", "");
                  }
                }}
                className="h-4 w-4 text-primary border-neutral-300 rounded"
              />
              <label
                htmlFor="plus-property-resale"
                className="ml-2 text-sm font-medium text-neutral-700"
              >
                Plus Property
              </label>
            </div>
            {isPremiumResale && (
              <SearchableDropdown
                label="Select Plus Option"
                value={watchResale("plusProperty")}
                onChange={(val) => setValueResale("plusProperty", val)}
                options={plusPropertyOptions}
                error={errorsResale.plusProperty?.message}
              />
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
            id="resale-ownerName"
            label="Owner Name (Optional)"
            error={errorsResale.ownerName?.message}
            {...registerResale("ownerName", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueResale("ownerName", formatted);
                return formatted;
              },
            })}
          />

          <Input
            id="resale-ownerNumber"
            label="Owner Number (Optional)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsResale.ownerNumber?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerResale("ownerNumber", {
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter valid 10-digit number",
              },
            })}
          />

          <Input
            id="resale-connectedPerson"
            label="Connected Person"
            placeholder="Employee name"
            error={errorsResale.connectedPerson?.message}
            {...registerResale("connectedPerson", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueResale("connectedPerson", formatted);
                return formatted;
              },
            })}
          />

          <Input
            id="resale-imageUrl"
            label="Image URL"
            error={errorsResale.imageUrl?.message}
            {...registerResale("imageUrl")}
          />

          <Input
            id="resale-videoUrl"
            label="Video URL"
            error={errorsResale.videoUrl?.message}
            {...registerResale("videoUrl")}
          />
        </div>
      ),
    },
  ];

  const rentalSteps = [
    {
      label: "Basic Details",
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="society"
            label={
              <>
                Building/Society Name{" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
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
            label={
              <>
                Sublocation <span className="text-red-500 font-bold">*</span>
              </>
            }
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
            label={
              <>
                Landmark <span className="text-red-500 font-bold">*</span>
              </>
            }
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
            label={
              <>
                PIN Code <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
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

          <div className="relative station-dropdown">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Station <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Search or enter station name..."
              value={watchRental("station") || stationSearchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setStationSearchTerm(value);
                setSelectedStationIndex(-1);
                setShowStationDropdown(true);

                // If user is editing a selected station, clear the form data to allow search
                if (
                  watchRental("station") &&
                  value !== watchRental("station")
                ) {
                  setValueRental("station", "");
                }
              }}
              onFocus={() => {
                setShowStationDropdown(true);
                setSelectedStationIndex(-1);
              }}
              onKeyDown={(e) => {
                const searchValue = watchRental("station") || stationSearchTerm;
                const filteredOptions = stationOptions.filter((option) =>
                  option.label.toLowerCase().includes(searchValue.toLowerCase())
                );

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const newIndex =
                    selectedStationIndex < filteredOptions.length - 1
                      ? selectedStationIndex + 1
                      : selectedStationIndex;
                  setSelectedStationIndex(newIndex);
                  if (!showStationDropdown) setShowStationDropdown(true);

                  // Auto-scroll to keep selected item visible
                  setTimeout(() => {
                    const dropdown = document.querySelector(
                      ".station-dropdown .absolute"
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
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const newIndex =
                    selectedStationIndex > 0 ? selectedStationIndex - 1 : -1;
                  setSelectedStationIndex(newIndex);
                  if (!showStationDropdown) setShowStationDropdown(true);

                  // Auto-scroll to keep selected item visible
                  setTimeout(() => {
                    const dropdown = document.querySelector(
                      ".station-dropdown .absolute"
                    );
                    const selectedItem = dropdown?.children[
                      newIndex >= 0 ? newIndex : 0
                    ] as HTMLElement;
                    if (selectedItem && dropdown) {
                      selectedItem.scrollIntoView({
                        block: "nearest",
                        behavior: "smooth",
                      });
                    }
                  }, 0);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (
                    selectedStationIndex >= 0 &&
                    filteredOptions[selectedStationIndex]
                  ) {
                    const stationValue =
                      filteredOptions[selectedStationIndex].value;
                    setValueRental("station", stationValue);
                    setSelectedStation(stationValue);
                    setStationSearchTerm("");
                    setShowStationDropdown(false);
                    setSelectedStationIndex(-1);
                  } else if (searchValue.trim()) {
                    // Allow manual entry of new station
                    setValueRental("station", searchValue.trim());
                    setSelectedStation(searchValue.trim());
                    setStationSearchTerm("");
                    setShowStationDropdown(false);
                  }
                } else if (e.key === "Escape") {
                  setShowStationDropdown(false);
                  setSelectedStationIndex(-1);
                }
              }}
            />
            {showStationDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {stationOptions
                  .filter((option) => {
                    const searchValue =
                      watchRental("station") || stationSearchTerm;
                    return option.label
                      .toLowerCase()
                      .includes(searchValue.toLowerCase());
                  })
                  .map((option, index) => (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer ${
                        index === selectedStationIndex
                          ? "bg-blue-500 text-white"
                          : "hover:bg-neutral-100"
                      }`}
                      onClick={() => {
                        setValueRental("station", option.value);
                        setSelectedStation(option.value);
                        setStationSearchTerm("");
                        setShowStationDropdown(false);
                        setSelectedStationIndex(-1);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                {stationOptions.filter((option) => {
                  const searchValue =
                    watchRental("station") || stationSearchTerm;
                  return option.label
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
                }).length === 0 && (
                  <div className="px-3 py-2 text-neutral-500">
                    No stations found. You can type to add a new station.
                  </div>
                )}
                {watchRental("station") && (
                  <div
                    className="px-3 py-2 hover:bg-neutral-100 cursor-pointer border-t border-neutral-200 text-red-600"
                    onClick={() => {
                      setValueRental("station", "");
                      setStationSearchTerm("");
                      setShowStationDropdown(false);
                      setSelectedStationIndex(-1);
                    }}
                  >
                    Clear selection
                  </div>
                )}
              </div>
            )}
            {errorsRental.station?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errorsRental.station.message}
              </p>
            )}
            {/* Hidden input for form validation */}
            <input
              type="hidden"
              value={watchRental("station") || ""}
              {...registerRental("station", {
                required: "Station is required",
              })}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">
              State & District <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="flex gap-1">
              <select
                id="state"
                value={selectedStateCode}
                onChange={handleStateChange}
                className="w-1/2 border border-neutral-300 rounded px-2 py-2 text-sm"
              >
                <option value="">State</option>
                {states.map((state, index) => (
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
                {cities.map((city, index) => (
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
            label={
              <>
                Configuration <span className="text-red-500 font-bold">*</span>
              </>
            }
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
            id="rental-buildingNo"
            label={
              <>
                Building No./Wing{" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
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
            id="rental-flatNo"
            label="Flat No. (Optional)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsRental.flatNo?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerRental("flatNo")}
          />

          <Input
            id="rental-floorNo"
            label={
              <>
                Floor No. <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsRental.floorNo?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerRental("floorNo", {
              required: "Floor No. is required",
            })}
          />

          <Input
            id="rental-totalFloors"
            label={
              <>
                Total Floors <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsRental.totalFloors?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerRental("totalFloors", {
              required: "Total floors is required",
            })}
          />

          <Input
            id="rental-propertyAge"
            label={
              <>
                Property Age (years){" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsRental.propertyAge?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerRental("propertyAge", {
              required: "Property age is required",
            })}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amenities <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                "Swimming Pool",
                "Gymnasium",
                "Club House",
                "Kid's Play Area",
                "Modular Kitchen",
                "Gas Pipeline",
              ].map((amenity, index) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(watchRental("amenities") || []).includes(amenity)}
                    onChange={(e) => {
                      const currentAmenities = watchRental("amenities") || [];
                      const newAmenities = e.target.checked
                        ? [...currentAmenities, amenity]
                        : currentAmenities.filter((a) => a !== amenity);
                      setValueRental("amenities", newAmenities);
                    }}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
            <TagInput
              label="Additional Amenities (Comma separated)"
              value={watchRental("amenities") || []}
              onChange={(updated) => setValueRental("amenities", updated)}
            />
          </div>

          <SearchableDropdown
            label={
              <>
                Furnishing <span className="text-red-500 font-bold">*</span>
              </>
            }
            value={watchRental("furnishing")}
            onChange={(val) => setValueRental("furnishing", val)}
            options={furnishingOptions}
            error={errorsRental.furnishing?.message}
          />

          <SearchableDropdown
            label={
              <>
                Parking <span className="text-red-500 font-bold">*</span>
              </>
            }
            value={watchRental("parking")}
            onChange={(val) => setValueRental("parking", val)}
            options={parkingOptions}
            error={errorsRental.parking?.message}
          />

          <SearchableDropdown
            label={
              <>
                Terrace/Gallery{" "}
                <span className="text-red-500 font-bold">*</span>
              </>
            }
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
              {
                <>
                  Cosmo Society{" "}
                  <span className="text-red-500 font-bold">*</span>
                </>
              }
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="rental-expectedRent"
              label={
                <>
                  Expected Rent (₹){" "}
                  <span className="text-red-500 font-bold">*</span>
                </>
              }
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              error={errorsRental.expectedRent?.message}
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
              onWheel={(e) => e.currentTarget.blur()}
              {...registerRental("expectedRent", {
                required: "Expected rent is required",
              })}
            />

            <Input
              id="rental-securityDeposit"
              label={
                <>
                  Security Deposit (₹){" "}
                  <span className="text-red-500 font-bold">*</span>
                </>
              }
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              error={errorsRental.securityDeposit?.message}
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
              onWheel={(e) => e.currentTarget.blur()}
              {...registerRental("securityDeposit", {
                required: "Security deposit is required",
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {
                <>
                  Negotiable <span className="text-red-500 font-bold">*</span>
                </>
              }
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

          {/* Pet Friendly field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {
                <>
                  Pet Friendly?{" "}
                  <span className="text-red-500 font-bold">*</span>
                </>
              }
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="true"
                  {...registerRental("availableImmediately", {
                    required: "Please select pet friendly option",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="false"
                  {...registerRental("availableImmediately", {
                    required: "Please select pet friendly option",
                  })}
                  className="h-4 w-4 text-primary border-neutral-300"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
            {errorsRental.availableImmediately && (
              <p className="text-error text-sm mt-1">
                {errorsRental.availableImmediately.message}
              </p>
            )}
          </div>

          {/* Plus Property */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="plus-property-rental"
                checked={isPremiumRental}
                onChange={(e) => {
                  setIsPremiumRental(e.target.checked);
                  if (!e.target.checked) {
                    setValueRental("plusProperty", "");
                  }
                }}
                className="h-4 w-4 text-primary border-neutral-300 rounded"
              />
              <label
                htmlFor="plus-property-rental"
                className="ml-2 text-sm font-medium text-neutral-700"
              >
                Plus Property
              </label>
            </div>
            {isPremiumRental && (
              <SearchableDropdown
                label="Select Plus Option"
                value={watchRental("plusProperty")}
                onChange={(val) => setValueRental("plusProperty", val)}
                options={plusPropertyOptions}
                error={errorsRental.plusProperty?.message}
              />
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
            id="rental-ownerName"
            label="Owner Name (Optional)"
            error={errorsRental.ownerName?.message}
            {...registerRental("ownerName", {
              onChange: (e) => {
                const formatted = toTitleCase(e.target.value);
                setValueRental("ownerName", formatted);
                return formatted;
              },
            })}
          />

          <Input
            id="rental-ownerNumber"
            label="Owner Number (Optional)"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            error={errorsRental.ownerNumber?.message}
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
            onWheel={(e) => e.currentTarget.blur()}
            {...registerRental("ownerNumber", {
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter valid 10-digit number",
              },
            })}
          />

          <Input
            id="rental-connectedPerson"
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
            id="rental-imageUrl"
            label="Image URL"
            error={errorsRental.imageUrl?.message}
            {...registerRental("imageUrl")}
          />

          <Input
            id="rental-videoUrl"
            label="Video URL"
            error={errorsRental.videoUrl?.message}
            {...registerRental("videoUrl")}
          />
        </div>
      ),
    },
  ];

  const isLastStep =
    currentStep ===
    (activeTab === "resale" ? resaleSteps : rentalSteps).length - 1;

  // Inventory state and fetch
  const [inventory, setInventory] = useState<{
    resale: ResaleProperty[];
    rental: RentalProperty[];
  }>({
    resale: [],
    rental: [],
  });

  const fetchStationOptions = useCallback(async () => {
    try {
      // Use static stations as default
      const stationNames = stations.map((s) => s.name);
      const defaultLocationOptions = stationNames.flatMap((name) => [
        { value: `${name} East`, label: `${name} East` },
        { value: `${name} West`, label: `${name} West` },
      ]);

      // Collect unique station names from existing properties and cost sheets
      const additionalLocations = new Set<string>();

      // Add stations from inventory
      [...inventory.resale, ...inventory.rental].forEach((property: any) => {
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

      // Add stations from cost sheets
      try {
        const costSheets = await getCostSheets();
        costSheets.forEach((sheet: any) => {
          if (sheet.station) {
            const stationName = sheet.station.trim();
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
      } catch (error) {
        
      }

      // Convert additional locations to options format
      const additionalLocationOptions = Array.from(additionalLocations)
        .sort()
        .map((location) => ({ value: location, label: location }));

      // Combine default and additional locations
      const allLocationOptions = [
        ...defaultLocationOptions,
        ...additionalLocationOptions,
      ];

      setStationOptions(allLocationOptions);
    } catch (error) {
      
    }
  }, [inventory]);

  // Update station options when inventory data changes
  useEffect(() => {
    fetchStationOptions();
  }, [fetchStationOptions]);

  // Filter and sort functions
  const filterAndSortResale = useCallback(
    (properties: ResaleProperty[]) => {
      let filtered = properties;

      // Apply search filter
      if (resaleSearchTerm) {
        const searchLower = resaleSearchTerm.toLowerCase();
        filtered = filtered.filter(
          (property) =>
            property.society?.toLowerCase().includes(searchLower) ||
            property.sublocation?.toLowerCase().includes(searchLower) ||
            property.station?.toLowerCase().includes(searchLower) ||
            property.landmark?.toLowerCase().includes(searchLower) ||
            property.district?.toLowerCase().includes(searchLower) ||
            property.state?.toLowerCase().includes(searchLower)
        );
      }

      // Apply type filter
      if (resaleFilters.type) {
        filtered = filtered.filter(
          (property) => property.type === resaleFilters.type
        );
      }

      // Apply sorting
      if (resaleFilters.sort) {
        filtered = [...filtered].sort((a, b) => {
          switch (resaleFilters.sort) {
            case "date-desc":
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            case "date-asc":
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
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
    },
    [resaleSearchTerm, resaleFilters]
  );

  const filterAndSortRental = useCallback(
    (properties: RentalProperty[]) => {
      let filtered = properties;

      // Apply search filter
      if (rentalSearchTerm) {
        const searchLower = rentalSearchTerm.toLowerCase();
        filtered = filtered.filter(
          (property) =>
            property.society?.toLowerCase().includes(searchLower) ||
            property.sublocation?.toLowerCase().includes(searchLower) ||
            property.station?.toLowerCase().includes(searchLower) ||
            property.landmark?.toLowerCase().includes(searchLower) ||
            property.district?.toLowerCase().includes(searchLower) ||
            property.state?.toLowerCase().includes(searchLower)
        );
      }

      // Apply type filter
      if (rentalFilters.type) {
        filtered = filtered.filter(
          (property) => property.type === rentalFilters.type
        );
      }

      // Apply sorting
      if (rentalFilters.sort) {
        filtered = [...filtered].sort((a, b) => {
          switch (rentalFilters.sort) {
            case "date-desc":
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            case "date-asc":
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
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
    },
    [rentalSearchTerm, rentalFilters]
  );

  // Get unique property types from inventory
  const getAvailableResaleTypes = useCallback(() => {
    const types = Array.from(
      new Set(inventory.resale.map((p) => p.type).filter(Boolean))
    );
    return types.sort();
  }, [inventory.resale]);

  const getAvailableRentalTypes = useCallback(() => {
    const types = Array.from(
      new Set(inventory.rental.map((p) => p.type).filter(Boolean))
    );
    return types.sort();
  }, [inventory.rental]);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    try {
      const [resale, rental] = await Promise.all([
        getResaleProperties(user.id),
        getRentalProperties(user.id),
      ]);

      const updatedResale = await Promise.all(
        resale.map(async (property) => {
          const updatedAt =
            typeof property.updatedAt?.toDate === "function"
              ? property.updatedAt.toDate()
              : new Date(property.updatedAt || property.createdAt);

          const isOlderThan30Days =
            (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24) > 30;

          if (
            isOlderThan30Days &&
            property.listingState !== "Hold" &&
            property.isApproved
          ) {
            await updateResaleProperty(
              user.id,
              property.docId,
              {
                listingState: "Hold",
                updatedAt: new Date().toISOString(),
              },
              { skipApprovalReset: true }
            );

            return {
              ...property,
              listingState: "Hold",
              updatedAt: new Date().toISOString(),
            };
          }

          return property;
        })
      );

      const updatedRental = await Promise.all(
        rental.map(async (property) => {
          const updatedAt =
            typeof property.updatedAt?.toDate === "function"
              ? property.updatedAt.toDate()
              : new Date(property.updatedAt || property.createdAt);

          const isOlderThan30Days =
            (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24) > 30;

          if (
            isOlderThan30Days &&
            property.listingState !== "Hold" &&
            property.isApproved
          ) {
            await updateRentalProperty(
              user.id,
              property.docId,
              {
                listingState: "Hold",
                updatedAt: new Date().toISOString(),
              },
              { skipApprovalReset: true }
            );

            return {
              ...property,
              listingState: "Hold",
              updatedAt: new Date().toISOString(),
            };
          }

          return property;
        })
      );

      setInventory({ resale: updatedResale, rental: updatedRental });
    } catch (error) {
      
    }
  }, [user]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        
      }
    };
    loadStates();
    // Initialize station options with default stations
    fetchStationOptions();
  }, [fetchStationOptions]);

  // Close modals on Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (viewProperty) {
          setViewProperty(null);
        }
        if (viewRentalProperty) {
          setViewRentalProperty(null);
        }
      }
    };

    if (viewProperty || viewRentalProperty) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [viewProperty, viewRentalProperty]);

  function getDisplayDate(createdAt: any) {
    if (!createdAt) return "N/A";
    if (typeof createdAt.toDate === "function") {
      const d = createdAt.toDate();
      if (!isNaN(d.getTime())) return format(d, "dd/MM/yyyy");
      return "N/A";
    }
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) return format(d, "dd/MM/yyyy");
    return "N/A";
  }

  const toggleView = () => {
    if (!showPropertyList) {
      fetchInventory();
    } else {
      resetAllForms();
    }
    setShowPropertyList(!showPropertyList);
  };

  const formatKey = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1") // add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
      .replace(/Url$/, "URL"); // cleanup URL casing

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              My Inventory
            </h1>
            <p className="text-neutral-500">Manage your property listings</p>
          </div>
          <Button
            variant={showPropertyList ? "primary" : "outline"}
            icon={
              showPropertyList ? (
                <Plus className="h-4 w-4 mr-1" />
              ) : (
                <Building className="h-4 w-4 mr-1" />
              )
            }
            onClick={toggleView}
          >
            {showPropertyList ? "Add New Property" : "View My Properties"}
          </Button>
        </div>

        {showPropertyList ? (
          // Property Listing View
          <Card>
            <Tabs
              activeTabId={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                {
                  id: "resale",
                  label: "Resale Properties",
                  content: (
                    <div className="space-y-4">
                      {/* Search and Filter Bar */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Search by society, location, station..."
                              value={resaleSearchTerm}
                              onChange={(e) =>
                                setResaleSearchTerm(e.target.value)
                              }
                              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={resaleFilters.type}
                              onChange={(e) =>
                                setResaleFilters((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }))
                              }
                              className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[120px]"
                            >
                              <option value="">All Types</option>
                              {getAvailableResaleTypes().map((type, index) => (
                                <option key={index} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            <select
                              value={resaleFilters.sort}
                              onChange={(e) =>
                                setResaleFilters((prev) => ({
                                  ...prev,
                                  sort: e.target.value,
                                }))
                              }
                              className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[120px]"
                            >
                              <option value="">Sort By</option>
                              <option value="date-desc">Newest First</option>
                              <option value="date-asc">Oldest First</option>
                              <option value="price-desc">
                                Price High to Low
                              </option>
                              <option value="price-asc">
                                Price Low to High
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        {inventory.resale.length === 0 ? (
                          <div className="text-center py-8">
                            <Building className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500">
                              No resale properties added yet
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-neutral-200">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                              <thead className="bg-neutral-100">
                                <tr>
                                  {[
                                    "Date",
                                    "Status",
                                    "Listing State",
                                    "Type",
                                    "Terrace",
                                    "Society",
                                    "Road/Location",
                                    "Station",
                                    "Expected Price",
                                    "Floor No",
                                    "Flat No",
                                    "Cosmo",
                                    "Connected Person",
                                    "Contact Name",
                                    "Contact Number",
                                    "Action",
                                  ].map((title, i) => (
                                    <th
                                      key={i}
                                      className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase text-center"
                                    >
                                      {title}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-neutral-200 bg-white">
                                {filterAndSortResale(inventory.resale).map(
                                  (property: ResaleProperty, index) => (
                                    <tr
                                      key={property.docId || `resale-${index}`}
                                      className="hover:bg-neutral-50 transition"
                                    >
                                      <td className="px-4 py-3 text-center">
                                        {getDisplayDate(property.createdAt)}
                                      </td>

                                      <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            property.rejectedAt
                                              ? "text-red-700 bg-red-100"
                                              : property.isApproved
                                              ? "text-green-700 bg-green-100"
                                              : "text-yellow-800 bg-yellow-100"
                                          }`}
                                          title={
                                            property.rejectedAt
                                              ? `Rejected by (${
                                                  property.rejectorRole
                                                })${
                                                  property.rejectionReason
                                                    ? ": " +
                                                      property.rejectionReason
                                                    : ""
                                                }`
                                              : undefined
                                          }
                                        >
                                          {property.rejectedAt
                                            ? "Rejected"
                                            : property.isApproved
                                            ? "Approved"
                                            : "Pending Approval"}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <select
                                          value={
                                            property.listingState || "Available"
                                          }
                                          onChange={async (e) => {
                                            const newState = e.target.value;
                                            if (!user) {
                                              toast.error(
                                                "User not found. Please login again."
                                              );
                                              return;
                                            }
                                            await updateResaleProperty(
                                              user.id,
                                              property.docId,
                                              {
                                                listingState: newState,
                                                updatedAt:
                                                  new Date().toISOString(),
                                              },
                                              {
                                                skipApprovalReset: true,
                                              }
                                            );
                                            setInventory((prev) => ({
                                              ...prev,
                                              resale: prev.resale.map((p) =>
                                                p.docId === property.docId
                                                  ? {
                                                      ...p,
                                                      listingState:
                                                        newState as ListingState,
                                                    }
                                                  : p
                                              ),
                                            }));
                                          }}
                                          disabled={!property.isApproved}
                                          className={`border rounded px-2 py-1 text-sm text-center min-w-[130px] ${
                                            !property.isApproved
                                              ? "bg-neutral-100 text-neutral-500"
                                              : "bg-white"
                                          }`}
                                        >
                                          <option value="Available">
                                            Available
                                          </option>
                                          <option value="Hold">Hold</option>
                                        </select>
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        {property.type}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.terrace ? "Yes" : "No"}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.society}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.sublocation}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.station}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        ₹
                                        {property.expectedPrice?.toLocaleString(
                                          "en-IN"
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.floorNo}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.flatNo}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.cosmoSociety ? "Yes" : "No"}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.connectedPerson}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.ownerName}
                                      </td>
                                      <td className="px-4 py-3 text-center font-mono">
                                        {property.ownerNumber}
                                      </td>

                                      <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                                        <Button
                                          size="sm"
                                          variant="text"
                                          icon={<Eye className="h-4 w-4" />}
                                          onClick={() =>
                                            setViewProperty(property)
                                          }
                                        >
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          icon={<Pencil className="h-4 w-4" />}
                                          onClick={() => handleEdit(property)}
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="danger"
                                          onClick={() =>
                                            handleDelete(property.docId)
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "rental",
                  label: "Rental Properties",
                  content: (
                    <div className="space-y-4">
                      {/* Search and Filter Bar */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Search by society, location, station..."
                              value={rentalSearchTerm}
                              onChange={(e) =>
                                setRentalSearchTerm(e.target.value)
                              }
                              className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            />
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={rentalFilters.type}
                              onChange={(e) =>
                                setRentalFilters((prev) => ({
                                  ...prev,
                                  type: e.target.value,
                                }))
                              }
                              className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white min-w-[120px]"
                            >
                              <option value="">All Types</option>
                              {getAvailableRentalTypes().map((type, index) => (
                                <option key={index} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                            <select
                              value={rentalFilters.sort}
                              onChange={(e) =>
                                setRentalFilters((prev) => ({
                                  ...prev,
                                  sort: e.target.value,
                                }))
                              }
                              className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white min-w-[120px]"
                            >
                              <option value="">Sort By</option>
                              <option value="date-desc">Newest First</option>
                              <option value="date-asc">Oldest First</option>
                              <option value="rent-desc">
                                Rent High to Low
                              </option>
                              <option value="rent-asc">Rent Low to High</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        {inventory.rental.length === 0 ? (
                          <div className="text-center py-8">
                            <Building className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500">
                              No rental properties added yet
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-neutral-200">
                            <table className="min-w-full divide-y divide-neutral-200 text-sm">
                              <thead className="bg-neutral-100">
                                <tr>
                                  {[
                                    "Date",
                                    "Status",
                                    "Listing State",
                                    "Type",
                                    "Terrace",
                                    "Society",
                                    "Road/Location",
                                    "Station",
                                    "Expected Rent",
                                    "Security Deposit",
                                    "Floor No",
                                    "Flat No",
                                    "Cosmo",
                                    "Connected Person",
                                    "Contact Name",
                                    "Contact Number",
                                    "Action",
                                  ].map((title, i) => (
                                    <th
                                      key={i}
                                      className="px-4 py-3 text-xs font-semibold text-neutral-600 uppercase text-center"
                                    >
                                      {title}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-neutral-200 bg-white">
                                {filterAndSortRental(inventory.rental).map(
                                  (property: RentalProperty, index) => (
                                    <tr
                                      key={property.docId || `rental-${index}`}
                                      className="hover:bg-neutral-50 transition"
                                    >
                                      <td className="px-4 py-3 text-center">
                                        {getDisplayDate(property.createdAt)}
                                      </td>

                                      <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            property.rejectedAt
                                              ? "text-red-700 bg-red-100"
                                              : property.isApproved
                                              ? "text-green-700 bg-green-100"
                                              : "text-yellow-800 bg-yellow-100"
                                          }`}
                                          title={
                                            property.rejectedAt
                                              ? `Rejected by (${
                                                  property.rejectorRole
                                                })${
                                                  property.rejectionReason
                                                    ? ": " +
                                                      property.rejectionReason
                                                    : ""
                                                }`
                                              : undefined
                                          }
                                        >
                                          {property.rejectedAt
                                            ? "Rejected"
                                            : property.isApproved
                                            ? "Approved"
                                            : "Pending Approval"}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <select
                                          value={
                                            property.listingState || "Available"
                                          }
                                          onChange={async (e) => {
                                            const newState = e.target.value;
                                            if (!user) {
                                              toast.error(
                                                "User not found. Please login again."
                                              );
                                              return;
                                            }
                                            await updateRentalProperty(
                                              user.id,
                                              property.docId,
                                              {
                                                listingState: newState,
                                                updatedAt:
                                                  new Date().toISOString(),
                                              },
                                              {
                                                skipApprovalReset: true,
                                              }
                                            );
                                            setInventory((prev) => ({
                                              ...prev,
                                              rental: prev.rental.map((p) =>
                                                p.docId === property.docId
                                                  ? {
                                                      ...p,
                                                      listingState:
                                                        newState as ListingState,
                                                    }
                                                  : p
                                              ),
                                            }));
                                          }}
                                          disabled={!property.isApproved}
                                          className={`border rounded px-2 py-1 text-sm text-center min-w-[130px] ${
                                            !property.isApproved
                                              ? "bg-neutral-100 text-neutral-500"
                                              : "bg-white"
                                          }`}
                                        >
                                          <option value="Available">
                                            Available
                                          </option>
                                          <option value="Hold">Hold</option>
                                        </select>
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        {property.type}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.terrace ? "Yes" : "No"}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.society}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.sublocation}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.station}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        ₹
                                        {property.rent?.toLocaleString("en-IN")}
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        ₹
                                        {property.deposit?.toLocaleString(
                                          "en-IN"
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.floorNo}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.flatNo}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.cosmo ? "Yes" : "No"}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.connectedPerson}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        {property.contactName}
                                      </td>
                                      <td className="px-4 py-3 text-center font-mono">
                                        {property.contactNumber}
                                      </td>

                                      <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                                        <Button
                                          size="sm"
                                          variant="text"
                                          icon={<Eye className="h-4 w-4" />}
                                          onClick={() =>
                                            setViewRentalProperty(property)
                                          }
                                        >
                                          View
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          icon={<Pencil className="h-4 w-4" />}
                                          onClick={() =>
                                            handleEditRental(property)
                                          }
                                        >
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="danger"
                                          onClick={() =>
                                            handleDelete(
                                              property.docId,
                                              "rental"
                                            )
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        ) : (
          // Property Add Form View
          <Card>
            <Tabs
              activeTabId={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                {
                  id: "resale",
                  label: editProperty
                    ? "Edit Resale Property"
                    : "Add Resale Property",
                  content: (
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Resale Form Steps */}
                      <div className="w-full md:w-1/4 space-y-6">
                        {resaleSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                                  index === currentStep
                                    ? "bg-primary text-white"
                                    : index < currentStep
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {index + 1}
                              </div>
                              {index !== resaleSteps.length - 1 && (
                                <div className="h-8 w-px bg-neutral-300 mt-1" />
                              )}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                index === currentStep
                                  ? "text-primary"
                                  : index < currentStep
                                  ? "text-green-600"
                                  : "text-neutral-400"
                              }`}
                            >
                              {step.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="w-full md:w-3/4">
                        {!isLastStep ? (
                          <>
                            <h2 className="text-xl font-semibold text-primary mb-4">
                              Step {currentStep + 1}:{" "}
                              {resaleSteps[currentStep].label}
                            </h2>
                            {resaleSteps[currentStep].render()}
                            <div className="flex justify-between mt-6">
                              {currentStep > 0 && (
                                <Button
                                  type="button"
                                  onClick={() => setCurrentStep((s) => s - 1)}
                                >
                                  Back
                                </Button>
                              )}
                              <Button type="button" onClick={handleNext}>
                                Next
                              </Button>
                            </div>
                          </>
                        ) : (
                          <form
                            onSubmit={handleSubmitResale(onSubmitResale)}
                            className="space-y-6"
                          >
                            <h2 className="text-xl font-semibold text-primary mb-4">
                              Step {currentStep + 1}:{" "}
                              {resaleSteps[currentStep].label}
                            </h2>
                            {resaleSteps[currentStep].render()}

                            <div className="flex justify-between mt-6">
                              <Button
                                type="button"
                                onClick={() => setCurrentStep((s) => s - 1)}
                              >
                                Back
                              </Button>
                              <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                              >
                                {editProperty
                                  ? "Update Property"
                                  : "Submit Property"}
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "rental",
                  label: editRentalProperty
                    ? "Edit Rental Property"
                    : "Add Rental Property",
                  content: (
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Rental Form Steps */}
                      <div className="w-full md:w-1/4 space-y-6">
                        {rentalSteps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                                  index === currentStep
                                    ? "bg-primary text-white"
                                    : index < currentStep
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {index + 1}
                              </div>
                              {index !== rentalSteps.length - 1 && (
                                <div className="h-8 w-px bg-neutral-300 mt-1" />
                              )}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                index === currentStep
                                  ? "text-primary"
                                  : index < currentStep
                                  ? "text-green-600"
                                  : "text-neutral-400"
                              }`}
                            >
                              {step.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="w-full md:w-3/4">
                        {!isLastStep ? (
                          <>
                            <h2 className="text-xl font-semibold text-primary mb-4">
                              Step {currentStep + 1}:{" "}
                              {rentalSteps[currentStep].label}
                            </h2>
                            {rentalSteps[currentStep].render()}
                            <div className="flex justify-between mt-6">
                              {currentStep > 0 && (
                                <Button
                                  type="button"
                                  onClick={() => setCurrentStep((s) => s - 1)}
                                >
                                  Back
                                </Button>
                              )}
                              <Button type="button" onClick={handleNext}>
                                Next
                              </Button>
                            </div>
                          </>
                        ) : (
                          <form
                            onSubmit={handleSubmitRental(onSubmitRental)}
                            className="space-y-6"
                          >
                            <h2 className="text-xl font-semibold text-primary mb-4">
                              Step {currentStep + 1}:{" "}
                              {rentalSteps[currentStep].label}
                            </h2>
                            {rentalSteps[currentStep].render()}

                            <div className="flex justify-between mt-6">
                              <Button
                                type="button"
                                onClick={() => setCurrentStep((s) => s - 1)}
                              >
                                Back
                              </Button>
                              <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                              >
                                {editRentalProperty
                                  ? "Update Property"
                                  : "Submit Property"}
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        )}
        {viewProperty && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setViewProperty(null)}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Make the scroll only for body */}
              <div className="max-h-[90vh] overflow-y-auto">
                {/* Sticky Header */}
                <div className="flex justify-between items-center p-6 sticky top-0 bg-white z-10 border-b">
                  <h2 className="text-xl font-semibold text-primary">
                    Resale Property Details
                  </h2>
                  <button
                    onClick={() => setViewProperty(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Basic Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Building/Society Name
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.society || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Sublocation
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.sublocation || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Landmark
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.landmark || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          PIN Code
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.pincode || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Station
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.station || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          District
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.district || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">State</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.state || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Property Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Configuration
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.type || "N/A"}
                        </span>
                      </div>
                      {viewProperty.type === "1 BHK" && (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-neutral-500">
                            Master Bed
                          </span>
                          <span className="text-sm font-medium text-neutral-900">
                            {viewProperty.masterBed ? "Yes" : "No"}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Building No./Wing
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.buildingNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Flat No.
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.flatNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Floor No.
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.floorNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Total Floors
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.totalFloors || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Carpet Area (sq ft)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.carpetArea || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Built-up Area (sq ft)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.builtUpArea || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Property Age (years)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.propertyAge || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          OC Available
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.ocAvailable ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Amenities
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {Array.isArray(viewProperty.amenities)
                            ? viewProperty.amenities.join(", ")
                            : viewProperty.amenities || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Furnishing
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.furnishing || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Parking
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.parking || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Terrace/Gallery
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.terraceGallery || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Cosmo Society
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.cosmoSociety ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Expected Price (₹)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.expectedPrice?.toLocaleString(
                            "en-IN"
                          ) || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Negotiable
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.negotiable ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Maintenance per Month (₹)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.maintenance?.toLocaleString("en-IN") ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Others */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Others
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Owner Name
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.ownerName || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Owner Number
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.ownerNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Connected Person
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.connectedPerson || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Image URL
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.imageUrl ? (
                            <a
                              href={viewProperty.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              View Images
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Video URL
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.videoUrl ? (
                            <a
                              href={viewProperty.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              View Video
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    className={`border rounded-lg p-4 ${
                      viewProperty.rejectedAt
                        ? "bg-red-50 border-red-400"
                        : "bg-yellow-50 border-yellow-400"
                    }`}
                  >
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Status
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Approval Status
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.rejectedAt
                            ? "Rejected"
                            : viewProperty.isApproved
                            ? "Approved"
                            : "Pending"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Listing State
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewProperty.listingState || "Available"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Created At
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {getDisplayDate(viewProperty.createdAt)}
                        </span>
                      </div>
                      {viewProperty.rejectedAt && (
                        <>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-neutral-500">
                              Rejected At
                            </span>
                            <span className="text-sm font-medium text-neutral-900">
                              {getDisplayDate(viewProperty.rejectedAt)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-neutral-500">
                              Rejector Role
                            </span>
                            <span className="text-sm font-medium text-neutral-900">
                              {viewProperty.rejectorRole || "N/A"}
                            </span>
                          </div>
                          {viewProperty.rejectionReason && (
                            <div className="flex flex-col gap-1 md:col-span-2">
                              <span className="text-sm text-neutral-500">
                                Rejection Reason
                              </span>
                              <span className="text-sm font-medium text-neutral-900">
                                {viewProperty.rejectionReason}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {viewRentalProperty && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setViewRentalProperty(null)}
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Make the scroll only for body */}
              <div className="max-h-[90vh] overflow-y-auto">
                {/* Sticky Header */}
                <div className="flex justify-between items-center p-6 sticky top-0 bg-white z-10 border-b">
                  <h2 className="text-xl font-semibold text-primary">
                    Rental Property Details
                  </h2>
                  <button
                    onClick={() => setViewRentalProperty(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Basic Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Building/Society Name
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.society || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Sublocation
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.sublocation || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Landmark
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.landmark || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          PIN Code
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.pincode || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Station
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.station || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          District
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.district || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">State</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.state || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Property Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Configuration
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.type || "N/A"}
                        </span>
                      </div>
                      {viewRentalProperty.type === "1 BHK" && (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-neutral-500">
                            Master Bed
                          </span>
                          <span className="text-sm font-medium text-neutral-900">
                            {viewRentalProperty.masterBed ? "Yes" : "No"}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Building No./Wing
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.buildingNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Flat No.
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.flatNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Floor No.
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.floorNo || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Total Floors
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.totalFloors || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Property Age (years)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.propertyAge || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Amenities
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {Array.isArray(viewRentalProperty.amenities)
                            ? viewRentalProperty.amenities.join(", ")
                            : viewRentalProperty.amenities || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Furnishing
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.furnishing || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Parking
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.parking || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Terrace/Gallery
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.terraceGallery || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Cosmo Society
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.cosmo ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Expected Rent (₹)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.rent?.toLocaleString("en-IN") ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Security Deposit (₹)
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.deposit?.toLocaleString(
                            "en-IN"
                          ) || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Negotiable
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.negotiable ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Others */}
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Others
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Owner Name
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.contactName || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Owner Number
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.contactNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Connected Person
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.connectedPerson || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Image URL
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.imageUrl ? (
                            <a
                              href={viewRentalProperty.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              View Images
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Video URL
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.videoUrl ? (
                            <a
                              href={viewRentalProperty.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              View Video
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div
                    className={`border rounded-lg p-4 ${
                      viewRentalProperty.rejectedAt
                        ? "bg-red-50 border-red-400"
                        : "bg-yellow-50 border-yellow-400"
                    }`}
                  >
                    <h5 className="font-semibold text-neutral-700 mb-3">
                      Status
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Approval Status
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.rejectedAt
                            ? "Rejected"
                            : viewRentalProperty.isApproved
                            ? "Approved"
                            : "Pending"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Listing State
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {viewRentalProperty.listingState || "Available"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-500">
                          Created At
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {getDisplayDate(viewRentalProperty.createdAt)}
                        </span>
                      </div>
                      {viewRentalProperty.rejectedAt && (
                        <>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-neutral-500">
                              Rejected At
                            </span>
                            <span className="text-sm font-medium text-neutral-900">
                              {getDisplayDate(viewRentalProperty.rejectedAt)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-neutral-500">
                              Rejector Role
                            </span>
                            <span className="text-sm font-medium text-neutral-900">
                              {viewRentalProperty.rejectorRole || "N/A"}
                            </span>
                          </div>
                          {viewRentalProperty.rejectionReason && (
                            <div className="flex flex-col gap-1 md:col-span-2">
                              <span className="text-sm text-neutral-500">
                                Rejection Reason
                              </span>
                              <span className="text-sm font-medium text-neutral-900">
                                {viewRentalProperty.rejectionReason}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
