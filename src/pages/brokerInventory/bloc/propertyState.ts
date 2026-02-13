export interface Property {
  id: string;
  propertyType: 'Residential' | 'Commercial' | 'Plot';
  transactionType: 'Resale' | 'Rental' | 'Sale';
  
  // Basic Details (mapped to old structure)
  society: string;
  sublocation: string;
  landmark: string;
  pincode: string;
  station: string;
  district: string;
  state: string;
  
  // Property Details
  type: string; // configuration
  masterBed?: boolean;
  buildingNo: string; // buildingNoWing
  flatNo?: number;
  floorNo?: number;
  totalFloors?: number;
  carpetArea?: number;
  builtUpArea?: number;
  propertyAge?: number;
  
  // Resale specific
  ocAvailable?: boolean;
  expectedPrice?: number;
  maintenance?: number;
  
  // Rental specific
  expectedRent?: number;
  securityDeposit?: number;
  petFriendly?: boolean;
  
  // Common fields
  amenities: string[];
  furnishing: string;
  parking: string;
  terraceGallery: string;
  cosmoSociety: string;
  negotiable: boolean;
  
  // Contact fields
  ownerName: string;
  ownerNumber: string;
  keyAvailable?: boolean;
  connectedPerson?: string;
  
  // Media fields
  imageUrl: string;
  videoUrl: string;
  
  // New fields
  parkingType?: string;
  exitDirection?: string;
  plusProperty?: string;
  plusPropertyType?: string;
  
  // System fields
  userId: string;
  userFullName: string;
  userMarketingPhoneNumber: string;
  createdAt: string;
  updatedAt: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  isApproved: boolean;
  listingState: 'Available' | 'Sold' | 'Rented';
}

export interface PropertyState {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  currentProperty: Property | null;
  filters: {
    propertyType?: string;
    transactionType?: string;
    status?: string;
    userId?: string;
  };
}

export const initialPropertyState: PropertyState = {
  properties: [],
  isLoading: false,
  error: null,
  success: false,
  message: null,
  currentProperty: null,
  filters: {}
};
