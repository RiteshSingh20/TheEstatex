# Code Snippets for Quick Integration

## 1. Add to Admin.tsx

### Import Statement
```typescript
import ManageCustomPackages from "./ManageCustomPackages";
```

### Add to Tabs Array
```typescript
{
  id: "custom-packages",
  label: "📦 Custom Packages",
  content: (
    <ManageCustomPackages />
  ),
}
```

### Complete Tab Example
```typescript
const tabs = [
  {
    id: "pricing",
    label: "💰 Pricing",
    content: <PricingTab {...pricingProps} />,
  },
  {
    id: "custom-packages",
    label: "📦 Custom Packages",
    content: <ManageCustomPackages />,
  },
  {
    id: "users",
    label: "👥 Users",
    content: <UsersTab {...usersProps} />,
  },
];
```

## 2. Verify App.tsx Route

The route should already be added. Verify it exists:

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

## 3. Test Data for Admin

Use this to test package creation:

```javascript
{
  name: "Premium Mumbai Package",
  description: "Premium access to all properties in Mumbai",
  locations: "Bandra, Andheri, Dadar, Borivali, Malad",
  actualPrice: "5000",
  offerPrice: "2500",
  discount1: "0",
  discount3: "10",
  discount6: "20",
  discount12: "40"
}
```

## 4. Test Data for User

Expected pricing calculations:

```javascript
// 1 Month
{
  duration: 1,
  actualPrice: 5000,
  offerPrice: 2500,
  discount: 0,
  saved: 2500
}

// 3 Months
{
  duration: 3,
  actualPrice: 15000,
  offerPrice: 6750,
  discount: 10,
  saved: 8250
}

// 6 Months
{
  duration: 6,
  actualPrice: 30000,
  offerPrice: 12000,
  discount: 20,
  saved: 18000
}

// 1 Year
{
  duration: 12,
  actualPrice: 60000,
  offerPrice: 18000,
  discount: 40,
  saved: 42000
}
```

## 5. Firestore Security Rules

Add these rules to allow package management:

```javascript
// Allow admins to read/write custom packages
match /settings/customPackages/packages/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.role in ['admin', 'manager'];
}

// Allow users to read subscriptions
match /users/{userId}/subscriptions/{document=**} {
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;
}
```

## 6. Environment Variables

No additional environment variables needed. Ensure these exist:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 7. Testing Script

Run these tests in browser console:

```javascript
// Test 1: Check if component loads
console.log('CustomPackageCheckout loaded:', typeof CustomPackageCheckout);

// Test 2: Check Firestore connection
db.collection('settings').doc('customPackages').collection('packages').get()
  .then(snap => console.log('Packages found:', snap.size))
  .catch(err => console.error('Error:', err));

// Test 3: Test price calculation
const calculatePrice = (baseActual, baseOffer, duration, discount) => {
  const actual = baseActual * duration;
  const offer = baseOffer * duration * (1 - discount / 100);
  return { actual, offer, saved: actual - offer };
};

console.log('3 Month pricing:', calculatePrice(5000, 2500, 3, 10));
```

## 8. Database Query Examples

### Get all packages
```javascript
const packages = await getDocs(
  collection(db, "settings", "customPackages", "packages")
);
packages.forEach(doc => console.log(doc.data()));
```

### Get user subscriptions
```javascript
const subscriptions = await getDocs(
  collection(db, `users/${userId}/subscriptions`)
);
subscriptions.forEach(doc => console.log(doc.data()));
```

### Create test package
```javascript
await setDoc(
  doc(db, "settings", "customPackages", "packages", "test-pkg-001"),
  {
    name: "Test Package",
    description: "Test Description",
    locations: ["Bandra", "Andheri"],
    actualPrice: 5000,
    offerPrice: 2500,
    durationDiscounts: { 1: 0, 3: 10, 6: 20, 12: 40 },
    createdAt: new Date().toISOString()
  }
);
```

## 9. Error Handling Examples

### Handle missing package
```typescript
if (!location.state?.customPackage) {
  toast.error("Missing package information");
  navigate("/subscription");
  return;
}
```

### Handle payment failure
```typescript
catch (error) {
  toast.error("Payment failed. Please try again.");
  console.error("Payment error:", error);
}
```

### Handle Firestore errors
```typescript
try {
  // Firestore operation
} catch (error) {
  if (error.code === 'permission-denied') {
    toast.error("You don't have permission to perform this action");
  } else if (error.code === 'not-found') {
    toast.error("Package not found");
  } else {
    toast.error("An error occurred. Please try again.");
  }
}
```

## 10. Debugging Tips

### Enable Firestore logging
```javascript
import { enableLogging } from 'firebase/firestore';
enableLogging(true);
```

### Log component state
```typescript
useEffect(() => {
  console.log('Selected Duration:', selectedDuration);
  console.log('Current Pricing:', calculatePrice(selectedDuration));
}, [selectedDuration]);
```

### Monitor Razorpay
```javascript
window.Razorpay = new Proxy(window.Razorpay, {
  construct(target, args) {
    console.log('Razorpay initialized with:', args[0]);
    return new target(...args);
  }
});
```

## 11. Performance Optimization

### Memoize price calculation
```typescript
const currentPricing = useMemo(
  () => calculatePrice(selectedDuration),
  [selectedDuration, customPackage]
);
```

### Lazy load packages
```typescript
const customPackages = lazy(() => 
  import('./CustomPackages').then(m => ({ default: m.CustomPackages }))
);
```

## 12. Accessibility Improvements

### Add ARIA labels
```typescript
<select
  aria-label="Select subscription duration"
  value={selectedDuration}
  onChange={(e) => setSelectedDuration(Number(e.target.value))}
>
  {/* options */}
</select>
```

### Add keyboard navigation
```typescript
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    handlePayment();
  }
};
```

## 13. Analytics Events

### Track package selection
```typescript
const trackPackageSelection = (packageId, duration) => {
  // Send to analytics
  console.log('Package selected:', { packageId, duration });
};
```

### Track payment completion
```typescript
const trackPaymentSuccess = (packageId, amount) => {
  // Send to analytics
  console.log('Payment successful:', { packageId, amount });
};
```

## 14. Backup & Recovery

### Export packages
```javascript
const exportPackages = async () => {
  const packages = await getDocs(
    collection(db, "settings", "customPackages", "packages")
  );
  const data = packages.docs.map(doc => doc.data());
  console.log(JSON.stringify(data, null, 2));
};
```

### Restore packages
```javascript
const restorePackages = async (data) => {
  for (const pkg of data) {
    await setDoc(
      doc(db, "settings", "customPackages", "packages", pkg.id),
      pkg
    );
  }
};
```

## 15. Quick Troubleshooting Commands

```javascript
// Check if component is mounted
console.log('Component mounted:', document.querySelector('[data-testid="custom-checkout"]'));

// Check Firestore connection
db.collection('settings').get().then(() => console.log('Firestore OK'));

// Check Razorpay
console.log('Razorpay available:', typeof window.Razorpay !== 'undefined');

// Check authentication
auth.currentUser ? console.log('User:', auth.currentUser.email) : console.log('Not authenticated');

// Check localStorage
console.log('Stored data:', localStorage.getItem('customPackageData'));
```

---

**Copy these snippets as needed for quick integration and testing.**
