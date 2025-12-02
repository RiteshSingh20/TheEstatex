import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// Input sanitization to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>\"'&]/g, '') // Remove dangerous HTML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
};

// Clean file names for safe storage
export const cleanFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

// Upload single file with error handling
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Upload multiple files with batch processing
export const uploadFiles = async (files: File[], basePath: string): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    const cleanName = cleanFileName(file.name);
    const filePath = `${basePath}/${index + 1}_${cleanName}`;
    return uploadFile(file, filePath);
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Batch file upload failed:', error);
    throw new Error(`Batch upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Convert RERA possession date format
export const convertReraPossession = (reraPossession: string): string => {
  if (!reraPossession || reraPossession === "Ready to move") {
    return "Ready to move";
  }

  try {
    const date = new Date(reraPossession);
    if (isNaN(date.getTime())) {
      return reraPossession; // Return original if invalid date
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month}-${year}`;
  } catch (error) {
    console.warn('Date conversion failed:', error);
    return reraPossession; // Return original on error
  }
};

// Remove undefined values from objects recursively
export const removeUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }
  
  return obj;
};

// Validate file types and sizes
export const validateFile = (file: File, allowedTypes: string[], maxSizeMB: number = 10): boolean => {
  // Check file type
  const isValidType = allowedTypes.some(type => {
    if (type.includes('*')) {
      const baseType = type.split('/')[0];
      return file.type.startsWith(baseType);
    }
    return file.type === type;
  });

  if (!isValidType) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  return true;
};

// Batch validate multiple files
export const validateFiles = (files: File[], allowedTypes: string[], maxSizeMB: number = 10): boolean => {
  files.forEach((file, index) => {
    try {
      validateFile(file, allowedTypes, maxSizeMB);
    } catch (error) {
      throw new Error(`File ${index + 1} (${file.name}): ${error instanceof Error ? error.message : 'Validation failed'}`);
    }
  });
  return true;
};

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Safe JSON parsing with error handling
export const safeJsonParse = <T = any>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse failed:', error);
    return fallback;
  }
};

// Format currency for Indian locale
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Parse currency string to number
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Preserve totalPackage formatting when transforming data
export const preserveTotalPackageFormatting = (sourceData: any, targetData: any): any => {
  if (sourceData && targetData && sourceData.totalPackage && targetData.totalPackage) {
    // If source has formatted totalPackage (contains ₹ or commas), preserve it
    if (typeof sourceData.totalPackage === 'string' && 
        (sourceData.totalPackage.includes('₹') || sourceData.totalPackage.includes(','))) {
      targetData.totalPackage = sourceData.totalPackage;
    }
  }
  return targetData;
};

// Deep clone object safely
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Deep clone failed, using shallow copy:', error);
    return { ...obj };
  }
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Retry function with exponential backoff
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};