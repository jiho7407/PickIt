import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";
import { getPublicVoteFeedItems } from "@/features/votes/vote-feed.server";

vi.mock("@/features/votes/vote-actions", () => ({
  castQuickVote: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
  })),
}));

vi.mock("@/features/votes/vote-feed.server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/votes/vote-feed.server")>();
  return {
    ...actual,
    getPublicVoteFeedItems: vi.fn(async () => [
      {
        id: "dilemma-1",
        title: "겨울 코트를 지금 사도 될까요?",
        productName: "울 블렌드 코트",
        price: 148720,
        category: "패션",
        imageUrl: null,
        createdAt: "2026-04-30T06:20:00.000Z",
        voteType: "buy_skip",
        totalVotes: 0,
        commentCount: 0,
        author: { nickname: "겨울준비러", lifeStageLabel: "대학생" },
        previewComment: null,
      },
    ]),
  };
});

describe("HomePage", () => {
  it("renders the product-01 home vote feed", async () => {
    render(await HomePage({}));

    expect(screen.getByRole("heading", { name: "PICKIT" })).toBeInTheDocument();
    expect(screen.getByText("겨울 코트를 지금 사도 될까요?")).toBeInTheDocument();
    expect(screen.queryByText("모두의 소비 고민이 모여")).not.toBeInTheDocument();
  });

  it("forwards the stage search param to the server query", async () => {
    const mockedFetch = vi.mocked(getPublicVoteFeedItems);
    mockedFetch.mockClear();

    render(
      await HomePage({
        searchParams: Promise.resolve({ stage: "university" }),
      }),
    );

    expect(mockedFetch).toHaveBeenCalledWith({ stage: "university" });
    expect(screen.getByRole("link", { name: "대학생" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("ignores invalid stage values", async () => {
    const mockedFetch = vi.mocked(getPublicVoteFeedItems);
    mockedFetch.mockClear();

    render(
      await HomePage({
        searchParams: Promise.resolve({ stage: "not-a-real-stage" }),
      }),
    );

    expect(mockedFetch).toHaveBeenCalledWith({});
  });
});
