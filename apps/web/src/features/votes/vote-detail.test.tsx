import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VoteDetail } from "./vote-detail";
import type { VoteDetailItem } from "./vote-detail.server";

const buySkipDetail: VoteDetailItem = {
  id: "dilemma-1",
  title: "브라운 코트 사고 싶은데 면접용으로만 쓰고 안 입을까 봐 고민돼요...",
  productName: "캐시미어브라운 코트",
  price: 307000,
  situation: "브라운 코트 사고 싶은데 면접용으로만 쓰고 안 입을까 봐 고민돼요...",
  imageUrl: null,
  createdAt: "2026-04-30T06:20:00.000Z",
  voteType: "buy_skip",
  hasVoted: false,
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
  comments: [
    {
      id: "comment-1",
      authorName: "익명의 아나콘다",
      authorLifeStageLabel: "대학생",
      body: "코트 하나 있으면 겨울 내내 돌려 입긴 해요, 활용도는 괜찮음.",
      createdAt: "2026-04-30T06:24:00.000Z",
    },
  ],
};

const abDetail: VoteDetailItem = {
  ...buySkipDetail,
  id: "dilemma-2",
  voteType: "ab",
  options: [
    { id: "option-a", label: "A가 나아", imageUrl: null, position: 1, price: 307000 },
    { id: "option-b", label: "B가 나아", imageUrl: null, position: 2, price: 307000 },
  ],
  summary: {
    buyCount: 0,
    buyRatio: 0,
    optionACount: 7,
    optionARatio: 70,
    optionBCount: 3,
    optionBRatio: 30,
    skipCount: 0,
    skipRatio: 0,
    totalCount: 10,
  },
};

describe("VoteDetail", () => {
  function renderDetail(detail: VoteDetailItem) {
    return render(
      <VoteDetail
        detail={detail}
        recordVoteAction={vi.fn(async () => ({ status: "idle" }))}
        submitCommentAction={vi.fn(async () => ({ status: "idle" }))}
      />,
    );
  }

  it("renders a buy/skip detail with product information and two choices", () => {
    renderDetail(buySkipDetail);

    expect(screen.getByText("캐시미어브라운 코트")).toBeInTheDocument();
    expect(screen.getByText("307,000원")).toBeInTheDocument();
    expect(screen.getByText(buySkipDetail.situation)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /사도 괜찮아\s+70%/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /참는 게 나아\s+30%/ })).toBeInTheDocument();
    expect(screen.getByText("70%가 사는 걸 추천했어요")).toBeInTheDocument();
  });

  it("renders an A/B detail with both option choices", () => {
    renderDetail(abDetail);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /A가 나아\s+70%/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /B가 나아\s+30%/ })).toBeInTheDocument();
    expect(screen.getByText("70%가 A를 추천했어요")).toBeInTheDocument();
  });

  it("renders vote-linked comments and the 200 character comment input", () => {
    renderDetail(buySkipDetail);

    expect(screen.getByText("댓글")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(buySkipDetail.comments[0].body)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("댓글을 입력해주세요")).toHaveAttribute("maxLength", "200");
  });
});
