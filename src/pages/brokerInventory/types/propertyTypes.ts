export type PropertyType = 'Residential' | 'Commercial' | 'Plot' | '';
export type FormType = 'Resale' | 'Rental' | '';

export interface NavigationState {
  selectedPropertyType: PropertyType;
  selectedFormType: FormType;
  showForm: boolean;
}

export interface FormProps {
  onBack?: () => void;
  onSubmit?: (data: any) => void;
}

export interface BaseFormData {
  // Location fields
  buildingSocietyName: string;
  sublocation: string;
  landmark: string;
  locationStation: string;
  pinCode: string;
  state: string;
  district: string;
  
  // Property fields
  configuration: string;
  carpetArea: string;
  builtUpArea: string;
  
  // Media files
  image: FileList | null;
  video: File | null;
  
  // Contact info
  ownerName: string;
  ownerNumber: string;
}

export const TAB_CONFIG = [
  { id: 'basic', icon: 'fas fa-info-circle', label: 'Basic Details' },
  { id: 'property', icon: 'fas fa-home', label: 'Property Details' },
  { id: 'contacts', icon: 'fas fa-address-book', label: 'Contacts & Collaterals' }
];

export const STYLES = {
  header: 'bg-slate-700 text-white px-8 py-4',
  gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  card: 'bg-white rounded-lg shadow-lg p-6',
  button: 'px-3 py-2 rounded text-xs font-semibold transition-all duration-200',
  grid: 'grid gap-1 bg-white rounded border border-gray-200 p-1',
  input: 'w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500'
};