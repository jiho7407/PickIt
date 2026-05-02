import { notFound } from "next/navigation";
import { redirectIfLifeStageMissing } from "@/features/profile/profile-onboarding";
import { recordDetailVote, submitDetailComment } from "@/features/votes/vote-actions";
import { VoteDetail } from "@/features/votes/vote-detail";
import { getVoteDetail } from "@/features/votes/vote-detail.server";
import { getLoginHref } from "@/lib/redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type VoteDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VoteDetailPage({ params }: VoteDetailPageProps) {
  const { id } = await params;
  const [detail, supabase] = await Promise.all([getVoteDetail(id), createServerSupabaseClient()]);

  if (!detail) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await redirectIfLifeStageMissing(supabase, user.id, `/votes/${detail.id}`);
  }

  return (
    <VoteDetail
      detail={detail}
      recordVoteAction={recordDetailVote}
      submitCommentAction={submitDetailComment}
      isAuthenticated={Boolean(user)}
      loginHref={getLoginHref(`/votes/${detail.id}`)}
    />
  );
}
