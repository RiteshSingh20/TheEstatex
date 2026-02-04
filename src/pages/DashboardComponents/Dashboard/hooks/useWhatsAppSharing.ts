import { useState } from "react";
import { generateWhatsAppText } from "../../../../utils/helper";
import { openWhatsApp } from "../../../../utils/deviceDetection";
import { useAuth } from "../../../../utils/authContext";
import toast from "react-hot-toast";

export const useWhatsAppSharing = () => {
  const { user } = useAuth();
  const [receiverPrefix, setReceiverPrefix] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverWhatsApp, setReceiverWhatsApp] = useState("");
  const [whatsAppError, setWhatsAppError] = useState("");
  const [nameError, setNameError] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewText, setPreviewText] = useState("");

  const validateInputs = () => {
    const nameEmpty = !receiverName.trim();
    const whatsAppEmpty = !receiverWhatsApp.trim();

    if (nameEmpty || whatsAppEmpty) {
      if (nameEmpty && whatsAppEmpty) {
        toast.error("Please enter name and WhatsApp number in filters first.");
      } else if (nameEmpty) {
        toast.error("Please enter name in filters first.");
      } else {
        toast.error("Please enter WhatsApp number in filters first.");
      }
      
      if (nameEmpty) setNameError("Name is required");
      if (whatsAppEmpty) setWhatsAppError("WhatsApp number is required");
      return false;
    }

    setNameError("");
    setWhatsAppError("");
    return true;
  };

  const sendWhatsAppMessage = (
    itemsToShare: any[],
    propertyCategory: string,
    totalCount?: number,
    isCostSheet = false,
    isQuickSend = false
  ) => {
    if (!validateInputs()) return;

    if (itemsToShare.length === 0) {
      toast.error("Please select at least one property.");
      return;
    }

    const text = generateWhatsAppText(
      itemsToShare,
      receiverPrefix,
      receiverName,
      receiverWhatsApp,
      user || undefined,
      totalCount,
      isCostSheet,
      isQuickSend,
      propertyCategory
    );

    openWhatsApp(receiverWhatsApp, text);
  };

  const previewWhatsAppMessage = (
    itemsToShare: any[],
    propertyCategory: string,
    totalCount?: number,
    isCostSheet = false,
    isQuickSend = false
  ) => {
    if (!validateInputs()) return;

    const text = generateWhatsAppText(
      itemsToShare,
      receiverPrefix,
      receiverName || "Customer",
      receiverWhatsApp,
      user || undefined,
      totalCount,
      isCostSheet,
      isQuickSend,
      propertyCategory
    );

    setPreviewText(text);
    setShowPreviewModal(true);
  };

  return {
    receiverPrefix,
    receiverName,
    receiverWhatsApp,
    whatsAppError,
    nameError,
    showPreviewModal,
    previewText,
    setReceiverPrefix,
    setReceiverName,
    setReceiverWhatsApp,
    setWhatsAppError,
    setNameError,
    setShowPreviewModal,
    setPreviewText,
    sendWhatsAppMessage,
    previewWhatsAppMessage,
    validateInputs,
  };
};