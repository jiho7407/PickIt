import type { VoteChoice, VoteSummary } from "./schema";

export function calculateVoteSummary(votes: VoteChoice[]): VoteSummary {
  const buyCount = votes.filter((vote) => vote === "buy").length;
  const skipCount = votes.filter((vote) => vote === "skip").length;
  const totalCount = votes.length;
  const buyRatio = totalCount === 0 ? 0 : Math.round((buyCount / totalCount) * 100);
  const skipRatio = totalCount === 0 ? 0 : 100 - buyRatio;

  return {
    buyCount,
    skipCount,
    totalCount,
    buyRatio,
    skipRatio,
  };
}
