import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  writeBatch,
  serverTimestamp,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { CostSheet, StampDutyRate } from "../../src/pages/Compare";
import { UserRole } from "../../src/types";
import { toast } from "react-toastify";
import { ResaleFormData } from "../utils/api";

// ==================== Property Listing Functions ====================
export const addResaleProperty = async (
  userId: string,
  property: ResaleFormData
) => {
  const { direction, ...rest } = property;

  // Combine station and direction if direction exists
  const stationWithDirection = direction
    ? `${rest.station} ${direction}`
    : rest.station;

  const resaleCollection = collection(db, "users", userId, "resaleProperties");
  const docRef = await addDoc(resaleCollection, {
    ...rest,
    station: stationWithDirection, // Store combined station name
    amenities: property.amenities || [], // Ensure amenities is always an array
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const deleteResaleProperty = async (
  userId: string,
  propertyId: string
): Promise<void> => {
  const propertyRef = doc(db, "users", userId, "resaleProperties", propertyId);
  await deleteDoc(propertyRef);
};

export const deleteRentalProperty = async (
  userId: string,
  propertyId: string
): Promise<void> => {
  const propertyRef = doc(db, "users", userId, "rentalProperties", propertyId);
  await deleteDoc(propertyRef);
};

export const addRentalProperty = async (userId: string, property: any) => {
  const { status, ...rest } = property;
  const rentalCollection = collection(db, "users", userId, "rentalProperties");
  const docRef = await addDoc(rentalCollection, {
    ...rest,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateUserListingState = async (
  userId: string,
  category: "resale" | "rental",
  propertyId: string,
  userListingState: string
) => {
  const propertyRef = doc(
    db,
    "users",
    userId,
    category === "resale" ? "resaleProperties" : "rentalProperties",
    propertyId
  );
  await updateDoc(propertyRef, {
    userListingState,
    updatedAt: serverTimestamp(),
  });
};

type UpdatablePropertyFields = {
  isApproved?: boolean;
  listingState?: string;
  userListingState?: string;
  updatedAt?: string;
};

export const updatePropertyStatus = async (
  userId: string,
  category: "resale" | "rental",
  propertyId: string,
  data: UpdatablePropertyFields
) => {
  const propertyRef = doc(
    db,
    "users",
    userId,
    category === "resale" ? "resaleProperties" : "rentalProperties",
    propertyId
  );
  await updateDoc(propertyRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const updateResaleProperty = async (
  userId: string,
  propertyId: string,
  data: Record<string, any>,
  options: { skipApprovalReset?: boolean } = {}
) => {
  if (!userId || !propertyId) {
    throw new Error(
      `Invalid parameters: userId=${userId}, propertyId=${propertyId}`
    );
  }

  const { ...rest } = data;
  const docRef = doc(db, "users", userId, "resaleProperties", propertyId);

  // Check if document exists
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Property not found: ${propertyId}`);
  }

  const payload: Record<string, any> = {
    ...rest,
    updatedAt: serverTimestamp(),
  };

  if (!options.skipApprovalReset) {
    payload.isApproved = false;
  }

  await updateDoc(docRef, payload);
};

export const updateRentalProperty = async (
  userId: string,
  propertyId: string,
  data: Record<string, any>,
  options: { skipApprovalReset?: boolean } = {}
) => {
  if (!userId || !propertyId) {
    throw new Error(
      `Invalid parameters: userId=${userId}, propertyId=${propertyId}`
    );
  }

  const { ...rest } = data;
  const docRef = doc(db, "users", userId, "rentalProperties", propertyId);

  // Check if document exists
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Property not found: ${propertyId}`);
  }

  const payload: Record<string, any> = {
    ...rest,
    updatedAt: serverTimestamp(),
  };

  if (!options.skipApprovalReset) {
    payload.isApproved = false;
  }

  await updateDoc(docRef, payload);
};

export const approveProperty = async (
  userId: string,
  category: "resale" | "rental",
  propertyId: string
) => {
  const propertyRef = doc(
    db,
    "users",
    userId,
    category === "resale" ? "resaleProperties" : "rentalProperties",
    propertyId
  );
  await updateDoc(propertyRef, {
    isApproved: true,
    updatedAt: serverTimestamp(),
  });
};

export const addAdminApproval = async (
  category: "resale" | "rental",
  property: any
) => {
  const adminApprovalsCollection = collection(db, "adminApprovals");
  const docRef = await addDoc(adminApprovalsCollection, {
    ...property,
    category,
    createdAt: serverTimestamp(),
    status: "pending",
  });
  return docRef.id;
};

// ==================== User Functions ====================
export const getUsers = async (): Promise<any[]> => {
  const usersCollection = collection(db, "users");
  const querySnapshot = await getDocs(usersCollection);
  const users = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Fetch property counts for each user
  const usersWithCounts = await Promise.all(
    users.map(async (user) => {
      try {
        const [resaleSnapshot, rentalSnapshot] = await Promise.all([
          getDocs(collection(db, `users/${user.id}/resaleProperties`)),
          getDocs(collection(db, `users/${user.id}/rentalProperties`)),
        ]);
        return {
          ...user,
          resalePropertiesCount: resaleSnapshot.size,
          rentalPropertiesCount: rentalSnapshot.size,
        };
      } catch (error) {
        return {
          ...user,
          resalePropertiesCount: 0,
          rentalPropertiesCount: 0,
        };
      }
    })
  );

  return usersWithCounts;
};

export const updateUserSubscriptionStatus = async (
  userId: string,
  hasActiveSubscription: boolean
) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    hasActiveSubscription,
    subscriptionUpdatedAt: serverTimestamp(),
  });
};

// ==================== Property Fetching Functions ====================
export const getResaleProperties = async (userId: string): Promise<any[]> => {
  const resaleCollection = collection(db, "users", userId, "resaleProperties");
  const querySnapshot = await getDocs(resaleCollection);
  return querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
};

export const getRentalProperties = async (userId: string): Promise<any[]> => {
  const rentalCollection = collection(db, "users", userId, "rentalProperties");
  const querySnapshot = await getDocs(rentalCollection);
  return querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
};

// Get user's resale properties for modal display
export const getUserResaleProperties = async (
  userId: string
): Promise<any[]> => {
  const resaleCollection = collection(db, "users", userId, "resaleProperties");
  const q = query(resaleCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
};

// Get user's rental properties for modal display
export const getUserRentalProperties = async (
  userId: string
): Promise<any[]> => {
  const rentalCollection = collection(db, "users", userId, "rentalProperties");
  const q = query(rentalCollection, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
};

export const getResalePropertiesByLocations = async (
  locations: string[]
): Promise<any[]> => {
  const users = await getUsers();
  const results: any[] = [];

  // Chunk locations into groups of 10
  const chunkArray = (arr: string[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const locationChunks = chunkArray(locations, 10);

  for (const user of users) {
    const resaleCollection = collection(
      db,
      "users",
      user.id,
      "resaleProperties"
    );

    for (const chunk of locationChunks) {
      const q = query(
        resaleCollection,
        where("roadLocation", "in", chunk),
        where("isApproved", "==", true)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        results.push({ docId: doc.id, ...doc.data() });
      });
    }
  }
  return results;
};

export const getRentalPropertiesByLocations = async (
  locations: string[]
): Promise<any[]> => {
  const users = await getUsers();
  const results: any[] = [];

  // Chunk locations into groups of 10
  const chunkArray = (arr: string[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const locationChunks = chunkArray(locations, 10);

  for (const user of users) {
    const rentalCollection = collection(
      db,
      "users",
      user.id,
      "rentalProperties"
    );

    for (const chunk of locationChunks) {
      const q = query(
        rentalCollection,
        where("roadLocation", "in", chunk),
        where("isApproved", "==", true)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        results.push({ docId: doc.id, ...doc.data() });
      });
    }
  }
  return results;
};

// ==================== Cost Sheet Functions ====================
export const addCostSheet = async (data: any) => {
  const costSheetCollection = collection(db, "TestingCostSheets");
  await addDoc(costSheetCollection, {
    ...data,
    createdAt: serverTimestamp(),
  });
};

// Unified function to get all cost sheets from both collections
export const getAllCostSheets = async (): Promise<any[]> => {
  const [oldSheets, newSheets] = await Promise.all([
    getOldCostSheets(),
    getNewCostSheets()
  ]);
  
  return [
    ...oldSheets.map(sheet => ({ ...sheet, dataVersion: 'v1', collection: 'costSheets' })),
    ...newSheets.map(sheet => ({ ...sheet, dataVersion: 'v2', collection: 'TestingCostSheets' }))
  ];
};

// Get old structure cost sheets
export const getOldCostSheets = async (): Promise<any[]> => {
  const costSheetCollection = collection(db, "costSheets");
  const querySnapshot = await getDocs(costSheetCollection);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Get new structure cost sheets
export const getNewCostSheets = async (): Promise<any[]> => {
  const costSheetCollection = collection(db, "TestingCostSheets");
  const querySnapshot = await getDocs(costSheetCollection);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Legacy function for backward compatibility
export const getCostSheets = async (): Promise<any[]> => {
  return getNewCostSheets();
};

// Update cost sheet (handles both versions)
export const updateCostSheet = async (id: string, data: any, version: 'v1' | 'v2') => {
  const collectionName = version === 'v1' ? 'costSheets' : 'TestingCostSheets';
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

// Delete cost sheet (handles both versions)
export const deleteCostSheet = async (id: string, version: 'v1' | 'v2') => {
  const collectionName = version === 'v1' ? 'costSheets' : 'TestingCostSheets';
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Get single cost sheet by ID and version
export const getCostSheetById = async (id: string, version: 'v1' | 'v2') => {
  const collectionName = version === 'v1' ? 'costSheets' : 'TestingCostSheets';
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Get all cost sheets with the same project name from old format (v1)
export const getCostSheetsByProjectName = async (projectName: string): Promise<any[]> => {
  const costSheetCollection = collection(db, "costSheets");
  const q = query(costSheetCollection, where("projectName", "==", projectName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ==================== Subscription & Payment Functions ====================
// Add this function to fetch active subscriptions
export const getUserActiveSubscriptions = async (
  userId: string
): Promise<{
  rrLocations: string[]; // for resale/rental
  ndLocations: string[]; // for new development
  allSubscriptions: Subscription[];
}> => {
  try {
    const subscriptionsRef = collection(db, `users/${userId}/subscriptions`);
    const now = Timestamp.now();

    const q = query(
      subscriptionsRef,
      where("status", "==", "active"),
      where("endDate", ">", now)
    );

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscription[];

    const rrLocations = new Set<string>();
    const ndLocations = new Set<string>();

    for (const sub of docs) {
      const locs = (sub.locations || []).map((l) => l.trim().toLowerCase());

      if (sub.type === "RR") {
        locs.forEach((l) => rrLocations.add(l));
      } else if (sub.type === "ND") {
        locs.forEach((l) => ndLocations.add(l));
      }
    }

    return {
      rrLocations: Array.from(rrLocations),
      ndLocations: Array.from(ndLocations),
      allSubscriptions: docs,
    };
  } catch (error) {
    toast.error("Failed to load active subscriptions");
    return {
      rrLocations: [],
      ndLocations: [],
      allSubscriptions: [],
    };
  }
};

export const createSubscription = async (
  userId: string,
  subscriptionData: Omit<Subscription, "id" | "status" | "createdAt">
): Promise<string> => {
  try {
    const subscriptionsRef = collection(db, "users", userId, "subscriptions");
    const docRef = await addDoc(subscriptionsRef, {
      ...subscriptionData,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error("Failed to create subscription");
  }
};

export const createPaymentRecord = async (
  userId: string,
  paymentData: Omit<Payment, "id" | "createdAt" | "status">
): Promise<string> => {
  try {
    const paymentsRef = collection(db, "users", userId, "payments");
    const docRef = await addDoc(paymentsRef, {
      ...paymentData,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error("Failed to create payment record");
  }
};

export const completeSubscriptionPayment = async (
  userId: string,
  subscriptionId: string,
  paymentId: string,
  transactionId: string
): Promise<void> => {
  const batch = writeBatch(db);

  // Update subscription status
  const subscriptionRef = doc(
    db,
    "users",
    userId,
    "subscriptions",
    subscriptionId
  );
  batch.update(subscriptionRef, {
    status: "active",
    paymentId,
    updatedAt: serverTimestamp(),
  });

  // Update payment status
  const paymentRef = doc(db, "users", userId, "payments", paymentId);
  batch.update(paymentRef, {
    status: "completed",
    transactionId,
    completedAt: serverTimestamp(),
  });

  // Update user's active status
  const userRef = doc(db, "users", userId);
  batch.update(userRef, {
    hasActiveSubscription: true,
    lastPaymentDate: serverTimestamp(),
  });

  await batch.commit();
};

export const getActiveSubscriptions = async (
  userId: string
): Promise<Subscription[]> => {
  const subscriptionsRef = collection(db, "users", userId, "subscriptions");
  const q = query(
    subscriptionsRef,
    where("status", "==", "active"),
    where("endDate", ">", Timestamp.now())
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as Subscription;
    const { id: _id, ...rest } = data;
    return {
      id: doc.id,
      ...rest,
    };
  });
};

export const getExpiringSubscriptions = async (
  days = 3
): Promise<{ userId: string; subscriptions: Subscription[] }[]> => {
  const now = new Date();
  const expirationThreshold = new Date();
  expirationThreshold.setDate(now.getDate() + days);

  const users = await getUsers();
  const results: { userId: string; subscriptions: Subscription[] }[] = [];

  for (const user of users) {
    const subscriptionsRef = collection(db, "users", user.id, "subscriptions");
    const q = query(
      subscriptionsRef,
      where("status", "==", "active"),
      where("endDate", ">=", Timestamp.fromDate(now)),
      where("endDate", "<=", Timestamp.fromDate(expirationThreshold))
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      results.push({
        userId: user.id,
        subscriptions: querySnapshot.docs.map((doc) => {
          const { id: _id, ...rest } = doc.data() as Subscription;
          return {
            id: doc.id,
            ...rest,
          };
        }),
      });
    }
  }

  return results;
};

export const renewSubscription = async (
  userId: string,
  subscriptionId: string,
  paymentData: {
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
  }
): Promise<void> => {
  const batch = writeBatch(db);

  // Get existing subscription
  const subscriptionRef = doc(
    db,
    "users",
    userId,
    "subscriptions",
    subscriptionId
  );
  const subscriptionSnap = await getDoc(subscriptionRef);

  if (!subscriptionSnap.exists()) {
    throw new Error("Subscription not found");
  }

  const subscription = subscriptionSnap.data() as Subscription;
  const now = new Date();

  // Calculate new end date based on subscription type
  let newEndDate = new Date();
  if (subscription.type === "RR") {
    newEndDate.setFullYear(now.getFullYear() + 1);
  } else {
    newEndDate.setMonth(now.getMonth() + 1);
  }

  // Create new payment record
  const paymentsRef = collection(db, "users", userId, "payments");
  const paymentDocRef = doc(paymentsRef);
  batch.set(paymentDocRef, {
    ...paymentData,
    status: "completed",
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
    subscriptionId,
  });

  // Update subscription
  batch.update(subscriptionRef, {
    status: "active",
    startDate: Timestamp.fromDate(now),
    endDate: Timestamp.fromDate(newEndDate),
    paymentId: paymentDocRef.id,
    updatedAt: serverTimestamp(),
  });

  // Update user record
  const userRef = doc(db, "users", userId);
  batch.update(userRef, {
    lastPaymentDate: serverTimestamp(),
  });

  await batch.commit();
};

export const cancelSubscription = async (
  userId: string,
  subscriptionId: string
): Promise<void> => {
  const subscriptionRef = doc(
    db,
    "users",
    userId,
    "subscriptions",
    subscriptionId
  );
  await updateDoc(subscriptionRef, {
    status: "canceled",
    canceledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getPaymentHistory = async (userId: string): Promise<Payment[]> => {
  const paymentsRef = collection(db, "users", userId, "payments");
  const q = query(paymentsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const { id: _id, ...rest } = doc.data() as Payment;
    return {
      id: doc.id,
      ...rest,
    };
  });
};

// ==================== Pricing Functions ====================
export const getPricing = async () => {
  const docRef = doc(db, "settings", "pricing");
  const snap = await getDoc(docRef);
  return snap.exists()
    ? snap.data()
    : {
        rentalResalePrice: 2500,
        newPropertyPrice: 1500,
        resalePrice: 2500,
        rentalPrice: 2500,
        newPropertyPricing: {},
      };
};

export const setPricing = async (pricing: {
  rentalResalePrice?: number;
  newPropertyPrice?: number;
  resalePrice?: number;
  rentalPrice?: number;
  newPropertyPricing?: { [key: string]: number };
}) => {
  const docRef = doc(db, "settings", "pricing");
  await setDoc(docRef, pricing, { merge: true });
};

export const makeAdmin = async (userId: string): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    isAdmin: true,
    updatedAt: serverTimestamp(),
  });
};

export const removeAdmin = async (userId: string): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    isAdmin: false,
    updatedAt: serverTimestamp(),
  });
};

export const getStampDutyRates = async (): Promise<StampDutyRate[]> => {
  const snapshot = await getDocs(collection(db, "stampDutyRates"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      location: data.location,
      jurisdiction: data.jurisdiction,
      rate: data.rate,
    } as StampDutyRate;
  });
};

export const setStampDutyRate = async (
  location: string,
  jurisdiction: string,
  rate: number
) => {
  const ref = doc(collection(db, "stampDutyRates"));
  await setDoc(ref, { location, jurisdiction, rate });
};

// ==================== Roles and access ====================
export const updateUserRole = async (userId: string, role: UserRole) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { role });
};

// ==================== Enhanced Property Approval Functions ====================
export const approvePropertyWithWorkflow = async (
  userId: string,
  category: "resale" | "rental",
  propertyId: string,
  approverId: string,
  approverRole: UserRole
) => {
  const propertyRef = doc(
    db,
    "users",
    userId,
    category === "resale" ? "resaleProperties" : "rentalProperties",
    propertyId
  );

  // Get current property data
  const propertyDoc = await getDoc(propertyRef);
  if (!propertyDoc.exists()) {
    throw new Error("Property not found");
  }

  const propertyData = propertyDoc.data();
  const submitterRole = propertyData.submitterRole || "executive";

  // Determine if this is final approval
  const isManagerApproval =
    approverRole === "manager" && submitterRole === "executive";
  const isAdminApproval = approverRole === "admin";
  const isFinalApproval =
    isAdminApproval || (isManagerApproval && submitterRole === "executive");

  await updateDoc(propertyRef, {
    isApproved: isFinalApproval,
    [`approvedBy_${approverRole}`]: approverId,
    [`approvedAt_${approverRole}`]: serverTimestamp(),
    currentApprovalLevel: approverRole,
    nextApprovalLevel: isFinalApproval ? null : "admin",
    updatedAt: serverTimestamp(),
  });
};

export const rejectPropertyWithReason = async (
  userId: string,
  category: "resale" | "rental",
  propertyId: string,
  rejectorId: string,
  rejectorRole: UserRole,
  reason: string
) => {
  const propertyRef = doc(
    db,
    "users",
    userId,
    category === "resale" ? "resaleProperties" : "rentalProperties",
    propertyId
  );

  await updateDoc(propertyRef, {
    isApproved: false,
    rejectedBy: rejectorId,
    rejectedAt: serverTimestamp(),
    rejectionReason: reason,
    rejectorRole: rejectorRole,
    currentApprovalLevel: null,
    nextApprovalLevel: null,
    updatedAt: serverTimestamp(),
  });
};

// Get properties pending approval for a specific role
export const getPropertiesPendingApproval = async (
  approverRole: UserRole
): Promise<any[]> => {
  const users = await getUsers();
  const results: any[] = [];

  for (const user of users) {
    // Get resale properties
    const resaleCollection = collection(
      db,
      "users",
      user.id,
      "resaleProperties"
    );
    let resaleQuery;

    if (approverRole === "admin") {
      // Admin sees all pending properties
      resaleQuery = query(resaleCollection, where("isApproved", "==", false));
    } else if (approverRole === "manager") {
      // Manager sees executive submissions that need manager approval
      resaleQuery = query(
        resaleCollection,
        where("isApproved", "==", false),
        where("submitterRole", "==", "executive")
      );
    } else {
      continue; // Other roles don't approve properties
    }

    const resaleSnapshot = await getDocs(resaleQuery);
    resaleSnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
        category: "resale",
        ownerInfo: { id: user.id, name: user.fullName, email: user.email },
      });
    });

    // Get rental properties with same logic
    const rentalCollection = collection(
      db,
      "users",
      user.id,
      "rentalProperties"
    );
    let rentalQuery;

    if (approverRole === "admin") {
      rentalQuery = query(rentalCollection, where("isApproved", "==", false));
    } else if (approverRole === "manager") {
      rentalQuery = query(
        rentalCollection,
        where("isApproved", "==", false),
        where("submitterRole", "==", "executive")
      );
    } else {
      continue;
    }

    const rentalSnapshot = await getDocs(rentalQuery);
    rentalSnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
        category: "rental",
        ownerInfo: { id: user.id, name: user.fullName, email: user.email },
      });
    });
  }

  return results;
};

// Add submitter role when creating properties
export const addResalePropertyWithRole = async (
  userId: string,
  property: any,
  submitterRole: UserRole
) => {
  const { direction, ...rest } = property;
  const stationWithDirection = direction
    ? `${rest.station} ${direction}`
    : rest.station;

  const resaleCollection = collection(db, "users", userId, "resaleProperties");
  const docRef = await addDoc(resaleCollection, {
    ...rest,
    station: stationWithDirection,
    amenities: property.amenities || [],
    userId,
    submitterRole,
    isApproved: submitterRole === "admin", // Auto-approve admin submissions
    currentApprovalLevel: null,
    nextApprovalLevel:
      submitterRole === "admin"
        ? null
        : submitterRole === "executive"
        ? "manager"
        : "admin",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const addRentalPropertyWithRole = async (
  userId: string,
  property: any,
  submitterRole: UserRole
) => {
  const { status, ...rest } = property;
  const rentalCollection = collection(db, "users", userId, "rentalProperties");
  const docRef = await addDoc(rentalCollection, {
    ...rest,
    userId,
    submitterRole,
    isApproved: submitterRole === "admin", // Auto-approve admin submissions
    currentApprovalLevel: null,
    nextApprovalLevel:
      submitterRole === "admin"
        ? null
        : submitterRole === "executive"
        ? "manager"
        : "admin",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// ==================== Data Models ====================
interface Subscription {
  id: string;
  userId: string;
  type: "RR" | "ND";
  locations: string[];
  amount: number;
  startDate: Timestamp;
  endDate: Timestamp;
  paymentId?: string;
  status: "active" | "expired" | "pending" | "canceled";
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  canceledAt?: Timestamp;
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  subscriptionId: string;
  paymentMethod: string;
  transactionId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
