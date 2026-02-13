# Custom Package System - Visual Guide

## 🎨 User Interface Flow

### 1. Subscription Page - Custom Packages Section

```
┌─────────────────────────────────────────────────────────────┐
│                    Property Access Plans                     │
│                                                               │
│  [RR Plan] [ND Plan] [SP Plan] [Enterprise]                 │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              📦 Custom Packages                       │   │
│  │  Tailored packages created specifically for needs    │   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │ Premium      │  │ Standard     │  │ Enterprise │ │   │
│  │  │ Mumbai       │  │ Package      │  │ Bundle     │ │   │
│  │  │              │  │              │  │            │ │   │
│  │  │ ₹5000        │  │ ₹3000        │  │ ₹8000      │ │   │
│  │  │ ₹2500 offer  │  │ ₹1500 offer  │  │ ₹4000 offer│ │   │
│  │  │              │  │              │  │            │ │   │
│  │  │ Bandra       │  │ Dadar        │  │ All        │ │   │
│  │  │ Andheri      │  │ Borivali     │  │ Locations  │ │   │
│  │  │ Dadar        │  │ Malad        │  │            │ │   │
│  │  │              │  │              │  │            │ │   │
│  │  │[Select]      │  │[Select]      │  │[Select]    │ │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Checkout Page - Duration Selection

```
┌─────────────────────────────────────────────────────────────┐
│                    Premium Mumbai Package                    │
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │   Select Duration        │  │   Order Summary          │ │
│  │                          │  │                          │ │
│  │  ○ 1 Month               │  │  Package: Premium Mumbai │ │
│  │    ₹5,000 → ₹2,500       │  │  Duration: 3 Months      │ │
│  │                          │  │                          │ │
│  │  ● 3 Months              │  │  Actual: ₹15,000         │ │
│  │    10% extra discount     │  │  Discount (10%): -₹1,500 │ │
│  │    ₹15,000 → ₹13,500      │  │                          │ │
│  │                          │  │  Total: ₹13,500          │ │
│  │  ○ 6 Months              │  │                          │ │
│  │    20% extra discount     │  │  [Pay ₹13,500]           │ │
│  │    ₹30,000 → ₹24,000      │  │  [Cancel]                │ │
│  │                          │  │                          │ │
│  │  ○ 1 Year                │  │  🔒 Secure checkout      │ │
│  │    40% extra discount     │  │                          │ │
│  │    ₹60,000 → ₹36,000      │  │                          │ │
│  │                          │  │                          │ │
│  │  Includes:               │  │                          │ │
│  │  • Bandra                │  │                          │ │
│  │  • Andheri               │  │                          │ │
│  │  • Dadar                 │  │                          │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. Admin Panel - Custom Packages Management

```
┌─────────────────────────────────────────────────────────────┐
│  📦 Custom Packages Management              [+ New Package]  │
│  Create and manage custom subscription packages              │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Premium Mumbai   │  │ Standard Package │  │ Enterprise │ │
│  │                  │  │                  │  │ Bundle     │ │
│  │ ₹5000 → ₹2500    │  │ ₹3000 → ₹1500    │  │ ₹8000 →    │ │
│  │ 50% OFF          │  │ 50% OFF          │  │ ₹4000      │ │
│  │                  │  │                  │  │ 50% OFF    │ │
│  │ Locations: 3     │  │ Locations: 3     │  │ Locations: │ │
│  │                  │  │                  │  │ All        │ │
│  │ Discounts:       │  │ Discounts:       │  │ Discounts: │ │
│  │ 1M: 0%           │  │ 1M: 0%           │  │ 1M: 0%     │ │
│  │ 3M: 10%          │  │ 3M: 10%          │  │ 3M: 15%    │ │
│  │ 6M: 20%          │  │ 6M: 20%          │  │ 6M: 25%    │ │
│  │ 12M: 40%         │  │ 12M: 40%         │  │ 12M: 50%   │ │
│  │                  │  │                  │  │            │ │
│  │ [✏️] [🗑️]        │  │ [✏️] [🗑️]        │  │ [✏️] [🗑️]   │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 💰 Pricing Calculation Flow

### Single Package Example

```
Admin Creates Package:
┌─────────────────────────────────────────┐
│ Name: Premium Mumbai Package             │
│ Actual Price: ₹5,000                    │
│ Offer Price: ₹2,500                     │
│ Duration Discounts:                     │
│   1 Month: 0%                           │
│   3 Months: 10%                         │
│   6 Months: 20%                         │
│   1 Year: 40%                           │
└─────────────────────────────────────────┘
                    ↓
User Selects Duration:
┌─────────────────────────────────────────┐
│ Selected: 3 Months                      │
└─────────────────────────────────────────┘
                    ↓
System Calculates:
┌─────────────────────────────────────────┐
│ Base Actual: ₹5,000                     │
│ × Duration: 3                           │
│ = Actual Total: ₹15,000                 │
│                                         │
│ Base Offer: ₹2,500                      │
│ × Duration: 3                           │
│ = ₹7,500                                │
│ × (1 - 10% discount)                    │
│ = Offer Total: ₹6,750                   │
│                                         │
│ Saved: ₹15,000 - ₹6,750 = ₹8,250        │
└─────────────────────────────────────────┘
                    ↓
