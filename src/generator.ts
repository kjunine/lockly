/**
 * Password generation core logic
 * Uses node:crypto for cryptographically secure random generation
 */

const getRandomValues = globalThis.crypto.getRandomValues.bind(
  globalThis.crypto
);

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

  /**
   * Ensure at least one character from each enabled charset is included.
   * When enabled, the password length must be >= the number of active charsets.
   * @default false
   */
  ensure?: boolean;
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

/**
 * Build a character pool string and collect individual active charsets.
 *
 * Concatenates the character sets that are enabled in the options.
 *
 * @param options - Generation options with charset toggles
 * @returns An object with the concatenated pool and an array of active charset strings
 */
function buildPool(options: Required<GenerateOptions>): {
  pool: string;
  charsets: string[];
} {
  let pool = '';
  const charsets: string[] = [];
  if (options.uppercase) {
    pool += UPPERCASE;
    charsets.push(UPPERCASE);
  }
  if (options.lowercase) {
    pool += LOWERCASE;
    charsets.push(LOWERCASE);
  }
  if (options.numbers) {
    pool += NUMBERS;
    charsets.push(NUMBERS);
  }
  if (options.symbols) {
    pool += SYMBOLS;
    charsets.push(SYMBOLS);
  }
  return { pool, charsets };
}

/**
 * Pick a single random character from a character set using rejection sampling.
 *
 * @param charset - The character set to pick from
 * @returns A single random character
 */
function pickRandomChar(charset: string): string {
  const len = charset.length;
  const limit = 256 - (256 % len);

  for (;;) {
    const randomBytes = new Uint8Array(2);
    getRandomValues(randomBytes);
    for (let i = 0; i < randomBytes.length; i++) {
      if (randomBytes[i] < limit) {
        return charset[randomBytes[i] % len];
      }
    }
  }
}

/**
 * Fisher-Yates shuffle using crypto-secure randomness.
 *
 * Shuffles the array in place using `crypto.getRandomValues()` to ensure
 * uniform distribution of permutations.
 *
 * @param arr - The array to shuffle in place
 */
function cryptoShuffle(arr: string[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    // Generate a uniform random index in [0, i]
    // Use rejection sampling to avoid modulo bias
    const range = i + 1;
    const limit = 256 - (256 % range);

    let j: number;
    for (;;) {
      const randomBytes = new Uint8Array(1);
      getRandomValues(randomBytes);
      if (randomBytes[0] < limit) {
        j = randomBytes[0] % range;
        break;
      }
    }

    // Swap
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

/**
 * Generate a single password of the given length from the character pool.
 *
 * Uses `crypto.getRandomValues()` for cryptographically secure randomness (REQ-1).
 * Applies rejection sampling to eliminate modulo bias: any random byte whose
 * value is >= `limit` (the largest multiple of `poolLength` that fits in a byte)
 * is discarded and re-sampled.
 *
 * When `charsets` is provided (ensure mode), one character from each charset is
 * placed first, then the remaining slots are filled from the full pool, and
 * finally the entire array is Fisher-Yates shuffled to prevent positional prediction.
 *
 * @param length - Desired password length
 * @param pool - Character pool to sample from
 * @param charsets - Individual active charsets for ensure mode (optional)
 * @returns A single password string
 */
function generateSingle(
  length: number,
  pool: string,
  charsets?: string[]
): string {
  const poolLength = pool.length;

  // Calculate the rejection threshold to eliminate modulo bias.
  // `limit` is the largest multiple of poolLength that is <= 256.
  // Any random byte value >= limit is biased and must be discarded.
  const limit = 256 - (256 % poolLength);

  const chars: string[] = [];

  // Ensure mode: pick one mandatory character from each active charset
  if (charsets) {
    for (const charset of charsets) {
      chars.push(pickRandomChar(charset));
    }
  }

  // Fill remaining characters from the full pool
  while (chars.length < length) {
    // Request enough random bytes to likely fill the remaining characters,
    // with extra to account for rejections.
    const remaining = length - chars.length;
    const bufferSize = remaining * 2;
    const randomBytes = new Uint8Array(bufferSize);
    getRandomValues(randomBytes);

    for (let i = 0; i < randomBytes.length && chars.length < length; i++) {
      const byte = randomBytes[i];
      // Reject bytes that would cause modulo bias
      if (byte < limit) {
        chars.push(pool[byte % poolLength]);
      }
    }
  }

  // Ensure mode: shuffle to prevent positional prediction of mandatory chars
  if (charsets) {
    cryptoShuffle(chars);
  }

  return chars.join('');
}

/**
 * Validate password generation options and throw descriptive errors.
 *
 * @param options - Resolved options to validate
 * @throws {Error} If validation fails (invalid length, count, or charset selection)
 */
function validateOptions(options: Required<GenerateOptions>): void {
  // REQ-3: Validate length range (1-1024)
  if (!Number.isInteger(options.length) || options.length < 1) {
    throw new Error('길이는 1~1024 사이여야 합니다');
  }
  if (options.length > 1024) {
    throw new Error('길이는 1~1024 사이여야 합니다');
  }

  // REQ-5: Validate count (must be >= 1)
  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error('count는 1 이상이어야 합니다');
  }

  // REQ-2: At least one charset must be enabled (RISK-2)
  if (
    !options.uppercase &&
    !options.lowercase &&
    !options.numbers &&
    !options.symbols
  ) {
    throw new Error('최소 1개 이상의 문자셋을 포함해야 합니다');
  }

  // Ensure mode: length must be >= number of active charsets
  if (options.ensure) {
    const activeCount =
      (options.uppercase ? 1 : 0) +
      (options.lowercase ? 1 : 0) +
      (options.numbers ? 1 : 0) +
      (options.symbols ? 1 : 0);
    if (options.length < activeCount) {
      throw new Error(
        `ensure 모드에서는 길이가 활성 문자셋 수(${activeCount}) 이상이어야 합니다`
      );
    }
  }
}

/**
 * Generate one or more cryptographically secure random passwords.
 *
 * Uses `node:crypto.getRandomValues()` as the entropy source (REQ-1, NFR-1).
 * Applies rejection sampling to avoid modulo bias when the character pool
 * length is not a power of two.
 *
 * @param options - Password generation options. All fields are optional and
 *   fall back to safe defaults (length=16, count=1, all charsets enabled).
 * @returns An array of generated password strings. The array length equals
 *   `options.count` (default 1).
 * @throws {Error} If options validation fails (invalid length, count, or charsets)
 *
 * @example
 * ```ts
 * // Generate one 16-character password with all charsets
 * const [pw] = generatePassword();
 *
 * // Generate three 32-character passwords without symbols
 * const pws = generatePassword({ length: 32, count: 3, symbols: false });
 * ```
 */
export function generatePassword(options?: GenerateOptions): string[] {
  const resolved: Required<GenerateOptions> = {
    length: options?.length ?? 16,
    count: options?.count ?? 1,
    uppercase: options?.uppercase ?? true,
    lowercase: options?.lowercase ?? true,
    numbers: options?.numbers ?? true,
    symbols: options?.symbols ?? true,
    ensure: options?.ensure ?? false,
  };

  // Validate options (REQ-2, REQ-3, REQ-5)
  validateOptions(resolved);

  const { pool, charsets } = buildPool(resolved);

  const passwords: string[] = [];
  for (let i = 0; i < resolved.count; i++) {
    passwords.push(
      generateSingle(
        resolved.length,
        pool,
        resolved.ensure ? charsets : undefined
      )
    );
  }

  return passwords;
}
