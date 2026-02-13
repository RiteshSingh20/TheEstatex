# Quick Integration Guide - Custom Packages

## Step 1: Add to Admin Panel

Open `src/components/Admin Components/Admin.tsx` and add the import:

```typescript
import ManageCustomPackages from "./ManageCustomPackages";
```

Then add to your admin tabs/sections:

```typescript
<Tab 
  id="custom-packages"
  label="📦 Custom Packages"
  content={<ManageCustomPackages />}
/>
```

## Step 2: Verify Routes

The routes are already added in `src/App.tsx`:
- `/subscription/custom-checkout` - Custom package checkout page

## Step 3: Test the Flow

### Admin Testing:
1. Go to Admin Panel
2. Find "Custom Packages" section
3. Click "New Package"
4. Fill in details:
   - Name: "Test Package"
   - Description: "Test Description"
   - Locations: "Bandra, Andheri"
   - Actual Price: 5000
   - Offer Price: 2500
   - Discounts: 1M=0%, 3M=10%, 6M=20%, 12M=40%
5. Click "Create Package"

### User Testing:
1. Go to Subscription page
2. Scroll down to "Custom Packages" section
3. Click "Select Package"
4. Select different durations from dropdown
5. Verify prices update correctly
6. Click "Pay" to test payment flow

## Step 4: Pricing Calculation Examples

### Example 1: 1 Month
- Base Actual: ₹5000
- Base Offer: ₹2500
- Duration: 1 Month (0% discount)
- **Final Actual:** ₹5000
- **Final Offer:** ₹2500
- **Saved:** ₹2500

### Example 2: 3 Months
- Base Actual: ₹5000
- Base Offer: ₹2500
- Duration: 3 Months (10% discount)
- **Final Actual:** ₹15000 (5000 × 3)
- **Final Offer:** ₹6750 (2500 × 3 × 0.9)
- **Saved:** ₹8250

### Example 3: 1 Year
- Base Actual: ₹5000
- Base Offer: ₹2500
- Duration: 1 Year (40% discount)
- **Final Actual:** ₹60000 (5000 × 12)
- **Final Offer:** ₹18000 (2500 × 12 × 0.6)
- **Saved:** ₹42000

## Step 5: Firestore Setup

No additional setup needed. The system automatically creates:
- Collection: `settings/customPackages/packages`
- Documents: One per package with auto-generated IDs

## Step 6: Verify Integration

Check that these files exist and are updated:
- ✅ `src/pages/CustomPackageCheckout.tsx` - NEW
- ✅ `src/components/Admin Components/ManageCustomPackages.tsx` - NEW
- ✅ `src/pages/Subscription.tsx` - UPDATED (added custom packages section)
- ✅ `src/App.tsx` - UPDATED (added route)

## Troubleshooting

### Issue: Custom packages not showing on subscription page
**Solution:** 
- Check browser console for errors
- Verify Firestore collection path: `settings/customPackages/packages`
- Ensure packages are created with all required fields

### Issue: Prices not updating when duration changes
**Solution:**
- Check that duration discount values are valid numbers
- Verify base prices are set correctly
- Clear browser cache and reload

### Issue: Payment not processing
**Solution:**
- Verify Razorpay key is correct in CustomPackageCheckout.tsx
- Check network tab for payment request
- Ensure user is authenticated

### Issue: Subscription not created after payment
**Solution:**
- Check Firestore write permissions for users collection
- Verify payment completion status
- Check browser console for errors

## File Structure

```
src/
├── pages/
│   ├── CustomPackageCheckout.tsx (NEW)
│   └── Subscription.tsx (UPDATED)
├── components/
│   └── Admin Components/
│       └── ManageCustomPackages.tsx (NEW)
└── App.tsx (UPDATED)
```

## Key Features Summary

✅ Admin creates packages without assigning to users
✅ Users see all available custom packages
✅ Duration dropdown with 4 options (1, 3, 6, 12 months)
✅ Dynamic price calculation based on duration
✅ Duration-based discounts applied automatically
✅ Clear order summary before payment
✅ Secure Razorpay payment integration
✅ Subscription created on successful payment
✅ Responsive design for all devices

## Next Steps

1. Add ManageCustomPackages to Admin Panel
2. Test package creation
3. Test user subscription flow
4. Monitor Firestore for data
5. Adjust discount percentages as needed
6. Train admins on package management

## Support

For issues or questions:
1. Check the CUSTOM_PACKAGE_IMPLEMENTATION.md file
2. Review browser console for errors
3. Check Firestore for data integrity
4. Verify all files are in correct locations
