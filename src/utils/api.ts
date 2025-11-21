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
    console.error("Error fetching stations by pincode:", error);
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
    console.error("Error fetching states:", error);
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
    console.error("Error fetching cities:", error);
    return [];
  }
};

// API to fetch district and state by pincode
export const fetchLocationByPincode = async (pincode: string) => {
  try {
    console.log(`API call for pincode: ${pincode}`);
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const data = await response.json();
    console.log('API response:', data);

    if (
      data?.[0]?.Status === "Success" &&
      Array.isArray(data[0]?.PostOffice) &&
      data[0].PostOffice.length > 0
    ) {
      const postOffice = data[0].PostOffice[0];
      console.log('PostOffice data:', postOffice);
      return {
        district: postOffice.District,
        state: postOffice.State,
      };
    }
    console.log('No valid data found in response');
    return { district: "", state: "" };
  } catch (error) {
    console.error("Error fetching location by pincode:", error);
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
    console.error("Error fetching banners:", error);
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
