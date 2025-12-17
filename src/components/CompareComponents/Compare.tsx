import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Edit3, Download } from "lucide-react";
import Button from "../ui/Button";
import {
  getStampDutyRates,
  getCostSheets,
} from "../../utils/firestoreListings";
import StampDutyDebugger from "../StampDutyDebugger";
import {
  getStampDutyRate,
  debugStampDutyLookup,
} from "../../utils/stampDutyUtils";
import { useAuth } from "../../utils/authContext";
import { furnitureModal } from "./furnitureModal";
import { negotiationModal } from "./negotiationModal";
import { inLineFilters } from "./inLineFilters";
import { discountRow } from "./TableContainer/discountRow";
import { selectPropertyRow } from "./TableContainer/selectPropertyRow";
import { ReraCarpetRow } from "./TableContainer/CarpetAreaHandler/reraCarpetRow";

export interface CostSheet {
  id: string;

  // Basic Details
  dateUpdateCostSheet?: string;
  station?: string;
  stationSide?: string;
  developerName?: string;
  projectName?: string;
  subLocation?: string;
  landmark?: string;
  district?: string;
  pinCode?: string;
  state?: string;
  landParcel?: string;
  towers?: string;
  storey?: string;

  // New Typologies Structure
  typologies?: Array<{
    typology: string;
    saleableArea: number;
    avRate: number;
    psfRate: number;
    fixedComponent?: string;
    floorBandConfiguration: Array<{
      fromFloor: string;
      toFloor: string;
      rates: { [bhkType: string]: string };
    }>;
  }>;

  // Pricing Configs
  pricingConfigs?: Array<{
    typology: string;
    saleableArea: string;
    avRate: string;
    psfRate: string;
    fixedComponent?: string;
    possessionCharges: string;
    reraCarpet: string;
    totalPackage: string;
    availability: string;
    negotiationScope: string;
  }>;

  // Floor Rise Configuration
  floorRiseConfig?: {
    fixedRateStartsFrom: string;
    rate: string;
    startsFrom: string;
  };
  floorRise?: string;

  // Floor Band Configuration
  floorBandConfig?: Array<{
    fromFloor: string;
    toFloor: string;
    rates: { [bhkType: string]: string };
  }>;

  // Typology Rates
  typologyRates?: { [bhkType: string]: string };

  // Sub Tab Data
  subTabData?: {
    parkingCharges: string;
    possessionCharges?: string;
  };

  // Pricing Details
  wingBuildingNo?: string;
  flatType?: string;
  saleableArea?: number;
  reraCarpet?: number;
  psfRate?: number;
  avRate?: number;
  floorRise?: number;
  registration?: number;
  originalRegistration?: number;

  // Other charges & Payment Plans
  fixedComponent?: number;
  additionalFixedComponent?: number;
  possessionCharges?: number;
  parkingCharge?: number;
  totalPackage?: number;
  paymentScheme?: string[];

  // Amenities
  apartmentAmenities?: string[];
  projectAmenities?: string[];
  locationHighlights?: string[];

  // Others
  type?: string;
  mahaReraNumber?: string;
  mahaReraLink?: string;
  possessionMonth?: string;
  possessionYear?: string;
  reraPossession?: string;
  isCosmo?: string;
  availibility?: string;
  imageUrl?: string;
  videoUrl?: string;
  siteHeadName?: string;
  siteHeadNumber?: string;
  smName?: string;
  smContact?: string;
  sourcingManagers?: Array<{ name: string; contact: string }>;
  siteHeads?: Array<{ name: string; contact: string }>;
  isApproved?: boolean;
  isRejected?: boolean;
  approvalStatus?: string;
  nextApprovalLevel?: string;
  psfIncludesFixedComponent?: boolean;
  psfIncludesParking?: boolean;

  // Legacy fields (keep for backward compatibility)
  discount?: number;
  sbua?: number;
  flatCost?: number;
  floorRisePerFloor?: number;
  floor?: number;
  agreementValue?: number;
  stampDuty?: number;
  gst?: number;
  furnitureCharges?: number;
  possession?: string;
  brochureUrl?: string;
  video?: string;
  images?: string[];
  withParking?: boolean;
  includeParkingInAgreement?: boolean;
  stampDutyRate?: number;
  amenities?: string[]; // Legacy - prefer apartmentAmenities
  highlights?: string[]; // Legacy - prefer locationHighlights
  isCosmo2?: string; // Legacy - prefer isCosmo
}

