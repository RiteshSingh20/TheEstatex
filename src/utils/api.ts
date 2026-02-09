import axios from "axios";
import { State, City, Banner } from "../types";

export interface ResaleFormData {
  amenities: string[];
  station: string;
  sublocality: string;
  direction?: string;
  district: string;
  state: string;
  society: string;
  sublocation?: string;
  landmark?: string;
  pincode: string;
  type: string;
  buildingNo?: string;
  flatNo: string;
  floorNo: number;
  totalFloors?: number;
  carpetArea: number;
  builtUpArea: number;
  propertyAge: number;
  ocAvailable: string;
  furnishing: string;
  parking: string;
  terraceGallery: string;
  cosmoSociety?: string;
  terrace?: boolean;
  expectedPrice: number;
  negotiable: string;
  maintenance?: number;
  ownerName: string;
  ownerNumber: string;
  connectedPerson?: string;
  imageUrl?: string;
  videoUrl?: string;
  masterBed?: boolean;
  plusProperty?: string;
}

// Add to your types file
export interface RentalFormData {
  // Basic Details (same as resale)
  society: string;
  sublocation?: string;
  landmark?: string;
  pincode: string;
  station: string;
  district: string;
  state: string;

  // Property Details (modified)
  type: string;
  buildingNo: string;
  flatNo: string;
  floorNo: number;
  totalFloors: number;
  propertyAge: number;
  furnishing: string;
  parking: string;
  terraceGallery: string;
  cosmoSociety: string;
  expectedRent: number; // Changed from expectedPrice
  securityDeposit: number; // New field
  negotiable: string;

  // Other Details (same as resale)
  ownerName: string;
  ownerNumber: string;
  connectedPerson?: string;
  imageUrl?: string;
  videoUrl?: string;

  amenities: string[];
  masterBed?: string;
  availableImmediately?: string;
  plusProperty?: string;
}

// Add this to your utils/api.ts or similar file
export const fetchStationsByPincode = async (pincode: string) => {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const data = await response.json();

    if (data[0]?.Status === "Success" && data[0]?.PostOffice) {
      return data[0].PostOffice.map((office: any) => office.Name);
    }
    return [];
  } catch (error) {
    return [];
  }
};

