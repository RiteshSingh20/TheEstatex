// User related types
export interface User {
  id: string;
  fullName: string;
  firmName?: string;
  phone: string;
  marketingPhoneNumber?: string;
  email: string;
  reraNumber: string;
  state: string;
  city: string;
  password: string;
  location: {
    lat: number;
    lng: number;
  };
  subscriptionLocations: SubscriptionLocation[];
  subscriptions?: Subscription[]; // Added subscriptions property
  isAdmin?: boolean;
  role: UserRole;
  subscriptionCount: number; // Number of active subscriptions
}

export type UserRole = "admin" | "manager" | "executive" | "user";

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager", 
  executive: "Executive",
  user: "User"
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system access - can manage everything",
  manager: "Can approve executive submissions and manage resale/rental properties",
  executive: "Can create property entries and view user access models", 
  user: "Regular user with basic functionality"
};

export interface SignupFormData {
  id: string;
  fullName: string;
  firmName?: string;
  phone: string;
  email: string;
  reraNumber: string;
  state: string;
  city: string;
  password: string;
  confirmPassword?: string; // optional, for frontend only
  location: {
    lat: number;
    lng: number;
  };
  subscriptionLocations: SubscriptionLocation[]; // you can type this better too if needed
}

// Add Subscription interface here to be used in User interface
export interface Subscription {
  id: string;
  type: "RR" | "NP";
  locations: string[];
  amount: number;
  startDate: string; // or Date, depending on your usage
  endDate: string;
  paymentId?: string;
  status: "active" | "expired" | "pending";
}

export interface SubscriptionLocation {
  id: string;
  name: string;
  price: number;
  subscribedAt?: string;
}

// Property related types
export type PropertyType = "Residential" | "Commercial" | "Villa";
export type PropertyCategory = "New" | "Resale" | "Rental";
export type PropertyStatus = "Pending Approval" | "Approved" | "Rejected";

export type ListingState = "Available" | "Sold Out" | "Hold";

export interface BaseProperty {
  id: string;
  createdAt: string;
  userId: string;

  // Listing details
  status: PropertyStatus;
  type: string; // BHK type
  terrace: boolean;
  zone: string;
  society: string;
  roadLocation: string;
  station: string;
  cosmo: boolean;
  connectedPerson: string;
  directBroker: "Direct" | "Broker";

  // UI & Listing State Fields
  isApproved: boolean;
  listingState: "Available" | "Sold Out" | "Hold" | "Rented Out";

  // Media
  images?: string[];
  video?: string;

  // Optional: Fallback contact detail
  contact?: string;

  location?: {
    lat: number;
    lng: number;
  };
  nearbyAreas?: string[];
}

export interface ResaleProperty extends BaseProperty {
  expectedPrice: number;
  finalPrice?: number;
  maintenance?: number;

  floorNo: number;
  flatNo: string;
  buildingNo?: string;
  totalFloors?: number;

  landmark?: string;
  carpetArea: number;
  builtUpArea: number;
  propertyAge: number;

  ocStatus: string;
  amenities: string[];
  furnishing: string;
  parking: string;

  masterBed?: boolean;
  sublocation?: string; // New field for sublocation
  cosmoSociety?: string; // New field for cosmo society
  ownerName: string;
  ownerNumber: string;
  pincode: string;
  sublocality: string;
  district: string;
  state: string;
  ocAvailable: string;
  terraceGallery: string;
  negotiable: string;

  contactName: string;
  contactNumber: string;
  imageUrl?: string;
  videoUrl?: string;

  possessionMonth?: string;
  possessionYear?: string;
  possession?: string; // Concatenated month-year string

  /** 🔥 Moderation / Listing fields */
  isApproved: boolean;
  listingState: ListingState;
}

export interface RentalProperty extends BaseProperty {
  rent: number;
  deposit: number;
  furnishing: "Unfurnished" | "Semi-Furnished" | "Fully Furnished";
  buildingNo?: string;
  floorNo: number;
  totalFloors: number;
  wing?: string;
  flatNo: string;
  pincode: string;
  landmark?: string;
  propertyAge: number;
  sublocation: string; // New field for sublocation
  amenities: string[];
  parking: "Open" | "Covered" | "None";
  availableFrom: string;
  ownership: string;
  masterBed: boolean;
  contactName: string;
  contactNumber: string;
  propertyId?: string;
  possessionMonth?: string;
  possessionYear?: string;
  possession?: string; // Concatenated month-year string
  negotiable?: boolean;
  district?: string;
  state?: string;
  terraceGallery?: string;
}

// State and City types
export interface State {
  name: string;
}

export interface City {
  name: string;
}

// Banner type
export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  location: string;
  discount?: string;
}

// Added LocationOption interface with disabled property for subscription page
export interface LocationOption {
  id: string;
  name: string;
  price: number;
  isSelected: boolean;
  disabled?: boolean;
}
