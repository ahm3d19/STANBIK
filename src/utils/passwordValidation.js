// utils/passwordValidation.js

export const isValidEmail = email => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return regex.test(email);
};

export const checkPasswordStrength = password => {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const minLength = password.length >= 8;

  return {
    hasLower,
    hasUpper,
    hasDigit,
    hasSpecialChar,
    minLength,
    isValid: hasLower && hasUpper && hasDigit && hasSpecialChar && minLength,
  };
};
