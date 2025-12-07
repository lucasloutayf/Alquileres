import DOMPurify from 'dompurify';

/**
 * Security utilities for input sanitization
 * Prevents XSS attacks and injection vulnerabilities
 */

/**
 * Sanitizes a string to remove potentially dangerous HTML/scripts
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and sanitize
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [] 
  });
  
  // Trim and limit length
  return sanitized.trim().slice(0, 1000);
};

/**
 * Sanitizes an object by cleaning all string values
 * @param {object} obj - The object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validates that a string only contains safe characters
 * @param {string} input - The string to validate
 * @returns {boolean} - Whether the string is safe
 */
export const isSafeString = (input) => {
  if (typeof input !== 'string') return false;
  
  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /\{\{/,
    /\$\{/,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Validates an email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validates a phone number format (Argentina)
 * @param {string} phone - The phone to validate
 * @returns {boolean} - Whether the phone is valid
 */
export const isValidPhone = (phone) => {
  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-()+ ]{7,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a DNI format (Argentina)
 * @param {string} dni - The DNI to validate
 * @returns {boolean} - Whether the DNI is valid
 */
export const isValidDNI = (dni) => {
  // Argentine DNI: 7-8 digits, possibly with dots
  const dniClean = dni.replace(/\./g, '');
  return /^\d{7,8}$/.test(dniClean);
};

export default {
  sanitizeString,
  sanitizeObject,
  isSafeString,
  isValidEmail,
  isValidPhone,
  isValidDNI
};
