// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex (at least 6 chars, uppercase, lowercase, number)
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

// Form validation functions
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!PASSWORD_REGEX.test(password)) return 'Password must contain uppercase, lowercase, and number';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must be less than 100 characters';
  return null;
};

// Generic field validator
export const validateField = (name, value) => {
  switch (name) {
    case 'name':
      return validateName(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    default:
      return null;
  }
};

// Form validation helper
export const validateForm = (formData, validationRules = {}) => {
  const errors = {};
  
  Object.keys(formData).forEach(field => {
    const error = validationRules[field] 
      ? validationRules[field](formData[field])
      : validateField(field, formData[field]);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};
