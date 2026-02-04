export const bhkOptions = [
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

export const possessionOptions = [
  { value: "Ready to Move", label: "Ready to Move" },
  { value: "1-2yrs", label: "1yr to 2yrs (Upto 24 Months)" },
  { value: "2-3yrs", label: "2yrs to 3yrs (13-36 Months)" },
  { value: "3-4yrs", label: "3yrs to 4yrs (25-48 Months)" },
  { value: "4+yrs", label: "4yrs & Above (37+ Months)" },
];

export const currentYear = new Date().getFullYear();

export const ITEMS_PER_PAGE = 10;

export const AMENITIES_LIST = [
  "Swimming Pool",
  "Gymnasium", 
  "Club House",
  "Kid's Play Area",
  "Modular Kitchen",
  "Gas Pipeline",
  "Security"
];

export interface FilterState {
  bhkType: string;
  station: string;
  minBudget: string;
  maxBudget: string;
  minCarpetArea: string;
  maxCarpetArea: string;
  subLocation: string[];
  possession: string;
  lookingForCosmo: boolean | undefined;
  BalconyorTerrace: string | undefined;
  parking: boolean | undefined;
  amenities: string[];
  petFriendly: boolean | undefined;
  furnishing: string | undefined;
  ocRed: string | undefined;
  schemes: string[];
}

export const EMPTY_FILTERS: FilterState = {
  bhkType: "",
  station: "",
  minBudget: "",
  maxBudget: "",
  minCarpetArea: "",
  maxCarpetArea: "",
  subLocation: [],
  possession: "",
  BalconyorTerrace: undefined,
  lookingForCosmo: undefined,
  parking: undefined,
  amenities: [],
  petFriendly: undefined,
  furnishing: undefined,
  ocRed: undefined,
  schemes: [],
};