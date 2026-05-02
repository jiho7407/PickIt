import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAnonymousSessionIdIfPresent,
  getOrCreateAnonymousSessionId,
} from "@/lib/session/anonymous-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordDetailVote, submitDetailComment } from "./vote-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/session/anonymous-session", () => ({
  getOrCreateAnonymousSessionId: vi.fn(),
  getAnonymousSessionIdIfPresent: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

function createFormData(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

type SupabaseStub = {
  auth: { getUser: ReturnType<typeof vi.fn> };
  from: ReturnType<typeof vi.fn>;
};

function buildSupabaseStub(args: {
  user: { id: string } | null;
  existingVoteId: string | null;
  insertResult?: { error: { code: string; message: string } | null };
  updateResult?: { error: { code: string; message: string } | null };
  commentInsertResult?: { error: { code: string; message: string } | null };
}): {
  client: SupabaseStub;
  inserts: Array<{ table: string; payload: unknown }>;
  updates: Array<{ table: string; payload: unknown; matchId: string }>;
} {
  const inserts: Array<{ table: string; payload: unknown }> = [];
  const updates: Array<{ table: string; payload: unknown; matchId: string }> = [];

  function selectVote() {
    const builder = {
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(async () => ({
        data: args.existingVoteId ? { id: args.existingVoteId } : null,
      })),
    };
    return builder;
  }

  return {
    inserts,
    updates,
    client: {
      auth: { getUser: vi.fn(async () => ({ data: { user: args.user } })) },
      from: vi.fn((table: string) => ({
        select: vi.fn(() => selectVote()),
        insert: vi.fn(async (payload: unknown) => {
          inserts.push({ table, payload });
          if (table === "votes") {
            return args.insertResult ?? { error: null };
          }
          return args.commentInsertResult ?? { error: null };
        }),
        update: vi.fn((payload: unknown) => ({
          eq: vi.fn(async (_column: string, value: string) => {
            updates.push({ table, payload, matchId: value });
            return args.updateResult ?? { error: null };
          }),
        })),
      })),
    } satisfies SupabaseStub,
  };
}

describe("recordDetailVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrCreateAnonymousSessionId).mockResolvedValue("anonymous-session-1");
    vi.mocked(getAnonymousSessionIdIfPresent).mockResolvedValue("anonymous-session-1");
  });

  it("inserts a new vote when none exists for the voter", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: null });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await recordDetailVote(
      { status: "idle" },
      createFormData({ choice: "skip", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("success");
    expect(stub.inserts).toHaveLength(1);
    expect(stub.inserts[0]).toMatchObject({
      table: "votes",
      payload: {
        anonymous_session_id: "anonymous-session-1",
        choice: "skip",
        dilemma_id: "dilemma-1",
        option_id: null,
        voter_id: null,
      },
    });
    expect(stub.updates).toHaveLength(0);
  });

  it("updates the existing vote so the voter can switch choice", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: "vote-1" });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await recordDetailVote(
      { status: "idle" },
      createFormData({ choice: "buy", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("success");
    expect(stub.inserts).toHaveLength(0);
    expect(stub.updates).toHaveLength(1);
    expect(stub.updates[0]).toMatchObject({
      table: "votes",
      payload: { choice: "buy", option_id: null },
      matchId: "vote-1",
    });
  });

  it("reports an error message when insert fails", async () => {
    const stub = buildSupabaseStub({
      user: null,
      existingVoteId: null,
      insertResult: { error: { code: "42501", message: "permission denied" } },
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await recordDetailVote(
      { status: "idle" },
      createFormData({ choice: "skip", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
  });
});

describe("submitDetailComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOrCreateAnonymousSessionId).mockResolvedValue("anonymous-session-1");
    vi.mocked(getAnonymousSessionIdIfPresent).mockResolvedValue("anonymous-session-1");
  });

  it("inserts a comment linked to the existing vote", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: "vote-1" });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await submitDetailComment(
      { status: "idle" },
      createFormData({ comment: "면접용이면 하나 사세요.", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("success");
    expect(stub.inserts).toHaveLength(1);
    expect(stub.inserts[0]).toMatchObject({
      table: "comments",
      payload: {
        author_id: null,
        body: "면접용이면 하나 사세요.",
        dilemma_id: "dilemma-1",
        vote_id: "vote-1",
      },
    });
  });

  it("rejects the comment when the voter has not voted yet", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: null });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await submitDetailComment(
      { status: "idle" },
      createFormData({ comment: "한마디", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("먼저 투표");
    expect(stub.inserts).toHaveLength(0);
  });

  it("rejects an empty comment", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: "vote-1" });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await submitDetailComment(
      { status: "idle" },
      createFormData({ comment: "   ", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
    expect(stub.inserts).toHaveLength(0);
  });
});
