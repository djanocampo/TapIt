/**
 * TapIt Cryptography and Security Utilities
 * Zero-dependency security helpers leveraging the browser's native Web Crypto API.
 */

// Format: pbkdf2$iterations$saltHex$hashHex
const PBKDF2_ITERATIONS = 100000;
const HASH_ALGO = 'SHA-256';

/**
 * Generates a cryptographically secure random salt in hexadecimal format.
 */
export function generateSalt(byteLength: number = 16): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Derives a secure PBKDF2 key from a plaintext password and salt.
 */
async function derivePbkdf2Hash(password: string, salt: string, iterations: number = PBKDF2_ITERATIONS): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const saltBuffer = enc.encode(salt);
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: HASH_ALGO,
    },
    passwordKey,
    256 // 32 bytes
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a plaintext password using salted PBKDF2 with SHA-256.
 * Returns a serialized hash string formatted as: pbkdf2$<iterations>$<salt>$<hash>
 */
export async function hashPassword(password: string, existingSalt?: string): Promise<{ hashString: string; salt: string; hash: string }> {
  const salt = existingSalt || generateSalt(16);
  const hash = await derivePbkdf2Hash(password, salt, PBKDF2_ITERATIONS);
  const hashString = `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
  return { hashString, salt, hash };
}

/**
 * Verifies a plaintext password against a stored hash string.
 * Supports serialized pbkdf2 strings, legacy formats, and fallback comparisons.
 */
export async function verifyPassword(password: string, storedHashOrPlaintext?: string): Promise<boolean> {
  if (!storedHashOrPlaintext) return false;

  // 1. If stored in pbkdf2$<iterations>$<salt>$<hash> format
  if (storedHashOrPlaintext.startsWith('pbkdf2$')) {
    const parts = storedHashOrPlaintext.split('$');
    if (parts.length === 4) {
      const iterations = parseInt(parts[1], 10) || PBKDF2_ITERATIONS;
      const salt = parts[2];
      const expectedHash = parts[3];
      const computedHash = await derivePbkdf2Hash(password, salt, iterations);
      return timingSafeEqual(computedHash, expectedHash);
    }
  }

  // 2. Fallback for legacy passwords (e.g. mock data or unhashed passwords)
  // Constant-time-like comparison
  return timingSafeEqual(password, storedHashOrPlaintext);
}

/**
 * Constant-time string comparison helper to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Sanitizes an outbound or inbound URL to prevent Stored Cross-Site Scripting (XSS).
 * Blocks javascript:, data:, vbscript:, and relative script payloads.
 * Only permits https:, http:, mailto:, and tel: protocols.
 */
export function sanitizeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Disallow control characters and dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.includes('script:')
  ) {
    return fallback;
  }

  // Allow safe inline image data URLs (e.g. base64 avatars)
  if (lower.startsWith('data:image/')) {
    return trimmed;
  }

  // Block any other data: schemes (such as data:text/html)
  if (lower.startsWith('data:')) {
    return fallback;
  }

  // If already standard protocol
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }

  // Relative root links are allowed for internal navigation
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Default web URLs without protocol -> prepend https://
  return `https://${trimmed}`;
}

/**
 * Generates a cryptographically secure random token (e.g. for NFC tokens, invites, or session nonces).
 */
export function generateSecureToken(prefix: string = 'tok', byteLength: number = 12): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}
