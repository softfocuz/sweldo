interface AccessTokenPayload {
  sub: string;
  exp: number;
}

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: AccessTokenPayload): boolean {
  return payload.exp * 1000 < Date.now();
}
