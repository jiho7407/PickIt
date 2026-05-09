"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DeleteActionState } from "@/features/comments/comment-actions";

function readRequiredFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing ${key}`);
  }

  return value;
}

export async function archiveMyDilemma(
  _state: DeleteActionState,
  formData: FormData,
): Promise<DeleteActionState> {
  const dilemmaId = readRequiredFormValue(formData, "dilemmaId");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "로그인한 뒤 투표를 삭제할 수 있어요.",
    };
  }

  const { data, error } = await supabase
    .from("dilemmas")
    .update({ status: "archived" })
    .eq("id", dilemmaId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: "투표를 삭제하지 못했어요. 잠시 후 다시 시도해주세요.",
    };
  }

  if (!data) {
    return {
      status: "error",
      message: "내가 만든 투표만 삭제할 수 있어요.",
    };
  }

  revalidatePath("/");
  revalidatePath("/me/votes");
  revalidatePath(`/votes/${dilemmaId}`);

  return {
    status: "success",
    message: "투표가 삭제됐어요.",
  };
}
