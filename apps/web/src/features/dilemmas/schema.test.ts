import { describe, expect, it } from "vitest";
import { createDilemmaSchema } from "./schema";

const validDilemma = {
  title: "겨울 코트를 사도 될까요?",
  productName: "울 블렌드 코트",
  price: 148720,
  category: "fashion",
  situation: "출근할 때 입을 따뜻한 코트가 필요하지만 예산이 걱정돼요.",
};

describe("createDilemmaSchema", () => {
  it("accepts a valid buy/skip dilemma and applies the default vote type", () => {
    const parsed = createDilemmaSchema.parse(validDilemma);

    expect(parsed).toMatchObject({
      ...validDilemma,
      voteType: "buy_skip",
    });
  });

  it("rejects a zero price", () => {
    const result = createDilemmaSchema.safeParse({
      ...validDilemma,
      price: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a situation shorter than ten characters", () => {
    const result = createDilemmaSchema.safeParse({
      ...validDilemma,
      situation: "짧아요",
    });

    expect(result.success).toBe(false);
  });
});
