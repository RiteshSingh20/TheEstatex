# Custom Package Subscription System - Implementation Guide

## Overview
This implementation adds a complete custom package subscription system where admins can create packages without assigning them to specific users. Users can then select packages and choose their subscription duration with dynamic pricing calculations.

## Architecture

### 1. Admin Panel - Package Management
**File:** `src/components/Admin Components/ManageCustomPackages.tsx`

**Features:**
- Create new custom packages with:
  - Package name and description
  - Location list (comma-separated)
  - Actual price and offer price
  - Duration-based discounts (1, 3, 6, 12 months)
- Edit existing packages
- Delete packages
- View all packages in a grid layout

**Data Structure:**
```typescript
interface CustomPackage {
  id: string;
  name: string;
  description: string;
  locations: string[];
  actualPrice: number;
  offerPrice: number;
  durationDiscounts: { 1: number; 3: number; 6: number; 12: number };
  createdAt: string;
}
```

**Firestore Path:** `settings/customPackages/packages/{packageId}`

### 2. User Subscription Page
**File:** `src/pages/Subscription.tsx` (Updated)

**New Features:**
- Displays all custom packages created by admin
- Shows package details:
  - Name and description
  - Actual and offer prices
  - Discount percentage
  - Locations included
  - "Select Package" button

**Integration:**
- Fetches custom packages on component mount
- Displays packages in a dedicated section below standard plans
- Each package card links to checkout page

### 3. Custom Package Checkout
**File:** `src/pages/CustomPackageCheckout.tsx`

**Key Features:**

#### Duration Selection Dropdown
```typescript
const durationOptions = [
  { value: 1, label: "1 Month" },
  { value: 3, label: "3 Months" },
  { value: 6, label: "6 Months" },
  { value: 12, label: "1 Year" }
];
```

#### Dynamic Price Calculation
```typescript
const calculatePrice = (duration: 1 | 3 | 6 | 12) => {
  const baseActualPrice = customPackage.actualPrice;
  const baseOfferPrice = customPackage.offerPrice;
  const discount = customPackage.durationDiscounts[duration] || 0;

  const actualPrice = baseActualPrice * duration;
  const offerPrice = baseOfferPrice * duration * (1 - discount / 100);

  return {
    actualPrice: Math.round(actualPrice),
    offerPrice: Math.round(offerPrice),
    discount: Math.round(discount),
  };
};
```

**Pricing Logic:**
1. Base prices are multiplied by selected duration
2. Duration discount is applied to offer price
3. Actual price shows original cost (for reference)
4. Offer price shows final cost after discount
5. Saved amount = Actual Price - Offer Price

**Example:**
- Package: ₹1000 actual, ₹800 offer
- Duration: 3 months with 10% discount
- Calculation:
  - Actual: 1000 × 3 = ₹3000
  - Offer: 800 × 3 × (1 - 0.10) = ₹2160
  - Saved: ₹840

#### Order Summary
- Shows selected package name
- Displays duration
- Shows actual and offer prices
- Calculates and displays discount percentage
- Shows total amount to pay

#### Payment Integration
- Razorpay integration for secure payments
- Creates subscription record in Firestore
- Tracks payment status
- Redirects to dashboard on success

### 4. Routing
**File:** `src/App.tsx` (Updated)

**New Route:**
```typescript
<Route
  path="subscription/custom-checkout"
  element={
    <ProtectedRoute>
      <CustomPackageCheckout />
    </ProtectedRoute>
  }
/>
```

## Workflow

### Admin Workflow
1. Navigate to Admin Panel
2. Go to "Custom Packages Management" section
3. Click "New Package"
4. Fill in package details:
   - Name: "Premium Mumbai Package"
   - Description: "Access to premium properties in Mumbai"
   - Locations: "Bandra, Andheri, Dadar"
   - Actual Price: ₹5000
   - Offer Price: ₹2500
   - Duration Discounts:
     - 1 Month: 0%
     - 3 Months: 10%
     - 6 Months: 20%
     - 1 Year: 40%
5. Click "Create Package"
6. Package is now available for users

### User Workflow
1. User logs in and goes to Subscription page
2. Sees custom packages section
3. Clicks "Select Package" on desired package
4. Redirected to checkout page
5. Sees duration dropdown with options
6. Selects duration (e.g., "3 Months")
7. Prices update automatically:
   - Actual Price: ₹15,000 (5000 × 3)
   - Offer Price: ₹13,500 (5000 × 3 × 0.9)
   - Discount: 10%
