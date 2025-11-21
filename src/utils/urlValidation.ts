// URL validation utility to prevent malicious redirects
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    // Allow only http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Block localhost and private IP ranges for security
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export const sanitizeUrl = (url: string): string => {
  if (!isValidUrl(url)) {
    return '#'; // Return safe fallback
  }
  return url;
};