// Device detection utility
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get appropriate WhatsApp URL based on device
export const getWhatsAppUrl = (phoneNumber: string, text: string): string => {
  const encodedText = encodeURIComponent(text);
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
  
  if (isMobileDevice()) {
    return `https://api.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`;
  } else {
    return `https://web.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`;
  }
};