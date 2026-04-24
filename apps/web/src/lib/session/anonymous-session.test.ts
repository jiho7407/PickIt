import { describe, expect, it, vi } from "vitest";
import {
  ANONYMOUS_SESSION_COOKIE,
  ANONYMOUS_SESSION_COOKIE_OPTIONS,
  ensureAnonymousSession,
  getAnonymousSessionIdIfPresent,
  hashAnonymousSessionValue,
} from "./anonymous-session";

const rawSession = "11111111-1111-4111-8111-111111111111";
const rowId = "22222222-2222-4222-8222-222222222222";

function makeDeps(cookieValue?: string, userId: string | null = null) {
  const cookies = new Map<string, string>();
  if (cookieValue) {
    cookies.set(ANONYMOUS_SESSION_COOKIE, cookieValue);
  }

  const setCookie = vi.fn((name: string, value: string) => {
    cookies.set(name, value);
  });
  const findSession = vi.fn(async () => rowId as string | null);
  const upsertSession = vi.fn(async () => rowId);

  return {
    deps: {
      cookies: {
        get: (name: string) => cookies.get(name),
        set: setCookie,
      },
      getUserId: vi.fn(async () => userId),
      findSession,
      upsertSession,
      createSessionValue: () => rawSession,
    },
    setCookie,
    findSession,
    upsertSession,
  };
}

describe("ensureAnonymousSession", () => {
  it("creates a secure cookie and DB row for a new anonymous visitor", async () => {
    const { deps, setCookie, upsertSession } = makeDeps();

    const id = await ensureAnonymousSession(deps);

    expect(id).toBe(rowId);
    expect(setCookie).toHaveBeenCalledWith(
      ANONYMOUS_SESSION_COOKIE,
      rawSession,
      ANONYMOUS_SESSION_COOKIE_OPTIONS,
    );
    expect(upsertSession).toHaveBeenCalledWith(await hashAnonymousSessionValue(rawSession));
  });

  it("reuses an existing valid cookie", async () => {
    const { deps, findSession, setCookie, upsertSession } = makeDeps(rawSession);

    const id = await ensureAnonymousSession(deps);

    expect(id).toBe(rowId);
    expect(setCookie).not.toHaveBeenCalled();
    expect(findSession).toHaveBeenCalledWith(await hashAnonymousSessionValue(rawSession));
    expect(upsertSession).not.toHaveBeenCalled();
  });

  it("replaces a valid cookie whose DB row no longer exists", async () => {
    const { deps, findSession, setCookie, upsertSession } = makeDeps(
      "33333333-3333-4333-8333-333333333333",
    );
    findSession.mockResolvedValueOnce(null);

    const id = await ensureAnonymousSession(deps);

    expect(id).toBe(rowId);
    expect(setCookie).toHaveBeenCalledWith(
      ANONYMOUS_SESSION_COOKIE,
      rawSession,
      ANONYMOUS_SESSION_COOKIE_OPTIONS,
    );
    expect(upsertSession).toHaveBeenCalledWith(await hashAnonymousSessionValue(rawSession));
  });

  it("replaces an invalid cookie before storing a session", async () => {
    const { deps, setCookie, upsertSession } = makeDeps("not-a-uuid");

    const id = await ensureAnonymousSession(deps);

    expect(id).toBe(rowId);
    expect(setCookie).toHaveBeenCalledWith(
      ANONYMOUS_SESSION_COOKIE,
      rawSession,
      ANONYMOUS_SESSION_COOKIE_OPTIONS,
    );
    expect(upsertSession).toHaveBeenCalledWith(await hashAnonymousSessionValue(rawSession));
  });

  it("does not create an anonymous session for authenticated users", async () => {
    const { deps, setCookie, upsertSession } = makeDeps(undefined, "user-id");

    const id = await ensureAnonymousSession(deps);

    expect(id).toBeNull();
    expect(setCookie).not.toHaveBeenCalled();
    expect(upsertSession).not.toHaveBeenCalled();
  });
});

describe("getAnonymousSessionIdIfPresent", () => {
  it("returns null when no cookie is present", async () => {
    const { deps, findSession, upsertSession } = makeDeps();

    await expect(getAnonymousSessionIdIfPresent(deps)).resolves.toBeNull();
    expect(findSession).not.toHaveBeenCalled();
    expect(upsertSession).not.toHaveBeenCalled();
  });

  it("returns the DB row id for a valid existing cookie", async () => {
    const { deps, findSession, upsertSession } = makeDeps(rawSession);

    await expect(getAnonymousSessionIdIfPresent(deps)).resolves.toBe(rowId);
    expect(findSession).toHaveBeenCalledWith(await hashAnonymousSessionValue(rawSession));
    expect(upsertSession).not.toHaveBeenCalled();
  });
});

describe("hashAnonymousSessionValue", () => {
  it("returns a SHA-256 hex digest without exposing the raw value", async () => {
    const hash = await hashAnonymousSessionValue(rawSession);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(rawSession);
  });
});
