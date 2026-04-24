import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import type { Database } from "../database.types";
import { createServerSupabaseClient } from "../supabase/server";
import { anonymousSessionCookieSchema, anonymousSessionRowSchema } from "./schema";

export const ANONYMOUS_SESSION_COOKIE = "pickit_anon_sid";
export const ANONYMOUS_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 180,
  path: "/",
} as const satisfies CookieOptions;

type CookieStore = {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: typeof ANONYMOUS_SESSION_COOKIE_OPTIONS) => void;
};

type AnonymousSessionDependencies = {
  cookies: CookieStore;
  getUserId: () => Promise<string | null>;
  findSession: (sessionHash: string) => Promise<string | null>;
  upsertSession: (sessionHash: string) => Promise<string>;
  createSessionValue?: () => string;
};

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service env is not configured");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function upsertAnonymousSession(sessionHash: string) {
  const { data, error } = await createAdminClient()
    .from("anonymous_sessions")
    .upsert({ session_hash: sessionHash }, { onConflict: "session_hash" })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return anonymousSessionRowSchema.parse(data).id;
}

export async function findAnonymousSession(sessionHash: string) {
  const { data, error } = await createAdminClient()
    .from("anonymous_sessions")
    .select("id")
    .eq("session_hash", sessionHash)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? anonymousSessionRowSchema.parse(data).id : null;
}

async function createDefaultDependencies(): Promise<AnonymousSessionDependencies> {
  const cookieStore = await cookies();

  return {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set(name, value, options),
    },
    getUserId: async () => {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user?.id ?? null;
    },
    findSession: findAnonymousSession,
    upsertSession: upsertAnonymousSession,
  };
}

function getValidCookieValue(cookieStore: CookieStore) {
  const value = cookieStore.get(ANONYMOUS_SESSION_COOKIE);
  const parsed = anonymousSessionCookieSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

function createSessionValue(deps: AnonymousSessionDependencies) {
  return deps.createSessionValue?.() ?? crypto.randomUUID();
}

export async function hashAnonymousSessionValue(sessionValue: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sessionValue));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function ensureAnonymousSession(
  dependencies?: AnonymousSessionDependencies,
): Promise<string | null> {
  const deps = dependencies ?? (await createDefaultDependencies());

  if (await deps.getUserId()) {
    return null;
  }

  const existingSessionValue = getValidCookieValue(deps.cookies);

  if (existingSessionValue) {
    const existingSessionId = await deps.findSession(
      await hashAnonymousSessionValue(existingSessionValue),
    );

    if (existingSessionId) {
      return existingSessionId;
    }
  }

  const sessionValue = createSessionValue(deps);
  deps.cookies.set(ANONYMOUS_SESSION_COOKIE, sessionValue, ANONYMOUS_SESSION_COOKIE_OPTIONS);

  return deps.upsertSession(await hashAnonymousSessionValue(sessionValue));
}

export async function getOrCreateAnonymousSessionId(): Promise<string> {
  const id = await ensureAnonymousSession();

  if (!id) {
    throw new Error("Authenticated users do not receive anonymous sessions");
  }

  return id;
}

export async function getAnonymousSessionIdIfPresent(
  dependencies?: AnonymousSessionDependencies,
): Promise<string | null> {
  const deps = dependencies ?? (await createDefaultDependencies());

  if (await deps.getUserId()) {
    return null;
  }

  const sessionValue = getValidCookieValue(deps.cookies);

  if (!sessionValue) {
    return null;
  }

  return deps.findSession(await hashAnonymousSessionValue(sessionValue));
}
