import type { CookieOptions } from "@supabase/ssr";

export const ANONYMOUS_SESSION_COOKIE = "pickit_anon_sid";
export const ANONYMOUS_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 180,
  path: "/",
} as const satisfies CookieOptions;

export async function hashAnonymousSessionValue(sessionValue: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sessionValue));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
