# Property Approval Workflow - Visual Diagrams

## 1. Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROPERTY APPROVAL WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

                          USER SUBMITS PROPERTY
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │  Check User Role     │
                        └──────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
                  ADMIN        MANAGER      EXECUTIVE
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │ AUTO-APPROVE │ │   PENDING    │ │   PENDING    │
            │ isApproved:  │ │ isApproved:  │ │ isApproved:  │
            │ true         │ │ false        │ │ false        │
            │ status:      │ │ status:      │ │ status:      │
            │ approved     │ │ pending      │ │ pending      │
            └──────────────┘ └──────────────┘ └──────────────┘
                    │             │             │
                    │             └─────┬───────┘
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────────┐
            │ VISIBLE IN   │    │ ADMIN PANEL      │
            │ DASHBOARD    │    │ "PENDING APPROVAL"
            │ IMMEDIATELY  │    │ TAB              │
            └──────────────┘    └──────────────────┘
                                        │
                        ┌───────────────┼───────────────┐
                        │               │               │
                        ▼               ▼               ▼
                    ┌────────┐    ┌────────┐    ┌────────────┐
                    │APPROVE │    │ REJECT │    │   EDIT &   │
                    │        │    │        │    │ RESUBMIT   │
                    └────────┘    └────────┘    └────────────┘
                        │               │               │
                        ▼               ▼               ▼
                    ┌────────┐    ┌────────┐    ┌────────────┐
                    │APPROVED│    │REJECTED│    │  PENDING   │
                    │TAB     │    │TAB     │    │  (AGAIN)   │
                    └────────┘    └────────┘    └────────────┘
                        │               │
                        ▼               ▼
                    ┌────────────────────────┐
                    │ VISIBLE IN DASHBOARD   │
                    │ TO ALL USERS           │
                    └────────────────────────┘
```

---

## 2. Admin Panel View

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROPERTIES TAB                                                 │
│  ├─ Pending Approval (5)  ◄─── NEW PROPERTIES APPEAR HERE     │
│  │  ├─ Project A - Submitted by Manager - [Approve] [Reject]  │
│  │  ├─ Project B - Submitted by Executive - [Approve] [Reject]│
│  │  ├─ Project C - Submitted by Manager - [Approve] [Reject]  │
│  │  ├─ Project D - Submitted by Executive - [Approve] [Reject]│
│  │  └─ Project E - Submitted by Manager - [Approve] [Reject]  │
│  │                                                              │
│  ├─ Approved (12)  ◄─── APPROVED PROPERTIES MOVE HERE         │
│  │  ├─ Project F - Approved by Admin                           │
│  │  ├─ Project G - Approved by Admin                           │
│  │  └─ ... (9 more)                                            │
│  │                                                              │
│  └─ Rejected (2)  ◄─── REJECTED PROPERTIES MOVE HERE          │
│     ├─ Project H - Rejected: "Incomplete information"          │
│     └─ Project I - Rejected: "Invalid location"                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard View (User Perspective)

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER DASHBOARD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NEW PROPERTIES (Filtered)                                      │
│  ├─ Project F - Approved ✓                                     │
│  ├─ Project G - Approved ✓                                     │
│  ├─ Project J - Approved ✓                                     │
│  └─ ... (9 more approved)                                      │
│                                                                 │
│  ❌ PENDING PROPERTIES NOT SHOWN                               │
│  ❌ REJECTED PROPERTIES NOT SHOWN                              │
│                                                                 │
│  Only approved properties visible to users                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    FIRESTORE DATABASE                            │
│                                                                  │
│  TestingCostSheets Collection                                   │
│  ├─ Document: project_001                                       │
│  │  ├─ projectName: "Project A"                                │
│  │  ├─ isApproved: false                                       │
│  │  ├─ approvalStatus: "pending"                               │
│  │  ├─ approvalWorkflow: {                                     │
│  │  │  ├─ status: "pending"                                    │
│  │  │  ├─ submittedBy: "user_123"                              │
│  │  │  ├─ submittedAt: "2024-01-15T10:30:00Z"                 │
│  │  │  └─ submitterRole: "manager"                             │
│  │  ├─ submittedBy: "user_123"                                 │
│  │  └─ submitterRole: "manager"                                │
│  │                                                              │
│  └─ Document: project_002                                       │
│     ├─ projectName: "Project B"                                │
│     ├─ isApproved: true                                        │
│     ├─ approvalStatus: "approved"                              │
│     ├─ approvalWorkflow: {                                     │
│     │  ├─ status: "approved"                                   │
│     │  ├─ submittedBy: "user_456"                              │
│     │  ├─ submittedAt: "2024-01-15T09:00:00Z"                 │
│     │  ├─ approvedBy: "admin_789"                              │
│     │  ├─ approvedAt: "2024-01-15T10:00:00Z"                  │
│     │  └─ submitterRole: "executive"                           │
│     ├─ submittedBy: "user_456"                                 │
│     └─ submitterRole: "executive"                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
    ┌─────────────┐            ┌──────────────┐
    │ ADMIN PANEL │            │  DASHBOARD   │
    │             │            │              │
    │ Shows both  │            │ Shows only   │
    │ pending &   │            │ approved     │
    │ approved    │            │ properties   │
    └─────────────┘            └──────────────┘
```

