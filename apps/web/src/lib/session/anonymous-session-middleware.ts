import type { NextRequest, NextResponse } from "next/server";
import { anonymousSessionCookieSchema } from "./schema";
import {
  ANONYMOUS_SESSION_COOKIE,
  ANONYMOUS_SESSION_COOKIE_OPTIONS,
  hashAnonymousSessionValue,
} from "./anonymous-session-core";

type MiddlewareAnonymousSessionDependencies = {
  createSessionValue?: () => string;
  persistSessionHash?: (sessionHash: string) => Promise<void>;
};

function createSessionValue(deps?: MiddlewareAnonymousSessionDependencies) {
  return deps?.createSessionValue?.() ?? crypto.randomUUID();
}

async function persistAnonymousSessionHash(sessionHash: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase anonymous session env is not configured");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/anonymous_sessions`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ session_hash: sessionHash }),
  });

  if (!response.ok && response.status !== 409) {
    throw new Error(`Failed to persist anonymous session: ${response.status}`);
  }
}

export async function ensureMiddlewareAnonymousSession(
  request: NextRequest,
  response: NextResponse,
  userId: string | null,
  dependencies?: MiddlewareAnonymousSessionDependencies,
) {
  if (userId) {
    if (request.cookies.has(ANONYMOUS_SESSION_COOKIE)) {
      response.cookies.delete(ANONYMOUS_SESSION_COOKIE);
    }

    return response;
  }

  const currentCookie = request.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value;
  const parsedCookie = anonymousSessionCookieSchema.safeParse(currentCookie);
  const sessionValue = parsedCookie.success ? parsedCookie.data : createSessionValue(dependencies);

  if (!parsedCookie.success) {
    response.cookies.set(
      ANONYMOUS_SESSION_COOKIE,
      sessionValue,
      ANONYMOUS_SESSION_COOKIE_OPTIONS,
    );
  }

  const persist = dependencies?.persistSessionHash ?? persistAnonymousSessionHash;
  try {
    await persist(await hashAnonymousSessionValue(sessionValue));
  } catch {
    // Do not block page rendering if the local/preview Supabase schema is stale.
    // Vote server actions call the server-side helper, which upserts the row again.
  }

  return response;
}
