import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { archiveMyDilemma } from "./my-vote-actions";

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

function buildUpdateStub(args: {
  user: { id: string } | null;
  updatedRow: { id: string } | null;
  error?: { code: string; message: string } | null;
}) {
  const filters: Array<[string, string]> = [];
  const updates: unknown[] = [];
  const builder = {
    update: vi.fn((payload: unknown) => {
      updates.push(payload);
      return builder;
    }),
    eq: vi.fn((column: string, value: string) => {
      filters.push([column, value]);
      return builder;
    }),
    select: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({
      data: args.updatedRow,
      error: args.error ?? null,
    })),
  };
  const client = {
    auth: { getUser: vi.fn(async () => ({ data: { user: args.user } })) },
    from: vi.fn(() => builder),
  };
  return { client, filters, updates };
}

describe("archiveMyDilemma", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("archives only a dilemma authored by the current user", async () => {
    const stub = buildUpdateStub({
      user: { id: "user-1" },
      updatedRow: { id: "dilemma-1" },
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await archiveMyDilemma(
      { status: "idle" },
      createFormData({ dilemmaId: "dilemma-1" }),
    );

    expect(result.status).toBe("success");
    expect(stub.client.from).toHaveBeenCalledWith("dilemmas");
    expect(stub.updates).toEqual([{ status: "archived" }]);
    expect(stub.filters).toEqual([
      ["id", "dilemma-1"],
      ["author_id", "user-1"],
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/me/votes");
    expect(revalidatePath).toHaveBeenCalledWith("/votes/dilemma-1");
  });

  it("fails when another user's dilemma is targeted", async () => {
    const stub = buildUpdateStub({ user: { id: "user-1" }, updatedRow: null });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(stub.client as never);

    const result = await archiveMyDilemma(
      { status: "idle" },
      createFormData({ dilemmaId: "dilemma-2" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("내가 만든");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
