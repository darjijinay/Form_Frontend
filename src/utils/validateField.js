/**
 * Validate a single field value against its validation rules
 * @param {*} value - The field value to validate
 * @param {Object} field - The field definition with validation rules
 * @returns {Object} - { isValid: boolean, error: string or null }
 */
export const validateField = (value, field) => {
  const validation = field.validation || {};

  // Check required
  if (field.required || validation.required) {
    if (value === '' || value === null || value === undefined) {
      return {
        isValid: false,
        error: validation.customMessage || `${field.label} is required`,
      };
    }
  }

  // If not required and empty, skip other validations
  if (!value) {
    return { isValid: true, error: null };
  }

  // Text field validations
  if (['short_text', 'long_text'].includes(field.type)) {
    const stringValue = String(value);

    if (validation.minLength && stringValue.length < validation.minLength) {
      return {
        isValid: false,
        error: `Minimum ${validation.minLength} characters required`,
      };
    }

    if (validation.maxLength && stringValue.length > validation.maxLength) {
      return {
        isValid: false,
        error: `Maximum ${validation.maxLength} characters allowed`,
      };
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(stringValue)) {
        return {
          isValid: false,
          error: validation.patternErrorMessage || `Invalid format`,
        };
      }
    }
  }

  // Email validation
  if (field.type === 'email' || validation.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return {
        isValid: false,
        error: `Please enter a valid email address`,
      };
    }
  }

  // Phone validation
  if (field.type === 'phone' || validation.phone) {
    const phoneRegex = /^[0-9+\-() ]{10,}$/;
    if (!phoneRegex.test(String(value).replace(/\s/g, ''))) {
      return {
        isValid: false,
        error: `Please enter a valid phone number`,
      };
    }
  }

  // Number validation
  if (field.type === 'number') {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `Please enter a valid number`,
      };
    }

    if (validation.min !== undefined && numValue < validation.min) {
      return {
        isValid: false,
        error: `Minimum value is ${validation.min}`,
      };
    }

    if (validation.max !== undefined && numValue > validation.max) {
      return {
        isValid: false,
        error: `Maximum value is ${validation.max}`,
      };
    }
  }

  // Date validation
  if (field.type === 'date') {
    const dateValue = new Date(value);

    if (isNaN(dateValue.getTime())) {
      return {
        isValid: false,
        error: `Please enter a valid date`,
      };
    }

    if (validation.min) {
      const minDate = new Date(validation.min);
      if (dateValue < minDate) {
        return {
          isValid: false,
          error: `Date must be after ${validation.min}`,
        };
      }
    }

    if (validation.max) {
      const maxDate = new Date(validation.max);
      if (dateValue > maxDate) {
        return {
          isValid: false,
          error: `Date must be before ${validation.max}`,
        };
      }
    }
  }

  // Regex pattern for any field
  if (validation.pattern && !['short_text', 'long_text'].includes(field.type)) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(String(value))) {
      return {
        isValid: false,
        error: validation.patternErrorMessage || `Invalid format`,
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validate all fields in a form
 * @param {Array} answers - Array of { fieldId, value } objects
 * @param {Array} fields - Array of field definitions
 * @returns {Object} - { isValid: boolean, errors: { fieldId: errorMessage } }
 */
export const validateForm = (answers, fields) => {
  const errors = {};
  let isValid = true;

  fields.forEach((field) => {
    const answer = answers.find((a) => a.fieldId === field._id);
    const value = answer?.value || '';

    const validation = validateField(value, field);
    if (!validation.isValid) {
      errors[field._id] = validation.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};
