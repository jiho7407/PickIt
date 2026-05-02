import { castQuickVote } from "@/features/votes/vote-actions";
import { VoteFeed } from "@/features/votes/vote-feed";
import { getPublicVoteFeedItems, parseVoteFeedFilter } from "@/features/votes/vote-feed.server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type HomePageSearchParams = {
  stage?: string | string[];
};

type HomePageProps = {
  searchParams?: Promise<HomePageSearchParams>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolved = (await searchParams) ?? {};
  const filter = parseVoteFeedFilter(resolved.stage);
  const [items, supabase] = await Promise.all([
    getPublicVoteFeedItems(filter),
    createServerSupabaseClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <VoteFeed
      items={items}
      quickVoteAction={castQuickVote}
      activeStage={filter.stage}
      isAuthenticated={Boolean(user)}
    />
  );
}
