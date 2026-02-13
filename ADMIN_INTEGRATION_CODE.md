# Admin Panel Integration Code

## Add to Admin.tsx

### Step 1: Add Import
Add this at the top of your Admin.tsx file:

```typescript
import ManageCustomPackages from "./ManageCustomPackages";
```

### Step 2: Add Tab/Section

If you're using tabs, add this to your tabs array:

```typescript
{
  id: "custom-packages",
  label: "📦 Custom Packages",
  content: (
    <ManageCustomPackages />
  ),
}
```

Or if you're using a different structure, add it as a section:

```typescript
<div className="mb-8">
  <ManageCustomPackages />
</div>
```

## Complete Example

Here's how it might look in your Admin component:

```typescript
import { useState } from "react";
import ManageCustomPackages from "./ManageCustomPackages";
import PricingTab from "./tabs/PricingTab";
import UsersTab from "./tabs/UsersTab";
import Tabs from "../ui/Tabs";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("pricing");

  return (
    <div className="space-y-6">
      <Tabs
        variant="underline"
        tabs={[
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
        ]}
      />
    </div>
  );
};

export default Admin;
```

## Alternative: Sidebar Navigation

If you use sidebar navigation instead of tabs:

```typescript
import ManageCustomPackages from "./ManageCustomPackages";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("pricing");

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-48 space-y-2">
        <button
          onClick={() => setActiveSection("pricing")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeSection === "pricing" ? "bg-blue-100" : ""
          }`}
        >
          💰 Pricing
        </button>
        <button
          onClick={() => setActiveSection("custom-packages")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeSection === "custom-packages" ? "bg-blue-100" : ""
          }`}
        >
          📦 Custom Packages
        </button>
        <button
          onClick={() => setActiveSection("users")}
          className={`w-full text-left px-4 py-2 rounded ${
            activeSection === "users" ? "bg-blue-100" : ""
          }`}
        >
          👥 Users
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeSection === "pricing" && <PricingTab {...pricingProps} />}
        {activeSection === "custom-packages" && <ManageCustomPackages />}
        {activeSection === "users" && <UsersTab {...usersProps} />}
      </div>
    </div>
  );
};

export default Admin;
```

## Minimal Integration

If you just want to add it quickly without tabs:

```typescript
import ManageCustomPackages from "./ManageCustomPackages";

const Admin = () => {
  return (
    <div className="space-y-8">
      {/* Other admin sections */}
      
      {/* Custom Packages Section */}
      <ManageCustomPackages />
    </div>
  );
};

export default Admin;
```

## Styling Notes

The ManageCustomPackages component includes:
- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Blue gradient header
- Card-based package display
- Modal for create/edit
- Toast notifications for feedback

No additional styling needed - it's self-contained!

## Features Included

✅ Create new packages
✅ Edit existing packages
✅ Delete packages
✅ View all packages in grid
✅ Set duration-based discounts
✅ Manage locations
✅ Real-time price preview
✅ Form validation
✅ Success/error notifications
✅ Responsive design

## Testing After Integration

1. Navigate to Admin Panel
2. Find "Custom Packages" section
3. Click "New Package"
4. Fill in test data:
   ```
   Name: Premium Package
   Description: Premium access to all properties
   Locations: Bandra, Andheri, Dadar
   Actual Price: 5000
   Offer Price: 2500
   Discounts: 1M=0%, 3M=10%, 6M=20%, 12M=40%
   ```
5. Click "Create Package"
6. Verify package appears in grid
7. Go to Subscription page as user
8. Verify package appears in "Custom Packages" section
9. Click "Select Package"
10. Test duration dropdown
11. Verify prices update correctly

## Common Issues & Solutions

### Component not found
- Ensure file is at: `src/components/Admin Components/ManageCustomPackages.tsx`
- Check import path is correct

### Styling looks off
- Ensure Tailwind CSS is configured
- Check that Card, Button, Input components are available
- Verify theme colors are defined

### Packages not saving
- Check Firestore permissions
- Verify database path: `settings/customPackages/packages`
- Check browser console for errors

### Packages not showing on subscription page
- Verify Subscription.tsx is updated
- Check that fetchCustomPackages is called
- Verify Firestore read permissions

## Next Steps

1. ✅ Add import to Admin.tsx
2. ✅ Add ManageCustomPackages to your admin layout
3. ✅ Test package creation
4. ✅ Test user subscription flow
5. ✅ Monitor Firestore for data
6. ✅ Adjust discount percentages as needed