Display to User:
┌─────────────────────────────────────────┐
│ Actual Price: ₹15,000 (strikethrough)   │
│ Offer Price: ₹6,750 (highlighted)       │
│ Discount: 55% OFF                       │
│ You Save: ₹8,250                        │
└─────────────────────────────────────────┘
```

## 📊 Pricing Comparison Table

```
Duration    Base Actual  Base Offer  Multiplier  Discount  Final Actual  Final Offer  Saved
─────────────────────────────────────────────────────────────────────────────────────────
1 Month     ₹5,000       ₹2,500      1           0%        ₹5,000        ₹2,500       ₹2,500
3 Months    ₹5,000       ₹2,500      3           10%       ₹15,000       ₹6,750       ₹8,250
6 Months    ₹5,000       ₹2,500      6           20%       ₹30,000       ₹12,000      ₹18,000
1 Year      ₹5,000       ₹2,500      12          40%       ₹60,000       ₹18,000      ₹42,000
```

## 🔄 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      ADMIN SIDE                              │
│                                                               │
│  Admin Panel                                                 │
│  ├─ Create Package                                           │
│  │  ├─ Name, Description                                     │
│  │  ├─ Locations                                             │
│  │  ├─ Actual & Offer Prices                                 │
│  │  └─ Duration Discounts                                    │
│  │                                                            │
│  └─ Save to Firestore                                        │
│     └─ settings/customPackages/packages/{id}                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    FIRESTORE DATABASE                        │
│                                                               │
│  settings/customPackages/packages/                           │
│  ├─ pkg-001                                                  │
│  │  ├─ name: "Premium Mumbai"                                │
│  │  ├─ actualPrice: 5000                                     │
│  │  ├─ offerPrice: 2500                                      │
│  │  ├─ locations: ["Bandra", "Andheri", "Dadar"]             │
│  │  └─ durationDiscounts: {1: 0, 3: 10, 6: 20, 12: 40}       │
│  │                                                            │
│  └─ pkg-002                                                  │
│     └─ ...                                                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      USER SIDE                               │
│                                                               │
│  Subscription Page                                           │
│  ├─ Fetch Custom Packages                                    │
│  ├─ Display Package Cards                                    │
│  └─ Click "Select Package"                                   │
│                                                               │
│  Checkout Page                                               │
│  ├─ Show Duration Dropdown                                   │
│  ├─ Calculate Prices                                         │
│  ├─ Display Order Summary                                    │
│  └─ Process Payment                                          │
│                                                               │
│  Payment Success                                             │
│  ├─ Create Subscription Record                               │
│  ├─ Save to users/{userId}/subscriptions/{id}                │
│  └─ Redirect to Dashboard                                    │
└──────────────────────────────────────────────────────────────┘
```

## 🎯 State Management Flow

```
CustomPackageCheckout Component:

┌─────────────────────────────────────────┐
│ State Variables                         │
├─────────────────────────────────────────┤
│ selectedDuration: 1 | 3 | 6 | 12        │
│ customPackage: CustomPackage | null     │
│ isProcessing: boolean                   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ User Selects Duration                   │
│ setSelectedDuration(3)                  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ calculatePrice(3) Called                │
│ Returns:                                │
│ {                                       │
│   actualPrice: 15000,                   │
│   offerPrice: 6750,                     │
│   discount: 10                          │
│ }                                       │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ UI Re-renders with New Prices           │
│ Order Summary Updated                   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ User Clicks "Pay"                       │
│ handlePayment() Called                  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Create Subscription Record              │
│ Create Payment Record                   │
│ Open Razorpay Modal                     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Payment Success                         │
│ Complete Subscription Payment           │
│ Reload User Data                        │
│ Redirect to Dashboard                   │
└─────────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

```
Mobile (< 768px):
┌─────────────────────┐
│  Package 1          │
├─────────────────────┤
│  Package 2          │
├─────────────────────┤
│  Package 3          │
└─────────────────────┘

Tablet (768px - 1024px):
┌──────────────┬──────────────┐
│  Package 1   │  Package 2   │
├──────────────┼──────────────┤
│  Package 3   │  Package 4   │
└──────────────┴──────────────┘

Desktop (> 1024px):
┌──────────┬──────────┬──────────┐
│Package 1 │Package 2 │Package 3 │
├──────────┼──────────┼──────────┤
│Package 4 │Package 5 │Package 6 │
└──────────┴──────────┴──────────┘
```

## 🔐 Security Flow

```
User Request
    ↓
Check Authentication (ProtectedRoute)
    ↓
Verify User is Logged In
    ↓
Load Package Data from Firestore
    ↓
Display Package to User
    ↓
User Selects Duration & Clicks Pay
    ↓
Create Payment Record in Firestore
    ↓
Load Razorpay Script
    ↓
Open Razorpay Payment Modal
    ↓
User Completes Payment
    ↓
Razorpay Returns Payment ID
    ↓
Verify Payment with Backend
    ↓
Create Subscription Record
    ↓
Update User Subscriptions
    ↓
Redirect to Dashboard
```

## 📈 Success Metrics

```
Admin Metrics:
├─ Packages Created: Count
├─ Average Discount: %
├─ Most Popular Duration: 1/3/6/12 months
└─ Revenue per Package: ₹

User Metrics:
├─ Packages Purchased: Count
├─ Average Duration Selected: months
├─ Conversion Rate: %
├─ Average Order Value: ₹
└─ Repeat Purchase Rate: %
```

---

This visual guide helps understand the complete flow of the custom package system from admin creation to user purchase.
