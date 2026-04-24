import { describe, expect, it } from "vitest";
import { voteCommentSchema } from "./schema";

describe("voteCommentSchema", () => {
  it("accepts a short vote-linked comment", () => {
    expect(voteCommentSchema.parse({ body: "저라면 이번 달은 참을래요." })).toEqual({
      body: "저라면 이번 달은 참을래요.",
    });
  });

  it("rejects an empty comment", () => {
    const result = voteCommentSchema.safeParse({ body: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a comment longer than 200 characters", () => {
    const result = voteCommentSchema.safeParse({ body: "a".repeat(201) });

    expect(result.success).toBe(false);
  });
});
