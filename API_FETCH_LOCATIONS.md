# API Fetch Locations - States & Districts

## API Endpoints
1. **Fetch States:** `https://countriesnow.space/api/v0.1/countries/states` (Filter for country = "India")
2. **Fetch Districts:** `https://countriesnow.space/api/v0.1/countries/state/cities` (POST with body: { country: "India", state: "<selectedState>" })

---

## Primary Fetch Location

### 1. Hook: `useStateDistrict`
**File:** `src/hooks/useStateDistrict.ts`

**What it does:**
- Fetches all states on component mount
- Fetches districts/cities when state is selected
- Implements caching for performance
- Handles loading states and errors

**API Calls:**
```typescript
// Fetch States
fetch('https://countriesnow.space/api/v0.1/countries/states')
// Response: { data: [{ name: "India", states: [...] }] }
// Filters for India and extracts states array

// Fetch Districts
fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'India', state: selectedState })
})
// Response: { data: ["Mumbai", "Pune", ...] }
```

---

## Forms Using These APIs

### Residential Forms

#### 1. **Resale Property Form**
- **Location 1:** `src/pages/brokerInventory/forms/ResalePropertyForm.tsx`
- **Location 2:** `resale-rentalform/src/ResalePropertyForm.tsx`
- **Uses:** `useStateDistrict` hook
- **Fields:** State dropdown → District dropdown

#### 2. **Rental Property Form**
- **Location 1:** `src/pages/brokerInventory/forms/RentalPropertyForm.tsx`
- **Location 2:** `resale-rentalform/src/RentalPropertyForm.tsx`
- **Uses:** `useStateDistrict` hook
- **Fields:** State dropdown → District dropdown

---

### Commercial Forms

#### 3. **Commercial Resale Property Form**
- **Location 1:** `src/pages/brokerInventory/forms/CommercialResalePropertyForm.tsx`
- **Location 2:** `resale-rentalform/src/CommercialResalePropertyForm.tsx`
- **Uses:** Manual text input (NOT using API)
- **Fields:** State text input → District text input

#### 4. **Commercial Rental Property Form**
- **Location 1:** `src/pages/brokerInventory/forms/CommercialRentalPropertyForm.tsx`
- **Location 2:** `resale-rentalform/src/CommercialRentalPropertyForm.tsx`
- **Uses:** Manual text input (NOT using API)
- **Fields:** State text input → District text input

---

### Plot Forms

#### 5. **Plot Sale Property Form**
- **Location 1:** `src/pages/brokerInventory/forms/PlotSalePropertyForm.tsx`
- **Location 2:** `resale-rentalform/src/PlotSalePropertyForm.tsx`
- **Uses:** Manual text input (NOT using API)
- **Fields:** State text input → District text input

#### 6. **Plot Rental Property Form**
- **Location 1:** `src/pages/brokerInventory/forms/PlotRentalPropertyForm.tsx`
- **Location 2:** `resale-rentalform/src/PlotRentalPropertyForm.tsx`
- **Uses:** Manual text input (NOT using API)
- **Fields:** State text input → District text input

---

## Summary Table

| Form Type | Main App Location | Standalone Location | API Used |
|-----------|------------------|-------------------|----------|
| Resale Residential | `src/pages/brokerInventory/forms/ResalePropertyForm.tsx` | `resale-rentalform/src/ResalePropertyForm.tsx` | ✅ useStateDistrict |
| Rental Residential | `src/pages/brokerInventory/forms/RentalPropertyForm.tsx` | `resale-rentalform/src/RentalPropertyForm.tsx` | ✅ useStateDistrict |
| Commercial Resale | `src/pages/brokerInventory/forms/CommercialResalePropertyForm.tsx` | `resale-rentalform/src/CommercialResalePropertyForm.tsx` | ❌ Manual Input |
| Commercial Rental | `src/pages/brokerInventory/forms/CommercialRentalPropertyForm.tsx` | `resale-rentalform/src/CommercialRentalPropertyForm.tsx` | ❌ Manual Input |
| Plot Sale | `src/pages/brokerInventory/forms/PlotSalePropertyForm.tsx` | `resale-rentalform/src/PlotSalePropertyForm.tsx` | ❌ Manual Input |
| Plot Rental | `src/pages/brokerInventory/forms/PlotRentalPropertyForm.tsx` | `resale-rentalform/src/PlotRentalPropertyForm.tsx` | ❌ Manual Input |

---

## API Fetch Flow

```
useStateDistrict Hook
    ↓
    ├─→ On Mount: Fetch States from API
    │   └─→ Filter for India
    │   └─→ Cache results
    │
    └─→ On State Selection: Fetch Districts from API
        └─→ POST with selected state
        └─→ Cache results
        └─→ Return city list
```

---

## Files That Need Updates (if adding API to Commercial/Plot forms)

1. `src/pages/brokerInventory/forms/CommercialResalePropertyForm.tsx`
2. `src/pages/brokerInventory/forms/CommercialRentalPropertyForm.tsx`
3. `src/pages/brokerInventory/forms/PlotSalePropertyForm.tsx`
4. `src/pages/brokerInventory/forms/PlotRentalPropertyForm.tsx`
5. `resale-rentalform/src/CommercialResalePropertyForm.tsx`
6. `resale-rentalform/src/CommercialRentalPropertyForm.tsx`
7. `resale-rentalform/src/PlotSalePropertyForm.tsx`
8. `resale-rentalform/src/PlotRentalPropertyForm.tsx`

---

## Current Implementation Status

✅ **Already Implemented:**
- States API fetch in `useStateDistrict` hook
- Districts API fetch in `useStateDistrict` hook
- Used in Resale & Rental Residential forms (both main app and standalone)

❌ **Not Implemented:**
- Commercial forms still use manual text input
- Plot forms still use manual text input
