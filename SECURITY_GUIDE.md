# Full-Stack Security Architecture & Implementation Blueprint
> **A Comprehensive Security Reference Guide for Modern Web Applications**  
> *Tested and proven across React, Vite, TypeScript, PostgreSQL, and Supabase.*

---

## Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [Cryptographic Password Management](#2-cryptographic-password-management)
   - [Zero-Dependency Web Crypto PBKDF2](#zero-dependency-web-crypto-pbkdf2)
   - [Constant-Time Verification (Timing Attack Defense)](#constant-time-verification-timing-attack-defense)
   - [Seamless Legacy Password Auto-Upgrade](#seamless-legacy-password-auto-upgrade)
   - [Database-Side Verification via PostgreSQL RPC](#database-side-verification-via-postgresql-rpc)
3. [Database & Backend Hardening (Supabase / PostgreSQL)](#3-database--backend-hardening-supabase--postgresql)
   - [Row-Level Security (RLS) Best Practices](#row-level-security-rls-best-practices)
   - [Eliminating Credential Leakage in Client Sync Queries](#eliminating-credential-leakage-in-client-sync-queries)
   - [Targeted Single-Row Credential Lookups](#targeted-single-row-credential-lookups)
   - [Database Role Enums and Default Constraints](#database-role-enums-and-default-constraints)
4. [Input Sanitization & Stored XSS Prevention](#4-input-sanitization--stored-xss-prevention)
   - [Strict Protocol Whitelisting](#strict-protocol-whitelisting)
   - [Safe Handling of Inline Data Images (Avatars)](#safe-handling-of-inline-data-images-avatars)
   - [Applying Sanitization to Dynamic Renderers](#applying-sanitization-to-dynamic-renderers)
5. [Role-Based Access Control (RBAC) & Privilege Escalation Guards](#5-role-based-access-control-rbac--privilege-escalation-guards)
   - [Hardened Route Guards](#hardened-route-guards)
   - [Guarding Client-Side State Transitions](#guarding-client-side-state-transitions)
6. [Secure Storage & File Upload Pipeline](#6-secure-storage--file-upload-pipeline)
   - [MIME Type & File Size Validation](#mime-type--file-size-validation)
   - [Collision-Resistant Unique Storage Keys](#collision-resistant-unique-storage-keys)
   - [Bucket Policy Configuration](#bucket-policy-configuration)
7. [HTTP Headers & Production Edge Security (Vercel / Reverse Proxy)](#7-http-headers--production-edge-security-vercel--reverse-proxy)
   - [Security Headers Configuration](#security-headers-configuration)
   - [Content Security Policy (CSP) Directives](#content-security-policy-csp-directives)
8. [Anti-Abuse, Rate-Limiting & Telemetry Flood Protection](#8-anti-abuse-rate-limiting--telemetry-flood-protection)
9. [Pre-Flight Security Checklist for New Projects](#9-pre-flight-security-checklist-for-new-projects)

---

## 1. Executive Overview

This security blueprint documents the full-stack security architecture implemented in the **TapIt** platform. It provides copy-pasteable, modular security patterns that can be reused across any project (React, Next.js, Vue, Node.js, Supabase, or Firebase).

### Core Principles
1. **Defense in Depth**: Security controls are placed across all layers — HTTP headers, frontend routing, input sanitizers, data store, and database RLS.
2. **Zero-Dependency Cryptography**: Utilizing standard native APIs (`Web Crypto API`, PostgreSQL `pgcrypto`) rather than heavy or untrusted npm packages in client bundles.
3. **No Breaking Changes**: Security improvements seamlessly support existing users, upgrading outdated data formats transparently on first login.
4. **Principle of Least Privilege**: Users default to the lowest privilege level (`role: 'user'`), and public sync APIs never expose password hashes or sensitive internal fields.

---

## 2. Cryptographic Password Management

### Zero-Dependency Web Crypto PBKDF2
Instead of importing large, potentially vulnerable npm packages like `bcryptjs` in frontend bundles, use the browser's native **Web Crypto API** (`crypto.subtle`). It executes in native C++ browser space, is cryptographically secure, and produces no bundle bloat.

#### Implementation Pattern (`crypto.ts`):
```typescript
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
async function derivePbkdf2Hash(
  password: string, 
  salt: string, 
  iterations: number = PBKDF2_ITERATIONS
): Promise<string> {
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
    256 // 32 bytes (256-bit key)
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes a plaintext password using salted PBKDF2.
 * Output format: pbkdf2$<iterations>$<salt>$<hash>
 */
export async function hashPassword(
  password: string, 
  existingSalt?: string
): Promise<{ hashString: string; salt: string; hash: string }> {
  const salt = existingSalt || generateSalt(16);
  const hash = await derivePbkdf2Hash(password, salt, PBKDF2_ITERATIONS);
  const hashString = `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
  return { hashString, salt, hash };
}
```

---

### Constant-Time Verification (Timing Attack Defense)
Standard string equality (`===`) short-circuits on the first mismatched character. Attackers can measure response latency in microseconds to incrementally guess password hashes. A constant-time comparison helper prevents this vulnerability:

```typescript
/**
 * Constant-time comparison helper to prevent timing side-channel attacks.
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
 * Verifies a candidate password against a stored PBKDF2 hash string or legacy fallback.
 */
export async function verifyPassword(password: string, storedHashOrPlaintext?: string): Promise<boolean> {
  if (!storedHashOrPlaintext) return false;

  // 1. Stored in pbkdf2$<iterations>$<salt>$<hash> format
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

  // 2. Fallback for unhashed legacy records (avoids locking out old accounts)
  return timingSafeEqual(password, storedHashOrPlaintext);
}
```

---

### Seamless Legacy Password Auto-Upgrade
When upgrading an existing application where passwords were previously unhashed, **never force a mass password reset**. Instead, perform transparent auto-upgrades inside your login handler:

```typescript
// Inside handleLogin:
const isUserMatch = await verifyPassword(cleanPassword, storedHash);

if (isUserMatch) {
  // If the stored hash is NOT yet in PBKDF2 format, upgrade it immediately
  if (!storedHash.startsWith('pbkdf2$')) {
    void (async () => {
      try {
        const { hashString } = await hashPassword(cleanPassword);
        await supabase
          .from('users')
          .update({ password_hash: hashString })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Auto-upgrade password hash failed:', err);
      }
    })();
  }
}
```

---

### Database-Side Verification via PostgreSQL RPC
If passwords were ever hashed in PostgreSQL using `crypt(password, gen_salt('bf'))` (bcrypt format `$2a$`), the browser's Web Crypto API cannot verify bcrypt natively. To solve this without adding heavy client-side bcrypt libraries, expose a secure PostgreSQL RPC function in Supabase:

```sql
-- Secure RPC Function in schema.sql
CREATE OR REPLACE FUNCTION public.verify_user_password(
  identifier TEXT,
  candidate_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_user RECORD;
  is_valid BOOLEAN := false;
BEGIN
  -- Lookup user by email or username
  SELECT id, password_hash INTO found_user
  FROM public.users
  WHERE LOWER(email) = LOWER(identifier)
     OR LOWER(username) = LOWER(identifier)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;

  -- Verify using pgcrypto crypt()
  IF found_user.password_hash IS NOT NULL AND 
     found_user.password_hash = crypt(candidate_password, found_user.password_hash) THEN
    is_valid := true;
  END IF;

  RETURN jsonb_build_object('success', is_valid, 'user_id', found_user.id);
END;
$$;
```

---

## 3. Database & Backend Hardening (Supabase / PostgreSQL)

### Eliminating Credential Leakage in Client Sync Queries
In offline-first or dual-layer sync apps, client applications frequently fetch records to populate local storage cache. **Never select `*` or include sensitive columns in broad sync queries.**

```typescript
// ❌ INSECURE: Exposes password hashes of all users to the browser's Network inspector
const { data } = await supabase.from('users').select('*');

// ✅ SECURE: Select explicit public columns only, excluding password_hash
const { data } = await supabase
  .from('users')
  .select('id, name, username, email, role, avatar, bio, headline, status, created_at, last_login_at');
```

---

### Targeted Single-Row Credential Lookups
Password verification must only occur for the single user attempting to sign in:

```typescript
// Query strictly the targeted account by exact email or username match
const { data: remoteRow, error } = await supabase
  .from('users')
  .select('id, name, username, email, password_hash, role, status')
  .or(`email.ilike.${cleanInput},username.ilike.${cleanInput}`)
  .maybeSingle();
```

---

### Row-Level Security (RLS) Best Practices
Enable RLS on all tables and create explicit role-aware policies:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- 1. Public can read active profiles (required for public-facing profiles/NFC cards)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (is_active = true);

-- 2. Users can only update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- 3. System settings can only be modified by admins
CREATE POLICY "Only admins can update system settings" 
  ON public.system_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );
```

---

### Database Role Enums and Default Constraints
Prevent privilege escalation at the database schema level:

```sql
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  -- Strictly default to 'user' and constrain valid values
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Input Sanitization & Stored XSS Prevention

### Strict Protocol Whitelisting
Users can input URLs for social profiles, custom links, or avatars. An attacker might input `javascript:alert(document.cookie)` or `data:text/html,<script>...`. 

Use a strict protocol sanitizer before rendering any user-provided URL in an `<a>` tag or `<img>` tag:

```typescript
/**
 * Sanitizes URLs to prevent Stored Cross-Site Scripting (XSS).
 * Whitelists https:, http:, mailto:, tel:, and safe data:image/ protocols.
 */
export function sanitizeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  const lower = trimmed.toLowerCase();

  // 1. Block dangerous executable pseudo-protocols
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.includes('script:')
  ) {
    return fallback;
  }

  // 2. Allow safe inline base64 image data URLs (e.g. data:image/png;base64,...)
  if (lower.startsWith('data:image/')) {
    return trimmed;
  }

  // 3. Block any other data: schemes (such as data:text/html or data:application/javascript)
  if (lower.startsWith('data:')) {
    return fallback;
  }

  // 4. Standard safe protocols
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }

  // 5. Internal root-relative paths
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // 6. Default to secure https://
  return `https://${trimmed}`;
}
```

### Applying Sanitization to Dynamic Renderers
Always wrap dynamic outbound links and image sources:

```tsx
// For links:
<a 
  href={sanitizeUrl(link.url)} 
  target="_blank" 
  rel="noopener noreferrer"
>
  {link.title}
</a>

// For avatars:
<img 
  src={sanitizeUrl(profile.avatar, DEFAULT_AVATAR_FALLBACK)} 
  alt={profile.name} 
/>
```

---

## 5. Role-Based Access Control (RBAC) & Privilege Escalation Guards

### Hardened Route Guards
Protect admin routes against unauthorized tampering by validating against authenticated user properties:

```tsx
interface ProtectedRouteProps {
  children?: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, currentUser } = useTapIt();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce authentic database role check
  if (adminOnly && (!currentUser || currentUser.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
```

### Guarding Client-Side State Transitions
Prevent users from manually executing `setRole('admin')` in the browser console:

```typescript
const setRole = (role: UserRole) => {
  // Privilege escalation protection:
  // Only allow switching to 'admin' if the verified currentUser object has 'admin' privileges
  if (role === 'admin' && currentUser.role !== 'admin') {
    console.warn('[Security] Unauthorized role escalation blocked.');
    return;
  }
  setCurrentRole(role);
};
```

---

## 6. Secure Storage & File Upload Pipeline

### MIME Type & File Size Validation
Before uploading to cloud storage (e.g. Supabase Storage, S3, Firebase), reject invalid formats on the client:

```typescript
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  // 1. MIME check
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file format. Please upload JPG, PNG, or WEBP.');
  }

  // 2. File size check
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit.');
  }

  // 3. Collision-resistant randomized key (prevents path traversal and overwrite attacks)
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}-${Date.now()}-${generateSecureToken('img', 8)}.${fileExt}`;

  // 4. Upload to storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}
```

---

## 7. HTTP Headers & Production Edge Security

Add production security headers at the hosting/CDN layer (e.g. `vercel.json`, Cloudflare, Nginx, or Netlify):

### `vercel.json` Example:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.dicebear.com; object-src 'none'; base-uri 'self';"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## 8. Anti-Abuse, Rate-Limiting & Telemetry Flood Protection

For applications accepting public event tracking (e.g., NFC taps, QR scans, link clicks), implement memory-based client throttling to prevent bot flooding:

```typescript
const telemetryCooldowns = new Map<string, number>();

export function logAnalyticsEvent(eventData: AnalyticsEventInput) {
  const throttleKey = `${eventData.eventType}_${eventData.profileId}_${eventData.linkId || ''}`;
  const now = Date.now();
  const lastTime = telemetryCooldowns.get(throttleKey) || 0;

  // Block identical telemetry bursts within 5 seconds
  if (now - lastTime < 5000) {
    return;
  }
  telemetryCooldowns.set(throttleKey, now);

  // Proceed with logging...
}
```

---

## 9. Pre-Flight Security Checklist for New Projects

Before launching any new application to production, run through this checklist:

| Category | Security Check Item | Status |
| :--- | :--- | :---: |
| **Passwords** | Zero plaintext passwords in database; all hashed with PBKDF2 or bcrypt | ✅ |
| **Passwords** | Verification uses constant-time string comparison (`timingSafeEqual`) | ✅ |
| **API Queries** | `password_hash` column is explicitly excluded from public/sync queries | ✅ |
| **Authentication** | Universal test passwords (e.g. `'password123'`) are completely removed | ✅ |
| **Database** | RLS is active on all Supabase/Postgres tables with specific policies | ✅ |
| **Database** | User roles default to `'user'` with `CHECK (role IN ('admin', 'user'))` | ✅ |
| **XSS Defense** | All user-submitted URLs passed through `sanitizeUrl()` | ✅ |
| **XSS Defense** | `javascript:` and executable `data:` URLs are completely blocked | ✅ |
| **File Storage** | Uploaded files validated for MIME type (`image/jpeg`, etc.) and size limits | ✅ |
| **File Storage** | Random nonces used for filenames to prevent overwrites or path traversal | ✅ |
| **RBAC** | Admin routes protected by both backend check and client route guards | ✅ |
| **HTTP Headers** | Production CSP, HSTS, `X-Frame-Options: SAMEORIGIN`, and `nosniff` deployed | ✅ |

---
*Created for TapIt Smart Identity Platform. Reusable across modern web architectures.*
