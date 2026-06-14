import type { Response } from 'express';

export const REFRESH_COOKIE = 'refresh_token';
export const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function setRefreshCookie(res: Response, token: string): void {
  const isSecure = process.env.COOKIE_SECURE === 'true';
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'strict' : 'lax',
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/',
  });
}
