import { Timestamp } from "firebase/firestore";
import { SubscriptionInfo } from "./helperFunctions";

export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}; // Helper to safely convert Firestore timestamps to Date

export const toDate = (timestamp: any): Date => {
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
}; // Define Property type for inventory items
export interface Property {
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
} // SubscriptionInfo must be defined before use

export interface SubscriptionInfo {
  id: string;
  type: string;
  status: string;
  amount?: number;
  discountedPrice?: number;
  locations?: string[] | string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
} // Add this component above the Admin component
export interface SubscriptionDisplayProps {
  subscription: SubscriptionInfo;
}
