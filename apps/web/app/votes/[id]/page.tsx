import { notFound } from "next/navigation";
import { recordDetailVote, submitDetailComment } from "@/features/votes/vote-actions";
import { VoteDetail } from "@/features/votes/vote-detail";
import { getVoteDetail } from "@/features/votes/vote-detail.server";

type VoteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VoteDetailPage({ params }: VoteDetailPageProps) {
  const { id } = await params;
  const detail = await getVoteDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <VoteDetail
      detail={detail}
      recordVoteAction={recordDetailVote}
      submitCommentAction={submitDetailComment}
    />
  );
}
