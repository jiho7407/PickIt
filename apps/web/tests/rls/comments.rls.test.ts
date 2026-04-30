import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupRlsContext,
  createRlsContext,
  insertAnonymousVote,
  insertAuthenticatedVote,
  insertDilemma,
  type RlsContext,
} from "./fixtures";

describe("comments RLS", () => {
  let ctx: RlsContext;

  beforeAll(async () => {
    ctx = await createRlsContext();
  });

  afterAll(async () => {
    await cleanupRlsContext(ctx);
  });

  it("allows authenticated vote-linked comments and blocks other users from deleting them", async () => {
    const dilemmaId = await insertDilemma(ctx);
    const voteId = await insertAuthenticatedVote(ctx, ctx.users.authorB, dilemmaId);
    const { data: comment, error } = await ctx.users.authorB.client
      .from("comments")
      .insert({
        author_id: ctx.users.authorB.id,
        body: "좋은 한마디",
        dilemma_id: dilemmaId,
        vote_id: voteId,
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(comment?.id).toBeTruthy();

    await ctx.users.authorA.client.from("comments").delete().eq("id", comment!.id);
    const { data: afterOtherDelete } = await ctx.service
      .from("comments")
      .select("id")
      .eq("id", comment!.id)
      .single();
    expect(afterOtherDelete?.id).toBe(comment!.id);

    const ownDelete = await ctx.users.authorB.client.from("comments").delete().eq("id", comment!.id);
    expect(ownDelete.error).toBeNull();
  });

  it("allows anonymous vote-linked comments but keeps them immutable", async () => {
    const dilemmaId = await insertDilemma(ctx);
    const { voteId } = await insertAnonymousVote(ctx, dilemmaId);
    const { data: comment, error } = await ctx.anon
      .from("comments")
      .insert({
        author_id: null,
        body: "익명 한마디",
        dilemma_id: dilemmaId,
        vote_id: voteId,
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(comment?.id).toBeTruthy();

    await ctx.anon.from("comments").update({ body: "수정 시도" }).eq("id", comment!.id);
    const { data: afterUpdate } = await ctx.service
      .from("comments")
      .select("body")
      .eq("id", comment!.id)
      .single();
    expect(afterUpdate?.body).toBe("익명 한마디");

    await ctx.anon.from("comments").delete().eq("id", comment!.id);
    const { data: afterDelete } = await ctx.service
      .from("comments")
      .select("id")
      .eq("id", comment!.id)
      .single();
    expect(afterDelete?.id).toBe(comment!.id);
  });

  it("rejects comments whose author does not match the linked vote", async () => {
    const dilemmaId = await insertDilemma(ctx);
    const voteId = await insertAuthenticatedVote(ctx, ctx.users.authorB, dilemmaId);
    const { error } = await ctx.users.authorA.client.from("comments").insert({
      author_id: ctx.users.authorA.id,
      body: "작성자 불일치",
      dilemma_id: dilemmaId,
      vote_id: voteId,
    });

    expect(error).not.toBeNull();
  });

  it("rejects standalone comments without an existing vote", async () => {
    const dilemmaId = await insertDilemma(ctx);
    const { error } = await ctx.anon.from("comments").insert({
      author_id: null,
      body: "단독 댓글",
      dilemma_id: dilemmaId,
      vote_id: crypto.randomUUID(),
    });

    expect(error).not.toBeNull();
  });
});
