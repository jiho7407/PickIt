import { redirect } from "next/navigation";
import { getSafeRedirectPath } from "@/lib/redirect";
import type { createServerSupabaseClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function redirectIfLifeStageMissing(
  supabase: SupabaseServerClient,
  userId: string,
  redirectTo: string,
) {
  const safeRedirectTo = getSafeRedirectPath(redirectTo);
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("life_stage")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile?.life_stage) {
    const params = new URLSearchParams({ redirectTo: safeRedirectTo });
    redirect(`/onboarding/life-stage?${params.toString()}`);
  }
}
