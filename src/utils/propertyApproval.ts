import { UserRole } from "../types";
import { canApproveFromRole, getApprovalWorkflow } from "./rbac";

export interface PropertyApprovalStatus {
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  submittedBy: string;
  submittedAt: string;
  currentApprovalLevel: UserRole | null;
  nextApprovalLevel: UserRole | null;
  approvalHistory: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  action: 'submitted' | 'approved' | 'rejected' | 'modified';
  by: string;
  byRole: UserRole;
  at: string;
  reason?: string;
  changes?: Record<string, any>;
}

// Get the next approver role for a property
export const getNextApprover = (submitterRole: UserRole, currentApprovalLevel?: UserRole): UserRole | null => {
  const workflow = getApprovalWorkflow(submitterRole);
  
  if (!currentApprovalLevel) {
    // First approval needed
    return workflow[0] || null;
  }
  
  const currentIndex = workflow.indexOf(currentApprovalLevel);
  if (currentIndex === -1 || currentIndex === workflow.length - 1) {
    return null; // No more approvals needed
  }
  
  return workflow[currentIndex + 1];
};

// Check if a user can approve a specific property
export const canUserApproveProperty = (
  userRole: UserRole, 
  propertySubmitterRole: UserRole,
  currentApprovalLevel?: UserRole
): boolean => {
  // Admin can always approve
  if (userRole === 'admin') return true;
  
  // Check if this user is the next in the approval workflow
  const nextApprover = getNextApprover(propertySubmitterRole, currentApprovalLevel);
  return nextApprover === userRole;
};

// Get properties that need approval from a specific user role
export const getPropertiesNeedingApproval = (
  properties: any[],
  userRole: UserRole
): any[] => {
  return properties.filter(property => {
    if (property.isApproved) return false; // Already approved
    
    const submitterRole = property.submitterRole || 'executive'; // Default to executive
    return canUserApproveProperty(userRole, submitterRole, property.currentApprovalLevel);
  });
};

// Create approval status for a new property
export const createInitialApprovalStatus = (
  submitterId: string,
  submitterRole: UserRole
): PropertyApprovalStatus => {
  const workflow = getApprovalWorkflow(submitterRole);
  
  return {
    isApproved: workflow.length === 0, // Auto-approve if no workflow needed (admin submissions)
    submittedBy: submitterId,
    submittedAt: new Date().toISOString(),
    currentApprovalLevel: null,
    nextApprovalLevel: workflow[0] || null,
    approvalHistory: [{
      action: 'submitted',
      by: submitterId,
      byRole: submitterRole,
      at: new Date().toISOString()
    }]
  };
};

// Process property approval
export const processPropertyApproval = (
  currentStatus: PropertyApprovalStatus,
  approverId: string,
  approverRole: UserRole
): PropertyApprovalStatus => {
  const workflow = getApprovalWorkflow(currentStatus.submittedBy);
  const currentIndex = currentStatus.currentApprovalLevel 
    ? workflow.indexOf(currentStatus.currentApprovalLevel)
    : -1;
  
  const nextLevel = workflow[currentIndex + 1] || null;
  const isFullyApproved = !nextLevel;
  
  return {
    ...currentStatus,
    isApproved: isFullyApproved,
    approvedBy: isFullyApproved ? approverId : currentStatus.approvedBy,
    approvedAt: isFullyApproved ? new Date().toISOString() : currentStatus.approvedAt,
    currentApprovalLevel: approverRole,
    nextApprovalLevel: nextLevel,
    approvalHistory: [
      ...currentStatus.approvalHistory,
      {
        action: 'approved',
        by: approverId,
        byRole: approverRole,
        at: new Date().toISOString()
      }
    ]
  };
};

// Process property rejection
export const processPropertyRejection = (
  currentStatus: PropertyApprovalStatus,
  rejectorId: string,
  rejectorRole: UserRole,
  reason: string
): PropertyApprovalStatus => {
  return {
    ...currentStatus,
    isApproved: false,
    rejectedBy: rejectorId,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
    currentApprovalLevel: null,
    nextApprovalLevel: null,
    approvalHistory: [
      ...currentStatus.approvalHistory,
      {
        action: 'rejected',
        by: rejectorId,
        byRole: rejectorRole,
        at: new Date().toISOString(),
        reason
      }
    ]
  };
};