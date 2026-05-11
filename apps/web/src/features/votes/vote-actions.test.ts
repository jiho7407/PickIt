import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { castQuickVote, recordDetailVote, submitDetailComment } from "./vote-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
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
  dilemmaStatus?: "open" | "closed";
  dilemmaClosesAt?: string;
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

  function selectDilemma() {
    const builder = {
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(async () => ({
        data: {
          status: args.dilemmaStatus ?? "open",
          closes_at: args.dilemmaClosesAt ?? "2099-01-01T00:00:00.000Z",
        },
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
        select: vi.fn(() => (table === "dilemmas" ? selectDilemma() : selectVote())),
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

describe("castQuickVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects signed-out visitors to login while preserving the feed path", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: null });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    await expect(
      castQuickVote(
        createFormData({
          choice: "skip",
          dilemmaId: "dilemma-1",
          redirectTo: "/?stage=worker",
        }),
      ),
    ).rejects.toThrow("redirect:/login?redirectTo=%2F%3Fstage%3Dworker");

    expect(redirect).toHaveBeenCalledWith("/login?redirectTo=%2F%3Fstage%3Dworker");
    expect(stub.inserts).toHaveLength(0);
  });
});

describe("recordDetailVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when the visitor is not signed in", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: null });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await recordDetailVote(
      { status: "idle" },
      createFormData({ choice: "skip", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("로그인");
    expect(stub.inserts).toHaveLength(0);
    expect(stub.updates).toHaveLength(0);
  });

  it("inserts a new vote when none exists for the signed-in voter", async () => {
    const stub = buildSupabaseStub({ user: { id: "user-1" }, existingVoteId: null });
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
        anonymous_session_id: null,
        choice: "skip",
        dilemma_id: "dilemma-1",
        option_id: null,
        voter_id: "user-1",
      },
    });
    expect(stub.updates).toHaveLength(0);
  });

  it("updates the existing vote so the voter can switch choice", async () => {
    const stub = buildSupabaseStub({ user: { id: "user-1" }, existingVoteId: "vote-1" });
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
      user: { id: "user-1" },
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

  it("refuses to record a vote on a closed dilemma", async () => {
    const stub = buildSupabaseStub({
      user: { id: "user-1" },
      existingVoteId: null,
      dilemmaStatus: "closed",
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await recordDetailVote(
      { status: "idle" },
      createFormData({ choice: "skip", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("마감");
    expect(stub.inserts).toHaveLength(0);
    expect(stub.updates).toHaveLength(0);
  });

  it("refuses when closes_at has passed even if status is still open", async () => {
    const stub = buildSupabaseStub({
      user: { id: "user-1" },
      existingVoteId: null,
      dilemmaStatus: "open",
      dilemmaClosesAt: "2020-01-01T00:00:00.000Z",
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await recordDetailVote(
      { status: "idle" },
      createFormData({ choice: "skip", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("마감");
    expect(stub.inserts).toHaveLength(0);
  });
});

describe("submitDetailComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when the visitor is not signed in", async () => {
    const stub = buildSupabaseStub({ user: null, existingVoteId: "vote-1" });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await submitDetailComment(
      { status: "idle" },
      createFormData({ comment: "한마디", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("로그인");
    expect(stub.inserts).toHaveLength(0);
  });

  it("inserts a comment linked to the existing vote", async () => {
    const stub = buildSupabaseStub({ user: { id: "user-1" }, existingVoteId: "vote-1" });
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
        author_id: "user-1",
        body: "면접용이면 하나 사세요.",
        dilemma_id: "dilemma-1",
        vote_id: "vote-1",
      },
    });
  });

  it("rejects the comment when the voter has not voted yet", async () => {
    const stub = buildSupabaseStub({ user: { id: "user-1" }, existingVoteId: null });
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
    const stub = buildSupabaseStub({ user: { id: "user-1" }, existingVoteId: "vote-1" });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await submitDetailComment(
      { status: "idle" },
      createFormData({ comment: "   ", dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("error");
    expect(stub.inserts).toHaveLength(0);
  });
});
