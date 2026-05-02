import type { SupabaseClient } from "@supabase/supabase-js";
import {
  LIFE_STAGE_OPTIONS,
  type LifeStageValue,
} from "@/features/onboarding/onboarding-trigger";
import type { Database } from "@/lib/database.types";
import { getAnonymousSessionIdIfPresent } from "@/lib/session/anonymous-session";
import { getPublicUrl } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
  id: string;
  body: string;
  created_at: string;
  author: RawAuthor | null;
};

type RawDilemma = {
  id: string;
  title: string;
  product_name: string;
  price: number;
  situation: string;
  image_path: string | null;
  created_at: string;
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
  id: string;
  authorName: string;
  authorLifeStageLabel: string | null;
  body: string;
  createdAt: string;
};

export type VoteDetailItem = {
  id: string;
  title: string;
  productName: string;
  price: number;
  situation: string;
  imageUrl: string | null;
  createdAt: string;
  voteType: "buy_skip" | "ab";
  hasVoted: boolean;
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

async function hasCurrentUserVoted(
  supabase: VoteDetailClient,
  dilemmaId: string,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("votes")
      .select("id")
      .eq("dilemma_id", dilemmaId)
      .eq("voter_id", user.id)
      .maybeSingle();

    if (error) {
      return false;
    }

    return Boolean(data);
  }

  const anonymousSessionId = await getAnonymousSessionIdIfPresent();
  return Boolean(anonymousSessionId);
}

export async function getVoteDetail(
  dilemmaId: string,
  client?: VoteDetailClient,
): Promise<VoteDetailItem | null> {
  const supabase = client ?? (await createServerSupabaseClient());
  const { data, error } = await supabase
    .from("dilemmas")
    .select(
      "id,title,product_name,price,situation,image_path,created_at,vote_type," +
        "author:profiles!inner(nickname,life_stage)," +
        "vote_options(id,label,price,image_path,position)," +
        "comments(id,body,created_at,author:profiles(nickname,life_stage))",
    )
    .eq("id", dilemmaId)
    .eq("status", "open")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as RawDilemma;
  const summary = await getDilemmaVoteSummary(dilemmaId, supabase);
  const totalCount = summary?.total_count ?? 0;
  const optionACount = summary?.option_a_count ?? 0;
  const optionBCount = summary?.option_b_count ?? 0;

  return {
    id: row.id,
    title: row.title,
    productName: row.product_name,
    price: row.price,
    situation: row.situation,
    imageUrl: toPublicImageUrl(row.image_path, supabase),
    createdAt: row.created_at,
    voteType: row.vote_type === "ab" ? "ab" : "buy_skip",
    hasVoted: await hasCurrentUserVoted(supabase, row.id),
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
        id: comment.id,
        authorName: comment.author?.nickname ?? "익명의 아나콘다",
        authorLifeStageLabel: lifeStageLabel(comment.author?.life_stage ?? null),
        body: comment.body,
        createdAt: comment.created_at,
      })),
  };
}
