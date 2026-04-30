import { castQuickVote } from "@/features/votes/vote-actions";
import { VoteFeed } from "@/features/votes/vote-feed";
import { getPublicVoteFeedItems } from "@/features/votes/vote-feed.server";

export default async function HomePage() {
  const items = await getPublicVoteFeedItems();

  return <VoteFeed items={items} quickVoteAction={castQuickVote} />;
}
