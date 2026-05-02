import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createVote } from "./create-vote-actions";

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

function createSupabaseMock() {
  const inserts: Array<{ table: string; payload: unknown }> = [];

  const supabase = {
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
    from: vi.fn((table: string) => ({
      insert: vi.fn((payload: unknown) => {
        inserts.push({ table, payload });
        if (table === "dilemmas") {
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({ data: { id: "dilemma-1" }, error: null })),
            })),
          };
        }
        return Promise.resolve({ error: null });
      }),
      delete: vi.fn(() => ({
        eq: vi.fn(async () => ({ error: null })),
      })),
    })),
  };

  return { inserts, supabase };
}

describe("createVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a buy/skip dilemma for the authenticated user", async () => {
    const { inserts, supabase } = createSupabaseMock();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const result = await createVote(
      { status: "idle" },
      createFormData({
        voteType: "buy_skip",
        productName: "브라운 코트",
        price: "50000",
        category: "university",
        situation: "면접 때 한 번만 입을까 봐 고민돼요.",
        imagePath: "user-1/coat.jpg",
      }),
    );

    expect(result).toMatchObject({ status: "success", dilemmaId: "dilemma-1" });
    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      table: "dilemmas",
      payload: {
        author_id: "user-1",
        category: "university",
        image_path: "user-1/coat.jpg",
        price: 50000,
        product_name: "브라운 코트",
        status: "open",
        vote_type: "buy_skip",
      },
    });
  });

  it("creates two vote_options when creating an A/B dilemma", async () => {
    const { inserts, supabase } = createSupabaseMock();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const result = await createVote(
      { status: "idle" },
      createFormData({
        voteType: "ab",
        optionAName: "A 코트",
        optionBName: "B 코트",
        optionAPrice: "50000",
        optionBPrice: "60000",
        optionAImagePath: "user-1/a.jpg",
        optionBImagePath: "user-1/b.jpg",
        situation: "두 제품 중 어떤 걸 사야 할지 고민돼요.",
      }),
    );

    expect(result.status).toBe("success");
    expect(inserts.map((insert) => insert.table)).toEqual(["dilemmas", "vote_options"]);
    expect(inserts[1].payload).toEqual([
      {
        dilemma_id: "dilemma-1",
        image_path: "user-1/a.jpg",
        label: "A 코트",
        position: 1,
        price: 50000,
      },
      {
        dilemma_id: "dilemma-1",
        image_path: "user-1/b.jpg",
        label: "B 코트",
        position: 2,
        price: 60000,
      },
    ]);
  });

  it("rejects invalid buy/skip input before inserting", async () => {
    const { inserts, supabase } = createSupabaseMock();
    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as never);

    const result = await createVote(
      { status: "idle" },
      createFormData({
        voteType: "buy_skip",
        productName: "브라운 코트",
        price: "0",
        category: "university",
        situation: "면접 때 한 번만 입을까 봐 고민돼요.",
      }),
    );

    expect(result.status).toBe("error");
    expect(inserts).toHaveLength(0);
  });
});
