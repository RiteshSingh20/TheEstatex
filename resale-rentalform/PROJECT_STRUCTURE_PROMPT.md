# Property Management Implementation - Production Ready Prompt

## Implementation Target
Implement property management flow within existing `src/pages/brokerInventory` directory following established BLoC pattern.

## Folder Structure (Add to existing brokerInventory/)
```
src/pages/brokerInventory/
├── PropertyFormSelector.tsx                 # Main navigation hub
├── forms/                                   # Property forms
│   ├── ResalePropertyForm.tsx              # Residential resale
│   ├── RentalPropertyForm.tsx              # Residential rental  
│   ├── CommercialResalePropertyForm.tsx    # Commercial resale
│   ├── CommercialRentalPropertyForm.tsx    # Commercial rental
│   ├── PlotSalePropertyForm.tsx            # Plot sale
│   └── PlotRentalPropertyForm.tsx          # Plot rental
├── types/                                   # TypeScript interfaces
│   └── propertyTypes.ts                    # Form data interfaces
├── utils/                                   # Helper functions
│   ├── calculations.ts                     # Area/price calculations
│   └── fileHandlers.ts                     # File upload utilities
└── hooks/                                   # Custom hooks
    └── usePropertyForm.ts                   # Form state management
```

## Core Implementation Requirements

### 1. Navigation Flow Architecture
```typescript
// PropertyFormSelector.tsx - Main Hub
type PropertyType = 'Residential' | 'Commercial' | 'Plot' | '';
type FormType = 'Resale' | 'Rental' | '';

interface NavigationState {
  selectedPropertyType: PropertyType;
  selectedFormType: FormType;
  showForm: boolean;
}

// Three-level navigation:
// Level 1: Property Type Selection
// Level 2: Transaction Type Selection  
// Level 3: Form Display
```

### 2. Form Component Pattern
```typescript
// Common interface for all forms
interface FormProps {
  onBack?: () => void;
  onSubmit?: (data: any) => void;
}

// 3-Tab Structure for all forms
const TAB_CONFIG = [
  { id: 'basic', icon: 'fas fa-info-circle', label: 'Basic Details' },
  { id: 'property', icon: 'fas fa-home', label: 'Property Details' },
  { id: 'contacts', icon: 'fas fa-address-book', label: 'Contacts & Collaterals' }
];
```

### 3. State Management Pattern
```typescript
// Each form maintains comprehensive state
interface BaseFormData {
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
```

### 4. UI Design System
```typescript
// Consistent styling patterns
const STYLES = {
  header: 'bg-slate-700 text-white px-8 py-4',
  gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  card: 'bg-white rounded-lg shadow-lg p-6',
  button: 'px-3 py-2 rounded text-xs font-semibold transition-all duration-200',
  grid: 'grid gap-1 bg-white rounded border border-gray-200 p-1',
  input: 'w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500'
};
```

## Key Features Implementation

### 1. Dynamic Layout System
- **ResalePropertyForm**: 7-column location grid, amenities management
- **RentalPropertyForm**: Similar to resale + pet-friendly, security deposit
- **CommercialResalePropertyForm**: Dynamic columns based on configuration
  - Shop: 4-6-6 layout
  - Office: 5-6-5 layout  
  - Big Commercials: 2-2-3 layout
- **PlotSalePropertyForm**: Flexible area units, auto price calculation

### 2. Auto-Calculations
```typescript
// Area conversion (carpet ↔ built-up)
const calculateBuiltUpArea = (carpetArea: number) => Math.round(carpetArea * 1.2);
const calculateCarpetArea = (builtUpArea: number) => Math.round(builtUpArea / 1.2);

// Price per unit calculation
const calculatePricePerUnit = (totalPrice: number, area: number) => 
  (totalPrice / area).toFixed(2);
```

### 3. File Upload System
- Image preview with remove functionality
- Video preview with thumbnail
- 20 image limit validation
- Drag-and-drop styling

### 4. Conditional Field Rendering
- Fields show/hide based on selections
- Context-sensitive labels
- Required field highlighting (orange borders)
- Master bedroom option for 1 BHK

## Production Considerations

### 1. Performance Optimization
- Lazy load form components
- Memoize expensive calculations
- Debounce auto-calculations
- Virtual scrolling for large lists

### 2. Error Handling
- Form validation with error messages
- File upload error handling
- Network error boundaries
- Graceful fallbacks

### 3. Accessibility
- ARIA labels for form fields
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### 4. Testing Strategy
- Unit tests for calculations
- Integration tests for navigation flow
- E2E tests for complete user journey
- Visual regression tests

## Integration Steps

### Phase 1: Core Structure
1. Create folder structure in brokerInventory
2. Implement PropertyFormSelector navigation
3. Add TypeScript interfaces
4. Create utility functions

### Phase 2: Form Implementation
1. Build ResalePropertyForm (most complex)
2. Implement RentalPropertyForm
3. Create CommercialResalePropertyForm with dynamic layout
4. Add PlotSalePropertyForm
5. Create placeholder forms for remaining types

### Phase 3: Advanced Features
1. File upload system
2. Auto-calculations
3. Form validation
4. Error handling

### Phase 4: Integration & Testing
1. Add to existing brokerInventory routing
2. Integration testing
3. Performance optimization
4. Production deployment

## Code Quality Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Consistent naming conventions
- Comprehensive JSDoc comments
- Error boundary implementation
- Loading states for async operations

## Scalability Features
- Modular component architecture
- Reusable hooks and utilities
- Configurable form fields
- Plugin-based amenities system
- Extensible validation framework
- Internationalization ready

This implementation provides a production-ready, scalable property management system integrated within the existing brokerInventory structure.

