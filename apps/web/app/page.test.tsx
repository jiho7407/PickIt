import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("@/features/votes/vote-actions", () => ({
  castQuickVote: vi.fn(),
}));

vi.mock("@/features/votes/vote-feed.server", () => ({
  getPublicVoteFeedItems: vi.fn(async () => [
    {
      id: "dilemma-1",
      title: "겨울 코트를 지금 사도 될까요?",
      productName: "울 블렌드 코트",
      price: 148720,
      category: "fashion",
      imageUrl: null,
      createdAt: "2026-04-30T06:20:00.000Z",
      voteType: "buy_skip",
      totalVotes: 0,
      commentCount: 0,
      previewComment: null,
    },
  ]),
}));

describe("HomePage", () => {
  it("renders the product-01 home vote feed", async () => {
    render(await HomePage());

    expect(screen.getByRole("heading", { name: "PICKIT" })).toBeInTheDocument();
    expect(screen.getByText("겨울 코트를 지금 사도 될까요?")).toBeInTheDocument();
    expect(screen.queryByText("모두의 소비 고민이 모여")).not.toBeInTheDocument();
  });
});
