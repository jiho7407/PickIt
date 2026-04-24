import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DilemmaVoteSummary =
  Database["public"]["Views"]["dilemma_vote_summaries"]["Row"];

type SummaryClient = SupabaseClient<Database>;

export async function getDilemmaVoteSummary(
  dilemmaId: string,
  client?: SummaryClient,
): Promise<DilemmaVoteSummary | null> {
  const supabase = client ?? (await createServerSupabaseClient());
  const { data, error } = await supabase
    .from("dilemma_vote_summaries")
    .select("*")
    .eq("dilemma_id", dilemmaId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getDilemmaVoteSummaries(
  dilemmaIds: string[],
  client?: SummaryClient,
): Promise<DilemmaVoteSummary[]> {
  if (dilemmaIds.length === 0) {
    return [];
  }

  const supabase = client ?? (await createServerSupabaseClient());
  const { data, error } = await supabase
    .from("dilemma_vote_summaries")
    .select("*")
    .in("dilemma_id", dilemmaIds);

  if (error) {
    throw error;
  }

  return data;
}
