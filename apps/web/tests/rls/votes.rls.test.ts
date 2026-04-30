import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  cleanupRlsContext,
  createAnonymousSession,
  createRlsContext,
  insertAuthenticatedVote,
  insertDilemma,
  type RlsContext,
} from "./fixtures";

describe("votes and anonymous session RLS", () => {
  let ctx: RlsContext;

  beforeAll(async () => {
    ctx = await createRlsContext();
  });

  afterAll(async () => {
    await cleanupRlsContext(ctx);
  });

  it("allows a valid anonymous session to vote once and rejects duplicate votes", async () => {
    const dilemmaId = await insertDilemma(ctx);
    const sessionId = await createAnonymousSession(ctx);

    const firstVote = await ctx.anon.from("votes").insert({
      anonymous_session_id: sessionId,
      choice: "buy",
      dilemma_id: dilemmaId,
    });
    expect(firstVote.error).toBeNull();

    const duplicateVote = await ctx.anon.from("votes").insert({
      anonymous_session_id: sessionId,
      choice: "skip",
      dilemma_id: dilemmaId,
    });
    expect(duplicateVote.error).not.toBeNull();
  });

  it("blocks authors from voting on their own dilemmas", async () => {
    const dilemmaId = await insertDilemma(ctx);
    const { error } = await ctx.users.authorA.client.from("votes").insert({
      choice: "buy",
      dilemma_id: dilemmaId,
      voter_id: ctx.users.authorA.id,
    });

    expect(error).not.toBeNull();
  });

  it("prevents authenticated users from creating anonymous sessions or anonymous votes", async () => {
    const dilemmaId = await insertDilemma(ctx);
    await insertAuthenticatedVote(ctx, ctx.users.authorB, dilemmaId);

    const chosenSessionId = crypto.randomUUID();
    const sessionInsert = await ctx.users.authorB.client.from("anonymous_sessions").insert({
      id: chosenSessionId,
      session_hash: `chosen-${crypto.randomUUID()}`,
    });
    expect(sessionInsert.error).not.toBeNull();

    const serviceSessionId = crypto.randomUUID();
    const serviceSession = await ctx.service.from("anonymous_sessions").insert({
      id: serviceSessionId,
      session_hash: `service-${crypto.randomUUID()}`,
    });
    expect(serviceSession.error).toBeNull();
    ctx.anonymousSessionIds.push(serviceSessionId);

    const anonymousVote = await ctx.users.authorB.client.from("votes").insert({
      anonymous_session_id: serviceSessionId,
      choice: "skip",
      dilemma_id: dilemmaId,
    });
    expect(anonymousVote.error).not.toBeNull();
  });

  it("prevents vote updates and deletes in the MVP", async () => {
    const dilemmaId = await insertDilemma(ctx);
    const voteId = await insertAuthenticatedVote(ctx, ctx.users.authorB, dilemmaId, "buy");

    await ctx.users.authorB.client.from("votes").update({ choice: "skip" }).eq("id", voteId);
    const { data: afterUpdate } = await ctx.service
      .from("votes")
      .select("choice")
      .eq("id", voteId)
      .single();
    expect(afterUpdate?.choice).toBe("buy");

    await ctx.users.authorB.client.from("votes").delete().eq("id", voteId);
    const { data: afterDelete } = await ctx.service
      .from("votes")
      .select("id")
      .eq("id", voteId)
      .single();
    expect(afterDelete?.id).toBe(voteId);
  });
});
