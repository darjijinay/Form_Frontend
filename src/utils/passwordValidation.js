/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Returns password hint text for display
 * @returns {string} - Password requirements hint text
 */
export function getPasswordHintText() {
  return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*(),.?":{}|<>)';
}
