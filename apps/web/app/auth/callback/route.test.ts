import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  maybeSingleProfile: vi.fn(),
  setAll: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _key: string, options: { cookies: { setAll: typeof supabaseMocks.setAll } }) => ({
    auth: {
      exchangeCodeForSession: vi.fn(async (code: string) => {
        options.cookies.setAll(
          [{ name: "sb-test-auth-token", value: "token", options: { path: "/" } }],
          { "Cache-Control": "private, no-store" },
        );
        return supabaseMocks.exchangeCodeForSession(code);
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: supabaseMocks.maybeSingleProfile,
        })),
      })),
    })),
  })),
}));

import { GET } from "./route";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

function makeRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    supabaseMocks.exchangeCodeForSession.mockReset();
    supabaseMocks.maybeSingleProfile.mockReset();
    supabaseMocks.setAll.mockReset();
    supabaseMocks.maybeSingleProfile.mockResolvedValue({
      data: { life_stage: "worker" },
      error: null,
    });
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      return;
    }

    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("returns 400 when code is missing", async () => {
    const response = await GET(makeRequest("http://localhost:3000/auth/callback"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing auth code" });
    expect(supabaseMocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("exchanges a code and redirects to a relative redirectTo path", async () => {
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "user@example.com" } } },
      error: null,
    });

    const response = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&redirectTo=/new"),
    );

    expect(supabaseMocks.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/new");
    expect(response.headers.get("set-cookie")).toContain("sb-test-auth-token=token");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("uses the configured app origin for callback redirects", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3000";
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "user@example.com" } } },
      error: null,
    });

    const response = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&redirectTo=/new"),
    );

    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/new");
  });

  it("redirects users without a life-stage profile tag to the signup tag selection", async () => {
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "user@example.com" } } },
      error: null,
    });
    supabaseMocks.maybeSingleProfile.mockResolvedValue({
      data: { life_stage: null },
      error: null,
    });

    const response = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&redirectTo=/votes/dilemma-1"),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/onboarding/life-stage?redirectTo=%2Fvotes%2Fdilemma-1",
    );
  });

  it("does not redirect to external redirectTo values", async () => {
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "user@example.com" } } },
      error: null,
    });

    const response = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&redirectTo=https://evil.test"),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("returns 400 when Supabase cannot exchange the code", async () => {
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({
      data: null,
      error: new Error("bad code"),
    });

    const response = await GET(makeRequest("http://localhost:3000/auth/callback?code=bad"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Failed to exchange auth code" });
  });
});
