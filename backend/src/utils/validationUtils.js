/**
 * Email validation regex
 */
exports.EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation regex (at least 6 chars, uppercase, lowercase, number)
 */
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

/**
 * Phone validation regex (basic international format)
 */
exports.PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;

/**
 * Name validation regex (letters, spaces, hyphens, apostrophes)
 */
exports.NAME_REGEX = /^[a-zA-Z\s\-']+$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} - Error message or null if valid
 */
exports.validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!exports.EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string|null} - Error message or null if valid
 */
exports.validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!exports.PASSWORD_REGEX.test(password)) return 'Password must contain uppercase, lowercase, and number';
  return null;
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {string|null} - Error message or null if valid
 */
exports.validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must be less than 100 characters';
  if (!exports.NAME_REGEX.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  return null;
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
exports.validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!exports.PHONE_REGEX.test(phone)) return 'Invalid phone number format';
  if (phone.replace(/\D/g, '').length < 10) return 'Phone number must have at least 10 digits';
  return null;
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {string|null} - Error message or null if valid
 */
exports.validateDate = (date) => {
  if (!date) return 'Date is required';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return 'Date must be in YYYY-MM-DD format';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  return null;
};

/**
 * Validate time format (HH:mm)
 * @param {string} time - Time string to validate
 * @returns {string|null} - Error message or null if valid
 */
exports.validateTime = (time) => {
  if (!time) return 'Time is required';
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) return 'Time must be in HH:mm format (24-hour)';
  
  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23) return 'Hour must be between 00 and 23';
  if (minutes < 0 || minutes > 59) return 'Minute must be between 00 and 59';
  
  return null;
};

/**
 * Validate positive number
 * @param {number|string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
exports.validatePositiveNumber = (value, fieldName) => {
  if (value === null || value === undefined || value === '') return `${fieldName} is required`;
  
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num <= 0) return `${fieldName} must be greater than 0`;
  
  return null;
};

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
exports.validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') return `${fieldName} is required`;
  if (typeof value === 'string' && value.trim().length === 0) return `${fieldName} cannot be empty`;
  return null;
};

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
exports.validateStringLength = (value, minLength, maxLength, fieldName) => {
  if (value === null || value === undefined || value === '') return `${fieldName} is required`;
  
  if (value.length < minLength) return `${fieldName} must be at least ${minLength} characters`;
  if (value.length > maxLength) return `${fieldName} must be less than ${maxLength} characters`;
  
  return null;
};

/**
 * Validate numeric range
 * @param {number|string} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
exports.validateRange = (value, min, max, fieldName) => {
  if (value === null || value === undefined || value === '') return `${fieldName} is required`;
  
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min) return `${fieldName} must be at least ${min}`;
  if (num > max) return `${fieldName} must be at most ${max}`;
  
  return null;
};

/**
 * Validate array (non-empty)
 * @param {Array} value - Array to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
exports.validateArray = (value, fieldName) => {
  if (!Array.isArray(value)) return `${fieldName} must be an array`;
  if (value.length === 0) return `${fieldName} cannot be empty`;
  return null;
};

/**
 * Validate object (non-empty)
 * @param {Object} value - Object to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
exports.validateObject = (value, fieldName) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return `${fieldName} must be an object`;
  }
  if (Object.keys(value).length === 0) return `${fieldName} cannot be empty`;
  return null;
};

/**
 * Generic field validator
 * @param {string} name - Field name
 * @param {*} value - Field value
 * @param {Object} rules - Validation rules object
 * @returns {string|null} - Error message or null if valid
 */
exports.validateField = (name, value, rules = {}) => {
  // Required validation
  if (rules.required && (value === null || value === undefined || value === '')) {
    return `${name} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return null;
  }

  // Type-specific validations
  switch (rules.type) {
    case 'email':
      return exports.validateEmail(value);
    case 'password':
      return exports.validatePassword(value);
    case 'name':
      return exports.validateName(value);
    case 'phone':
      return exports.validatePhone(value);
    case 'date':
      return exports.validateDate(value);
    case 'time':
      return exports.validateTime(value);
    case 'number':
      if (rules.min !== undefined || rules.max !== undefined) {
        return exports.validateRange(value, rules.min || 0, rules.max || Infinity, name);
      }
      return exports.validatePositiveNumber(value, name);
    case 'string':
      if (rules.minLength !== undefined || rules.maxLength !== undefined) {
        return exports.validateStringLength(value, rules.minLength || 0, rules.maxLength || Infinity, name);
      }
      return null;
    case 'array':
      return exports.validateArray(value, name);
    case 'object':
      return exports.validateObject(value, name);
    default:
      return null;
  }
};

/**
 * Validate entire form object
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules object
 * @returns {Object} - Errors object with field names as keys
 */
exports.validateForm = (formData, validationRules = {}) => {
  const errors = {};

  Object.keys(validationRules).forEach(field => {
    const error = exports.validateField(field, formData[field], validationRules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};
