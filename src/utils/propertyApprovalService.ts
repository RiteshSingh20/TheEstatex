import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Approve a property - checks both old and new storage locations
 */
export const approvePropertyInFirestore = async (
  userId: string,
  category: 'resale' | 'rental',
  docId: string,
  adminId: string
): Promise<void> => {
  if (!userId?.trim()) throw new Error('User ID is required');
  if (!docId?.trim()) throw new Error('Document ID is required');
  if (!adminId?.trim()) throw new Error('Admin ID is required');
  if (!category) throw new Error('Category is required');

  const collectionName = category === 'resale' ? 'resaleProperties' : 'rentalProperties';
  
  // Try old location first: users/{userId}/{collectionName}/{docId}
  const oldRef = doc(db, 'users', userId, collectionName, docId);
  const oldDoc = await getDoc(oldRef);
  
  if (oldDoc.exists()) {
    await updateDoc(oldRef, {
      isApproved: true,
      approvedBy: adminId,
      approvedAt: serverTimestamp(),
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // Try new location: properties/{docId}
  const newRef = doc(db, 'properties', docId);
  const newDoc = await getDoc(newRef);
  
  if (newDoc.exists() && newDoc.data()?.userId === userId) {
    await updateDoc(newRef, {
      isApproved: true,
      approvedBy: adminId,
      approvedAt: serverTimestamp(),
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
    return;
  }

  throw new Error(`Property not found at users/${userId}/${collectionName}/${docId} or properties/${docId}`);
};

/**
 * Reject a property - checks both old and new storage locations
 */
export const rejectPropertyInFirestore = async (
  userId: string,
  category: 'resale' | 'rental',
  docId: string,
  adminId: string,
  reason: string,
  adminRole: string
): Promise<void> => {
  if (!userId?.trim()) throw new Error('User ID is required');
  if (!docId?.trim()) throw new Error('Document ID is required');
  if (!adminId?.trim()) throw new Error('Admin ID is required');
  if (!reason?.trim()) throw new Error('Rejection reason is required');
  if (!category) throw new Error('Category is required');

  const collectionName = category === 'resale' ? 'resaleProperties' : 'rentalProperties';
  
  // Try old location first
  const oldRef = doc(db, 'users', userId, collectionName, docId);
  const oldDoc = await getDoc(oldRef);
  
  if (oldDoc.exists()) {
    await updateDoc(oldRef, {
      isApproved: false,
      isRejected: true,
      rejectedBy: adminId,
      rejectedAt: serverTimestamp(),
      rejectionReason: reason,
      rejectorRole: adminRole,
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // Try new location
  const newRef = doc(db, 'properties', docId);
  const newDoc = await getDoc(newRef);
  
  if (newDoc.exists() && newDoc.data()?.userId === userId) {
    await updateDoc(newRef, {
      isApproved: false,
      isRejected: true,
      rejectedBy: adminId,
      rejectedAt: serverTimestamp(),
      rejectionReason: reason,
      rejectorRole: adminRole,
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
    return;
  }

  throw new Error(`Property not found at users/${userId}/${collectionName}/${docId} or properties/${docId}`);
};
