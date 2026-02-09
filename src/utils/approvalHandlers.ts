import toast from 'react-hot-toast';
import { approvePropertyInFirestore, rejectPropertyInFirestore } from './propertyApprovalService';
import { Property } from '../components/Admin Components/helperFunctions';

/**
 * Safely approve a property with comprehensive validation
 */
export const safeApproveProperty = async (
  docId: string,
  category: 'resale' | 'rental',
  pendingProperties: Record<string, Property[]>,
  userId: string | undefined
): Promise<boolean> => {
  // Validate docId parameter
  if (!docId?.trim()) {
    toast.error('Document ID is missing or invalid');
    return false;
  }

  // Find property using both docId and id fields
  const property = pendingProperties[category]?.find(
    (p: Property) => (p.docId || p.id) === docId
  );

  if (!property) {
    toast.error(`Property not found in pending ${category} list`);
    return false;
  }

  // Validate property has userId
  if (!property.userId?.trim()) {
    toast.error('Property missing user ID - cannot approve');
    return false;
  }

  // Validate admin ID
  if (!userId?.trim()) {
    toast.error('Admin ID not available');
    return false;
  }

  // Use the actual docId from property object
  const actualDocId = property.docId || property.id;
  if (!actualDocId?.trim()) {
    toast.error('Property document ID is invalid');
    return false;
  }

  try {
    // Call approval service with validated data
    await approvePropertyInFirestore(
      property.userId,
      category,
      actualDocId,
      userId
    );
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    toast.error(`Approval failed: ${errorMsg}`);
    return false;
  }
};

/**
 * Safely reject a property with comprehensive validation
 */
export const safeRejectProperty = async (
  docId: string,
  category: 'resale' | 'rental',
  reason: string,
  pendingProperties: Record<string, Property[]>,
  userId: string | undefined,
  userRole: string | undefined
): Promise<boolean> => {
  // Validate docId
  if (!docId?.trim()) {
    toast.error('Document ID is missing or invalid');
    return false;
  }

  // Validate reason
  if (!reason?.trim()) {
    toast.error('Rejection reason is required');
    return false;
  }

  // Find property
  const property = pendingProperties[category]?.find(
    (p: Property) => (p.docId || p.id) === docId
  );

  if (!property) {
    toast.error(`Property not found in pending ${category} list`);
    return false;
  }

  // Validate property has userId
  if (!property.userId?.trim()) {
    toast.error('Property missing user ID - cannot reject');
    return false;
  }

  // Validate admin ID
  if (!userId?.trim()) {
    toast.error('Admin ID not available');
    return false;
  }

  // Use actual docId from property
  const actualDocId = property.docId || property.id;
  if (!actualDocId?.trim()) {
    toast.error('Property document ID is invalid');
    return false;
  }

  try {
    await rejectPropertyInFirestore(
      property.userId,
      category,
      actualDocId,
      userId,
      reason,
      userRole || 'admin'
    );
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    toast.error(`Rejection failed: ${errorMsg}`);
    return false;
  }
};
