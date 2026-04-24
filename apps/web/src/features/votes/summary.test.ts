import { describe, expect, it } from "vitest";
import { calculateVoteSummary } from "./summary";

describe("calculateVoteSummary", () => {
  it("returns a 75/25 split for three buy votes and one skip vote", () => {
    expect(calculateVoteSummary(["buy", "buy", "buy", "skip"])).toEqual({
      buyCount: 3,
      skipCount: 1,
      totalCount: 4,
      buyRatio: 75,
      skipRatio: 25,
    });
  });

  it("returns zero counts and ratios when there are no votes", () => {
    expect(calculateVoteSummary([])).toEqual({
      buyCount: 0,
      skipCount: 0,
      totalCount: 0,
      buyRatio: 0,
      skipRatio: 0,
    });
  });

  it("keeps odd vote ratios stable by deriving skip ratio from buy ratio", () => {
    expect(calculateVoteSummary(["buy", "skip", "skip"])).toEqual({
      buyCount: 1,
      skipCount: 2,
      totalCount: 3,
      buyRatio: 33,
      skipRatio: 67,
    });
  });

  it("returns a 50/50 split for one buy and one skip vote", () => {
    expect(calculateVoteSummary(["buy", "skip"])).toEqual({
      buyCount: 1,
      skipCount: 1,
      totalCount: 2,
      buyRatio: 50,
      skipRatio: 50,
    });
  });
});
