"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  LIFE_STAGE_OPTIONS,
  type LifeStageValue,
} from "@/features/onboarding/onboarding-trigger";

const lifeStageSchema = z.enum(
  LIFE_STAGE_OPTIONS.map((option) => option.value) as [LifeStageValue, ...LifeStageValue[]],
);

export type UpdateLifeStageResult =
  | { ok: true }
  | { ok: false; error: "invalid_life_stage" | "auth_required" | "update_failed" };

export async function updateMyLifeStage(
  lifeStage: LifeStageValue,
): Promise<UpdateLifeStageResult> {
  const parsed = lifeStageSchema.safeParse(lifeStage);

  if (!parsed.success) {
    return { ok: false, error: "invalid_life_stage" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "auth_required" };
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update({ life_stage: parsed.data })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return { ok: false, error: "update_failed" };
  }

  if (!updatedProfile) {
    const fallbackNickname = buildFallbackNickname(user.email, user.user_metadata);
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      life_stage: parsed.data,
      nickname: fallbackNickname,
      role: "user",
    });

    if (insertError) {
      return { ok: false, error: "update_failed" };
    }
  }

  return { ok: true };
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

  if (trimmed.length < 2) {
    return "PickIt user";
  }

  return trimmed.slice(0, 24);
}

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
