import type { SupabaseClient } from "@supabase/supabase-js";
import {
  LIFE_STAGE_OPTIONS,
  type LifeStageValue,
} from "@/features/onboarding/onboarding-trigger";
import type { Database } from "@/lib/database.types";
import { getAnonymousSessionIdIfPresent } from "@/lib/session/anonymous-session";
import { getPublicUrl } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { VoteChoice } from "./schema";
import { getDilemmaVoteSummary } from "./summary.server";

type VoteDetailClient = SupabaseClient<Database>;

type RawAuthor = {
  nickname: string;
  life_stage: string | null;
};

type RawOption = {
  id: string;
  image_path: string | null;
  label: string;
  position: number;
  price: number | null;
};

type RawComment = {
  author_id: string | null;
  id: string;
  body: string;
  created_at: string;
  author: RawAuthor | null;
};

type RawDilemma = {
  author_id: string;
  id: string;
  title: string;
  product_name: string;
  price: number;
  situation: string;
  image_path: string | null;
  created_at: string;
  closes_at: string;
  status: string;
  vote_type: string;
  author: RawAuthor;
  vote_options: RawOption[] | null;
  comments: RawComment[] | null;
};

export type VoteDetailOption = {
  id: string;
  imageUrl: string | null;
  label: string;
  position: 1 | 2;
  price: number | null;
};

export type VoteDetailComment = {
  authorId: string | null;
  id: string;
  authorName: string;
  authorLifeStageLabel: string | null;
  body: string;
  createdAt: string;
};

export type VoteDetailMyVote = {
  choice: VoteChoice | null;
  optionId: string | null;
};

export type VoteDetailItem = {
  currentUserId: string | null;
  id: string;
  title: string;
  productName: string;
  price: number;
  situation: string;
  imageUrl: string | null;
  createdAt: string;
  closesAt: string;
  isClosed: boolean;
  voteType: "buy_skip" | "ab";
  hasVoted: boolean;
  isOwn: boolean;
  myVote: VoteDetailMyVote | null;
  author: {
    nickname: string;
    lifeStageLabel: string | null;
  };
  options: VoteDetailOption[];
  summary: {
    buyCount: number;
    buyRatio: number;
    optionACount: number;
    optionARatio: number;
    optionBCount: number;
    optionBRatio: number;
    skipCount: number;
    skipRatio: number;
    totalCount: number;
  };
  comments: VoteDetailComment[];
};

const LIFE_STAGE_LABEL_BY_VALUE = new Map<string, string>(
  LIFE_STAGE_OPTIONS.map((option) => [option.value, option.label]),
);

function lifeStageLabel(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return LIFE_STAGE_LABEL_BY_VALUE.get(value as LifeStageValue) ?? null;
}

function toPublicImageUrl(path: string | null, client: VoteDetailClient) {
  return path ? getPublicUrl(path, client) : null;
}

function toOption(option: RawOption, client: VoteDetailClient): VoteDetailOption | null {
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

function ratio(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

async function getCurrentUserVote(
  supabase: VoteDetailClient,
  dilemmaId: string,
  userId: string | null,
): Promise<VoteDetailMyVote | null> {
  if (userId) {
    const { data, error } = await supabase
      .from("votes")
      .select("choice, option_id")
      .eq("dilemma_id", dilemmaId)
      .eq("voter_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      choice: (data.choice as VoteChoice | null) ?? null,
      optionId: data.option_id ?? null,
    };
  }

  const anonymousSessionId = await getAnonymousSessionIdIfPresent();
  if (!anonymousSessionId) {
    return null;
  }

  const { data, error } = await supabase
    .from("votes")
    .select("choice, option_id")
    .eq("dilemma_id", dilemmaId)
    .eq("anonymous_session_id", anonymousSessionId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    choice: (data.choice as VoteChoice | null) ?? null,
    optionId: data.option_id ?? null,
  };
}

export async function getVoteDetail(
  dilemmaId: string,
  client?: VoteDetailClient,
): Promise<VoteDetailItem | null> {
  const supabase = client ?? (await createServerSupabaseClient());
  // Lazy-expire overdue open dilemmas so the page reflects accurate status.
  await supabase.rpc("expire_open_dilemmas");

  const { data, error } = await supabase
    .from("dilemmas")
    .select(
      "id,author_id,title,product_name,price,situation,image_path,created_at,closes_at,status,vote_type," +
        "author:profiles!inner(nickname,life_stage)," +
        "vote_options(id,label,price,image_path,position)," +
        "comments(id,author_id,body,created_at,author:profiles(nickname,life_stage))",
    )
    .eq("id", dilemmaId)
    .in("status", ["open", "closed"])
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as RawDilemma;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [summary, myVote] = await Promise.all([
    getDilemmaVoteSummary(dilemmaId, supabase),
    getCurrentUserVote(supabase, row.id, user?.id ?? null),
  ]);
  const totalCount = summary?.total_count ?? 0;
  const optionACount = summary?.option_a_count ?? 0;
  const optionBCount = summary?.option_b_count ?? 0;
  const isClosed = row.status === "closed" || new Date(row.closes_at).getTime() <= Date.now();

  return {
    currentUserId: user?.id ?? null,
    id: row.id,
    title: row.title,
    productName: row.product_name,
    price: row.price,
    situation: row.situation,
    imageUrl: toPublicImageUrl(row.image_path, supabase),
    createdAt: row.created_at,
    closesAt: row.closes_at,
    isClosed,
    voteType: row.vote_type === "ab" ? "ab" : "buy_skip",
    hasVoted: myVote !== null,
    isOwn: Boolean(user && row.author_id === user.id),
    myVote,
    author: {
      nickname: row.author.nickname,
      lifeStageLabel: lifeStageLabel(row.author.life_stage),
    },
    options: (row.vote_options ?? [])
      .map((option) => toOption(option, supabase))
      .filter((option): option is VoteDetailOption => option !== null)
      .sort((a, b) => a.position - b.position),
    summary: {
      buyCount: summary?.buy_count ?? 0,
      buyRatio: summary?.buy_ratio ?? 0,
      optionACount,
      optionARatio: ratio(optionACount, totalCount),
      optionBCount,
      optionBRatio: ratio(optionBCount, totalCount),
      skipCount: summary?.skip_count ?? 0,
      skipRatio: summary?.skip_ratio ?? 0,
      totalCount,
    },
    comments: [...(row.comments ?? [])]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((comment) => ({
        authorId: comment.author_id,
        id: comment.id,
        authorName: comment.author?.nickname ?? "익명의 아나콘다",
        authorLifeStageLabel: lifeStageLabel(comment.author?.life_stage ?? null),
        body: comment.body,
        createdAt: comment.created_at,
      })),
  };
}
