import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'linkal-super-secret-key-change-in-production-2026'
);

const COOKIE_NAME = 'linkal_session';

export interface AdminUser {
  email: string;
  role: 'owner';
}

export async function createSession(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role === 'owner' && typeof payload.email === 'string') {
      return { email: payload.email, role: 'owner' };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function verifyCredentials(email: string, pass: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@linkal.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'linkal123';
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && pass === adminPassword;
}
