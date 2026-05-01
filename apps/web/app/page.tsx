import { castQuickVote } from "@/features/votes/vote-actions";
import { VoteFeed } from "@/features/votes/vote-feed";
import { getPublicVoteFeedItems, parseVoteFeedFilter } from "@/features/votes/vote-feed.server";

type HomePageSearchParams = {
  stage?: string | string[];
};

type HomePageProps = {
  searchParams?: Promise<HomePageSearchParams>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolved = (await searchParams) ?? {};
  const filter = parseVoteFeedFilter(resolved.stage);
  const items = await getPublicVoteFeedItems(filter);

  return (
    <VoteFeed items={items} quickVoteAction={castQuickVote} activeStage={filter.stage} />
  );
}
