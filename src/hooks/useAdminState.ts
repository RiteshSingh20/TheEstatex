import { useState } from "react";
import { User } from "../types";
import { Property } from "../types/admin";

export const useAdminState = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState<Property | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingProperty, setRejectingProperty] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  return {
    showUserModal,
    setShowUserModal,
    userDetails,
    setUserDetails,
    showPropertyDetails,
    setShowPropertyDetails,
    showRejectModal,
    setShowRejectModal,
    rejectingProperty,
    setRejectingProperty,
    rejectionReason,
    setRejectionReason,
    actionLoading,
    setActionLoading
  };
};