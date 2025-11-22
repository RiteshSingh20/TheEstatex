import { useState } from "react";
import { updatePropertyStatus, updateResaleProperty, updateRentalProperty } from "../../utils/firestoreListings";
import { doc, updateDoc, serverTimestamp, deleteField } from "firebase/firestore";
import { db } from "../../utils/firebase";
import toast from "react-hot-toast";

export const usePropertyActions = () => {
  const [actionLoading, setActionLoading] = useState(false);

  const handleApproveProperty = async (docId: string, category: "resale" | "rental", userId: string) => {
    try {
      setActionLoading(true);
      await updatePropertyStatus(userId, category, docId, {
        isApproved: true,
      });
      toast.success("Property approved!");
      return true;
    } catch (error) {
      
      toast.error("Failed to approve property - " + (error as Error).message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProperty = async (docId: string, category: "resale" | "rental" | "newProperty", reason: string, user: any) => {
    try {
      setActionLoading(true);

      if (category === "newProperty") {
        const propertyRef = doc(db, "costSheets", docId);
        await updateDoc(propertyRef, {
          isApproved: false,
          isRejected: true,
          rejectedAt: serverTimestamp(),
          rejectedBy: user?.id || null,
          rejectorRole: user?.role || null,
          rejectionReason: reason,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updatePropertyStatus("", category, docId, {
          isApproved: false,
          isRejected: true,
          rejectedAt: serverTimestamp(),
          rejectedBy: user?.id || null,
          rejectorRole: user?.role || null,
          rejectionReason: reason,
        });
      }

      toast.success("Property rejected!");
      return true;
    } catch (error) {
      
      toast.error("Failed to reject property - " + (error as Error).message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveNewProperty = async (id: string, user: any) => {
    try {
      setActionLoading(true);
      const { updateCostSheet } = await import("../../utils/firestoreListings");
      const updatedProperty = {
        isApproved: true,
        approvalStatus: "approved",
        approvedBy: user!.id,
        approvedAt: new Date().toISOString(),
        nextApprovalLevel: null,
      };

      await updateCostSheet(id, updatedProperty);
      toast.success("New property approved successfully!");
      return true;
    } catch (error) {
      toast.error("Failed to approve new property - " + (error as Error).message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRejectedProperty = async (propertyId: string, category: "resale" | "rental" | "newProperty", user: any) => {
    try {
      setActionLoading(true);

      if (category === "newProperty") {
        const propertyRef = doc(db, "costSheets", propertyId);
        await updateDoc(propertyRef, {
          isApproved: true,
          isRejected: false,
          rejectedAt: deleteField(),
          rejectedBy: deleteField(),
          rejectorRole: deleteField(),
          rejectionReason: deleteField(),
          approvedAt: serverTimestamp(),
          approvedBy: user?.id,
          updatedAt: serverTimestamp(),
        });
      } else {
        const collectionName = category === "resale" ? "resaleProperties" : "rentalProperties";
        const propertyRef = doc(db, "users", "", collectionName, propertyId);
        await updateDoc(propertyRef, {
          isApproved: true,
          isRejected: false,
          rejectedAt: deleteField(),
          rejectedBy: deleteField(),
          rejectorRole: deleteField(),
          rejectionReason: deleteField(),
          approvedAt: serverTimestamp(),
          approvedBy: user?.id,
          updatedAt: serverTimestamp(),
        });
      }

      toast.success("Property approved successfully");
      return true;
    } catch (error) {
      
      toast.error("Failed to approve property");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    handleApproveProperty,
    handleRejectProperty,
    handleApproveNewProperty,
    handleApproveRejectedProperty
  };
};