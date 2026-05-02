import { redirect } from "next/navigation";
import { createVote } from "@/features/votes/create-vote-actions";
import { CreateVoteForm } from "@/features/votes/create-vote-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NewVotePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=%2Fvotes%2Fnew");
  }

  return <CreateVoteForm action={createVote} />;
}
