import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOrCreateAnonymousSessionId } from "@/lib/session/anonymous-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { castDetailVote } from "./vote-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/session/anonymous-session", () => ({
  getOrCreateAnonymousSessionId: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

function createFormData(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("castDetailVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrCreateAnonymousSessionId).mockResolvedValue("anonymous-session-1");
  });

  it("creates a vote and a vote-linked comment in one server action", async () => {
    const inserts: Array<{ table: string; payload: unknown }> = [];
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
      from: vi.fn((table: string) => ({
        insert: vi.fn(async (payload: unknown) => {
          inserts.push({ table, payload });
          return { error: null };
        }),
      })),
    } as never);

    const result = await castDetailVote(
      { status: "idle" },
      createFormData({
        choice: "skip",
        comment: "면접용이면 하나 사세요.",
        dilemmaId: "dilemma-1",
      }),
    );

    expect(result.status).toBe("success");
    expect(inserts[0]).toMatchObject({
      table: "votes",
      payload: {
        anonymous_session_id: "anonymous-session-1",
        choice: "skip",
        dilemma_id: "dilemma-1",
        option_id: null,
        voter_id: null,
      },
    });
    expect(inserts[1]).toMatchObject({
      table: "comments",
      payload: {
        author_id: null,
        body: "면접용이면 하나 사세요.",
        dilemma_id: "dilemma-1",
      },
    });
    expect(inserts[1].payload).toHaveProperty("vote_id", inserts[0].payload.id);
  });

  it("returns a duplicate vote error without creating a comment", async () => {
    const inserts: Array<{ table: string; payload: unknown }> = [];
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
      from: vi.fn((table: string) => ({
        insert: vi.fn(async (payload: unknown) => {
          inserts.push({ table, payload });
          return {
            error:
              table === "votes" ?
                { code: "23505", message: "duplicate key value violates unique constraint" }
              : null,
          };
        }),
      })),
    } as never);

    const result = await castDetailVote(
      { status: "idle" },
      createFormData({
        choice: "buy",
        comment: "좋아요",
        dilemmaId: "dilemma-1",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "이미 이 투표에 참여했어요.",
    });
    expect(inserts.map((insert) => insert.table)).toEqual(["votes"]);
  });
});
