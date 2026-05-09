import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MyVotesPage from "./page";
import { getMyVoteList } from "@/features/me/my-votes.server";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

vi.mock("@/features/comments/comment-actions", () => ({
  deleteMyComment: vi.fn(),
}));

vi.mock("@/features/me/my-vote-actions", () => ({
  archiveMyDilemma: vi.fn(),
}));

vi.mock("@/features/me/my-votes.server", () => ({
  getMyVoteList: vi.fn(),
}));

describe("MyVotesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the authenticated user's vote management page", async () => {
    vi.mocked(getMyVoteList).mockResolvedValue({
      currentUserId: "user-1",
      created: [],
      participated: [],
      comments: [],
    });

    render(await MyVotesPage());

    expect(screen.getByRole("heading", { name: "나의 투표" })).toBeInTheDocument();
    expect(screen.getByText("아직 올린 투표가 없어요.")).toBeInTheDocument();
  });

  it("redirects signed-out visitors to login", async () => {
    vi.mocked(getMyVoteList).mockResolvedValue(null);

    await expect(MyVotesPage()).rejects.toThrow("redirect:/login?redirectTo=%2Fme%2Fvotes");
    expect(redirect).toHaveBeenCalledWith("/login?redirectTo=%2Fme%2Fvotes");
  });
});
