import type { SupabaseClient } from "@supabase/supabase-js";
import {
  LIFE_STAGE_OPTIONS,
  type LifeStageValue,
} from "@/features/onboarding/onboarding-trigger";
import type { Database } from "@/lib/database.types";
import { getPublicUrl } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type MyVotesClient = SupabaseClient<Database>;

type RawCountRef = {
  id: string;
};

type RawOption = {
  id: string;
  image_path: string | null;
  label: string;
  position: number;
  price: number | null;
};

type RawDilemmaRef = {
  id: string;
  title: string;
  product_name: string;
  price: number;
  situation: string;
  image_path: string | null;
  created_at: string;
  vote_type: string;
  vote_options: RawOption[] | null;
  votes: RawCountRef[] | null;
  comments: RawCountRef[] | null;
};

type RawCreatedDilemma = RawDilemmaRef & {
  status: string;
};

type RawParticipatedVote = {
  id: string;
  choice: string | null;
  option_id: string | null;
  created_at: string;
  dilemma: RawDilemmaRef | null;
};

type RawComment = {
  id: string;
  body: string;
  created_at: string;
  dilemma: RawDilemmaRef | null;
};

export type MyVoteOption = {
  id: string;
  imageUrl: string | null;
  label: string;
  position: 1 | 2;
  price: number | null;
};

export type MyVoteCardItem = {
  id: string;
  title: string;
  productName: string;
  price: number;
  situation: string;
  imageUrl: string | null;
  createdAt: string;
  voteType: "buy_skip" | "ab";
  totalVotes: number;
  commentCount: number;
  options: MyVoteOption[];
};

export type MyParticipatedVoteItem = MyVoteCardItem & {
  myChoiceLabel: string;
  votedAt: string;
};

export type MyCommentItem = {
  id: string;
  body: string;
  createdAt: string;
  dilemma: MyVoteCardItem;
};

export type MyVoteListData = {
  currentUserId: string;
  created: MyVoteCardItem[];
  participated: MyParticipatedVoteItem[];
  comments: MyCommentItem[];
};

const LIFE_STAGE_LABEL_BY_VALUE = new Map<string, string>(
  LIFE_STAGE_OPTIONS.map((option) => [option.value, option.label]),
);

function toPublicImageUrl(path: string | null, client: MyVotesClient) {
  return path ? getPublicUrl(path, client) : null;
}

function toOption(option: RawOption, client: MyVotesClient): MyVoteOption | null {
  if (option.position !== 1 && option.position !== 2) {
    return null;
  }

  return {
    id: option.id,
    imageUrl: toPublicImageUrl(option.image_path, client),
    label: option.label,
    position: option.position,
    price: option.price,
  };
}

function toCard(row: RawDilemmaRef, client: MyVotesClient): MyVoteCardItem {
  return {
    id: row.id,
    title: row.title,
    productName: row.product_name,
    price: row.price,
    situation: row.situation,
    imageUrl: toPublicImageUrl(row.image_path, client),
    createdAt: row.created_at,
    voteType: row.vote_type === "ab" ? "ab" : "buy_skip",
    totalVotes: row.votes?.length ?? 0,
    commentCount: row.comments?.length ?? 0,
    options: (row.vote_options ?? [])
      .map((option) => toOption(option, client))
      .filter((option): option is MyVoteOption => option !== null)
      .sort((a, b) => a.position - b.position),
  };
}

function selectedVoteLabel(vote: RawParticipatedVote, dilemma: MyVoteCardItem) {
  if (dilemma.voteType === "ab") {
    const selectedOption = dilemma.options.find((option) => option.id === vote.option_id);
    return selectedOption ?
        `${selectedOption.position === 1 ? "A" : "B"}가 나아`
      : "선택한 옵션";
  }

  return vote.choice === "buy" ? "사도 괜찮아" : "참는 게 나아";
}

export async function getMyVoteList(client?: MyVotesClient): Promise<MyVoteListData | null> {
  const supabase = client ?? (await createServerSupabaseClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [createdResult, participatedResult, commentsResult] = await Promise.all([
    supabase
      .from("dilemmas")
      .select(
        "id,title,product_name,price,situation,image_path,created_at,vote_type,status," +
          "vote_options(id,label,price,image_path,position)," +
          "votes(id),comments(id)",
      )
      .eq("author_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    supabase
      .from("votes")
      .select(
        "id,choice,option_id,created_at," +
          "dilemma:dilemmas!inner(" +
          "id,title,product_name,price,situation,image_path,created_at,vote_type," +
          "vote_options(id,label,price,image_path,position),votes(id),comments(id)" +
          ")",
      )
      .eq("voter_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select(
        "id,body,created_at," +
          "dilemma:dilemmas!inner(" +
          "id,title,product_name,price,situation,image_path,created_at,vote_type," +
          "vote_options(id,label,price,image_path,position),votes(id),comments(id)" +
          ")",
      )
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (createdResult.error) {
    throw createdResult.error;
  }
  if (participatedResult.error) {
    throw participatedResult.error;
  }
  if (commentsResult.error) {
    throw commentsResult.error;
  }

  const createdRows = (createdResult.data ?? []) as unknown as RawCreatedDilemma[];
  const participatedRows = (participatedResult.data ?? []) as unknown as RawParticipatedVote[];
  const commentRows = (commentsResult.data ?? []) as unknown as RawComment[];

  return {
    currentUserId: user.id,
    created: createdRows.map((row) => toCard(row, supabase)),
    participated: participatedRows
      .filter((vote) => vote.dilemma !== null)
      .map((vote) => {
        const dilemma = toCard(vote.dilemma as RawDilemmaRef, supabase);
        return {
          ...dilemma,
          myChoiceLabel: selectedVoteLabel(vote, dilemma),
          votedAt: vote.created_at,
        };
      }),
    comments: commentRows
      .filter((comment) => comment.dilemma !== null)
      .map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.created_at,
        dilemma: toCard(comment.dilemma as RawDilemmaRef, supabase),
      })),
  };
}

export function getLifeStageLabel(value: string | null) {
  if (!value) {
    return null;
  }
  return LIFE_STAGE_LABEL_BY_VALUE.get(value as LifeStageValue) ?? null;
}
