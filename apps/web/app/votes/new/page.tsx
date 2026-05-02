import { createVote } from "@/features/votes/create-vote-actions";
import { CreateVoteForm } from "@/features/votes/create-vote-form";

export default function NewVotePage() {
  return <CreateVoteForm action={createVote} />;
}
