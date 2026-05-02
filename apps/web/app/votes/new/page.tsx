import { redirect } from "next/navigation";
import { redirectIfLifeStageMissing } from "@/features/profile/profile-onboarding";
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

  await redirectIfLifeStageMissing(supabase, user.id, "/votes/new");

  return <CreateVoteForm action={createVote} />;
}
