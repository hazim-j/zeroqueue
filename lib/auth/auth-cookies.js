import { serialize, parse } from 'cookie';

const TOKEN_NAME = 'session';
const BASE_AGE = 60 * 60 * 8; // 8 hours
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setTokenCookie(res, token, isExtededSession) {
  const cookieAge = isExtededSession ? MAX_AGE : BASE_AGE;
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: cookieAge,
    expires: new Date(Date.now() + cookieAge * 1000),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function parseCookies(req) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || '');
}

export function getTokenCookie(req) {
  const cookies = parseCookies(req);
  return cookies[TOKEN_NAME];
}
