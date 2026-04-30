import type { NextRequest } from "next/server";
import { ensureMiddlewareAnonymousSession } from "./src/lib/session/anonymous-session-middleware";
import { updateSession } from "./src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, userId } = await updateSession(request);

  return ensureMiddlewareAnonymousSession(request, response, userId);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|auth/callback|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
