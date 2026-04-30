import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it, vi } from "vitest";
import {
  ANONYMOUS_SESSION_COOKIE,
  ANONYMOUS_SESSION_COOKIE_OPTIONS,
  hashAnonymousSessionValue,
} from "./anonymous-session-core";
import { ensureMiddlewareAnonymousSession } from "./anonymous-session-middleware";

const rawSession = "11111111-1111-4111-8111-111111111111";

function makeRequest(cookie?: string) {
  return new NextRequest("http://localhost:3000/", {
    headers: cookie ? { cookie: `${ANONYMOUS_SESSION_COOKIE}=${cookie}` } : undefined,
  });
}

describe("ensureMiddlewareAnonymousSession", () => {
  it("sets a secure anonymous cookie and persists only its hash for anonymous users", async () => {
    const persistSessionHash = vi.fn(async () => undefined);
    const response = NextResponse.next();

    await ensureMiddlewareAnonymousSession(makeRequest(), response, null, {
      createSessionValue: () => rawSession,
      persistSessionHash,
    });

    expect(response.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value).toBe(rawSession);
    expect(response.cookies.get(ANONYMOUS_SESSION_COOKIE)).toMatchObject({
      httpOnly: ANONYMOUS_SESSION_COOKIE_OPTIONS.httpOnly,
      maxAge: ANONYMOUS_SESSION_COOKIE_OPTIONS.maxAge,
      path: ANONYMOUS_SESSION_COOKIE_OPTIONS.path,
      sameSite: ANONYMOUS_SESSION_COOKIE_OPTIONS.sameSite,
      secure: ANONYMOUS_SESSION_COOKIE_OPTIONS.secure,
    });
    expect(persistSessionHash).toHaveBeenCalledWith(await hashAnonymousSessionValue(rawSession));
  });

  it("reuses a valid anonymous cookie without resetting it", async () => {
    const persistSessionHash = vi.fn(async () => undefined);
    const response = NextResponse.next();

    await ensureMiddlewareAnonymousSession(makeRequest(rawSession), response, null, {
      createSessionValue: () => "22222222-2222-4222-8222-222222222222",
      persistSessionHash,
    });

    expect(response.cookies.get(ANONYMOUS_SESSION_COOKIE)).toBeUndefined();
    expect(persistSessionHash).toHaveBeenCalledWith(await hashAnonymousSessionValue(rawSession));
  });

  it("clears anonymous cookies for authenticated users", async () => {
    const persistSessionHash = vi.fn(async () => undefined);
    const response = NextResponse.next();

    await ensureMiddlewareAnonymousSession(makeRequest(rawSession), response, "user-id", {
      persistSessionHash,
    });

    expect(response.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value).toBe("");
    expect(persistSessionHash).not.toHaveBeenCalled();
  });

  it("does not fail the response when persistence is temporarily unavailable", async () => {
    const response = NextResponse.next();

    await expect(
      ensureMiddlewareAnonymousSession(makeRequest(), response, null, {
        createSessionValue: () => rawSession,
        persistSessionHash: vi.fn(async () => {
          throw new Error("storage unavailable");
        }),
      }),
    ).resolves.toBe(response);

    expect(response.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value).toBe(rawSession);
  });
});
