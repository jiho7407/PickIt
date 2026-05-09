import { describe, expect, it, vi } from "vitest";
import { getMyVoteList } from "./my-votes.server";

function createQuery(result: { data: unknown[]; error: null }) {
  const calls: Array<[string, unknown]> = [];
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((column: string, value: unknown) => {
      calls.push([column, value]);
      return builder;
    }),
    neq: vi.fn((column: string, value: unknown) => {
      calls.push([`neq:${column}`, value]);
      return builder;
    }),
    order: vi.fn(async () => result),
  };
  return { builder, calls };
}

describe("getMyVoteList", () => {
  it("filters created votes, participated votes, and comments by the current user", async () => {
    const createdQuery = createQuery({
      data: [
        {
          id: "created-1",
          title: "내가 만든 투표",
          product_name: "코트",
          price: 307000,
          situation: "면접용으로만 입을까 봐 고민돼요.",
          image_path: null,
          created_at: "2026-04-30T06:20:00.000Z",
          vote_type: "buy_skip",
          status: "open",
          vote_options: [],
          votes: [{ id: "vote-1" }],
          comments: [{ id: "comment-1" }],
        },
      ],
      error: null,
    });
    const participatedQuery = createQuery({
      data: [
        {
          id: "vote-2",
          choice: "skip",
          option_id: null,
          created_at: "2026-04-30T06:21:00.000Z",
          dilemma: {
            id: "joined-1",
            title: "참여한 투표",
            product_name: "가방",
            price: 128000,
            situation: "둘 중 어떤 게 나을까요?",
            image_path: null,
            created_at: "2026-04-30T06:10:00.000Z",
            vote_type: "buy_skip",
            vote_options: [],
            votes: [{ id: "vote-2" }],
            comments: [],
          },
        },
      ],
      error: null,
    });
    const commentsQuery = createQuery({
      data: [
        {
          id: "comment-2",
          body: "면접용이면 하나 사세요.",
          created_at: "2026-04-30T06:24:00.000Z",
          dilemma: {
            id: "commented-1",
            title: "댓글 단 투표",
            product_name: "신발",
            price: 89000,
            situation: "출근용으로 살까요?",
            image_path: null,
            created_at: "2026-04-30T06:00:00.000Z",
            vote_type: "buy_skip",
            vote_options: [],
            votes: [],
            comments: [{ id: "comment-2" }],
          },
        },
      ],
      error: null,
    });
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn((table: string) => {
        if (table === "dilemmas") {
          return createdQuery.builder;
        }
        if (table === "votes") {
          return participatedQuery.builder;
        }
        if (table === "comments") {
          return commentsQuery.builder;
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const result = await getMyVoteList(client as never);

    expect(result?.created).toHaveLength(1);
    expect(result?.created[0]).toMatchObject({
      id: "created-1",
      productName: "코트",
      totalVotes: 1,
      commentCount: 1,
    });
    expect(result?.participated[0]).toMatchObject({
      id: "joined-1",
      myChoiceLabel: "참는 게 나아",
    });
    expect(result?.comments[0]).toMatchObject({
      id: "comment-2",
      body: "면접용이면 하나 사세요.",
    });
    expect(createdQuery.calls).toContainEqual(["author_id", "user-1"]);
    expect(createdQuery.calls).toContainEqual(["neq:status", "archived"]);
    expect(participatedQuery.calls).toContainEqual(["voter_id", "user-1"]);
    expect(commentsQuery.calls).toContainEqual(["author_id", "user-1"]);
  });

  it("returns null when the visitor is not signed in", async () => {
    const client = {
      auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
      from: vi.fn(),
    };

    await expect(getMyVoteList(client as never)).resolves.toBeNull();
    expect(client.from).not.toHaveBeenCalled();
  });
});
