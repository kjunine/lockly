/**
 * Password generation core logic
 * Uses node:crypto for cryptographically secure random generation
 */

/**
 * Options for password generation
 */
export interface GenerateOptions {
  /**
   * Password length (1-1024)
   * @default 16
   */
  length?: number;

  /**
   * Number of passwords to generate
   * @default 1
   */
  count?: number;

  /**
   * Include uppercase letters (A-Z)
   * @default true
   */
  uppercase?: boolean;

  /**
   * Include lowercase letters (a-z)
   * @default true
   */
  lowercase?: boolean;

  /**
   * Include numbers (0-9)
   * @default true
   */
  numbers?: boolean;

  /**
   * Include special characters
   * @default true
   */
  symbols?: boolean;
}

/**
 * Uppercase character set (A-Z)
 */
export const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Lowercase character set (a-z)
 */
export const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';

/**
 * Numeric character set (0-9)
 */
export const NUMBERS = '0123456789';

/**
 * Special character set
 */
export const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
