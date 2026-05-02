import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSafeRedirectPath } from "@/lib/redirect";
import type { Database } from "@/lib/database.types";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function applyAuthCookies(response: NextResponse, cookiesToSet: CookieToSet[], headersToSet: Record<string, string>) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  Object.entries(headersToSet).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

function getConfiguredAppOrigin(requestUrl: URL) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!siteUrl) {
    return requestUrl.origin;
  }

  try {
    return new URL(siteUrl).origin;
  } catch {
    console.error("[auth/callback] invalid NEXT_PUBLIC_SITE_URL", { siteUrl });
    return requestUrl.origin;
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const appOrigin = getConfiguredAppOrigin(requestUrl);
  const code = requestUrl.searchParams.get("code");
  const cookiesToSet: CookieToSet[] = [];
  const headersToSet: Record<string, string> = {};

  if (!code) {
    return NextResponse.json({ error: "Missing auth code" }, { status: 400 });
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(nextCookies, nextHeaders) {
          cookiesToSet.push(...nextCookies);
          Object.assign(headersToSet, nextHeaders);
        },
      },
    },
  );
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchange failed", { message: error.message });
    return applyAuthCookies(
      NextResponse.json({ error: "Failed to exchange auth code" }, { status: 400 }),
      cookiesToSet,
      headersToSet,
    );
  }

  console.info("[auth/callback] exchange ok", {
    userId: data?.session?.user.id ?? null,
    email: data?.session?.user.email ?? null,
    requestOrigin: requestUrl.origin,
    appOrigin,
  });

  const redirectTo = getSafeRedirectPath(requestUrl.searchParams.get("redirectTo"));
  const userId = data?.session?.user.id;

  if (userId) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("life_stage")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile?.life_stage) {
      const onboardingUrl = new URL("/onboarding/life-stage", appOrigin);
      onboardingUrl.searchParams.set("redirectTo", redirectTo);
      return applyAuthCookies(NextResponse.redirect(onboardingUrl), cookiesToSet, headersToSet);
    }
  }

  return applyAuthCookies(
    NextResponse.redirect(new URL(redirectTo, appOrigin)),
    cookiesToSet,
    headersToSet,
  );
}
