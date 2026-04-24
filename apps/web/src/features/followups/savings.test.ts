import { describe, expect, it } from "vitest";
import { calculateFollowupDueAt, calculateSavedAmount } from "./savings";

describe("calculateSavedAmount", () => {
  it("returns the full price when the user skipped the purchase", () => {
    expect(calculateSavedAmount({ outcome: "skipped", price: 148720 })).toBe(148720);
  });

  it("returns zero when the user bought the product", () => {
    expect(calculateSavedAmount({ outcome: "bought", price: 148720 })).toBe(0);
  });
});

describe("calculateFollowupDueAt", () => {
  it("returns exactly seven days after the created date", () => {
    const createdAt = new Date("2026-04-25T03:15:00.000Z");

    expect(calculateFollowupDueAt(createdAt).toISOString()).toBe(
      "2026-05-02T03:15:00.000Z",
    );
  });
});
