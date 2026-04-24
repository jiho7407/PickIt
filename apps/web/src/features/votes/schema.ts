import { z } from "zod";

export type VoteChoice = "buy" | "skip";
export type VoteType = "buy_skip" | "ab";

export type VoteSummary = {
  buyCount: number;
  skipCount: number;
  totalCount: number;
  buyRatio: number;
  skipRatio: number;
};

export const voteChoiceSchema = z.enum(["buy", "skip"]);

export const voteCommentSchema = z.object({
  body: z.string().min(1).max(200),
});

export type VoteCommentInput = z.infer<typeof voteCommentSchema>;
