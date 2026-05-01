import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  LIFE_STAGE_OPTIONS,
  isLifeStageValue,
  type LifeStageValue,
} from "@/features/onboarding/onboarding-trigger";
import { getPublicUrl } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDilemmaVoteSummaries } from "./summary.server";
import type { VoteFeedItem, VoteFeedOption } from "./vote-card";

type VoteFeedClient = SupabaseClient<Database>;

type RawVoteOption = {
  id: string;
  label: string;
  price: number | null;
  image_path: string | null;
  position: number;
};

type RawAuthorRef = {
  nickname: string;
  life_stage: string | null;
};

type RawComment = {
  body: string;
  created_at: string;
  author: RawAuthorRef | null;
};

type RawDilemma = {
  id: string;
  title: string;
  product_name: string;
  price: number;
  category: string;
  image_path: string | null;
  vote_type: string;
  created_at: string;
  author: RawAuthorRef;
  vote_options: RawVoteOption[] | null;
  comments: RawComment[] | null;
};

const LIFE_STAGE_LABEL_BY_VALUE = new Map<string, string>(
  LIFE_STAGE_OPTIONS.map((option) => [option.value, option.label]),
);

function lifeStageLabel(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return LIFE_STAGE_LABEL_BY_VALUE.get(value) ?? null;
}

function toPublicImageUrl(path: string | null, client: VoteFeedClient) {
  return path ? getPublicUrl(path, client) : null;
}

function toVoteOption(option: RawVoteOption, client: VoteFeedClient): VoteFeedOption | null {
  if (option.position !== 1 && option.position !== 2) {
    return null;
  }

  return {
    id: option.id,
    label: option.label,
    price: option.price,
    imageUrl: toPublicImageUrl(option.image_path, client),
    position: option.position,
  };
}

export type VoteFeedFilter = {
  stage?: LifeStageValue;
};

export function parseVoteFeedFilter(stage: string | string[] | undefined): VoteFeedFilter {
  const value = Array.isArray(stage) ? stage[0] : stage;
  if (value && isLifeStageValue(value)) {
    return { stage: value };
  }
  return {};
}

export async function getPublicVoteFeedItems(
  filter: VoteFeedFilter = {},
  client?: VoteFeedClient,
): Promise<VoteFeedItem[]> {
  const supabase = client ?? (await createServerSupabaseClient());
  let query = supabase
    .from("dilemmas")
    .select(
      "id,title,product_name,price,category,image_path,vote_type,created_at," +
        "author:profiles!inner(nickname,life_stage)," +
        "vote_options(id,label,price,image_path,position)," +
        "comments(body,created_at,author:profiles(nickname))",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);

  if (filter.stage) {
    query = query.eq("author.life_stage", filter.stage);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as RawDilemma[];
  const summaries = await getDilemmaVoteSummaries(
    rows.map((row) => row.id),
    supabase,
  );
  const summariesByDilemmaId = new Map(
    summaries
      .filter((summary) => summary.dilemma_id)
      .map((summary) => [summary.dilemma_id, summary]),
  );

  return rows.map((row) => {
    const sortedComments = [...(row.comments ?? [])].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );
    const firstComment = sortedComments[0] ?? null;
    const summary = summariesByDilemmaId.get(row.id);

    return {
      id: row.id,
      title: row.title,
      productName: row.product_name,
      price: row.price,
      category: row.category,
      imageUrl: toPublicImageUrl(row.image_path, supabase),
      createdAt: row.created_at,
      voteType: row.vote_type === "ab" ? "ab" : "buy_skip",
      totalVotes: summary?.total_count ?? 0,
      commentCount: sortedComments.length,
      author: {
        nickname: row.author.nickname,
        lifeStageLabel: lifeStageLabel(row.author.life_stage),
      },
      previewComment:
        firstComment ?
          {
            authorName: firstComment.author?.nickname ?? "익명",
            body: firstComment.body,
          }
        : null,
      options: (row.vote_options ?? [])
        .map((option) => toVoteOption(option, supabase))
        .filter((option): option is VoteFeedOption => option !== null),
    };
  });
}
