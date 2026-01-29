import type { AuthUser } from './types';

const COOKIE_NAME = 'unitime_user';

const encode = (value: string) => encodeURIComponent(value);
const decode = (value: string) => decodeURIComponent(value);

export const setAuthCookie = (user: AuthUser) => {
  const json = JSON.stringify(user);
  const maxAgeSeconds = 60 * 60 * 24 * 7;
  document.cookie = `${COOKIE_NAME}=${encode(json)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
};

export const clearAuthCookie = () => {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
};

export const getAuthCookie = (): AuthUser | null => {
  const cookies = document.cookie.split(';').map(c => c.trim());
  const pair = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!pair) return null;

  const raw = pair.slice(`${COOKIE_NAME}=`.length);
  try {
    const parsed = JSON.parse(decode(raw));
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.id !== 'string') return null;
    if (typeof parsed.name !== 'string') return null;
    if (typeof parsed.email !== 'string') return null;
    if (parsed.role !== 'admin' && parsed.role !== 'teacher') return null;
    return parsed as AuthUser;
  } catch {
    return null;
  }
};