export interface StampDutyRate {
  id: string;
  location?: string;
  jurisdiction: string;
  rate: number;
}

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [costSheets, setCostSheets] = useState<CostSheet[]>([]);
  const [stampDutyRates, setStampDutyRates] = useState<StampDutyRate[]>([]);
  const [allCostSheets, setAllCostSheets] = useState<CostSheet[]>([]);
  const [showStampDutyDebugger, setShowStampDutyDebugger] = useState(false);
  const [showFurnitureModal, setShowFurnitureModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null
  );
  const [selectedNegotiationValue, setSelectedNegotiationValue] =
    useState<string>("");
  const [filterPropertyType, setFilterPropertyType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filteredSheets, setFilteredSheets] = useState<CostSheet[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(Array(5).fill(""));
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>(
    Array(5).fill(false)
  );
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    Array(5).fill(-1)
  );
  const safeNumber = (val: unknown, fallback = undefined) => {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
      const parsed = Number(val.trim());
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  // Helper to get data from new typologies structure or legacy fields
  const getFieldValue = (sheet: CostSheet, field: string) => {
    // For possession charges, check typologies first
    if (field === "possessionCharges") {
      const typologyValue = sheet.typologies?.[0]?.possessionCharges;
      const subTabValue = safeNumber(sheet.subTabData?.possessionCharges);
      const legacyValue = safeNumber(sheet.possessionCharges);
      return safeNumber(typologyValue) || subTabValue || legacyValue;
    }

    // For parking charges, check subTabData first
    if (field === "parkingCharge") {
      // subTabData is a map with numeric keys (0, 1764494130533, etc.)
      // We need to find parkingCharges from any of these nested objects
      let parkingFromSubTab = undefined;
      if (sheet.subTabData && typeof sheet.subTabData === "object") {
        // Iterate through all keys in subTabData to find parkingCharges
        for (const key in sheet.subTabData) {
          const tabData = sheet.subTabData[key];
          if (
            tabData &&
            typeof tabData === "object" &&
            "parkingCharges" in tabData
          ) {
            parkingFromSubTab = safeNumber(tabData.parkingCharges);
            if (parkingFromSubTab) break; // Use first non-zero value found
          }
        }
      }
      return parkingFromSubTab || safeNumber(sheet.parkingCharge);
    }

    // For fixed component, check typologies first
    if (field === "fixedComponent") {
      // Search through all typologies to find one with fixedComponent
      let typologyValue;
      if (sheet.typologies) {
        for (const typology of sheet.typologies) {
          if (
            typology.fixedComponent &&
            safeNumber(typology.fixedComponent) > 0
          ) {
            typologyValue = typology.fixedComponent;
            break;
          }
        }
      }

      // Search through all pricingConfigs to find one with fixedComponent
      let pricingValue;
      if (sheet.pricingConfigs) {
        for (const config of sheet.pricingConfigs) {
          if (config.fixedComponent && safeNumber(config.fixedComponent) > 0) {
            pricingValue = config.fixedComponent;
            break;
          }
        }
      }

      const legacyValue = sheet.fixedComponent;
      return (
        safeNumber(typologyValue) ||
        safeNumber(pricingValue) ||
        safeNumber(legacyValue)
      );
    }

    // For new structure with typologies
    if (sheet.typologies && sheet.typologies.length > 0) {
      const typology = sheet.typologies[0];
      switch (field) {
        case "saleableArea":
          return (
            safeNumber(typology.saleableArea) || safeNumber(sheet.saleableArea)
          );
        case "reraCarpet":
          // Check all typologies for reraCarpet, not just the first one
          let reraCarpetValue;
          if (sheet.typologies) {
            for (const t of sheet.typologies) {
              if (t.reraCarpet) {
                reraCarpetValue = safeNumber(t.reraCarpet);
                break;
              }
            }
          }
          // Check pricingConfigs as fallback
          if (!reraCarpetValue && sheet.pricingConfigs) {
            for (const p of sheet.pricingConfigs) {
              if (p.reraCarpet) {
                reraCarpetValue = safeNumber(p.reraCarpet);
                break;
              }
            }
          }
          return reraCarpetValue || safeNumber(sheet.reraCarpet);
        case "psfRate":
          return safeNumber(typology.psfRate) || safeNumber(sheet.psfRate);
        case "avRate":
          return safeNumber(typology.avRate) || safeNumber(sheet.avRate);
        case "flatType":
          return typology.typology || sheet.flatType;
        default:
          return sheet[field as keyof CostSheet];
      }
    }

    // Legacy structure
    return sheet[field as keyof CostSheet];
  };

  // Helper function to extract floor band rate from ACTUAL data structure
  const getFloorBandRate = (
    floor: number,
    bhkType: string,
    floorBandConfig: any[],
    typologyRates?: { [bhkType: string]: string }
  ) => {
    // First check if we have floorBandConfig (Band Rate method)
    if (
      floorBandConfig &&
      Array.isArray(floorBandConfig) &&
      floorBandConfig.length > 0
    ) {
      // Find the band where floor falls within range
      const matchingBand = floorBandConfig.find((band) => {
        const from = parseInt(band.fromFloor || "1");
        const to = parseInt(band.toFloor || "999"); // Default to high number if empty
        return floor >= from && floor <= to;
      });

      // Extract rate for the specific BHK type
      if (matchingBand && matchingBand.rates && matchingBand.rates[bhkType]) {
        return parseInt(matchingBand.rates[bhkType]) || 0;
      }
    }

    // Fallback to typologyRates if no floor band config
    if (typologyRates && typologyRates[bhkType]) {
      return parseInt(typologyRates[bhkType]) || 0;
    }

    return 0;
  };

  // Calculate floor rise based on configuration
  const calculateFloorRise = (sheet: CostSheet, floor: number) => {
    if (!sheet.typologies || sheet.typologies.length === 0) return 0;

    const typology = sheet.typologies[0];
    const saleableArea = parseFloat(String(typology.saleableArea)) || 0;
    const floorRiseConfig = sheet.floorRiseConfig || {};
    const floorRise = sheet.floorRise || "";

    // Use floor 1 if no input
    const actualFloor = floor || 1;

    if (floorRise === "Floor Rise") {
      // Rise Rate = Rise Rate × Saleable Area
      const riseRate = parseInt(floorRiseConfig.rate || "0") || 0;
      const startsFrom = parseInt(floorRiseConfig.startsFrom || "1") || 1;

      // Only apply floor rise if floor is >= startsFrom
      if (actualFloor >= startsFrom) {
        return riseRate * saleableArea * (actualFloor - startsFrom + 1);
      }
      return 0;
    } else if (floorRise === "Fixed Rate") {
      // Fixed Rate = Fixed Rate of Typology selected
      const fixedRate =
        parseInt(floorRiseConfig.fixedRateStartsFrom || "0") || 0;
      return fixedRate;
    } else {
      // Band Rate calculation
      const bhkType = typology.typology || "";
      const bandRate = getFloorBandRate(
        actualFloor,
        bhkType,
        typology.floorBandConfiguration || [],
        sheet.typologyRates
      );

      // If rate > 20000, don't multiply with saleable area
      if (bandRate > 20000) {
        return bandRate;
      } else {
        return bandRate * saleableArea;
      }
    }
  };

  // Main calculation function - Exact implementation per image
  const calculateAgreementValue = (
    propertyData: CostSheet,
    selectedTypologyIndex = 0,
    floorNumber: number
  ) => {
    const typology = propertyData.typologies?.[selectedTypologyIndex];
    if (!typology) return 0;

    const {
      saleableArea = 0,
      avRate = 0,
      psfRate = 0,
      typology: bhkType = "",
      floorBandConfiguration = [],
    } = typology;

    const area = parseFloat(String(saleableArea));
    const av = parseFloat(String(avRate));
    const psf = parseFloat(String(psfRate));
    const floor = parseInt(String(floorNumber)) || 1;

    // Get discount rate (per sq ft)
    const discountRate = propertyData.discount || 0;

    // Get parking charges - only if include parking is "Yes" and mandatory with selected typology
    let parkingCharges = 0;
    let includeParkingInAgreement =
      propertyData.includeParkingInAgreement || false;
    let isMandatoryParking = false;

    if (
      propertyData.subTabData &&
      typeof propertyData.subTabData === "object"
    ) {
      for (const key in propertyData.subTabData) {
        const tabData = propertyData.subTabData[key];
        if (
          tabData &&
          typeof tabData === "object" &&
          "parkingCharges" in tabData
        ) {
          parkingCharges = parseInt(tabData.parkingCharges) || 0;
          if (parkingCharges) break;
        }
      }

      // Check if parking is mandatory for this typology
      for (const k in propertyData.subTabData) {
        const tabData = propertyData.subTabData[k];
        if (
          tabData?.psfIncludesParking === true ||
          tabData?.psfIncludesParking === "true"
        ) {
          isMandatoryParking = true;
          break;
        }
        if (
          tabData?.mandatoryParkingTypologies &&
          Array.isArray(tabData.mandatoryParkingTypologies)
        ) {
          if (tabData.mandatoryParkingTypologies.includes(bhkType)) {
            isMandatoryParking = true;
            break;
          }
        }
      }
    }
    if (!parkingCharges) {
      parkingCharges = safeNumber(propertyData.parkingCharge) || 0;
    }

    // Only include parking if "Yes" and mandatory
    const finalParkingCharges =
      includeParkingInAgreement && isMandatoryParking ? parkingCharges : 0;

    // Get fixed component
    const fixedComponent =
      safeNumber(getFieldValue(propertyData, "fixedComponent")) || 0;

    // Check if PSF Rate includes Fixed component
    let psfIncludesFixedComponent = false;
    if (
      propertyData.psfIncludesFixedComponent === true ||
      propertyData.psfIncludesFixedComponent === "true"
    ) {
      psfIncludesFixedComponent = true;
    }

    // Also check in subTabData structure
    if (
      !psfIncludesFixedComponent &&
      propertyData.subTabData &&
      typeof propertyData.subTabData === "object"
    ) {
      for (const key in propertyData.subTabData) {
        const tabData = propertyData.subTabData[key];
        if (
          tabData?.psfIncludesFixedComponent === true ||
          tabData?.psfIncludesFixedComponent === "true"
        ) {
          psfIncludesFixedComponent = true;
          break;
        }
      }
    }

    // Calculate Floor Rise based on exact image logic
    let floorRiseAmount = 0;
    const floorRiseConfig = propertyData.floorRiseConfig || {};
    const floorRiseType = propertyData.floorRise || "";

    if (floorRiseType === "Floor Rise") {
      // if floor rise then (Rise Rate * saleable Area) * ((floor - Floor Rise Starts from) + 1))
      const riseRate = parseInt(floorRiseConfig.rate || "0") || 0;
      const floorRiseStartsFrom =
        parseInt(floorRiseConfig.startsFrom || "1") || 1;

      // perform calculation ((floor - Floor Rise Starts from) + 1) when floor is equal to or greater than Floor Rise Starts from
      if (floor >= floorRiseStartsFrom) {
        floorRiseAmount = riseRate * area * (floor - floorRiseStartsFrom + 1);
      }
    } else if (
      floorRiseType === "FR - Fixed Rate" ||
      floorRiseType === "Fixed Rate"
    ) {
      // if fixed Rate Then (Fixed Rate * ((floor - Floor Rise Starts from) + 1))
      const fixedRateStartsFrom =
        parseInt(floorRiseConfig.fixedRateStartsFrom || "1") || 1;
      const typologyRates = floorRiseConfig.typologyRates || {};
      const fixedRate = parseInt(typologyRates[bhkType] || "0") || 0;

      if (floor >= fixedRateStartsFrom) {
        floorRiseAmount = fixedRate * (floor - fixedRateStartsFrom + 1);
      }
    } else if (floorRiseType === "Floor Band") {
      // if Floor Band then: if Band rate is less than 20000 then (Band Rate * Saleable area) else Band Rate
      const actualFloor = floor || 1;
      let bandRate = 0;

      // Try root level floorBandConfig first
      if (
        propertyData.floorBandConfig &&
        propertyData.floorBandConfig.length > 0
      ) {
        const matchingBand = propertyData.floorBandConfig.find((band) => {
          const fromFloor = parseInt(band.fromFloor || "1");
          const toFloor = parseInt(band.toFloor || "999");
          return actualFloor >= fromFloor && actualFloor <= toFloor;
        });

        if (matchingBand && matchingBand.rates && matchingBand.rates[bhkType]) {
          bandRate = parseInt(matchingBand.rates[bhkType] || "0") || 0;
        }
      }

      // Fallback to typology floorBandConfiguration
      if (
        !bandRate &&
        floorBandConfiguration &&
        floorBandConfiguration.length > 0
      ) {
        const matchingBand = floorBandConfiguration.find((band) => {
          const fromFloor = parseInt(band.fromFloor || "1");
          const toFloor = parseInt(band.toFloor || "999");
          return actualFloor >= fromFloor && actualFloor <= toFloor;
        });

        if (matchingBand) {
          bandRate = parseInt(matchingBand.rate || "0") || 0;
        }
      }

      // Apply the exact logic: if Band rate is less than 20000 then (Band Rate * Saleable area) else Band Rate
      if (bandRate < 20000) {
        floorRiseAmount = bandRate * area;
      } else {
        floorRiseAmount = bandRate;
      }
    }

    // Get Additional Fixed Component (always deducted from Agreement Value)
    const additionalFixedComponent =
      safeNumber(propertyData.additionalFixedComponent) || 0;

    // Main Agreement Value calculation per image
    let agreementValue = 0;

    if (av === psf) {
      // If AV Rate and PSF Rate same then
      // Agreement Value = (Saleable Area * AV Rate) + Floor Rise + Parking charges - (Saleable Area * Discount Rate) - Additional Fixed component
      agreementValue =
        area * av +
        floorRiseAmount +
        finalParkingCharges -
        area * discountRate -
        additionalFixedComponent;

      // Subtract Fixed component if PSF Rate includes Fixed component
      if (psfIncludesFixedComponent) {
        agreementValue -= fixedComponent;
      }
    } else if (av < psf) {
      // If AV Rate less than PSF Rate then
      // Agreement Value = (Saleable Area * AV Rate) - Additional Fixed component
      agreementValue = area * av - additionalFixedComponent;

      // Subtract Fixed component if PSF Rate includes Fixed component
      if (psfIncludesFixedComponent) {
        agreementValue -= fixedComponent;
      }
    }

    return agreementValue;
  };

  // Legacy calculation for backward compatibility
  const calculateLegacyAgreementValue = (
    sheet: CostSheet,
    floorNumber: number
  ) => {
    const saleableArea = safeNumber(sheet.saleableArea) || 0;
    const reraCarpet = safeNumber(sheet.reraCarpet) || 0;
    const avRate = safeNumber(sheet.avRate) || 0;
    const discount = sheet.discount || 0;
    const floorRise = safeNumber(sheet.floorRise) || 0;
    const floor = parseInt(String(floorNumber)) || 1;

    const area = saleableArea || reraCarpet || 0;
    const rate = avRate - discount;
    const flatCost = area * rate;
    const floorRisePerFloor = saleableArea * floorRise;

    return flatCost + floorRisePerFloor * (floor - 1);
  };

  const recalculateCostSheet = useCallback(
    (sheet: CostSheet): CostSheet => {
      // Get original registration from database (not from recalculated sheet)
      const originalSheet = allCostSheets.find((s) => s.id === sheet.id);
      const originalDbRegistration = originalSheet
        ? safeNumber(originalSheet.registration) || 0
        : safeNumber(sheet.registration) || 0;

      const floor = safeNumber(sheet.floor) ?? 1;

      // Use new calculation method if typologies exist
      let agreementValue: number;
      let flatCost: number;
      let floorRisePerFloor: number;

      if (sheet.typologies && sheet.typologies.length > 0) {
        // New Firestore structure calculation (discount already handled inside)
        agreementValue = calculateAgreementValue(sheet, 0, floor);

        // For display purposes, calculate legacy values
        const typology = sheet.typologies[0];
        const area = parseFloat(String(typology.saleableArea)) || 0;
        const av = parseFloat(String(typology.avRate)) || 0;
        flatCost = area * av;

        // Calculate floor rise for display
        const floorRiseConfig = sheet.floorRiseConfig || {};
        const floorRiseType = sheet.floorRise || "";

        if (floorRiseType === "Floor Rise") {
          const riseRate = parseInt(floorRiseConfig.rate || "0") || 0;
          const startsFrom = parseInt(floorRiseConfig.startsFrom || "1") || 1;
          if (floor >= startsFrom) {
            const floorDifference = floor - startsFrom + 1;
            floorRisePerFloor = riseRate * floorDifference * area;
          } else {
            floorRisePerFloor = 0;
          }
        } else if (floorRiseType === "FR - Fixed Rate") {
          const fixedRateStartsFrom =
            parseInt(floorRiseConfig.fixedRateStartsFrom || "1") || 1;
          const bhkType = typology.typology || "";
          const typologyRates = floorRiseConfig.typologyRates || {};
          const fixedRate = parseInt(typologyRates[bhkType] || "0") || 0;

          if (floor >= fixedRateStartsFrom) {
            const floorDifference = floor - fixedRateStartsFrom + 1;
            floorRisePerFloor = fixedRate * floorDifference;
          } else {
            floorRisePerFloor = 0;
          }
        } else if (floorRiseType === "Floor Band") {
          const bhkType = typology.typology || "";
          const actualFloor = floor || 1;

          // Try root level floorBandConfig first
          let matchingBand = null;
          if (sheet.floorBandConfig && sheet.floorBandConfig.length > 0) {
            matchingBand = sheet.floorBandConfig.find((band) => {
              const fromFloor = parseInt(band.fromFloor || "1");
              const toFloor = parseInt(band.toFloor || "999");
              return actualFloor >= fromFloor && actualFloor <= toFloor;
            });

            if (
              matchingBand &&
              matchingBand.rates &&
              matchingBand.rates[bhkType]
            ) {
              const rate = parseInt(matchingBand.rates[bhkType] || "0") || 0;
              floorRisePerFloor = rate > 20000 ? rate : rate * area;
            }
          }

          // Fallback to typology floorBandConfiguration
          if (
            !matchingBand &&
            typology.floorBandConfiguration &&
            typology.floorBandConfiguration.length > 0
          ) {
            matchingBand = typology.floorBandConfiguration.find((band) => {
              const fromFloor = parseInt(band.fromFloor || "1");
              const toFloor = parseInt(band.toFloor || "999");
              return actualFloor >= fromFloor && actualFloor <= toFloor;
            });

            if (matchingBand) {
              const rate = parseInt(matchingBand.rate || "0") || 0;
              floorRisePerFloor = rate > 20000 ? rate : rate * area;
            }
          }
        } else {
          const bhkType = typology.typology || "";
          const bandRate = getFloorBandRate(
            floor,
            bhkType,
            typology.floorBandConfiguration || [],
            sheet.typologyRates
          );
          if (bandRate > 20000) {
            floorRisePerFloor = bandRate;
          } else {
            floorRisePerFloor = bandRate * area;
          }
        }
      } else {
        // Legacy calculation
        const saleableArea = safeNumber(sheet.saleableArea) || 0;
        const reraCarpet = safeNumber(sheet.reraCarpet) || 0;
        const avRate = safeNumber(sheet.avRate) || 0;
        const discount = sheet.discount || 0;
        const floorRise = safeNumber(sheet.floorRise) || 0;

        const area = saleableArea || reraCarpet || 0;
        flatCost = area * avRate;
        floorRisePerFloor = saleableArea * floorRise;
        agreementValue = flatCost + floorRisePerFloor * (floor - 1);

        // Discount already applied in calculateAgreementValue function
      }

      // Calculate parking cost based on rules
      let parkingCost = 0;

      // Get parking cost from new or legacy structure
      // subTabData is a map with numeric keys, need to search through them
      if (sheet.subTabData && typeof sheet.subTabData === "object") {
        for (const key in sheet.subTabData) {
          const tabData = sheet.subTabData[key];
          if (
            tabData &&
            typeof tabData === "object" &&
            "parkingCharges" in tabData
          ) {
            parkingCost = parseInt(tabData.parkingCharges) || 0;
            if (parkingCost) break;
          }
        }
      }

      // Fallback to legacy structure if not found in subTabData
      if (!parkingCost) {
        parkingCost = safeNumber(sheet.parkingCharge) || 0;
      }

      // Check if parking should be included in agreement value
      let shouldIncludeParkingInAgreement =
        sheet.includeParkingInAgreement || false;
      let isParkingMandatoryOrIncluded = false;

      // Also include parking if it's mandatory or included in PSF
      if (sheet.subTabData && typeof sheet.subTabData === "object") {
        const currentTypology =
          sheet.typologies?.[0]?.typology || sheet.flatType || "";
        for (const k in sheet.subTabData) {
          const tabData = sheet.subTabData[k];
          // Check if parking is included in PSF
          if (
            tabData?.psfIncludesParking === true ||
            tabData?.psfIncludesParking === "true"
          ) {
            isParkingMandatoryOrIncluded = true;
            break;
          }
          // Check if current typology is in mandatory parking list
          if (
            tabData?.mandatoryParkingTypologies &&
            Array.isArray(tabData.mandatoryParkingTypologies)
          ) {
            if (tabData.mandatoryParkingTypologies.includes(currentTypology)) {
              isParkingMandatoryOrIncluded = true;
              break;
            }
          }
        }
      }

      // Determine PSF and AV rates for comparison
      const psfRate = sheet.typologies?.[0]
        ? parseFloat(String(sheet.typologies[0].psfRate)) || 0
        : safeNumber(sheet.psfRate) || 0;
      const avRate = sheet.typologies?.[0]
        ? parseFloat(String(sheet.typologies[0].avRate)) || 0
        : safeNumber(sheet.avRate) || 0;

      // Include parking in agreement only if AV >= PSF and parking is mandatory/included or user selected
      if (
        (shouldIncludeParkingInAgreement || isParkingMandatoryOrIncluded) &&
        avRate >= psfRate
      ) {
        agreementValue += parkingCost;
      }

      // Fixed Component Logic is already handled in calculateAgreementValue function
      // No need to subtract again here

      // GST = if Agreement Value is less than 4500000 then 1% else 5% of agreement value
      const gstRate = agreementValue < 4500000 ? 0.01 : 0.05;
      const gst = Math.ceil(agreementValue * gstRate);

      // Stamp Duty = Rate to be captured from stored stamp duty rates
      const rateUsed = getStampDutyRate(
        stampDutyRates,
        sheet.district,
        sheet.station,
        7 // Default to 7%
      );

      // Debug stamp duty lookup if no rate found
      if (rateUsed === 7 && (sheet.district || sheet.station)) {
        debugStampDutyLookup(stampDutyRates, sheet.district, sheet.station);
      }

      // Calculate stamp duty: Agreement Value × Rate ÷ 100
      const stampDuty =
        Math.ceil((agreementValue * rateUsed) / 100 / 100) * 100;

      // Registration Fee = 1% of Agreement Value subject to maximum caps
      const currentTypology =
        sheet.typologies?.[0]?.typology || sheet.flatType || "";
      const isJodiOption = currentTypology.toLowerCase().includes("jodi");
      const maxRegistrationFee = isJodiOption ? 60000 : 30000;

      // Calculate 1% of Agreement Value
      const calculatedRegistrationFee = Math.ceil(agreementValue * 0.01);

      // Apply maximum cap + any additional DB registration
      const registrationFee =
        Math.min(calculatedRegistrationFee, maxRegistrationFee) +
        originalDbRegistration;

      // Furniture = Difference + Floor Rise + Parking + Fixed component + Additional fixed Component
      let furnitureCharges = 0;
      let parkingInFurniture = 0;

      if (sheet.typologies && sheet.typologies.length > 0) {
        const typology = sheet.typologies[0];
        const furnitureArea = parseFloat(String(typology.saleableArea)) || 0;
        const psfRate = parseFloat(String(typology.psfRate)) || 0;
        const avRate = parseFloat(String(typology.avRate)) || 0;

        // Difference = (Saleable Area * (PSF Rate - AV Rate))
        // If AV Rate < PSF Rate and discount is provided, subtract discount from the rate difference
        let rateDifference = psfRate - avRate;
        if (avRate < psfRate && sheet.discount) {
          rateDifference = Math.max(0, rateDifference - sheet.discount);
        }
        const difference = furnitureArea * rateDifference;

        // Parking: if AV Rate less than PSF Rate then include parking if "Yes" and mandatory with selected typology
        if (
          avRate < psfRate &&
          (shouldIncludeParkingInAgreement || isParkingMandatoryOrIncluded)
        ) {
          parkingInFurniture = parkingCost;
        }

        // Floor Rise: Include Floor Rise ONLY if AV Rate < PSF Rate (per specification)
        let floorRiseAmount = 0;
        if (avRate < psfRate) {
          const currentFloorRiseType = sheet.floorRise || "";

          if (currentFloorRiseType === "Floor Rise") {
            const floorRiseConfig = sheet.floorRiseConfig || {};
            const riseRate = parseInt(floorRiseConfig.rate || "0") || 0;
            const startsFrom = parseInt(floorRiseConfig.startsFrom || "1") || 1;

            if (floor >= startsFrom) {
              floorRiseAmount =
                riseRate * furnitureArea * (floor - startsFrom + 1);
            }
          } else if (
            currentFloorRiseType === "FR - Fixed Rate" ||
            currentFloorRiseType === "Fixed Rate"
          ) {
            const floorRiseConfig = sheet.floorRiseConfig || {};
            const fixedRateStartsFrom =
              parseInt(floorRiseConfig.fixedRateStartsFrom || "1") || 1;
            const bhkType = typology.typology || "";
            const typologyRates = floorRiseConfig.typologyRates || {};
            const fixedRate = parseInt(typologyRates[bhkType] || "0") || 0;

            if (floor >= fixedRateStartsFrom) {
              floorRiseAmount = fixedRate * (floor - fixedRateStartsFrom + 1);
            }
          } else if (currentFloorRiseType === "Floor Band") {
            const bhkType = typology.typology || "";
            const actualFloor = floor || 1;
            let bandRate = 0;

            // Try root level floorBandConfig first
            if (sheet.floorBandConfig && sheet.floorBandConfig.length > 0) {
              const matchingBand = sheet.floorBandConfig.find((band) => {
                const fromFloor = parseInt(band.fromFloor || "1");
                const toFloor = parseInt(band.toFloor || "999");
                return actualFloor >= fromFloor && actualFloor <= toFloor;
              });

              if (
                matchingBand &&
                matchingBand.rates &&
                matchingBand.rates[bhkType]
              ) {
                bandRate = parseInt(matchingBand.rates[bhkType] || "0") || 0;
              }
            }

            // Fallback to typology floorBandConfiguration
            if (
              !bandRate &&
              typology.floorBandConfiguration &&
              typology.floorBandConfiguration.length > 0
            ) {
              const matchingBand = typology.floorBandConfiguration.find(
                (band) => {
                  const fromFloor = parseInt(band.fromFloor || "1");
                  const toFloor = parseInt(band.toFloor || "999");
                  return actualFloor >= fromFloor && actualFloor <= toFloor;
                }
              );

              if (matchingBand) {
                bandRate = parseInt(matchingBand.rate || "0") || 0;
              }
            }

            // Apply band rate logic
            if (bandRate < 20000) {
              floorRiseAmount = bandRate * furnitureArea;
            } else {
              floorRiseAmount = bandRate;
            }
          }
        }

        // Fixed component: Always use the actual fixed component amount for furniture calculation
        // The PSF inclusion logic is handled separately in Agreement Value calculation
        const fixedComponentAmount =
          safeNumber(getFieldValue(sheet, "fixedComponent")) || 0;
        const fixedComponent = fixedComponentAmount;

        // Additional Fixed Component: Get from sheet data
        const additionalFixedComponent =
          safeNumber(sheet.additionalFixedComponent) || 0;

        // Furniture = Difference + Floor Rise + Parking + Fixed component + Additional fixed Component
        furnitureCharges =
          difference +
          floorRiseAmount +
          parkingInFurniture +
          fixedComponent +
          additionalFixedComponent;
      } else {
        // Legacy structure calculation
        const furnitureArea =
          safeNumber(sheet.saleableArea) || safeNumber(sheet.reraCarpet) || 0;
        const psfRate = safeNumber(sheet.psfRate) || 0;
        const avRate = safeNumber(sheet.avRate) || 0;

        // Difference = (Saleable Area * (PSF Rate - AV Rate))
        // If AV Rate < PSF Rate and discount is provided, subtract discount from the rate difference
        let rateDifference = psfRate - avRate;
        if (avRate < psfRate && sheet.discount) {
          rateDifference = Math.max(0, rateDifference - sheet.discount);
        }
        const difference = furnitureArea * rateDifference;

        // Parking: if AV Rate less than PSF Rate then include parking if "Yes" and mandatory with selected typology
        if (
          avRate < psfRate &&
          (shouldIncludeParkingInAgreement || isParkingMandatoryOrIncluded)
        ) {
          parkingInFurniture = parkingCost;
        }

        // Fixed component: Always use the actual fixed component amount for furniture calculation
        // The PSF inclusion logic is handled separately in Agreement Value calculation
        const fixedComponentAmount =
          safeNumber(getFieldValue(sheet, "fixedComponent")) || 0;
        const fixedComponent = fixedComponentAmount;

        // Additional Fixed Component: Get from sheet data
        const additionalFixedComponent =
          safeNumber(sheet.additionalFixedComponent) || 0;

        // Furniture = Difference + Floor Rise + Parking + Fixed component + Additional fixed Component
        furnitureCharges =
          difference +
          0 +
          parkingInFurniture +
          fixedComponent +
          additionalFixedComponent;
      }

      // Possession Charge = Value as stored in DB for typology RERA
      const typologyPossession = sheet.typologies?.[0]?.possessionCharges;
      const subTabPossession = sheet.subTabData?.possessionCharges;
      const legacyPossession = sheet.possessionCharges;
      const possessionCharges =
        safeNumber(typologyPossession) ||
        safeNumber(subTabPossession) ||
        safeNumber(legacyPossession) ||
        0;

      // Total Package = Agreement Value + Stamp Duty + Registration Fees + GST + Possession Charge + furniture + Parking (when parking field showing value in table)

      // Determine parking amount based on what's showing in table
      let parkingForTotal = 0;
      if (
        sheet.withParking &&
        !shouldIncludeParkingInAgreement &&
        !isParkingMandatoryOrIncluded
      ) {
        // When parking field shows actual value in table
        parkingForTotal = parkingCost;
      }

      const totalPackage =
        agreementValue +
        stampDuty +
        registrationFee +
        gst +
        possessionCharges +
        furnitureCharges +
        parkingForTotal;

      const safeFlatCost = Number.isFinite(flatCost)
        ? Number(flatCost.toFixed(2))
        : 0;

      const safeFloorRisePerFloor = Number.isFinite(floorRisePerFloor)
        ? Number(floorRisePerFloor.toFixed(2))
        : 0;

      const safeAgreementValue = Number.isFinite(agreementValue)
        ? Number(agreementValue.toFixed(2))
        : 0;

      const safeFurnitureCharges = Number.isFinite(furnitureCharges)
        ? Number(furnitureCharges.toFixed(2))
        : 0;

      const safeGst = Number.isFinite(gst) ? Math.round(gst) : 0;

      const safeStampDuty = Number.isFinite(stampDuty)
        ? Math.round(stampDuty)
        : 0;

      const safeTotalPackage = Number.isFinite(totalPackage)
        ? Number(totalPackage.toFixed(2))
        : 0;

      const safeRegistrationFee = Number.isFinite(registrationFee)
        ? Math.round(registrationFee)
        : 0;

      return {
        ...sheet,
        flatCost: safeFlatCost,
        floorRisePerFloor: safeFloorRisePerFloor,
        agreementValue: safeAgreementValue,
        stampDuty: safeStampDuty,
        stampDutyRate: rateUsed,
        registration: safeRegistrationFee,
        gst: safeGst,
        furnitureCharges: safeFurnitureCharges,
        totalPackage: safeTotalPackage,
      };
    },
    [stampDutyRates]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("Compare: Fetching initial data...");
      const [rates, allSheets] = await Promise.all([
        getStampDutyRates(),
        getCostSheets(),
      ]);

      setStampDutyRates(rates);
      setAllCostSheets(allSheets);
    };
    fetchInitialData();
  }, []);

  const initialSelectedItemsRef = useRef<CostSheet[]>([]);

  // Get selected items from sessionStorage or location.state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const storageKey = urlParams.get("storageKey");
    const bhkFilter = urlParams.get("bhkType");

    console.log("Compare: URL search params:", location.search);
    console.log("Compare: Storage key from URL:", storageKey);
    console.log("Compare: BHK filter from URL:", bhkFilter);
    console.log("Compare: Location state:", location.state);

    let selectedItems: CostSheet[] = [];

    if (storageKey) {
      // New tab - get from sessionStorage
      console.log(
        "Compare: Looking for data in sessionStorage with key:",
        storageKey
      );
      const storedData = sessionStorage.getItem(storageKey);
      console.log("Compare: Retrieved data from sessionStorage:", storedData);

      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          selectedItems = Array.isArray(parsedData) ? parsedData : [];
          console.log(
            "Compare: Parsed selected items:",
            selectedItems.length,
            "items"
          );
          // Don't remove immediately - let it expire naturally or remove after a delay
          setTimeout(() => {
            sessionStorage.removeItem(storageKey);
          }, 1000);
        } catch (error) {
          console.error("Error parsing stored comparison data:", error);
        }
      } else {
        console.log(
          "Compare: No data found in sessionStorage for key:",
          storageKey
        );
        // Check if there are any compare keys in sessionStorage
        const allKeys = Object.keys(sessionStorage);
        const compareKeys = allKeys.filter((key) => key.startsWith("compare_"));
        console.log(
          "Compare: All compare keys in sessionStorage:",
          compareKeys
        );
      }
    } else {
      // Same tab - get from location.state
      selectedItems = location.state?.selectedItems || [];
      console.log(
        "Compare: Using location.state, found",
        selectedItems.length,
        "items"
      );
    }

    console.log("Compare: Final selected items count:", selectedItems.length);
    initialSelectedItemsRef.current = selectedItems;

    // Store BHK filter for auto-filtering
    if (bhkFilter) {
      sessionStorage.setItem("compare_bhk_filter", bhkFilter);
    }
  }, [location]);

  useEffect(() => {
    if (stampDutyRates.length && allCostSheets.length) {
      console.log("Compare: Setting up cost sheets...", {
        selectedItemsCount: initialSelectedItemsRef.current.length,
        selectedItems: initialSelectedItemsRef.current.map((item) => ({
          id: item.id,
          projectName: item.projectName,
          hasSubTabData: !!item.subTabData,
        })),
      });

      // Replace sessionStorage items with fresh data from allCostSheets
      let updatedSheets = initialSelectedItemsRef.current.map((item) => {
        const freshData = allCostSheets.find((s) => s.id === item.id);
        return recalculateCostSheet(freshData || item);
      });

      // Check for BHK filter from dashboard and auto-populate if no items selected
      const bhkFilter = sessionStorage.getItem("compare_bhk_filter");
      if (bhkFilter && updatedSheets.length === 0) {
        console.log("Compare: Auto-filtering for BHK type:", bhkFilter);

        // Filter approved cost sheets by BHK type
        const matchingSheets = allCostSheets.filter((sheet) => {
          const isApproved =
            sheet.isApproved === true || sheet.approvalStatus === "approved";
          if (!isApproved) return false;

          // Check typologies for matching BHK
          if (sheet.typologies && Array.isArray(sheet.typologies)) {
            return sheet.typologies.some(
              (typology) =>
                typology.typology === bhkFilter &&
                typology.availability !== "Sold Out"
            );
          }

          // Check legacy flatType
          const flatType = sheet.flatType;
          const availability = sheet.availability;
          return flatType === bhkFilter && availability !== "Sold Out";
        });

        // Take first 3 matching properties
        const autoSelectedSheets = matchingSheets
          .slice(0, 3)
          .map((sheet) => recalculateCostSheet(sheet));
        updatedSheets = autoSelectedSheets;

        console.log(
          "Compare: Auto-selected",
          autoSelectedSheets.length,
          "properties for",
          bhkFilter
        );

        // Clear the filter after use
        sessionStorage.removeItem("compare_bhk_filter");
      }

      // Ensure we always have 5 columns (empty ones will be filled with dropdowns)
      while (updatedSheets.length < 5) {
        updatedSheets.push({ id: `empty-${updatedSheets.length}` });
      }

      console.log(
        "Compare: Final cost sheets:",
        updatedSheets.map((sheet) => ({
          id: sheet.id,
          projectName: sheet.projectName,
        }))
      );
      setCostSheets(updatedSheets);
    }
  }, [stampDutyRates, allCostSheets, recalculateCostSheet]);

  const handleClose = () => navigate("/dashboard");

  const formatCurrency = (value?: number) => {
    return `₹${(value || 0).toLocaleString("en-IN")}`;
  };

  const formatArea = (value?: number) => {
    return `${(value || 0).toLocaleString("en-IN")} sq.ft.`;
  };

  const formatBooleanDropdown = (
    value: boolean | undefined,
    index: number,
    key: "withParking" | "includeParkingInAgreement"
  ) => {
    const sheet = costSheets[index];
    // Get current typology
    const currentTypology =
      sheet?.typologies?.[0]?.typology || sheet?.flatType || "";

    // Check if parking is included in PSF or if typology is mandatory
    let psfIncludesParking = false;
    let isMandatoryParking = false;
    if (sheet?.subTabData && typeof sheet.subTabData === "object") {
      for (const k in sheet.subTabData) {
        const tabData = sheet.subTabData[k];
        if (
          tabData?.psfIncludesParking === true ||
          tabData?.psfIncludesParking === "true"
        ) {
          psfIncludesParking = true;
        }
        // Check mandatoryParkingTypologies only if psfIncludesParking is false
        if (
          !psfIncludesParking &&
          tabData?.mandatoryParkingTypologies &&
          Array.isArray(tabData.mandatoryParkingTypologies)
        ) {
          if (tabData.mandatoryParkingTypologies.includes(currentTypology)) {
            isMandatoryParking = true;
          }
        }
      }
    }
    const isDisabled = psfIncludesParking || isMandatoryParking; // Disable if parking is included in PSF or mandatory

    return (
      <div className="relative inline-block w-full">
        <select
          className={`border rounded-lg px-3 py-2 appearance-none focus:outline-none w-full ${
            isDisabled
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          }`}
          value={value ? "yes" : "no"}
          disabled={isDisabled}
          onChange={(e) => {
            if (isDisabled) return;
            const newValue = e.target.value === "yes";
            console.log(`[Parking Debug] ${key} changed to:`, newValue);
            // Extract parking from nested subTabData structure
            let parkingFromSubTab = undefined;
            if (sheet.subTabData) {
              for (const k in sheet.subTabData) {
                const tabData = sheet.subTabData[k];
                if (tabData?.parkingCharges) {
                  parkingFromSubTab = tabData.parkingCharges;
                  break;
                }
              }
            }
            console.log(`[Parking Debug] Sheet parking data:`, {
              subTabData: sheet.subTabData,
              parkingFromSubTab,
              legacyParking: sheet.parkingCharge,
              projectName: sheet.projectName,
            });
            setCostSheets((prev) => {
              const updated = [...prev];
              const item = updated[index];

              // Update the specific parking field
              const updatedItem = {
                ...item,
                [key]: newValue,
              };

              // Recalculate the entire cost sheet
              updated[index] = recalculateCostSheet(updatedItem);
              console.log(
                `[Parking Debug] After recalc, withParking:`,
                updated[index].withParking
              );
              console.log(
                `[Parking Debug] Parking charge value:`,
                getFieldValue(updated[index], "parkingCharge")
              );
              return updated;
            });
          }}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    );
  };

  const handleCarpetAreaChange = (index: number, newArea: number) => {
    console.log("RERA Carpet Area Change:", { index, newArea, filtersApplied });

    setCostSheets((prev) => {
      const updated = [...prev];
      const currentSheet = updated[index];
      const currentTypology =
        getFieldValue(currentSheet, "flatType") ||
        currentSheet.typologies?.[0]?.typology ||
        currentSheet.flatType;

      console.log("Current sheet:", {
        projectName: currentSheet.projectName,
        typology: currentTypology,
      });

      // Use filtered sheets if filters are applied, otherwise use all sheets
      const sheetsToSearch = filtersApplied ? filteredSheets : allCostSheets;

      console.log("Sheets to search:", sheetsToSearch.length, "sheets");

      // Find matching sheet with same project and typology (or any project if filters applied)
      const matchingSheet = sheetsToSearch.find((sheet) => {
        // If filters are applied, search across all projects; otherwise same project only
        if (!filtersApplied && sheet.projectName !== currentSheet.projectName)
          return false;

        // Check if this sheet has the matching carpet area
        let hasMatchingArea = false;

        // Check typologies
        if (sheet.typologies) {
          hasMatchingArea = sheet.typologies.some(
            (t) =>
              t.typology === currentTypology &&
              safeNumber(t.reraCarpet) === newArea
          );
        }

        // Check pricingConfigs
        if (!hasMatchingArea && sheet.pricingConfigs) {
          hasMatchingArea = sheet.pricingConfigs.some(
            (p) =>
              p.typology === currentTypology &&
              safeNumber(p.reraCarpet) === newArea
          );
        }

        // Check legacy fields
        if (
          !hasMatchingArea &&
          sheet.flatType === currentTypology &&
          safeNumber(sheet.reraCarpet) === newArea
        ) {
          hasMatchingArea = true;
        }

        if (hasMatchingArea) {
          console.log("Found matching sheet:", {
            projectName: sheet.projectName,
            id: sheet.id,
          });
        }

        return hasMatchingArea;
      });

      if (matchingSheet) {
        console.log("Updating with matching sheet:", matchingSheet.projectName);
        // Preserve the current sheet's user inputs while updating with matching sheet data
        const updatedSheet = {
          ...recalculateCostSheet(matchingSheet),
          // Preserve user-modified fields from current sheet
          discount: currentSheet.discount,
          floor: currentSheet.floor,
          withParking: currentSheet.withParking,
          includeParkingInAgreement: currentSheet.includeParkingInAgreement,
        };
        updated[index] = recalculateCostSheet(updatedSheet);
      } else {
        console.log("No matching sheet found for carpet area:", newArea);
        // If no matching sheet found, just update the current sheet's carpet area
        const updatedSheet = {
          ...currentSheet,
          reraCarpet: newArea,
        };
        // Update typologies if they exist
        if (updatedSheet.typologies && updatedSheet.typologies.length > 0) {
          updatedSheet.typologies = updatedSheet.typologies.map((t) =>
            t.typology === currentTypology ? { ...t, reraCarpet: newArea } : t
          );
        }
        updated[index] = recalculateCostSheet(updatedSheet);
      }

      return updated;
    });
  };

  const handleAddProject = (index: number, newId: string) => {
    const newSheet = allCostSheets.find((s) => s.id === newId);
    if (newSheet) {
      const recalculated = recalculateCostSheet(newSheet);

      setCostSheets((prev) => {
        const updated = [...prev];
        updated[index] = recalculated;
        return updated;
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".relative")) {
        setShowDropdowns(Array(5).fill(false));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportPDF = () => {
    const selectedProperties = costSheets.filter((sheet) => sheet.projectName);
    if (selectedProperties.length === 0) {
      alert("No properties selected for comparison");
      return;
    }

    // Clone the comparison table
    const tableElement = document.querySelector(".min-w-full.border-collapse");
    if (!tableElement) return;

    const clonedTable = tableElement.cloneNode(true) as HTMLElement;

    // Remove negotiation row from cloned table
    const negotiationRows = clonedTable.querySelectorAll("tr");
    negotiationRows.forEach((row) => {
      const firstCell = row.querySelector("td");
      if (firstCell && firstCell.textContent?.includes("Negotiation Scope")) {
        row.remove();
      }
    });

    // Replace "Select Property" row content with actual project names
    const selectPropertyRows = clonedTable.querySelectorAll("tr");
    selectPropertyRows.forEach((row) => {
      const firstCell = row.querySelector("td");
      if (firstCell && firstCell.textContent?.includes("Select Property")) {
        const cells = row.querySelectorAll("td");
        costSheets.forEach((sheet, index) => {
          if (sheet.projectName && cells[index + 1]) {
            cells[index + 1].textContent = sheet.projectName;
          }
        });
      }
    });

    // Remove columns that don't have properties selected
    const allRows = clonedTable.querySelectorAll("tr");
    const columnsToRemove: number[] = [];

    // Find empty columns (columns without properties)
    costSheets.forEach((sheet, index) => {
      if (!sheet.projectName) {
        columnsToRemove.push(index + 1); // +1 because first column is labels
      }
    });

    // Remove empty columns from all rows
    allRows.forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      // Remove columns in reverse order to maintain indices
      columnsToRemove.reverse().forEach((colIndex) => {
        if (cells[colIndex]) {
          cells[colIndex].remove();
        }
      });
    });

    // Replace interactive elements with actual data values
    costSheets.forEach((sheet, colIndex) => {
      if (!sheet.projectName) return;

      // Adjust column index after removing empty columns
      const adjustedColIndex =
        colIndex +
        1 -
        columnsToRemove.filter((col) => col <= colIndex + 1).length;

      // Find RERA Carpet Area row and replace dropdown with actual value
      const reraRows = clonedTable.querySelectorAll("tr");
      reraRows.forEach((row) => {
        const firstCell = row.querySelector("td");
        if (firstCell && firstCell.textContent?.includes("RERA Carpet Area")) {
          const cells = row.querySelectorAll("td");
          const targetCell = cells[adjustedColIndex];
          if (targetCell) {
            const carpetArea = getFieldValue(sheet, "reraCarpet");
            targetCell.textContent = carpetArea ? formatArea(carpetArea) : "-";
          }
        }
      });
    });

    // Replace Furniture row values before removing interactive elements
    const furnitureRows = clonedTable.querySelectorAll("tr");
    furnitureRows.forEach((row) => {
      const firstCell = row.querySelector("td");
      if (firstCell && firstCell.textContent?.includes("Furniture")) {
        const cells = row.querySelectorAll("td");
        costSheets.forEach((sheet, index) => {
          if (sheet.projectName && cells[index + 1]) {
            const furnitureValue = sheet.furnitureCharges || 0;
            cells[index + 1].textContent = formatCurrency(furnitureValue);
          }
        });
      }
    });

    // Remove remaining interactive elements
    clonedTable.querySelectorAll("select, button, input").forEach((el) => {
      const parent = el.parentElement;
      if (parent) {
        if (el.tagName === "SELECT") {
          const selectedOption = (el as HTMLSelectElement).selectedOptions[0];
          parent.textContent = selectedOption
            ? selectedOption.textContent
            : "-";
        } else if (el.tagName === "INPUT") {
          parent.textContent = (el as HTMLInputElement).value || "-";
        } else {
          parent.textContent = el.textContent || "-";
        }
      }
    });

    // Get broker information
    const brokerName = user?.firmName || user?.fullName || "-";
    const reraNumber = user?.reraNumber || "-";
    const phone = user?.phone || "-";

    // Create signature section
    const signatureSection = `
      <div class="signature-section">
        <p><strong>Thank you for considering ${brokerName}</strong></p>
        <br>
        <p>${user?.fullName || "-"}</p>
        <p>${phone}</p>
      </div>
    `;

    // Create HTML content for PDF with copy protection
    const htmlContent = `
      <html>
        <head>
          <title>${brokerName} - Property Comparison</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header { text-align: center; margin-bottom: 30px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px 8px; 
              text-align: left;
              word-wrap: break-word;
            }
            .bg-blue-50 { background-color: #eff6ff !important; }
            .border-l-4.border-blue-500 { border-left: 4px solid #3b82f6 !important; }
            .font-semibold { font-weight: 600; }
            .text-right { text-align: right; }
            .font-bold.text-blue-700 { font-weight: bold; color: #1d4ed8; }
            .signature-section {
              margin-top: 40px;
              padding: 20px;
              border-top: 2px solid #ddd;
              text-align: left;
            }
            .signature-section p {
              margin: 5px 0;
              font-size: 14px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              * { -webkit-user-select: none; -moz-user-select: none; user-select: none; }
              @page { margin: 0.5in; }
            }
            @page {
              @bottom-left { content: none; }
              @bottom-right { content: none; }
              @top-left { content: none; }
              @top-right { content: none; }
            }
          </style>
          <script>
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.addEventListener('selectstart', e => e.preventDefault());
            document.addEventListener('dragstart', e => e.preventDefault());
            document.addEventListener('keydown', e => {
              if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
              }
            });
          </script>
        </head>
        <body>
          <div class="header">
            <h1>${brokerName}</h1>
            <p>MAHA-RERA Number (${reraNumber})</p>
            <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit", hour12: true }
    )}</p>
          </div>
          ${clonedTable.outerHTML}
          ${signatureSection}
        </body>
      </html>
    `;

    // Create and download PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  // Get all unique project names from allCostSheets
  const allProjectOptions = Array.from(
    new Set(allCostSheets.map((sheet) => sheet.projectName).filter(Boolean))
  );

  // Get currently selected project names (excluding empty columns)
  const selectedProjectNames = costSheets
    .map((sheet) => sheet.projectName)
    .filter(Boolean);

  // Filter options to only show projects that aren't already selected
  const availableProjectOptions = allProjectOptions.filter(
    (project) => !selectedProjectNames.includes(project)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Modern Header */}
        <div className="bg-[#0a1f44] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-white">
              Property Comparison
            </h2>

            {/* Inline Filter Controls */}
            {inLineFilters(
              filterPropertyType,
              setFilterPropertyType,
              allCostSheets,
              filterLocation,
              setFilterLocation,
              setFilteredSheets,
              setFiltersApplied,
              setCostSheets,
              filtersApplied
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="text-white hover:text-gray-300 transition-colors"
              onClick={handleClose}
              aria-label="Close compare page"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
        </div>

        {/* Table Container with Sticky Headers */}
        <div className="overflow-x-auto max-h-[70vh] relative">
          <table className="min-w-full border-collapse">
            <tbody className="divide-y divide-gray-200">
              {/* Discount Row */}
              {discountRow(costSheets, setCostSheets, recalculateCostSheet)}

              {/* Select Property Row */}
              {selectPropertyRow(
                costSheets,
                searchTerms,
                setSearchTerms,
                showDropdowns,
                setShowDropdowns,
                filtersApplied,
                filteredSheets,
                allCostSheets,
                location,
                selectedProjectNames,
                handleAddProject,
                selectedIndices,
                setSelectedIndices
              )}

              {/* Data Rows */}
              {[
                { label: "Location", key: "subLocation", icon: "📍" },
                { label: "Storey", key: "storey", icon: "🏗️" },
                {
                  label: "Saleable Area",
                  key: "saleableArea",
                  formatter: formatArea,
                  icon: "📏",
                  useHelper: true,
                },
                {
                  label: "RERA Carpet Area",
                  key: "reraCarpet",
                  formatter: formatArea,
                  icon: "📐",
                  useHelper: true,
                },
                {
                  label: "PSF Rate",
                  key: "psfRate",
                  formatter: formatCurrency,
                  icon: "💰",
                  useHelper: true,
                },
                {
                  label: "AV Rate",
                  key: "avRate",
                  formatter: formatCurrency,
                  icon: "💎",
                  useHelper: true,
                },
                {
                  label: "Flat Cost",
                  key: "flatCost",
                  formatter: formatCurrency,
                  icon: "🏠",
                },
                {
                  label: "Floor Rise",
                  key: "floorRisePerFloor",
                  formatter: formatCurrency,
                  icon: "📈",
                  custom: true,
                },
                { label: "Floor", key: "floor", icon: "🪜" },
                {
                  label: "Agreement Value",
                  key: "agreementValue",
                  formatter: formatCurrency,
                  icon: "📑",
                },
                {
                  label: `Stamp Duty`,
                  key: "stampDuty",
                  formatter: formatCurrency,
                  icon: "🏷️",
                },
                {
                  label: "Registration",
                  key: "registration",
                  formatter: formatCurrency,
                  icon: "✍️",
                },
                {
                  label: `GST`,
                  key: "gst",
                  formatter: formatCurrency,
                  icon: "🧾",
                },
                {
                  label: "Possession Charges",
                  key: "possessionCharges",
                  formatter: formatCurrency,
                  icon: "🔑",
                  useHelper: true,
                },
                {
                  label: "Parking Charge",
                  key: "parkingCharge",
                  custom: true,
                  icon: "🚗",
                },
                {
                  label: "Furniture",
                  key: "furnitureCharges",
                  formatter: formatCurrency,
                  icon: "🛋️",
                  custom: true,
                },
                {
                  label: "Total Package",
                  key: "totalPackage",
                  formatter: formatCurrency,
                  bold: true,
                  icon: "📦",
                },
                { label: "Possession", key: "reraPossession", icon: "📅" },
              ].map(
                ({
                  label,
                  key,
                  formatter,
                  bold,
                  custom,
                  suffix,
                  useHelper,
                }) => {
                  // Handle Floor row with custom logic
                  if (key === "floor") {
                    return (
                      <tr
                        key={key}
                        className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 px-2 py-1 font-semibold text-gray-700 border-r">
                          <div className="flex items-center">
                            <span>{label}</span>
                            {suffix && (
                              <span className="ml-2 text-xs text-gray-500">
                                {suffix}
                              </span>
                            )}
                          </div>
                        </td>
                        {costSheets.map((sheet, index) => (
                          <td
                            key={`${index}-${key}`}
                            className="px-2 py-1 text-sm text-right border-r border-gray-200"
                          >
                            {sheet.projectName ? (
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                min={1}
                                value={
                                  sheet.floor === undefined ||
                                  sheet.floor === null
                                    ? ""
                                    : sheet.floor
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCostSheets((prev) => {
                                    const updated = [...prev];
                                    const currentSheet = updated[index];

                                    const newFloor =
                                      val.trim() === ""
                                        ? undefined
                                        : parseInt(val);
                                    const updatedSheet = {
                                      ...currentSheet,
                                      floor: isNaN(newFloor!)
                                        ? undefined
                                        : newFloor,
                                    };

                                    updated[index] =
                                      recalculateCostSheet(updatedSheet);
                                    return updated;
                                  });
                                }}
                                className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <div className="h-10"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  }

                  // Handle Floor Rise row with custom logic
                  if (key === "floorRisePerFloor" && custom) {
                    return (
                      <tr
                        key={key}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white p-3 font-semibold text-gray-700 border-r">
                          <div className="flex items-center">
                            <span>{label}</span>
                            {suffix && (
                              <span className="ml-2 text-xs text-gray-500">
                                {suffix}
                              </span>
                            )}
                          </div>
                        </td>
                        {costSheets.map((sheet, index) => {
                          let floorRiseAmount = 0;

                          if (
                            sheet.projectName &&
                            sheet.typologies &&
                            sheet.typologies.length > 0
                          ) {
                            const typology = sheet.typologies[0];
                            const saleableArea =
                              parseFloat(String(typology.saleableArea)) || 0;
                            const floorRiseConfig = sheet.floorRiseConfig || {};
                            const floorRise = sheet.floorRise || "";

                            if (floorRise === "Floor Rise") {
                              // Rise Rate = Rise Rate × Saleable Area
                              const riseRate =
                                parseInt(floorRiseConfig.rate || "0") || 0;
                              floorRiseAmount = riseRate * saleableArea;
                            } else if (floorRise === "FR - Fixed Rate") {
                              // FR - Fixed Rate - show the fixed rate directly
                              const bhkType = typology.typology || "";
                              const typologyRates =
                                sheet.floorRiseConfig?.typologyRates || {};
                              floorRiseAmount =
                                parseInt(typologyRates[bhkType] || "0") || 0;
                            } else if (floorRise === "Floor Band") {
                              // Floor Band calculation - check both root floorBandConfig and typology floorBandConfiguration
                              const bhkType = typology.typology || "";
                              const floor = sheet.floor || 1; // Default to floor 1 if no input

                              // Try root level floorBandConfig first
                              let matchingBand = null;
                              if (
                                sheet.floorBandConfig &&
                                sheet.floorBandConfig.length > 0
                              ) {
                                matchingBand = sheet.floorBandConfig.find(
                                  (band) => {
                                    const fromFloor = parseInt(
                                      band.fromFloor || "1"
                                    );
                                    const toFloor = parseInt(
                                      band.toFloor || "999"
                                    );
                                    return (
                                      floor >= fromFloor && floor <= toFloor
                                    );
                                  }
                                );

                                if (
                                  matchingBand &&
                                  matchingBand.rates &&
                                  matchingBand.rates[bhkType]
                                ) {
                                  const rate =
                                    parseInt(
                                      matchingBand.rates[bhkType] || "0"
                                    ) || 0;
                                  floorRiseAmount =
                                    rate > 20000 ? rate : rate * saleableArea;
                                }
                              }

                              // Fallback to typology floorBandConfiguration
                              if (
                                !matchingBand &&
                                typology.floorBandConfiguration &&
                                typology.floorBandConfiguration.length > 0
                              ) {
                                matchingBand =
                                  typology.floorBandConfiguration.find(
                                    (band) => {
                                      const fromFloor = parseInt(
                                        band.fromFloor || "1"
                                      );
                                      const toFloor = parseInt(
                                        band.toFloor || "999"
                                      );
                                      return (
                                        floor >= fromFloor && floor <= toFloor
                                      );
                                    }
                                  );

                                if (matchingBand) {
                                  const rate =
                                    parseInt(matchingBand.rate || "0") || 0;
                                  floorRiseAmount =
                                    rate > 20000 ? rate : rate * saleableArea;
                                }
                              }
                            } else {
                              // Use the existing calculated value for other types
                              floorRiseAmount = sheet.floorRisePerFloor || 0;
                            }
                          }

                          return (
                            <td
                              key={`${index}-${key}`}
                              className="px-2 py-1 text-sm text-right border-r border-gray-200"
                            >
                              {sheet.projectName ? (
                                <div className="flex items-center justify-end">
                                  {sheet.floorRise === "Floor Rise" && (
                                    <span className="text-xs text-blue-600 mr-4">
                                      Rise Rate
                                    </span>
                                  )}
                                  {sheet.floorRise === "FR - Fixed Rate" && (
                                    <span className="text-xs text-green-600 mr-4">
                                      Fixed Rate
                                    </span>
                                  )}
                                  {sheet.floorRise === "Floor Band" && (
                                    <span className="text-xs text-orange-600 mr-4">
                                      Band Rate
                                    </span>
                                  )}
                                  <span>{formatCurrency(floorRiseAmount)}</span>
                                </div>
                              ) : (
                                <div className="h-6" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }

                  // Handle Furniture row with custom logic
                  if (key === "furnitureCharges" && custom) {
                    return (
                      <tr
                        key={key}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white p-3 font-semibold text-gray-700 border-r">
                          <div className="flex items-center">
                            <span>{label}</span>
                            {suffix && (
                              <span className="ml-2 text-xs text-gray-500">
                                {suffix}
                              </span>
                            )}
                          </div>
                        </td>
                        {costSheets.map((sheet, index) => (
                          <td
                            key={`${index}-${key}`}
                            className="px-2 py-1 text-sm text-right border-r border-gray-200"
                          >
                            {sheet.projectName ? (
                              <div className="flex items-center justify-between w-full">
                                {sheet.projectName && (
                                  <button
                                    onClick={() => {
                                      setSelectedColumnIndex(index);
                                      setShowFurnitureModal(true);
                                    }}
                                    className="p-3 text-gray-400 hover:text-blue-600 transition-colors mr-2"
                                    title="Edit furniture charges"
                                  >
                                    <Edit3 className="h-5 w-5" />
                                  </button>
                                )}
                                <span>
                                  {formatCurrency(sheet.furnitureCharges || 0)}
                                </span>
                              </div>
                            ) : (
                              <div className="h-6" />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  }

                  // Handle Parking Charge row with custom logic
                  if (key === "parkingCharge" && custom) {
                    return (
                      <tr
                        key={key}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white p-3 font-semibold text-gray-700 border-r">
                          <div className="flex items-center">
                            <span>{label}</span>
                            {suffix && (
                              <span className="ml-2 text-xs text-gray-500">
                                {suffix}
                              </span>
                            )}
                          </div>
                        </td>
                        {costSheets.map((sheet, index) => {
                          const parkingValue =
                            getFieldValue(sheet, "parkingCharge") || 0;
                          const currentTypology =
                            sheet?.typologies?.[0]?.typology ||
                            sheet?.flatType ||
                            "";

                          // Check psfIncludesParking and mandatoryParkingTypologies inside subTabData map
                          let psfIncludesParking = false;
                          let isMandatoryParking = false;
                          let numberOfParkingIncluded = "";
                          if (
                            sheet.subTabData &&
                            typeof sheet.subTabData === "object"
                          ) {
                            for (const k in sheet.subTabData) {
                              const tabData = sheet.subTabData[k];
                              if (
                                tabData?.psfIncludesParking === true ||
                                tabData?.psfIncludesParking === "true"
                              ) {
                                psfIncludesParking = true;
                                if (tabData?.numberOfParkingIncluded) {
                                  numberOfParkingIncluded =
                                    tabData.numberOfParkingIncluded;
                                }
                              }
                            }
                            // Check mandatoryParkingTypologies only if psfIncludesParking is false
                            if (!psfIncludesParking) {
                              for (const k in sheet.subTabData) {
                                const tabData = sheet.subTabData[k];
                                if (
                                  tabData?.mandatoryParkingTypologies &&
                                  Array.isArray(
                                    tabData.mandatoryParkingTypologies
                                  )
                                ) {
                                  if (
                                    tabData.mandatoryParkingTypologies.includes(
                                      currentTypology
                                    )
                                  ) {
                                    isMandatoryParking = true;
                                    break;
                                  }
                                }
                              }
                            }
                          }

                          return (
                            <td
                              key={`${index}-${key}`}
                              className="px-2 py-1 text-sm text-right border-r border-gray-200"
                            >
                              {sheet.projectName ? (
                                // if PSF Rate Includes Parking then show "(0) Parking Included"
                                psfIncludesParking ? (
                                  <span className="text-green-600 font-medium">
                                    {numberOfParkingIncluded
                                      ? `(${numberOfParkingIncluded}) `
                                      : "(0) "}
                                    Parking Included
                                  </span>
                                ) : // if Mandatory with selected typology then show "Included in Agreement"
                                isMandatoryParking ? (
                                  <span className="text-blue-600 font-medium">
                                    Included in Agreement
                                  </span>
                                ) : // Include Parking in Agreement = "Yes" then show "Included in Agreement"
                                sheet.includeParkingInAgreement ? (
                                  <span className="text-blue-600 font-medium">
                                    Included in Agreement
                                  </span>
                                ) : // With Parking = "Yes" Then show Parking Values as stored for typology RERA
                                sheet.withParking ? (
                                  formatCurrency(parkingValue)
                                ) : (
                                  formatCurrency(0)
                                )
                              ) : (
                                <div className="h-6" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }

                  // Special handling for RERA row
                  if (key === "reraCarpet") {
                    return (
                      <ReraCarpetRow
                        key={key}
                        label={label}
                        suffix={suffix}
                        costSheets={costSheets}
                        getFieldValue={getFieldValue}
                        handleCarpetAreaChange={handleCarpetAreaChange}
                        formatArea={formatArea}
                      />
                    );
                  }

                  // Regular rows
                  return (
                    <tr
                      key={key}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-white px-2 py-1 text-sm font-semibold text-gray-700 border-r">
                        <div className="flex items-center space-x-1">
                          <span>{label}</span>
                          {suffix && (
                            <span className="text-xs text-gray-500">
                              {suffix}
                            </span>
                          )}
                        </div>
                      </td>
                      {costSheets.map((sheet, index) => (
                        <td
                          key={`${index}-${key}`}
                          className={`px-2 py-1 text-sm text-right border-r border-gray-200 ${
                            bold ? "font-bold text-blue-700" : ""
                          }`}
                        >
                          {sheet.projectName ? (
                            (() => {
                              const value = useHelper
                                ? getFieldValue(sheet, key)
                                : sheet[key as keyof CostSheet];
                              return formatter && typeof value === "number"
                                ? formatter(value)
                                : value != null
                                ? String(value)
                                : "N/A";
                            })()
                          ) : (
                            <div className="h-5" />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                }
              )}

              {/* With Parking */}
              <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100">
                <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>With Parking</span>
                  </div>
                </td>
                {costSheets.map((sheet, index) => (
                  <td
                    key={index}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    {sheet.projectName ? (
                      <div className="flex justify-center">
                        {formatBooleanDropdown(
                          sheet.withParking ?? false,
                          index,
                          "withParking"
                        )}
                      </div>
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Include Parking in Agreement */}
              <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100">
                <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>Include Parking in Agreement</span>
                  </div>
                </td>
                {costSheets.map((sheet, index) => (
                  <td
                    key={index}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    {sheet.projectName ? (
                      <div className="flex justify-center">
                        {formatBooleanDropdown(
                          sheet.includeParkingInAgreement ?? false,
                          index,
                          "includeParkingInAgreement"
                        )}
                      </div>
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Negotiation Scope */}
              <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100">
                <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>Negotiation Scope</span>
                  </div>
                </td>
                {costSheets.map((sheet, index) => (
                  <td
                    key={index}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    {sheet.projectName ? (
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            const negotiationValue = (() => {
                              // Get negotiation scope from pricingConfigs or typologies
                              if (
                                sheet.pricingConfigs &&
                                sheet.pricingConfigs.length > 0
                              ) {
                                const config = sheet.pricingConfigs.find(
                                  (config) => config.negotiationScope
                                );
                                return config?.negotiationScope || "N/A";
                              }
                              if (
                                sheet.typologies &&
                                sheet.typologies.length > 0
                              ) {
                                const typology = sheet.typologies.find(
                                  (t) => t.negotiationScope
                                );
                                return typology?.negotiationScope || "N/A";
                              }
                              return "N/A";
                            })();

                            setSelectedNegotiationValue(
                              negotiationValue === "N/A"
                                ? "N/A"
                                : Number(negotiationValue).toLocaleString(
                                    "en-IN"
                                  )
                            );
                            setShowNegotiationModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          View
                        </button>
                      </div>
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer with Summary */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              {filtersApplied ? (
                <p>
                  Filtered <strong>{filteredSheets.length}</strong> properties
                  available for selection
                </p>
              ) : (
                <p>
                  Comparing{" "}
                  <strong>
                    {costSheets.filter((s) => s.projectName).length}
                  </strong>{" "}
                  properties
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                disabled={costSheets.filter((s) => s.projectName).length === 0}
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg transition-colors"
              >
                Close Comparison
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stamp Duty Debugger Modal */}
      {showStampDutyDebugger && (
        <StampDutyDebugger
          district="Thane"
          onClose={() => setShowStampDutyDebugger(false)}
        />
      )}

      {/* Negotiation Modal */}
      {showNegotiationModal &&
        negotiationModal(setShowNegotiationModal, selectedNegotiationValue)}

      {/* Furniture Modal */}
      {showFurnitureModal &&
        selectedColumnIndex !== null &&
        furnitureModal(
          setShowFurnitureModal,
          costSheets,
          selectedColumnIndex,
          getFieldValue,
          formatCurrency,
          safeNumber,
          setCostSheets,
          recalculateCostSheet
        )}
    </div>
  );
};

export default Compare;