// API to fetch states
export const fetchStates = async (): Promise<State[]> => {
  try {
    const response = await axios.get(
      "https://api.countrystatecity.in/v1/countries/IN/states",
      {
        headers: {
          "X-CSCAPI-KEY":
            "QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ==",
        },
      }
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

// API to fetch cities based on state code
export const fetchCities = async (stateCode: string): Promise<City[]> => {
  try {
    const response = await axios.get(
      `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
      {
        headers: {
          "X-CSCAPI-KEY":
            "QXc3MW5lbVNuVTdpWm5sVnZYOFNid0hSUjVNNnRZSVB2czFpaE5FTQ==",
        },
      }
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

// API to fetch district and state by pincode
export const fetchLocationByPincode = async (pincode: string) => {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const data = await response.json();

    if (
      data?.[0]?.Status === "Success" &&
      Array.isArray(data[0]?.PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const postOffice = data[0].PostOffice[0];
      return {
        district: postOffice.District,
        state: postOffice.State,
      };
    }
    return { district: "", state: "" };
  } catch (error) {
    return { district: "", state: "" };
  }
};

// API to fetch banners
export const fetchBanners = async (locations: string[]): Promise<Banner[]> => {
  try {
    const locationsParam = locations.join(",");
    const response = await axios.get(
      `https://asia-south1-starzapp.cloudfunctions.net/EstatexD4P/banners?location=${encodeURIComponent(
        locationsParam
      )}`
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

// Simulate station data based on city
export const fetchStationsByCity = async (city: string): Promise<string[]> => {
  // This is a mock function - in a real app, this would call an API
  const mockStations: Record<string, string[]> = {
    Mumbai: ["Dadar", "Andheri", "Borivali", "Churchgate", "CST"],
    Thane: ["Thane", "Mulund", "Kalwa", "Airoli"],
    "Mira Road": ["Mira Road", "Bhayandar"],
    Dahisar: ["Dahisar", "Borivali"],
    Bhayandar: ["Bhayandar", "Naigaon"],
    Delhi: ["Connaught Place", "Rajiv Chowk", "Chandni Chowk"],
    Bangalore: ["MG Road", "Indiranagar", "Whitefield"],
    Pune: ["Shivaji Nagar", "Hinjewadi", "Kothrud"],
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockStations[city] || [];
};

// Simulate localities data based on city
export const fetchLocalitiesByCity = async (
  city: string
): Promise<string[]> => {
  // This is a mock function - in a real app, this would call an API
  const mockLocalities: Record<string, string[]> = {
    Mumbai: [
      "Andheri East",
      "Andheri West",
      "Juhu",
      "Bandra",
      "Powai",
      "Malad",
      "Goregaon",
    ],
    Thane: [
      "Ghodbunder Road",
      "Eastern Express Highway",
      "Wagle Estate",
      "Majiwada",
    ],
    "Mira Road": [
      "Shanti Nagar",
      "Pleasant Park",
      "Shrishti Complex",
      "Beverly Park",
    ],
    Dahisar: ["Anand Nagar", "Rawalpada", "Dahisar East", "Dahisar West"],
    Bhayandar: ["Bhayandar East", "Bhayandar West", "Navghar", "Uttan"],
    Delhi: ["South Delhi", "North Delhi", "East Delhi", "Dwarka", "Noida"],
    Bangalore: ["Koramangala", "HSR Layout", "Jayanagar", "JP Nagar"],
    Pune: ["Aundh", "Baner", "Viman Nagar", "Koregaon Park"],
  };

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockLocalities[city] || [];
};

// API to fetch location suggestions from TestingCostSheets database
export const fetchLocationSuggestions = async (
  searchTerm: string,
  field: "location" | "subLocation" | "road" | "landmark",
  database: string = "TestingCostSheets",
  locationFilter?: string,
  subLocationFilter?: string
): Promise<string[]> => {
  try {
    const { getDocs, collection } = await import('firebase/firestore');
    const { db } = await import('../utils/firebase');
    
    const snapshot = await getDocs(collection(db, database));
    const suggestions = new Set<string>();
    const searchLower = searchTerm.toLowerCase().trim();
    const locationLower = locationFilter?.toLowerCase().trim();
    const subLocationLower = subLocationFilter?.toLowerCase().trim();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if ((field === "subLocation" || field === "road" || field === "landmark") && locationLower) {
        const docLocation = typeof data.location === "string" ? data.location : "";
        if (docLocation.toLowerCase().trim() !== locationLower) {
          return;
        }
      }
      if ((field === "road" || field === "landmark") && subLocationLower) {
        const docSubLocation = typeof data.subLocation === "string" ? data.subLocation : "";
        if (docSubLocation.toLowerCase().trim() !== subLocationLower) {
          return;
        }
      }
      const fieldValue = data[field];
      
      if (fieldValue && typeof fieldValue === 'string') {
        const valueLower = fieldValue.toLowerCase().trim();
        if (
          !searchLower ||
          valueLower.startsWith(searchLower) ||
          valueLower.includes(searchLower)
        ) {
          suggestions.add(fieldValue);
        }
      }
    });
    
    return Array.from(suggestions)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 15);
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
};

export const fetchLocationContextByValue = async (
  field: "road" | "landmark",
  value: string,
  database: string = "TestingCostSheets"
): Promise<{ location?: string; subLocation?: string } | null> => {
  try {
    const { getDocs, collection } = await import("firebase/firestore");
    const { db } = await import("../utils/firebase");

    const snapshot = await getDocs(collection(db, database));
    const valueLower = value.toLowerCase().trim();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const fieldValue = typeof data[field] === "string" ? data[field] : "";
      if (fieldValue.toLowerCase().trim() === valueLower) {
        const location =
          typeof data.location === "string" ? data.location : undefined;
        const subLocation =
          typeof data.subLocation === "string" ? data.subLocation : undefined;
        return { location, subLocation };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching location context:", error);
    return null;
  }
};
