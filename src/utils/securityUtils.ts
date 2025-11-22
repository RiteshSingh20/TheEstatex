// Security utilities for input validation and sanitization

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: "'self'",
  SCRIPT_SRC: "'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  STYLE_SRC: "'self' 'unsafe-inline'",
  IMG_SRC: "'self' data: https:",
  CONNECT_SRC: "'self' https:",
  FONT_SRC: "'self' https:",
  OBJECT_SRC: "'none'",
  MEDIA_SRC: "'self'",
  FRAME_SRC: "'none'",
};

// XSS Prevention
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone number validation (Indian format)
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  const cleanPhone = phone.replace(/\D/g, '');
  return phoneRegex.test(cleanPhone);
};

// File type validation
export const isAllowedFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => {
    if (type.includes('*')) {
      const baseType = type.split('/')[0];
      return file.type.startsWith(baseType);
    }
    return file.type === type;
  });
};

// File size validation
export const isValidFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// SQL Injection prevention for search terms
export const sanitizeSearchTerm = (term: string): string => {
  if (typeof term !== 'string') return '';
  
  return term
    .replace(/['"`;\\]/g, '') // Remove SQL injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100); // Limit length
};

// Path traversal prevention
export const sanitizeFilePath = (path: string): string => {
  if (typeof path !== 'string') return '';
  
  return path
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/\\/g, '/') // Normalize path separators
    .replace(/\/+/g, '/') // Remove duplicate slashes
    .trim();
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// Input validation schemas
export const ValidationSchemas = {
  projectName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.()]+$/,
  },
  
  developerName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.()]+$/,
  },
  
  location: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
  },
  
  pinCode: {
    pattern: /^\d{6}$/,
  },
  
  reraNumber: {
    minLength: 5,
    maxLength: 50,
    pattern: /^[A-Z0-9\-\/]+$/,
  },
  
  currency: {
    min: 0,
    max: 999999999999, // 999 billion
  },
  
  area: {
    min: 1,
    max: 99999, // 99,999 sq ft
  },
  
  percentage: {
    min: 0,
    max: 100,
  },
};

// Validate input against schema
export const validateInput = (
  value: any,
  schema: any,
  fieldName: string
): { isValid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '') {
    return { isValid: true }; // Allow empty values, handle required validation separately
  }
  
  const stringValue = String(value).trim();
  
  // Length validation
  if (schema.minLength && stringValue.length < schema.minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${schema.minLength} characters long`,
    };
  }
  
  if (schema.maxLength && stringValue.length > schema.maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${schema.maxLength} characters`,
    };
  }
  
  // Pattern validation
  if (schema.pattern && !schema.pattern.test(stringValue)) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid characters`,
    };
  }
  
  // Numeric validation
  if (typeof schema.min === 'number' || typeof schema.max === 'number') {
    const numValue = parseFloat(stringValue);
    
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${fieldName} must be a valid number`,
      };
    }
    
    if (typeof schema.min === 'number' && numValue < schema.min) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${schema.min}`,
      };
    }
    
    if (typeof schema.max === 'number' && numValue > schema.max) {
      return {
        isValid: false,
        error: `${fieldName} must not exceed ${schema.max}`,
      };
    }
  }
  
  return { isValid: true };
};

// Batch validate multiple fields
export const validateForm = (
  data: Record<string, any>,
  schemas: Record<string, any>,
  requiredFields: string[] = []
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = data[field];
    if (value === null || value === undefined || String(value).trim() === '') {
      errors[field] = `${field} is required`;
    }
  });
  
  // Validate against schemas
  Object.entries(schemas).forEach(([field, schema]) => {
    if (!errors[field]) { // Only validate if not already marked as required field error
      const validation = validateInput(data[field], schema, field);
      if (!validation.isValid && validation.error) {
        errors[field] = validation.error;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Generate secure random string
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// Hash function for client-side hashing (not for passwords)
export const simpleHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Content filtering
export const containsProfanity = (text: string): boolean => {
  // Basic profanity filter - in production, use a comprehensive library
  const profanityWords = ['spam', 'scam', 'fake', 'fraud'];
  const lowerText = text.toLowerCase();
  
  return profanityWords.some(word => lowerText.includes(word));
};

// IP address validation
export const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Security headers helper
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
});

export default {
  sanitizeHtml,
  isValidUrl,
  isValidEmail,
  isValidPhoneNumber,
  isAllowedFileType,
  isValidFileSize,
  sanitizeSearchTerm,
  sanitizeFilePath,
  RateLimiter,
  ValidationSchemas,
  validateInput,
  validateForm,
  generateSecureId,
  simpleHash,
  containsProfanity,
  isValidIPAddress,
  getSecurityHeaders,
};