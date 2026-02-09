# API Fetch Locations

## Location 1: Hook File
**File:** `src/hooks/useStateDistrict.ts`

### Line 47-54: Fetch States API
```typescript
const response = await fetch('https://countriesnow.space/api/v0.1/countries/states');
if (!response.ok) throw new Error('Failed to fetch states');

const data = await response.json();
const indiaStates = data.data?.find((country: any) => country.name === 'India')?.states || [];
statesCache = indiaStates;
setStates(indiaStates);
```

### Line 65-73: Fetch Districts API
```typescript
const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ country: 'India', state: selectedState }),
  signal: controller.signal
});

if (!response.ok) throw new Error('Failed to fetch districts');

const data = await response.json();
const cityList = data.data || [];
```

---

## Location 2-7: Forms Using This Hook

### Resale Residential Forms
1. `src/pages/brokerInventory/forms/ResalePropertyForm.tsx` - Uses `useStateDistrict` hook
2. `resale-rentalform/src/ResalePropertyForm.tsx` - Uses `useStateDistrict` hook

### Rental Residential Forms
3. `src/pages/brokerInventory/forms/RentalPropertyForm.tsx` - Uses `useStateDistrict` hook
4. `resale-rentalform/src/RentalPropertyForm.tsx` - Uses `useStateDistrict` hook

### Commercial Forms (Manual Input - NOT using API)
5. `src/pages/brokerInventory/forms/CommercialResalePropertyForm.tsx`
6. `src/pages/brokerInventory/forms/CommercialRentalPropertyForm.tsx`
7. `resale-rentalform/src/CommercialResalePropertyForm.tsx`
8. `resale-rentalform/src/CommercialRentalPropertyForm.tsx`

### Plot Forms (Manual Input - NOT using API)
9. `src/pages/brokerInventory/forms/PlotSalePropertyForm.tsx`
10. `src/pages/brokerInventory/forms/PlotRentalPropertyForm.tsx`
11. `resale-rentalform/src/PlotSalePropertyForm.tsx`
12. `resale-rentalform/src/PlotRentalPropertyForm.tsx`

---

## Summary

**APIs are fetched in:** `src/hooks/useStateDistrict.ts`

**Used by:** Resale & Rental Residential forms (4 forms total)

**Not used by:** Commercial & Plot forms (8 forms - manual input)
