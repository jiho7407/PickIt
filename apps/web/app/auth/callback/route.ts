import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getSafeRedirectPath(redirectTo: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/";
  }

  return redirectTo;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing auth code" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchange failed", { message: error.message });
    return NextResponse.json({ error: "Failed to exchange auth code" }, { status: 400 });
  }

  console.info("[auth/callback] exchange ok", {
    userId: data?.session?.user.id ?? null,
    email: data?.session?.user.email ?? null,
    origin: requestUrl.origin,
  });

  return NextResponse.redirect(
    new URL(getSafeRedirectPath(requestUrl.searchParams.get("redirectTo")), requestUrl.origin),
  );
}
