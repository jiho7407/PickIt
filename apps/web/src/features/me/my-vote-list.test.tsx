import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MyVoteList } from "./my-vote-list";
import type { MyVoteListData } from "./my-votes.server";

const data: MyVoteListData = {
  currentUserId: "user-1",
  created: [
    {
      id: "created-1",
      title: "브라운 코트 고민",
      productName: "캐시미어브라운 코트",
      price: 307000,
      situation: "면접용으로만 입을까 봐 고민돼요.",
      imageUrl: null,
      createdAt: "2026-04-30T06:20:00.000Z",
      voteType: "buy_skip",
      totalVotes: 95,
      commentCount: 2,
      options: [],
    },
  ],
  participated: [
    {
      id: "joined-1",
      title: "가방 A/B 고민",
      productName: "가방",
      price: 128000,
      situation: "둘 중 어떤 게 나을까요?",
      imageUrl: null,
      createdAt: "2026-04-30T06:10:00.000Z",
      voteType: "buy_skip",
      totalVotes: 12,
      commentCount: 1,
      options: [],
      myChoiceLabel: "참는 게 나아",
      votedAt: "2026-04-30T06:24:00.000Z",
    },
  ],
  comments: [
    {
      id: "comment-1",
      body: "면접용이면 하나 사세요.",
      createdAt: "2026-04-30T06:24:00.000Z",
      dilemma: {
        id: "commented-1",
        title: "신발 고민",
        productName: "운동화",
        price: 89000,
        situation: "출근용으로 살까요?",
        imageUrl: null,
        createdAt: "2026-04-30T06:00:00.000Z",
        voteType: "buy_skip",
        totalVotes: 4,
        commentCount: 1,
        options: [],
      },
    },
  ],
};

describe("MyVoteList", () => {
  it("renders created votes, participated votes, and author comments", () => {
    render(
      <MyVoteList
        data={data}
        deleteCommentAction={vi.fn(async () => ({ status: "idle" }))}
        deleteDilemmaAction={vi.fn(async () => ({ status: "idle" }))}
      />,
    );

    expect(screen.getByRole("heading", { name: "나의 투표" })).toBeInTheDocument();
    expect(screen.getByText("내가 올린 투표")).toBeInTheDocument();
    expect(screen.getByText("브라운 코트 고민")).toBeInTheDocument();
    expect(screen.getByText("내 선택 · 참는 게 나아")).toBeInTheDocument();
    expect(screen.getByText("면접용이면 하나 사세요.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /삭제 메뉴/ })).toHaveLength(2);
  });
});
