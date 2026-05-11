import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VoteDetailPage from "./page";
import { getVoteDetail } from "@/features/votes/vote-detail.server";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
}));

vi.mock("@/features/votes/vote-actions", () => ({
  recordDetailVote: vi.fn(),
  submitDetailComment: vi.fn(),
}));

vi.mock("@/features/comments/comment-actions", () => ({
  deleteMyComment: vi.fn(),
}));

vi.mock("@/features/me/my-vote-actions", () => ({
  archiveMyDilemma: vi.fn(),
}));

vi.mock("@/features/votes/vote-detail.server", () => ({
  getVoteDetail: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
  })),
}));

describe("VoteDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the product-02 vote detail page", async () => {
    vi.mocked(getVoteDetail).mockResolvedValue({
      currentUserId: null,
      id: "dilemma-1",
      title: "브라운 코트 고민",
      productName: "캐시미어브라운 코트",
      price: 307000,
      situation: "브라운 코트 사고 싶은데 고민돼요.",
      imageUrl: null,
      createdAt: "2026-04-30T06:20:00.000Z",
      closesAt: "2030-01-01T00:00:00.000Z",
      isClosed: false,
      voteType: "buy_skip",
      hasVoted: false,
      isOwn: false,
      myVote: null,
      author: { nickname: "익명의 아나콘다", lifeStageLabel: "대학생" },
      options: [],
      summary: {
        buyCount: 7,
        buyRatio: 70,
        optionACount: 0,
        optionARatio: 0,
        optionBCount: 0,
        optionBRatio: 0,
        skipCount: 3,
        skipRatio: 30,
        totalCount: 10,
      },
      comments: [],
    });

    render(await VoteDetailPage({ params: Promise.resolve({ id: "dilemma-1" }) }));

    expect(getVoteDetail).toHaveBeenCalledWith("dilemma-1");
    expect(screen.getByText("캐시미어브라운 코트")).toBeInTheDocument();
  });

  it("sends a deleted or missing vote to the not found boundary", async () => {
    vi.mocked(getVoteDetail).mockResolvedValue(null);

    await expect(
      VoteDetailPage({ params: Promise.resolve({ id: "deleted-dilemma" }) }),
    ).rejects.toThrow("not-found");
    expect(notFound).toHaveBeenCalled();
  });
});
