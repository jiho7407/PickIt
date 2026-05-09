import { redirect } from "next/navigation";
import { EditProfileForm } from "@/features/profile/edit-profile-form";
import {
  isLifeStageValue,
  LIFE_STAGE_OPTIONS,
} from "@/features/onboarding/onboarding-trigger";
import { getLoginHref } from "@/lib/redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const lifeStageLabels = new Map(LIFE_STAGE_OPTIONS.map((option) => [option.value, option.label]));

export default async function ProfileEditPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLoginHref("/profile/edit"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, life_stage")
    .eq("id", user.id)
    .maybeSingle();

  const nickname = profile?.nickname ?? buildFallbackNickname(user.email, user.user_metadata);
  const lifeStage = getLifeStageLabel(profile?.life_stage);

  return <EditProfileForm initialNickname={nickname} initialLifeStageLabel={lifeStage} />;
}

function buildFallbackNickname(
  email: string | undefined,
  metadata: Record<string, unknown> | undefined,
) {
  const rawNickname =
    readMetadataString(metadata, "nickname") ??
    readMetadataString(metadata, "full_name") ??
    readMetadataString(metadata, "name") ??
    email?.split("@")[0] ??
    "PickIt user";

  const trimmed = rawNickname.trim();
  return trimmed.length >= 2 ? trimmed.slice(0, 24) : "PickIt user";
}

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getLifeStageLabel(value: string | null | undefined) {
  if (!value) {
    return "대학생";
  }

  return isLifeStageValue(value) ? (lifeStageLabels.get(value) ?? value) : value;
}
