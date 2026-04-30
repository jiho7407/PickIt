import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupRlsContext,
  createRlsContext,
  insertAnonymousVote,
  insertDilemma,
  type RlsContext,
} from "./fixtures";

describe("followups and notification RPC RLS", () => {
  let ctx: RlsContext;

  beforeAll(async () => {
    ctx = await createRlsContext();
  });

  afterAll(async () => {
    await cleanupRlsContext(ctx);
  });

  it("lets only the dilemma author create one followup and derives saved amount/status", async () => {
    const dilemmaId = await insertDilemma(ctx, ctx.users.authorA.id, { price: 148720 });
    const denied = await ctx.users.authorB.client.from("followups").insert({
      author_id: ctx.users.authorB.id,
      dilemma_id: dilemmaId,
      outcome: "skipped",
    });
    expect(denied.error).not.toBeNull();

    const { data: followup, error } = await ctx.users.authorA.client
      .from("followups")
      .insert({
        author_id: ctx.users.authorA.id,
        dilemma_id: dilemmaId,
        outcome: "skipped",
      })
      .select("saved_amount")
      .single();
    expect(error).toBeNull();
    expect(followup?.saved_amount).toBe(148720);

    const { data: dilemma } = await ctx.service
      .from("dilemmas")
      .select("status")
      .eq("id", dilemmaId)
      .single();
    expect(dilemma?.status).toBe("followed_up");

    const duplicate = await ctx.users.authorA.client.from("followups").insert({
      author_id: ctx.users.authorA.id,
      dilemma_id: dilemmaId,
      outcome: "bought",
    });
    expect(duplicate.error).not.toBeNull();
  });

  it("returns followup candidates only for the current author", async () => {
    const now = new Date();
    const dueAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const ownDueId = await insertDilemma(ctx, ctx.users.authorA.id, { followup_due_at: dueAt });
    const otherDueId = await insertDilemma(ctx, ctx.users.authorB.id, { followup_due_at: dueAt });

    const { data, error } = await ctx.users.authorA.client.rpc("get_followup_candidates", {
      now_ts: now.toISOString(),
    });

    expect(error).toBeNull();
    expect(data?.map((row) => row.dilemma_id)).toContain(ownDueId);
    expect(data?.map((row) => row.dilemma_id)).not.toContain(otherDueId);
  });

  it("blocks non-operators from global notification RPC and allows operators", async () => {
    const dueAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const resultId = await insertDilemma(ctx, ctx.users.authorB.id, { followup_due_at: dueAt });
    await insertAnonymousVote(ctx, resultId);

    const { error: anonError } = await ctx.anon.rpc("get_operator_notification_candidates");
    const { error: userError } = await ctx.users.authorB.client.rpc(
      "get_operator_notification_candidates",
    );
    expect(anonError).not.toBeNull();
    expect(userError).not.toBeNull();

    const { data, error } = await ctx.users.operator.client.rpc(
      "get_operator_notification_candidates",
    );
    expect(error).toBeNull();
    expect(data).toEqual(
      expect.arrayContaining([
        { author_id: ctx.users.authorB.id, dilemma_id: resultId, kind: "followup" },
      ]),
    );
  });
});