---

## 5. State Transitions

```
                    ┌─────────────────────────────────────┐
                    │   PROPERTY SUBMISSION               │
                    └─────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ┌──────────────────┐          ┌──────────────────┐
            │  ADMIN SUBMITS   │          │ NON-ADMIN SUBMITS│
            └──────────────────┘          └──────────────────┘
                    │                               │
                    ▼                               ▼
            ┌──────────────────┐          ┌──────────────────┐
            │ APPROVED STATE   │          │ PENDING STATE    │
            │ ✓ isApproved     │          │ ✗ isApproved     │
            │ ✓ status:        │          │ ✗ status:        │
            │   approved       │          │   pending        │
            └──────────────────┘          └──────────────────┘
                    │                               │
                    │                   ┌───────────┼───────────┐
                    │                   │           │           │
                    │                   ▼           ▼           ▼
                    │            ┌────────┐  ┌────────┐  ┌──────────┐
                    │            │APPROVE │  │ REJECT │  │   EDIT   │
                    │            └────────┘  └────────┘  └──────────┘
                    │                   │           │           │
                    │                   ▼           ▼           ▼
                    │            ┌────────┐  ┌────────┐  ┌──────────┐
                    │            │APPROVED│  │REJECTED│  │ PENDING  │
                    │            └────────┘  └────────┘  │ (AGAIN)  │
                    │                                     └──────────┘
                    │                                           │
                    └───────────────────┬───────────────────────┘
                                        │
                                        ▼
                            ┌──────────────────────┐
                            │ VISIBLE IN DASHBOARD │
                            │ TO ALL USERS         │
                            └──────────────────────┘
```

---

## 6. Role-Based Visibility

```
┌──────────────────────────────────────────────────────────────────┐
│                    ROLE-BASED PROPERTY VISIBILITY                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ADMIN                                                           │
│  ├─ Dashboard: ✓ All approved properties                        │
│  ├─ Admin Panel: ✓ Pending, Approved, Rejected                 │
│  └─ Own Properties: ✓ Auto-approved                             │
│                                                                  │
│  MANAGER                                                         │
│  ├─ Dashboard: ✓ All approved properties                        │
│  ├─ Admin Panel: ✓ Own pending, Approved, Rejected              │
│  └─ Own Properties: ⏳ Pending approval                          │
│                                                                  │
│  EXECUTIVE                                                       │
│  ├─ Dashboard: ✓ All approved properties                        │
│  ├─ Admin Panel: ✓ Own pending, Approved, Rejected              │
│  └─ Own Properties: ⏳ Pending approval                          │
│                                                                  │
│  REGULAR USER                                                    │
│  ├─ Dashboard: ✓ All approved properties                        │
│  ├─ Admin Panel: ❌ No access                                   │
│  └─ Own Properties: ⏳ Pending approval (if submitted)           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Approval Status Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│              PROPERTY APPROVAL STATUS INDICATORS                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PENDING STATE                                                  │
│  ├─ isApproved: false                                          │
│  ├─ approvalStatus: "pending"                                  │
│  ├─ approvalWorkflow.status: "pending"                         │
│  ├─ Location: Admin Panel "Pending Approval" tab               │
│  └─ Visible to: Admin, Submitter, Manager (if manager)         │
│                                                                 │
│  APPROVED STATE                                                 │
│  ├─ isApproved: true                                           │
│  ├─ approvalStatus: "approved"                                 │
│  ├─ approvalWorkflow.status: "approved"                        │
│  ├─ Location: Admin Panel "Approved" tab + Dashboard           │
│  └─ Visible to: Everyone                                       │
│                                                                 │
│  REJECTED STATE                                                 │
│  ├─ isApproved: false                                          │
│  ├─ approvalStatus: "rejected"                                 │
│  ├─ approvalWorkflow.status: "rejected"                        │
│  ├─ Location: Admin Panel "Rejected" tab                       │
│  └─ Visible to: Admin, Submitter                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Filter Logic Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              DASHBOARD PROPERTY FILTER LOGIC                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Load All Properties from Firestore                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────┐                  │
│  │ Check Approval Status                   │                  │
│  │ if (isApproved === true                 │                  │
│  │     OR approvalStatus === "approved"    │                  │
│  │     OR approvalWorkflow?.status ===     │                  │
│  │         "approved")                     │                  │
│  └─────────────────────────────────────────┘                  │
│           │                                                     │
│      ┌────┴────┐                                               │
│      │          │                                               │
│      ▼          ▼                                               │
│    YES         NO                                              │
│      │          │                                               │
│      │          └──► EXCLUDE FROM DASHBOARD                   │
│      │                                                          │
│      ▼                                                          │
│  Apply Other Filters                                           │
│  ├─ Location                                                   │
│  ├─ Property Type                                              │
│  ├─ Budget                                                     │
│  ├─ Amenities                                                  │
│  └─ ... (other filters)                                        │
│      │                                                          │
│      ▼                                                          │
│  Display in Dashboard                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
