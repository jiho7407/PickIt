import { describe, expect, it } from "vitest";
import { createVoteSchema } from "./create-vote-schema";

describe("createVoteSchema", () => {
  it("rejects input without a vote type", () => {
    const result = createVoteSchema.safeParse({
      productName: "브라운 코트",
      price: 50000,
      category: "university",
      situation: "면접 때 한 번만 입을까 봐 고민돼요.",
    });

    expect(result.success).toBe(false);
  });

  it("validates required buy/skip fields and positive price", () => {
    expect(
      createVoteSchema.safeParse({
        voteType: "buy_skip",
        productName: "브라운 코트",
        price: 0,
        category: "university",
        situation: "면접 때 한 번만 입을까 봐 고민돼요.",
      }).success,
    ).toBe(false);

    expect(
      createVoteSchema.safeParse({
        voteType: "buy_skip",
        productName: "브라운 코트",
        price: 50000,
        category: "university",
        situation: "면접 때 한 번만 입을까 봐 고민돼요.",
        imagePath: "user/image.jpg",
      }).success,
    ).toBe(true);
  });

  it("requires both A/B option names and positive prices", () => {
    const result = createVoteSchema.safeParse({
      voteType: "ab",
      optionAName: "A 코트",
      optionBName: "",
      optionAPrice: 50000,
      optionBPrice: 60000,
      situation: "두 제품 중 어떤 걸 사야 할지 고민돼요.",
    });

    expect(result.success).toBe(false);
  });
});
