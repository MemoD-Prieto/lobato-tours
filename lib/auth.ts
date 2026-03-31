/**
 * lib/auth.ts
 * JWT auth utilities using Node.js built-in crypto (no extra packages needed).
 *
 * ROLES (explicit permission tiers):
 *   admin   – full access: CRUD users, see ALL quotes, manage everything
 *   manager – see ALL quotes, edit any quote, cannot manage users
 *   user    – own quotes only (filtered by employee_id), cannot see others
 */
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

// ── Role constants ──────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  USER:    'user',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  admin:   'Administrador',
  manager: 'Gerente',
  user:    'Usuario',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin:   'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  user:    'bg-green-100 text-green-800',
};

// ── Permission helpers ──────────────────────────────────────────────────────
export const can = {
  manageUsers:  (role: Role) => role === ROLES.ADMIN,
  seeAllQuotes: (role: Role) => role === ROLES.ADMIN || role === ROLES.MANAGER,
  editAnyQuote: (role: Role) => role === ROLES.ADMIN || role === ROLES.MANAGER,
};

// ── JWT (HMAC-SHA256 via Node crypto) ──────────────────────────────────────
const SECRET = process.env.JWT_SECRET ?? 'lobato-tours-jwt-secret-change-in-prod';
const COOKIE  = 'lt_token';
const EXPIRY  = 60 * 60 * 24 * 7; // 7 days in seconds

export interface TokenPayload {
  id:        number;
  user_name: string;
  real_name: string;
  email:     string;
  role:      Role;
  iat:       number;
  exp:       number;
}

function b64url(s: string) {
  return Buffer.from(s).toString('base64url');
}
function fromB64url(s: string) {
  return Buffer.from(s, 'base64url').toString('utf8');
}

export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const full: TokenPayload = { ...payload, iat: now, exp: now + EXPIRY };
  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body    = b64url(JSON.stringify(full));
  const sig     = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): TokenPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [header, body, sig] = parts;
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  if (sig !== expected) throw new Error('Invalid token signature');
  const payload = JSON.parse(fromB64url(body)) as TokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

// ── Cookie helpers ──────────────────────────────────────────────────────────
export function setAuthCookie(res: NextApiResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${EXPIRY}`,
  );
}

export function clearAuthCookie(res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0`,
  );
}

// ── Request helpers ─────────────────────────────────────────────────────────
export function getTokenFromRequest(req: NextApiRequest): string | null {
  // Try cookie first, then Authorization header
  if (req.cookies?.[COOKIE]) return req.cookies[COOKIE];
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

/**
 * Parses the token from the request and returns the payload.
 * Returns null if missing/invalid (does NOT call res.status).
 */
export function getUserFromRequest(req: NextApiRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Middleware wrapper: ensures the request is authenticated.
 * Optionally restricts to specific roles.
 * Returns the payload or responds with 401/403 and returns null.
 */
export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  allowedRoles?: Role[],
): TokenPayload | null {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'No autenticado' });
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    res.status(403).json({ error: 'Sin permisos suficientes' });
    return null;
  }
  return user;
}
