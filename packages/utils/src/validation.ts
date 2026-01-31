// Validation utilities for form inputs and data

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// alphanumeric + underscores, 3-20 chars
export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

// 8+ chars, 1 uppercase, 1 lowercase, 1 number
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function isValidCodeLength(code: string, maxLength = 50000): boolean {
  return code.length > 0 && code.length <= maxLength;
}

// Type guard to check if a value is a non-empty string
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
