import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VoteFeed } from "./vote-feed";
import type { VoteFeedItem } from "./vote-card";

const sampleItems: VoteFeedItem[] = [
  {
    id: "dilemma-1",
    title: "브라운 코트 사고 싶은데 면접용으로만 쓰고 안 입을까 봐 고민돼요...",
    productName: "브라운 코트",
    price: 277000,
    category: "패션",
    imageUrl: null,
    createdAt: "2026-04-30T06:20:00.000Z",
    voteType: "buy_skip",
    totalVotes: 5,
    commentCount: 1,
    author: { nickname: "면접앞둔취준생", lifeStageLabel: "취준생" },
    previewComment: {
      authorName: "분당대학생",
      body: "코트 사기에는 좀 아깝지 않을까요?",
    },
  },
  {
    id: "dilemma-2",
    title: "태블릿을 새로 사도 될까요?",
    productName: "태블릿",
    price: 890000,
    category: "전자기기",
    imageUrl: "/sample/tablet.png",
    createdAt: "2026-04-30T06:16:00.000Z",
    voteType: "buy_skip",
    totalVotes: 3,
    commentCount: 0,
    author: { nickname: "공대생A", lifeStageLabel: "대학생" },
    previewComment: null,
  },
  {
    id: "dilemma-3",
    title: "A랑 B 중 어떤 가방이 나을까요?",
    productName: "가방",
    price: 128000,
    category: "패션",
    imageUrl: null,
    createdAt: "2026-04-30T06:10:00.000Z",
    voteType: "ab",
    totalVotes: 8,
    commentCount: 2,
    author: { nickname: "직장인지원", lifeStageLabel: "직장인" },
    previewComment: null,
    options: [
      { id: "option-a", label: "A 가방", price: 128000, imageUrl: null, position: 1 },
      { id: "option-b", label: "B 가방", price: 150000, imageUrl: null, position: 2 },
    ],
  },
];

describe("VoteFeed", () => {
  it("renders public vote cards using profile-driven labels", () => {
    render(<VoteFeed items={sampleItems} quickVoteAction={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "PICKIT" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(sampleItems[0].title)).toBeInTheDocument();
    expect(screen.getByText(sampleItems[1].title)).toBeInTheDocument();
    expect(screen.getByText(sampleItems[2].title)).toBeInTheDocument();
    expect(screen.getAllByText("투표 진행 중")).toHaveLength(3);
    expect(screen.getByText("면접앞둔취준생")).toBeInTheDocument();
    expect(screen.getByText("공대생A")).toBeInTheDocument();
    expect(screen.getByText("직장인지원")).toBeInTheDocument();
    expect(screen.getAllByText("취준생").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("대학생").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("패션")).not.toBeInTheDocument();
    expect(screen.queryByText("전자기기")).not.toBeInTheDocument();
  });

  it("displays vote count alongside category and comment count", () => {
    render(<VoteFeed items={sampleItems} quickVoteAction={vi.fn()} />);

    expect(screen.getByText("투표 5")).toBeInTheDocument();
    expect(screen.getByText("투표 3")).toBeInTheDocument();
    expect(screen.getByText("투표 8")).toBeInTheDocument();
  });

  it("renders the comment preview row from profile data", () => {
    render(<VoteFeed items={sampleItems} quickVoteAction={vi.fn()} />);

    expect(screen.getByText("분당대학생")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /면접앞둔취준생 투표 댓글 더보기/ }),
    ).toHaveAttribute("href", "/votes/dilemma-1");
  });

  it("renders an empty state when there are no public votes", () => {
    render(<VoteFeed items={[]} quickVoteAction={vi.fn()} />);

    expect(screen.getByText("아직 올라온 소비 고민이 없어요.")).toBeInTheDocument();
    expect(screen.getByText("첫 고민을 올리면 이곳에서 함께 투표할 수 있어요.")).toBeInTheDocument();
  });

  it("formats prices as Korean won", () => {
    render(<VoteFeed items={sampleItems} quickVoteAction={vi.fn()} />);

    expect(screen.getByText("277,000원")).toBeInTheDocument();
    expect(screen.getByText("890,000원")).toBeInTheDocument();
  });

  it("links each card to its detail page and exposes quick vote actions", () => {
    render(<VoteFeed items={sampleItems} quickVoteAction={vi.fn()} />);

    expect(screen.getByRole("link", { name: "브라운 코트 상세 보기" })).toHaveAttribute(
      "href",
      "/votes/dilemma-1",
    );
    expect(screen.getAllByRole("button", { name: "사도 괜찮아" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "참는 게 나아" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "A가 나아" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B가 나아" })).toBeInTheDocument();
  });

  it("renders the active stage filter chip and links others to query params", () => {
    render(
      <VoteFeed items={sampleItems} quickVoteAction={vi.fn()} activeStage="university" />,
    );

    expect(screen.getByRole("link", { name: "대학생" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "전체" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "취준생" })).toHaveAttribute(
      "href",
      "/?stage=job_seeker",
    );
    expect(screen.getByRole("link", { name: "직장인" })).toHaveAttribute("href", "/?stage=worker");
  });
});