8. Reviews order summary
9. Clicks "Pay" button
10. Razorpay payment modal opens
11. Completes payment
12. Subscription activated
13. Redirected to dashboard

## Key Features

### 1. Dynamic Pricing
- Prices automatically calculate based on selected duration
- Duration discounts are applied on top of base offer price
- Real-time price updates as user changes duration

### 2. Flexible Duration Options
- Users can choose 1, 3, 6, or 12 months
- Each duration can have different discount percentage
- Admin controls all discount percentages

### 3. No User Assignment
- Packages are created globally
- Not assigned to specific users
- All authenticated users can see and purchase

### 4. Order Summary
- Clear breakdown of pricing
- Shows actual vs offer price
- Displays discount percentage
- Shows total amount to pay

### 5. Secure Payment
- Razorpay integration
- SSL encryption
- Payment verification
- Subscription activation on successful payment

## Database Schema

### Custom Packages Collection
```
settings/
  customPackages/
    packages/
      {packageId}/
        - id: string
        - name: string
        - description: string
        - locations: string[]
        - actualPrice: number
        - offerPrice: number
        - durationDiscounts: {
            1: number,
            3: number,
            6: number,
            12: number
          }
        - createdAt: string
```

### Subscription Record (Created on Purchase)
```
users/{userId}/subscriptions/{subscriptionId}
  - userId: string
  - type: "SP" (Special Package)
  - locations: string[]
  - amount: number (offer price)
  - actualPrice: number
  - discountedPrice: number
  - startDate: Timestamp
  - endDate: Timestamp
  - createdAt: Timestamp
  - packageId: string
  - duration: 1 | 3 | 6 | 12
```

## Integration Points

### 1. Admin Panel Integration
Add to admin panel tabs:
```typescript
import ManageCustomPackages from "./ManageCustomPackages";

// In admin component
<Tab label="Custom Packages" content={<ManageCustomPackages />} />
```

### 2. Subscription Page Integration
Already integrated in updated `Subscription.tsx`:
- Fetches packages on mount
- Displays in dedicated section
- Links to checkout

### 3. Navigation
- From subscription page → custom checkout
- From checkout → dashboard (on success)
- From checkout → back to subscription (on cancel)

## UI Components Used

- **Card:** Package display containers
- **Button:** Action buttons (Select, Pay, Cancel)
- **Input:** Form fields for admin
- **Modal:** Package creation/edit dialog
- **Radio Buttons:** Duration selection

## Styling

### Color Scheme
- Primary: Blue (#2563eb)
- Success: Green (#16a34a)
- Warning: Orange (#ea580c)
- Custom: Purple (#a855f7)

### Responsive Design
- Mobile: Single column
- Tablet: 2 columns
- Desktop: 3+ columns

## Error Handling

- Missing package information → redirect to subscription
- Payment failure → show error toast
- Network errors → retry mechanism
- Validation errors → form validation messages

## Future Enhancements

1. **Bulk Operations:** Create multiple packages at once
2. **Package Templates:** Save and reuse package configurations
3. **Seasonal Discounts:** Time-based discount rules
4. **User Tiers:** Different pricing for different user types
5. **Package Analytics:** Track package popularity and revenue
6. **Renewal Management:** Auto-renewal options
7. **Coupon Integration:** Apply coupon codes to packages

## Testing Checklist

- [ ] Admin can create custom package
- [ ] Admin can edit custom package
- [ ] Admin can delete custom package
- [ ] User can see custom packages on subscription page
- [ ] User can select custom package
- [ ] Duration dropdown works correctly
- [ ] Prices calculate correctly for each duration
- [ ] Order summary displays correct information
- [ ] Payment integration works
- [ ] Subscription is created after payment
- [ ] User is redirected to dashboard after payment
- [ ] Subscription appears in user's subscription list
- [ ] Renewal date is calculated correctly

## Troubleshooting

### Packages not showing
- Check Firestore path: `settings/customPackages/packages`
- Verify packages are created with correct structure
- Check browser console for errors

### Prices not calculating
- Verify duration discount values are numbers
- Check that base prices are set correctly
- Ensure duration is selected

### Payment not working
- Verify Razorpay key is correct
- Check network connectivity
- Verify payment record is created before opening Razorpay

### Subscription not created
- Check Firestore write permissions
- Verify user is authenticated
- Check payment completion status
