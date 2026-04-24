import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: supabaseMocks.exchangeCodeForSession,
    },
  })),
}));

import { GET } from "./route";

function makeRequest(url: string) {
  return new NextRequest(url);
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    supabaseMocks.exchangeCodeForSession.mockReset();
  });

  it("returns 400 when code is missing", async () => {
    const response = await GET(makeRequest("http://localhost:3000/auth/callback"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Missing auth code" });
    expect(supabaseMocks.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("exchanges a code and redirects to a relative redirectTo path", async () => {
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&redirectTo=/new"),
    );

    expect(supabaseMocks.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/new");
  });

  it("does not redirect to external redirectTo values", async () => {
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&redirectTo=https://evil.test"),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("returns 400 when Supabase cannot exchange the code", async () => {
    supabaseMocks.exchangeCodeForSession.mockResolvedValue({ error: new Error("bad code") });

    const response = await GET(makeRequest("http://localhost:3000/auth/callback?code=bad"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Failed to exchange auth code" });
  });
});
