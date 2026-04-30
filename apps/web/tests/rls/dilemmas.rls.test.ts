import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cleanupRlsContext, createRlsContext, insertDilemma, type RlsContext } from "./fixtures";

describe("dilemmas RLS", () => {
  let ctx: RlsContext;

  beforeAll(async () => {
    ctx = await createRlsContext();
  });

  afterAll(async () => {
    await cleanupRlsContext(ctx);
  });

  it("lets anyone read public dilemmas but only authors read their draft dilemmas", async () => {
    const openId = await insertDilemma(ctx);
    const draftId = await insertDilemma(ctx, ctx.users.authorA.id, { status: "draft" });

    const { data: anonRows, error: anonError } = await ctx.anon
      .from("dilemmas")
      .select("id")
      .in("id", [openId, draftId]);
    expect(anonError).toBeNull();
    expect(anonRows?.map((row) => row.id)).toEqual([openId]);

    const { data: ownDraft, error: ownDraftError } = await ctx.users.authorA.client
      .from("dilemmas")
      .select("id")
      .eq("id", draftId)
      .single();
    expect(ownDraftError).toBeNull();
    expect(ownDraft?.id).toBe(draftId);

    const { data: otherDraft, error: otherDraftError } = await ctx.users.authorB.client
      .from("dilemmas")
      .select("id")
      .eq("id", draftId);
    expect(otherDraftError).toBeNull();
    expect(otherDraft).toEqual([]);
  });

  it("rejects inserts where author_id does not match the authenticated user", async () => {
    const { error } = await ctx.users.authorB.client.from("dilemmas").insert({
      author_id: ctx.users.authorA.id,
      category: "test",
      price: 10000,
      product_name: "테스트 상품",
      situation: "작성자 불일치 insert를 막기 위한 충분히 긴 설명입니다.",
      title: "작성자 불일치",
    });

    expect(error).not.toBeNull();
  });

  it("prevents other users from updating or deleting an author's dilemma", async () => {
    const updateId = await insertDilemma(ctx);
    await ctx.users.authorB.client
      .from("dilemmas")
      .update({ title: "다른 사용자의 수정" })
      .eq("id", updateId);

    const { data: afterUpdate } = await ctx.service
      .from("dilemmas")
      .select("title")
      .eq("id", updateId)
      .single();
    expect(afterUpdate?.title).toBe("테스트 고민");

    const deleteId = await insertDilemma(ctx);
    await ctx.users.authorB.client.from("dilemmas").delete().eq("id", deleteId);

    const { data: afterDelete } = await ctx.service
      .from("dilemmas")
      .select("id")
      .eq("id", deleteId)
      .single();
    expect(afterDelete?.id).toBe(deleteId);
  });
});
