import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
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

type RawComment = {
  body: string;
  created_at: string;
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
  vote_options: RawVoteOption[] | null;
  comments: RawComment[] | null;
};

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

export async function getPublicVoteFeedItems(
  client?: VoteFeedClient,
): Promise<VoteFeedItem[]> {
  const supabase = client ?? (await createServerSupabaseClient());
  const { data, error } = await supabase
    .from("dilemmas")
    .select(
      "id,title,product_name,price,category,image_path,vote_type,created_at,vote_options(id,label,price,image_path,position),comments(body,created_at)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as RawDilemma[];
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
      previewComment:
        firstComment ?
          {
            authorName: "익명의 아나콘다",
            body: firstComment.body,
          }
        : null,
      options: (row.vote_options ?? [])
        .map((option) => toVoteOption(option, supabase))
        .filter((option): option is VoteFeedOption => option !== null),
    };
  });
}
