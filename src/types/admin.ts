import { Timestamp } from "firebase/firestore";
import { User } from "./user";

export interface Property {
  id: string;
  userId?: string;
  createdAt: Date | Timestamp;
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
  docId?: string;
  submitterRole?: string;
  pincode?: string;
  pinCode?: string;
  district?: string;
  state?: string;
  ownerName?: string;
  ownerNumber?: string;
  keyAvailable?: boolean | string;
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
  category?: "resale" | "rental" | "newProperty";
  [key: string]: any;
}

export interface Inventory {
  resale: Property[];
  rental: Property[];
  newProperties?: any[];
}

export interface SubscriptionInfo {
  id: string;
  type: string;
  status: string;
  amount?: number;
  discountedPrice?: number;
  locations?: string[] | string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
}

export interface PricingState {
  rentalResalePrice: number;
  newPropertyPrice: number;
  resalePrice: number;
  rentalPrice: number;
  actualPrice?: number;
  discount?: number;
  offerPrice?: number;
  discountedPrice?: { [key: string]: number };
  newStationName?: string;
  selectedStationId?: string;
}

export interface StationPricing {
  actual: number;
  offer: number;
}

export interface AdminFilters {
  searchTerms: {
    resale: string;
    rental: string;
    newProperty: string;
  };
  filters: {
    resale: { type: string; sort: string };
    rental: { type: string; sort: string };
    newProperty: { bhk: string; sort: string };
  };
}

export interface RejectingProperty {
  id: string;
  category: "resale" | "rental" | "newProperty";
}
