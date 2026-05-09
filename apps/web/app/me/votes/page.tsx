import { redirect } from "next/navigation";
import { deleteMyComment } from "@/features/comments/comment-actions";
import { archiveMyDilemma } from "@/features/me/my-vote-actions";
import { MyVoteList } from "@/features/me/my-vote-list";
import { getMyVoteList } from "@/features/me/my-votes.server";
import { getLoginHref } from "@/lib/redirect";

export default async function MyVotesPage() {
  const data = await getMyVoteList();

  if (!data) {
    redirect(getLoginHref("/me/votes"));
  }

  return (
    <MyVoteList
      data={data}
      deleteCommentAction={deleteMyComment}
      deleteDilemmaAction={archiveMyDilemma}
    />
  );
}
