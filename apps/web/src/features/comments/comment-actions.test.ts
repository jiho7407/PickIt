import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteMyComment } from "./comment-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

function createFormData(values: Record<string, string>) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

function buildDeleteStub(args: {
  user: { id: string } | null;
  deletedRow: { id: string; dilemma_id: string } | null;
  error?: { code: string; message: string } | null;
}) {
  const filters: Array<[string, string]> = [];
  const builder = {
    delete: vi.fn(() => builder),
    eq: vi.fn((column: string, value: string) => {
      filters.push([column, value]);
      return builder;
    }),
    select: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({
      data: args.deletedRow,
      error: args.error ?? null,
    })),
  };
  const client = {
    auth: { getUser: vi.fn(async () => ({ data: { user: args.user } })) },
    from: vi.fn(() => builder),
  };
  return { builder, client, filters };
}

describe("deleteMyComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes only a comment authored by the current user", async () => {
    const stub = buildDeleteStub({
      user: { id: "user-1" },
      deletedRow: { id: "comment-1", dilemma_id: "dilemma-1" },
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await deleteMyComment(
      { status: "idle" },
      createFormData({ commentId: "comment-1" }),
    );

    expect(result.status).toBe("success");
    expect(stub.client.from).toHaveBeenCalledWith("comments");
    expect(stub.filters).toEqual([
      ["id", "comment-1"],
      ["author_id", "user-1"],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/me/votes");
    expect(revalidatePath).toHaveBeenCalledWith("/votes/dilemma-1");
  });

  it("fails when the matching author-owned comment is not found", async () => {
    const stub = buildDeleteStub({ user: { id: "user-1" }, deletedRow: null });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await deleteMyComment(
      { status: "idle" },
      createFormData({ commentId: "comment-2" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("내가 작성한");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
