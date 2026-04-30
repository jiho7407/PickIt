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

  const { error } = await supabase
    .from("profiles")
    .update({ life_stage: parsed.data })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: "update_failed" };
  }

  return { ok: true };
}
