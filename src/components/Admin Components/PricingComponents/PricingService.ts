import { db } from "../../../utils/firebase";
import { doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";

// Core data interfaces
export interface StationPricing {
  actual: number;
  offer: number;
}

export interface Station {
  id: string;
  name: string;
  district: string;
  state: string;
  source: "costsheet" | "custom" | "resale-rental" | "new-property";
}

export interface Package {
  id: string;
  name: string;
  stationIds: string[];
  totalActual: number;
  offerPrice: number;
  category: "resale-rental" | "new-property";
}

export interface DurationDiscount {
  months: number;
  discountPercent: number;
}

export interface PricingData {
  // Station pricing by category
  resaleRental: {
    [stationId: string]: StationPricing;
  };
  newProperty: {
    [stationId: string]: StationPricing;
  };

  // Custom stations
  customStations: {
    [stationId: string]: Station;
  };

  // Packages by category
  packages: {
    resaleRental: {
      [packageId: string]: Package;
    };
    newProperty: {
      [packageId: string]: Package;
    };
  };

  // Duration discounts
  durationDiscounts: DurationDiscount[];
}

const PRICING_DOC_PATH = "settings/pricing";

// Get pricing data
export const getPricingData = async (): Promise<PricingData> => {
  try {
    const docRef = doc(db, PRICING_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as PricingData;
    }

    // Return default structure
    return {
      resaleRental: {},
      newProperty: {},
      customStations: {},
      packages: {
        resaleRental: {},
        newProperty: {},
      },
      durationDiscounts: [],
    };
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    throw error;
  }
};

// Update station pricing
export const updateStationPricing = async (
  category: "resaleRental" | "newProperty",
  stationId: string,
  pricing: StationPricing | null
): Promise<void> => {
  try {
    const docRef = doc(db, PRICING_DOC_PATH);
    
    if (pricing === null) {
      // Delete the field entirely
      await updateDoc(docRef, {
        [`${category}.${stationId}`]: deleteField(),
      });
    } else {
      // Update the pricing
      await updateDoc(docRef, {
        [`${category}.${stationId}`]: pricing,
      });
    }
  } catch (error) {
    console.error("Error updating station pricing:", error);
    throw error;
  }
};

// Add custom station
export const addCustomStation = async (
  station: Omit<Station, "id">
): Promise<string> => {
  try {
    const stationId = `custom_${Date.now()}`;
    const docRef = doc(db, PRICING_DOC_PATH);

    await updateDoc(docRef, {
      [`customStations.${stationId}`]: {
        ...station,
        id: stationId,
        source: "custom",
      },
    });

    return stationId;
  } catch (error) {
    console.error("Error adding custom station:", error);
    throw error;
  }
};

// Create package
export const createPackage = async (
  category: "resaleRental" | "newProperty",
  packageData: Omit<Package, "id">
): Promise<string> => {
  try {
    const packageId = `pkg_${Date.now()}`;
    const docRef = doc(db, PRICING_DOC_PATH);

    await updateDoc(docRef, {
      [`packages.${category}.${packageId}`]: {
        ...packageData,
        id: packageId,
        category,
      },
    });

    return packageId;
  } catch (error) {
    console.error("Error creating package:", error);
    throw error;
  }
};

// Update package
export const updatePackage = async (
  category: "resaleRental" | "newProperty",
  packageId: string,
  packageData: any
): Promise<void> => {
  try {
    const docRef = doc(db, PRICING_DOC_PATH);
    await updateDoc(docRef, {
      [`packages.${category}.${packageId}`]: {
        ...packageData,
        isFreemium: packageData.isFreemium || false,
        freemiumDuration: packageData.freemiumDuration || null,
      },
    });
  } catch (error) {
    console.error("Error updating package:", error);
    throw error;
  }
};

// Delete package
export const deletePackage = async (
  category: "resaleRental" | "newProperty",
  packageId: string
): Promise<void> => {
  try {
    const docRef = doc(db, PRICING_DOC_PATH);
    await updateDoc(docRef, {
      [`packages.${category}.${packageId}`]: deleteField(),
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    throw error;
  }
};

// Update duration discounts
export const updateDurationDiscounts = async (
  discounts: DurationDiscount[]
): Promise<void> => {
  try {
    const docRef = doc(db, PRICING_DOC_PATH);
    await updateDoc(docRef, {
      durationDiscounts: discounts,
    });
  } catch (error) {
    console.error("Error updating duration discounts:", error);
    throw error;
  }
};

// Calculate final price with discounts
export const calculateFinalPrice = (
  basePrice: number,
  durationMonths: number,
  durationDiscounts: DurationDiscount[]
): number => {
  const discount = durationDiscounts.find((d) => d.months === durationMonths);
  if (discount) {
    return basePrice * (1 - discount.discountPercent / 100);
  }
  return basePrice;
};

// Initialize pricing document
export const initializePricingData = async (): Promise<void> => {
  try {
    const docRef = doc(db, PRICING_DOC_PATH);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const initialData: PricingData = {
        resaleRental: {},
        newProperty: {},
        customStations: {},
        packages: {
          resaleRental: {},
          newProperty: {},
        },
        durationDiscounts: [
          { months: 1, discountPercent: 0 },
          { months: 3, discountPercent: 10 },
          { months: 6, discountPercent: 20 },
          { months: 12, discountPercent: 30 },
        ],
      };

      await setDoc(docRef, initialData);
    }
  } catch (error) {
    console.error("Error initializing pricing data:", error);
    throw error;
  }
};
