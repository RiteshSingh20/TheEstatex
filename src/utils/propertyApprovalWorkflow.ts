import { Timestamp } from "firebase/firestore";

export interface ApprovalStatus {
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectedBy?: string;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  submittedBy: string;
  submittedAt: Timestamp;
}

export const createApprovalStatus = (userId: string): ApprovalStatus => {
  return {
    status: "pending",
    submittedBy: userId,
    submittedAt: Timestamp.now(),
  };
};

export const approveProperty = (
  currentStatus: ApprovalStatus,
  adminId: string
): ApprovalStatus => {
  return {
    ...currentStatus,
    status: "approved",
    approvedBy: adminId,
    approvedAt: Timestamp.now(),
  };
};

export const rejectProperty = (
  currentStatus: ApprovalStatus,
  adminId: string,
  reason: string
): ApprovalStatus => {
  return {
    ...currentStatus,
    status: "rejected",
    rejectedBy: adminId,
    rejectedAt: Timestamp.now(),
    rejectionReason: reason,
  };
};
