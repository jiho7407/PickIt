import { redirect } from "next/navigation";
import { AuthenticatedLifeStageSelectionScreen } from "@/features/onboarding/onboarding-screen";
import { getLoginHref, getSafeRedirectPath } from "@/lib/redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LifeStagePageProps = {
  searchParams?: Promise<{
    redirectTo?: string | string[];
  }>;
};

export default async function LifeStagePage({ searchParams }: LifeStagePageProps) {
  const resolved = (await searchParams) ?? {};
  const redirectToParam = Array.isArray(resolved.redirectTo) ? resolved.redirectTo[0] : resolved.redirectTo;
  const redirectTo = getSafeRedirectPath(redirectToParam);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLoginHref(redirectTo));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("life_stage")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.life_stage) {
    redirect(redirectTo);
  }

  return <AuthenticatedLifeStageSelectionScreen redirectTo={redirectTo} />;
}
