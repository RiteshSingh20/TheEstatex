import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Edit3 } from "lucide-react";
import Button from "../components/ui/Button";
import { getStampDutyRates, getCostSheets } from "../utils/firestoreListings";
import StampDutyDebugger from "../components/StampDutyDebugger";
import { getStampDutyRate, debugStampDutyLookup } from "../utils/stampDutyUtils";

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
  sourcingManagers?: Array<{name: string; contact: string}>;
  siteHeads?: Array<{name: string; contact: string}>;
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
  const [costSheets, setCostSheets] = useState<CostSheet[]>([]);
  const [stampDutyRates, setStampDutyRates] = useState<StampDutyRate[]>([]);
  const [allCostSheets, setAllCostSheets] = useState<CostSheet[]>([]);
  const [showStampDutyDebugger, setShowStampDutyDebugger] = useState(false);
  const [showFurnitureModal, setShowFurnitureModal] = useState(false);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
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
    if (field === 'possessionCharges') {
      const typologyValue = sheet.typologies?.[0]?.possessionCharges;
      const subTabValue = safeNumber(sheet.subTabData?.possessionCharges);
      const legacyValue = safeNumber(sheet.possessionCharges);
      return safeNumber(typologyValue) || subTabValue || legacyValue;
    }
    
    // For parking charges, check subTabData first
    if (field === 'parkingCharge') {
      return safeNumber(sheet.subTabData?.parkingCharges) || safeNumber(sheet.parkingCharge);
    }
    
    // For fixed component, check typologies first
    if (field === 'fixedComponent') {
      // Search through all typologies to find one with fixedComponent
      let typologyValue;
      if (sheet.typologies) {
        for (const typology of sheet.typologies) {
          if (typology.fixedComponent && safeNumber(typology.fixedComponent) > 0) {
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
      return safeNumber(typologyValue) || safeNumber(pricingValue) || safeNumber(legacyValue);
    }
    
    // For new structure with typologies
    if (sheet.typologies && sheet.typologies.length > 0) {
      const typology = sheet.typologies[0];
      switch (field) {
        case 'saleableArea':
          return safeNumber(typology.saleableArea) || safeNumber(sheet.saleableArea);
        case 'reraCarpet':
          return safeNumber(typology.reraCarpet) || safeNumber(sheet.reraCarpet);
        case 'psfRate':
          return safeNumber(typology.psfRate) || safeNumber(sheet.psfRate);
        case 'avRate':
          return safeNumber(typology.avRate) || safeNumber(sheet.avRate);
        case 'flatType':
          return typology.typology || sheet.flatType;
        default:
          return sheet[field as keyof CostSheet];
      }
    }
    
    // Legacy structure
    return sheet[field as keyof CostSheet];
  };

  // Helper function to extract floor band rate from ACTUAL data structure
  const getFloorBandRate = (floor: number, bhkType: string, floorBandConfig: any[], typologyRates?: { [bhkType: string]: string }) => {
    // First check if we have floorBandConfig (Band Rate method)
    if (floorBandConfig && Array.isArray(floorBandConfig) && floorBandConfig.length > 0) {
      // Find the band where floor falls within range
      const matchingBand = floorBandConfig.find(band => {
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
      const fixedRate = parseInt(floorRiseConfig.fixedRateStartsFrom || "0") || 0;
      return fixedRate;
    } else {
      // Band Rate calculation
      const bhkType = typology.typology || "";
      const bandRate = getFloorBandRate(actualFloor, bhkType, typology.floorBandConfiguration || [], sheet.typologyRates);
      
      // If rate > 20000, don't multiply with saleable area
      if (bandRate > 20000) {
        return bandRate;
      } else {
        return bandRate * saleableArea;
      }
    }
  };

  // Main calculation function
  const calculateAgreementValue = (propertyData: CostSheet, selectedTypologyIndex = 0, floorNumber: number) => {
    const typology = propertyData.typologies?.[selectedTypologyIndex];
    if (!typology) return 0;
    
    const {
      saleableArea = 0,
      avRate = 0,
      psfRate = 0,
      typology: bhkType = "",
      floorBandConfiguration = []
    } = typology;
    
    const area = parseFloat(String(saleableArea));
    const av = parseFloat(String(avRate));
    const psf = parseFloat(String(psfRate));
    const floor = parseInt(String(floorNumber)) || 1;
    
    // Step 1: Check if AV Rate < PSF Rate
    if (av < psf) {
      return area * av;
    }
    
    // Use the actual floor rise configuration from database
    const floorRiseConfig = propertyData.floorRiseConfig || {};
    const floorRiseType = propertyData.floorRise || "";
    
    // Calculate floor rise amount based on configuration
    let floorRiseAmount = 0;
    
    if (floorRiseType === "Floor Rise") {
      // Rise Rate calculation with conditional placement
      const riseRate = parseInt(floorRiseConfig.rate || "0") || 0;
      const startsFrom = parseInt(floorRiseConfig.startsFrom || "1") || 1;
      
      // Only apply floor rise if floor is >= startsFrom
      if (floor >= startsFrom) {
        const floorDifference = floor - startsFrom + 1;
        const riseAmount = riseRate * floorDifference * area;
        
        // Add to agreement value only if AV Rate = PSF Rate
        if (av === psf) {
          floorRiseAmount = riseAmount;
        } else {
          floorRiseAmount = 0; // Will be added to furniture charges instead
        }
      }
    } else if (floorRiseType === "FR - Fixed Rate") {
      // FR - Fixed Rate calculation with floor-based logic
      const fixedRateStartsFrom = parseInt(floorRiseConfig.fixedRateStartsFrom || "1") || 1;
      const typologyRates = floorRiseConfig.typologyRates || {};
      const fixedRate = parseInt(typologyRates[bhkType] || "0") || 0;
      
      // Only calculate if floor >= fixedRateStartsFrom
      if (floor >= fixedRateStartsFrom) {
        const floorDifference = floor - fixedRateStartsFrom + 1;
        floorRiseAmount = fixedRate * floorDifference;
      } else {
        floorRiseAmount = 0;
      }
      
      // Add to agreement value only if AV Rate = PSF Rate
      if (av !== psf) {
        floorRiseAmount = 0; // Will be added to furniture charges instead
      }
    } else if (floorRiseType === "Floor Band") {
      // Floor Band calculation - add to agreement value only if AV Rate = PSF Rate
      if (av === psf) {
        const actualFloor = floor || 1;
        
        // Try root level floorBandConfig first
        let matchingBand = null;
        if (propertyData.floorBandConfig && propertyData.floorBandConfig.length > 0) {
          matchingBand = propertyData.floorBandConfig.find(band => {
            const fromFloor = parseInt(band.fromFloor || "1");
            const toFloor = parseInt(band.toFloor || "999");
            return actualFloor >= fromFloor && actualFloor <= toFloor;
          });
          
          if (matchingBand && matchingBand.rates && matchingBand.rates[bhkType]) {
            const rate = parseInt(matchingBand.rates[bhkType] || "0") || 0;
            floorRiseAmount = rate > 20000 ? rate : rate * area;
          }
        }
        
        // Fallback to typology floorBandConfiguration
        if (!matchingBand && floorBandConfiguration && floorBandConfiguration.length > 0) {
          matchingBand = floorBandConfiguration.find(band => {
            const fromFloor = parseInt(band.fromFloor || "1");
            const toFloor = parseInt(band.toFloor || "999");
            return actualFloor >= fromFloor && actualFloor <= toFloor;
          });
          
          if (matchingBand) {
            const rate = parseInt(matchingBand.rate || "0") || 0;
            floorRiseAmount = rate > 20000 ? rate : rate * area;
          }
        }
      } else {
        // AV ≠ PSF: Floor Band will be added to furniture charges, not agreement value
        floorRiseAmount = 0;
      }
    } else {
      // Legacy Band Rate calculation
      const actualFloor = floor || 1;
      const bandRate = getFloorBandRate(actualFloor, bhkType, floorBandConfiguration, propertyData.typologyRates);
      
      if (bandRate > 20000) {
        floorRiseAmount = bandRate;
      } else {
        floorRiseAmount = bandRate * area;
      }
    }
    
    return area * av + floorRiseAmount;
  };

  // Legacy calculation for backward compatibility
  const calculateLegacyAgreementValue = (sheet: CostSheet, floorNumber: number) => {
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
      const floor = safeNumber(sheet.floor) ?? 1;

      // Use new calculation method if typologies exist
      let agreementValue: number;
      let flatCost: number;
      let floorRisePerFloor: number;
      
      if (sheet.typologies && sheet.typologies.length > 0) {
        // New Firestore structure calculation
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
          const fixedRateStartsFrom = parseInt(floorRiseConfig.fixedRateStartsFrom || "1") || 1;
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
            matchingBand = sheet.floorBandConfig.find(band => {
              const fromFloor = parseInt(band.fromFloor || "1");
              const toFloor = parseInt(band.toFloor || "999");
              return actualFloor >= fromFloor && actualFloor <= toFloor;
            });
            
            if (matchingBand && matchingBand.rates && matchingBand.rates[bhkType]) {
              const rate = parseInt(matchingBand.rates[bhkType] || "0") || 0;
              floorRisePerFloor = rate > 20000 ? rate : rate * area;
            }
          }
          
          // Fallback to typology floorBandConfiguration
          if (!matchingBand && typology.floorBandConfiguration && typology.floorBandConfiguration.length > 0) {
            matchingBand = typology.floorBandConfiguration.find(band => {
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
          const bandRate = getFloorBandRate(floor, bhkType, typology.floorBandConfiguration || [], sheet.typologyRates);
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
        const rate = avRate - discount;
        flatCost = area * rate;
        floorRisePerFloor = saleableArea * floorRise;
        agreementValue = flatCost + floorRisePerFloor * (floor - 1);
      }

      // Calculate parking cost based on rules
      let parkingCost = 0;

      // Get parking cost from new or legacy structure
      if (sheet.subTabData?.parkingCharges) {
        parkingCost = parseInt(sheet.subTabData.parkingCharges) || 0;
      } else {
        parkingCost = safeNumber(sheet.parkingCharge) || 0;
      }

      // Include parking charges in agreement if "Include Parking in Agreement" is true
      if (sheet.includeParkingInAgreement) {
        agreementValue += parkingCost;
      }

      // Fixed Component Logic: If PSF includes fixed component, subtract it from agreement value
      const fixedComponentAmount = getFieldValue(sheet, 'fixedComponent') || 0;
      
      // Handle missing psfIncludesFixedComponent field
      let psfIncludesFixedComponent = false;
      
      if (sheet.psfIncludesFixedComponent === true || sheet.psfIncludesFixedComponent === 'true') {
        psfIncludesFixedComponent = true;
      } else if (sheet.psfIncludesFixedComponent === undefined && fixedComponentAmount > 0) {
        // Temporary workaround: If field is missing but fixed component exists, 
        // assume PSF includes fixed component for projects with significant fixed components
        psfIncludesFixedComponent = fixedComponentAmount >= 100000; // Threshold for significant fixed component
      }
      
      // Debug: Check document ID and values for 127 Raj Homes
      if (sheet.projectName === '127 Raj Homes') {
        console.log(`[DEBUG] 127 Raj Homes Document ID: ${sheet.id}`);
        console.log(`[DEBUG] 127 Raj Homes psfIncludesFixedComponent:`, sheet.psfIncludesFixedComponent);
        console.log(`[DEBUG] 127 Raj Homes fixedComponent:`, fixedComponentAmount);
        console.log(`[DEBUG] 127 Raj Homes ALL typologies:`, sheet.typologies?.map((t, i) => ({ index: i, fixedComponent: t.fixedComponent, typology: t.typology })));
        console.log(`[DEBUG] 127 Raj Homes ALL pricingConfigs:`, sheet.pricingConfigs?.map((p, i) => ({ index: i, fixedComponent: p.fixedComponent, typology: p.typology })));
        console.log(`[DEBUG] 127 Raj Homes legacy fixedComponent:`, sheet.fixedComponent);
      }
      
      if (psfIncludesFixedComponent && fixedComponentAmount > 0) {
        // Subtract fixed component from agreement value since it's already included in PSF rate
        agreementValue -= fixedComponentAmount;
      }
      




      // Calculate GST based on agreement value
      const gstRate = agreementValue < 4500000 ? 0.01 : 0.05;
      const gst = Math.ceil(agreementValue * gstRate);

      // Use utility function for stamp duty rate lookup
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
      const stampDuty =
        Math.ceil((agreementValue * rateUsed) / 100 / 100) * 100;

      // Calculate registration fee using totalPackageCalculator logic
      const typology = sheet.typologies?.[0]?.typology || sheet.flatType || "";
      const isJodi = typology.toLowerCase().includes('jodi');
      let registrationFee = 0;
      if (agreementValue > 0) {
        if (agreementValue < 3000000) {
          registrationFee = Math.max(100, agreementValue * 0.01);
          if (isJodi) registrationFee *= 2;
        } else {
          registrationFee = isJodi ? 60000 : 30000;
        }
      }
      
      // Get original legal charges from database registration field
      // Store original value to prevent accumulation
      const originalRegistrationFromDB = sheet.originalRegistration || safeNumber(sheet.registration) || 0;
      
      // Store original value for future calculations if not already stored
      if (!sheet.originalRegistration) {
        sheet.originalRegistration = safeNumber(sheet.registration) || 0;
      }
      
      // Add original legal charges to calculated registration fee
      const totalRegistrationCharges = registrationFee + originalRegistrationFromDB;

      // Calculate furniture charges (including fixed component, PSF-AV difference, and Floor Band)
      let furnitureCharges = 0;
      if (sheet.typologies && sheet.typologies.length > 0) {
        const typology = sheet.typologies[0];
        const furnitureArea = parseFloat(String(typology.saleableArea)) || 0;
        const psfRate = parseFloat(String(typology.psfRate)) || 0;
        const avRate = parseFloat(String(typology.avRate)) || 0;
        
        // PSF-AV difference × saleable area
        const psfAvDifference = (psfRate - avRate) * furnitureArea;
        
        // Floor Band amount (if Floor Band type and AV ≠ PSF)
        let floorBandAmount = 0;
        const currentFloorRiseType = sheet.floorRise || "";
        
        // Floor Rise amount (if Floor Rise type and AV ≠ PSF)
        if (currentFloorRiseType === "Floor Rise" && psfRate !== avRate) {
          const floorRiseConfig = sheet.floorRiseConfig || {};
          const riseRate = parseInt(floorRiseConfig.rate || "0") || 0;
          const startsFrom = parseInt(floorRiseConfig.startsFrom || "1") || 1;
          
          if (floor >= startsFrom) {
            const floorDifference = floor - startsFrom + 1;
            floorBandAmount = riseRate * floorDifference * furnitureArea;
          }
        } else if (currentFloorRiseType === "FR - Fixed Rate" && psfRate !== avRate) {
          const floorRiseConfig = sheet.floorRiseConfig || {};
          const fixedRateStartsFrom = parseInt(floorRiseConfig.fixedRateStartsFrom || "1") || 1;
          const bhkType = typology.typology || "";
          const typologyRates = floorRiseConfig.typologyRates || {};
          const fixedRate = parseInt(typologyRates[bhkType] || "0") || 0;
          
          if (floor >= fixedRateStartsFrom) {
            const floorDifference = floor - fixedRateStartsFrom + 1;
            floorBandAmount = fixedRate * floorDifference;
          }
        } else if (currentFloorRiseType === "Floor Band" && psfRate !== avRate) {
          const bhkType = typology.typology || "";
          const actualFloor = floor || 1;
          
          // Try root level floorBandConfig first
          let matchingBand = null;
          if (sheet.floorBandConfig && sheet.floorBandConfig.length > 0) {
            matchingBand = sheet.floorBandConfig.find(band => {
              const fromFloor = parseInt(band.fromFloor || "1");
              const toFloor = parseInt(band.toFloor || "999");
              return actualFloor >= fromFloor && actualFloor <= toFloor;
            });
            
            if (matchingBand && matchingBand.rates && matchingBand.rates[bhkType]) {
              const rate = parseInt(matchingBand.rates[bhkType] || "0") || 0;
              floorBandAmount = rate > 20000 ? rate : rate * furnitureArea;
            }
          }
          
          // Fallback to typology floorBandConfiguration
          if (!matchingBand && typology.floorBandConfiguration && typology.floorBandConfiguration.length > 0) {
            matchingBand = typology.floorBandConfiguration.find(band => {
              const fromFloor = parseInt(band.fromFloor || "1");
              const toFloor = parseInt(band.toFloor || "999");
              return actualFloor >= fromFloor && actualFloor <= toFloor;
            });
            
            if (matchingBand) {
              const rate = parseInt(matchingBand.rate || "0") || 0;
              floorBandAmount = rate > 20000 ? rate : rate * furnitureArea;
            }
          }
        }
        
        furnitureCharges = psfAvDifference + floorBandAmount + fixedComponentAmount;
      } else {
        const furnitureArea = safeNumber(sheet.saleableArea) || safeNumber(sheet.reraCarpet) || 0;
        const psfAvDifference = ((safeNumber(sheet.psfRate) || 0) - (safeNumber(sheet.avRate) || 0)) * furnitureArea;
        furnitureCharges = psfAvDifference + fixedComponentAmount;
      }

      // Get possession charges from new or legacy structure
      const typologyPossession = sheet.typologies?.[0]?.possessionCharges;
      const subTabPossession = sheet.subTabData?.possessionCharges;
      const legacyPossession = sheet.possessionCharges;
      const possessionCharges = safeNumber(typologyPossession) || safeNumber(subTabPossession) || safeNumber(legacyPossession) || 0;
      

      
      // Calculate total package using total registration charges
      const totalPackage =
        agreementValue +
        stampDuty +
        totalRegistrationCharges +
        gst +
        possessionCharges +
        furnitureCharges +
        // Add parking cost separately when not included in agreement
        (sheet.withParking && !sheet.includeParkingInAgreement
          ? parkingCost
          : 0);

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

      const safeRegistrationFee = Number.isFinite(totalRegistrationCharges)
        ? Math.round(totalRegistrationCharges)
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
      const [rates, allSheets] = await Promise.all([
        getStampDutyRates(),
        getCostSheets(),
      ]);
      

      
      setStampDutyRates(rates);
      setAllCostSheets(allSheets);
    };
    fetchInitialData();
  }, []);

  const initialSelectedItemsRef = useRef<CostSheet[]>(
    location.state?.selectedItems || []
  );

  useEffect(() => {
    if (stampDutyRates.length && allCostSheets.length) {
      const updatedSheets = initialSelectedItemsRef.current.map((item) =>
        recalculateCostSheet(item)
      );
      // Ensure we always have 5 columns (empty ones will be filled with dropdowns)
      while (updatedSheets.length < 5) {
        updatedSheets.push({ id: `empty-${updatedSheets.length}` });
      }
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
    const floorRise = sheet?.floorRise || "";
    // Disable dropdowns for Fixed Rate and Band Rate (when floorBandConfiguration exists or typologyRates exists)
    const hasFloorBandConfig = sheet?.typologies?.[0]?.floorBandConfiguration?.length > 0;
    const hasTypologyRates = sheet?.typologyRates && Object.keys(sheet.typologyRates).length > 0;
    const isDisabled = floorRise === "Fixed Rate" || hasFloorBandConfig || hasTypologyRates;
    
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
    setCostSheets((prev) => {
      const updated = [...prev];
      const currentSheet = updated[index];

      // Find matching sheet from allCostSheets
      const matchingSheet = allCostSheets.find(
        (sheet) =>
          sheet.projectName === currentSheet.projectName &&
          sheet.flatType === currentSheet.flatType &&
          safeNumber(sheet.reraCarpet) === newArea
      );

      // If we find a full matching sheet, update multiple fields
      if (matchingSheet) {
        const updatedSheet = {
          ...currentSheet,
          ...matchingSheet, // overrides with updated saleableArea, psfRate, etc.
        };

        updated[index] = recalculateCostSheet(updatedSheet);
      }

      // Recalculate costs
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
          <h2 className="text-2xl font-bold text-white">Property Comparison</h2>
          <div className="flex items-center gap-3">
            <button
              className="text-white hover:text-gray-300 transition-colors px-3 py-1 border border-white/30 rounded text-sm"
              onClick={() => setShowStampDutyDebugger(true)}
            >
              Debug Stamp Duty
            </button>
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
        <div className="overflow-x-auto max-h-[75vh] relative">
          <table className="min-w-full border-collapse">
            <tbody className="divide-y divide-gray-200">
              {/* Discount Row */}
              <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors">
                <td className="bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>Discount/Negotiation</span>
                  </div>
                </td>
                {costSheets.map((sheet, index) => (
                  <td
                    key={index}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    {sheet.projectName ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={sheet.discount || ""}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          setCostSheets((prev) => {
                            const updated = [...prev];
                            const item = updated[index];
                            const newItem = { ...item, discount: newValue };
                            updated[index] = recalculateCostSheet(newItem);
                            return updated;
                          });
                        }}
                        className="w-24 text-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                            e.preventDefault();
                          }
                        }}
                        onWheel={(e) => {
                          // Prevent the scroll wheel from changing the number
                          e.preventDefault();
                        }}
                      />
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Select Property Row */}
              <tr className="sticky top-0 z-30 bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors">
                <td className="sticky left-0 z-30 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
                  <div className="flex items-center">
                    <span>Select Property</span>
                  </div>
                </td>

                {costSheets.map((sheet, index) => (
                  <td
                    key={`select-${index}`}
                    className="px-2 py-1 text-sm text-right border-r border-gray-200"
                  >
                    <select
                      value={sheet.id}
                      onChange={(e) => handleAddProject(index, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-center font-medium shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Project</option>
                      {sheet.projectName && (
                        <option value={sheet.id}>{sheet.projectName}</option>
                      )}
                      {availableProjectOptions.map((projectName) => {
                        // Find cost sheets with this project name that match the current flatType (if any)
                        const currentFlatType = costSheets.find(s => s.projectName)?.flatType;
                        const projectSheets = allCostSheets.filter(
                          (s) => s.projectName === projectName &&
                          (!currentFlatType || s.flatType === currentFlatType)
                        );
                        const projectSheet = projectSheets[0];
                        return projectSheet ? (
                          <option key={projectSheet.id} value={projectSheet.id}>
                            {projectName}
                          </option>
                        ) : null;
                      })}
                    </select>
                  </td>
                ))}
              </tr>

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
              ].map(({ label, key, formatter, bold, custom, suffix, useHelper }) => {
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

                                  updated[index] = recalculateCostSheet(updatedSheet);
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
                        
                        if (sheet.projectName && sheet.typologies && sheet.typologies.length > 0) {
                          const typology = sheet.typologies[0];
                          const saleableArea = parseFloat(String(typology.saleableArea)) || 0;
                          const floorRiseConfig = sheet.floorRiseConfig || {};
                          const floorRise = sheet.floorRise || "";
                          
                          if (floorRise === "Floor Rise") {
                            // Rise Rate = Rise Rate × Saleable Area
                            const riseRate = parseInt(floorRiseConfig.rate || "0") || 0;
                            floorRiseAmount = riseRate * saleableArea;
                          } else if (floorRise === "FR - Fixed Rate") {
                            // FR - Fixed Rate - show the fixed rate directly
                            const bhkType = typology.typology || "";
                            const typologyRates = sheet.floorRiseConfig?.typologyRates || {};
                            floorRiseAmount = parseInt(typologyRates[bhkType] || "0") || 0;
                          } else if (floorRise === "Floor Band") {
                            // Floor Band calculation - check both root floorBandConfig and typology floorBandConfiguration
                            const bhkType = typology.typology || "";
                            const floor = sheet.floor || 1; // Default to floor 1 if no input
                            
                            // Try root level floorBandConfig first
                            let matchingBand = null;
                            if (sheet.floorBandConfig && sheet.floorBandConfig.length > 0) {
                              matchingBand = sheet.floorBandConfig.find(band => {
                                const fromFloor = parseInt(band.fromFloor || "1");
                                const toFloor = parseInt(band.toFloor || "999");
                                return floor >= fromFloor && floor <= toFloor;
                              });
                              
                              if (matchingBand && matchingBand.rates && matchingBand.rates[bhkType]) {
                                const rate = parseInt(matchingBand.rates[bhkType] || "0") || 0;
                                floorRiseAmount = rate > 20000 ? rate : rate * saleableArea;
                              }
                            }
                            
                            // Fallback to typology floorBandConfiguration
                            if (!matchingBand && typology.floorBandConfiguration && typology.floorBandConfiguration.length > 0) {
                              matchingBand = typology.floorBandConfiguration.find(band => {
                                const fromFloor = parseInt(band.fromFloor || "1");
                                const toFloor = parseInt(band.toFloor || "999");
                                return floor >= fromFloor && floor <= toFloor;
                              });
                              
                              if (matchingBand) {
                                const rate = parseInt(matchingBand.rate || "0") || 0;
                                floorRiseAmount = rate > 20000 ? rate : rate * saleableArea;
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
                                  <span className="text-xs text-blue-600 mr-4">Rise Rate</span>
                                )}
                                {sheet.floorRise === "FR - Fixed Rate" && (
                                  <span className="text-xs text-green-600 mr-4">Fixed Rate</span>
                                )}
                                {sheet.floorRise === "Floor Band" && (
                                  <span className="text-xs text-orange-600 mr-4">Band Rate</span>
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
                              <span>{formatCurrency(sheet.furnitureCharges || 0)}</span>
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
                      {costSheets.map((sheet, index) => (
                        <td
                          key={`${index}-${key}`}
                          className="px-2 py-1 text-sm text-right border-r border-gray-200"
                        >
                          {sheet.projectName ? (
                            sheet.includeParkingInAgreement &&
                            (getFieldValue(sheet, 'parkingCharge') ?? 0) > 0 ? (
                              "Parking Included"
                            ) : sheet.withParking ? (
                              formatCurrency(getFieldValue(sheet, 'parkingCharge') || 0)
                            ) : (
                              formatCurrency(0)
                            )
                          ) : (
                            <div className="h-6" />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                }

                // Special handling for RERA row
                if (key === "reraCarpet") {
                  return (
                    <tr
                      key={key}
                      className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-blue-50 border-l-4 border-blue-500 p-3 font-semibold text-gray-700 border-r">
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
                        if (!sheet.projectName) {
                          return (
                            <td
                              key={`empty-${index}`}
                              className="px-2 py-1 text-sm text-right border-r border-gray-200"
                            >
                              <div className="h-10"></div>
                            </td>
                          );
                        }

                        // Filter all cost-sheets to just this column's flatType (and same project, if desired)
                        const currentFlatType = getFieldValue(sheet, 'flatType');
                        const sameTypeSheets = allCostSheets.filter(
                          (s) => {
                            const sheetFlatType = getFieldValue(s, 'flatType');
                            return sheetFlatType === currentFlatType &&
                                   s.projectName === sheet.projectName;
                          }
                        );

                        // pull out numeric carpet areas:
                        const carpetAreas = Array.from(
                          new Set(
                            sameTypeSheets
                              .map((s) => getFieldValue(s, 'reraCarpet'))
                              .filter((n) => n !== undefined && !isNaN(n))
                          )
                        ).sort((a, b) => a - b);

                        return (
                          <td
                            key={sheet.id}
                            className="px-2 py-1 text-sm text-right border-r border-gray-200"
                          >
                            <select
                              value={getFieldValue(sheet, 'reraCarpet') || ""}
                              onChange={(e) =>
                                handleCarpetAreaChange(
                                  index,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-blue-500"
                            >
                              {carpetAreas.map((area) => (
                                <option key={area} value={area}>
                                  {formatArea(area)}
                                </option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }

                // Regular rows
                return (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
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
                        {sheet.projectName ? (() => {
                          const value = useHelper ? getFieldValue(sheet, key) : sheet[key as keyof CostSheet];
                          return formatter && typeof value === "number" ? (
                            formatter(value)
                          ) : value != null ? (
                            String(value)
                          ) : (
                            "N/A"
                          );
                        })() : (
                          <div className="h-5" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}

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
            </tbody>
          </table>
        </div>

        {/* Footer with Summary */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Comparing{" "}
              <strong>{costSheets.filter((s) => s.projectName).length}</strong>{" "}
              properties
            </p>
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
      
      {/* Stamp Duty Debugger Modal */}
      {showStampDutyDebugger && (
        <StampDutyDebugger
          district="Thane"
          onClose={() => setShowStampDutyDebugger(false)}
        />
      )}

      {/* Furniture Modal */}
      {showFurnitureModal && selectedColumnIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Furniture Charges</h3>
              <button
                onClick={() => setShowFurnitureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {(() => {
                const sheet = costSheets[selectedColumnIndex];
                const psfRate = getFieldValue(sheet, 'psfRate') || 0;
                const avRate = getFieldValue(sheet, 'avRate') || 0;
                const saleableArea = getFieldValue(sheet, 'saleableArea') || 0;
                const showDifferenceFields = psfRate !== avRate;
                
                return (
                  <>
                    {showDifferenceFields && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difference between AV & PSF (Disabled)
                          </label>
                          <input
                            type="text"
                            value={formatCurrency((psfRate - avRate) * saleableArea)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Floor Rise (Disabled)
                          </label>
                          <input
                            type="text"
                            value={formatCurrency(sheet?.floorRisePerFloor || 0)}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fixed Component (Editable)
                </label>
                <input
                  type="number"
                  value={(() => {
                    const sheet = costSheets[selectedColumnIndex];
                    const typologyValue = sheet?.typologies?.[0]?.fixedComponent;
                    const pricingValue = sheet?.pricingConfigs?.[0]?.fixedComponent;
                    const legacyValue = sheet?.fixedComponent;
                    
                    console.log('Fixed Component Debug:', {
                      typologyValue,
                      pricingValue,
                      legacyValue,
                      safeTypology: safeNumber(typologyValue),
                      safePricing: safeNumber(pricingValue),
                      safeLegacy: safeNumber(legacyValue),
                      sheet: sheet
                    });
                    
                    const finalValue = safeNumber(typologyValue) || safeNumber(pricingValue) || safeNumber(legacyValue);
                    console.log('Final Fixed Component Value:', finalValue);
                    return finalValue || "";
                  })()}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newValue = value === "" ? undefined : parseFloat(value) || 0;
                    setCostSheets((prev) => {
                      const updated = [...prev];
                      const item = updated[selectedColumnIndex];
                      
                      // Update the fixedComponent in the appropriate location
                      const updatedItem = {
                        ...item,
                        fixedComponent: newValue,
                      };
                      
                      // Also update in typologies if it exists
                      if (updatedItem.typologies && updatedItem.typologies.length > 0) {
                        updatedItem.typologies = [...updatedItem.typologies];
                        updatedItem.typologies[0] = {
                          ...updatedItem.typologies[0],
                          fixedComponent: newValue?.toString() || ""
                        };
                      }
                      
                      updated[selectedColumnIndex] = recalculateCostSheet(updatedItem);
                      return updated;
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter fixed component amount"
                />
              </div>
              
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">Total Package:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(costSheets[selectedColumnIndex]?.totalPackage || 0)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFurnitureModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFurnitureModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
