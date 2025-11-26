// Device detection utility
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get appropriate WhatsApp URL based on device
export const getWhatsAppUrl = (phoneNumber: string, text: string): string => {
  const encodedText = encodeURIComponent(text);
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
  
  if (isMobileDevice()) {
    // For mobile devices, use API URL for better compatibility
    return `https://api.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`;
  } else {
    // For desktop/web, use WhatsApp Web
    return `https://web.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`;
  }
};

// Get WhatsApp Web URL (force web version)
export const getWhatsAppWebUrl = (phoneNumber: string, text: string): string => {
  const encodedText = encodeURIComponent(text);
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
  return `https://web.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`;
};

// Get WhatsApp App URL (force app version)
export const getWhatsAppAppUrl = (phoneNumber: string, text: string): string => {
  const encodedText = encodeURIComponent(text);
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
  return `whatsapp://send?phone=${cleanPhoneNumber}&text=${encodedText}`;
};

// Simple WhatsApp opener that works reliably across platforms
export const openWhatsAppSimple = (phoneNumber: string, text: string): void => {
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
  const encodedText = encodeURIComponent(text);
  
  // Use the most compatible URL for all platforms
  const url = isMobileDevice() 
    ? `https://api.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${cleanPhoneNumber}&text=${encodedText}`;
    
  window.open(url, '_blank');
};

// Open WhatsApp with smart app detection and fallback
export const openWhatsApp = (phoneNumber: string, text: string): void => {
  // For now, use the simple reliable method to avoid scheme handler errors
  openWhatsAppSimple(phoneNumber, text);
};