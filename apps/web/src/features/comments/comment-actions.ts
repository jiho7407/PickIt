"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DeleteActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function readRequiredFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing ${key}`);
  }

  return value;
}

export async function deleteMyComment(
  _state: DeleteActionState,
  formData: FormData,
): Promise<DeleteActionState> {
  const commentId = readRequiredFormValue(formData, "commentId");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "로그인한 뒤 댓글을 삭제할 수 있어요.",
    };
  }

  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id)
    .select("id,dilemma_id")
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      message: "댓글을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.",
    };
  }

  if (!data) {
    return {
      status: "error",
      message: "내가 작성한 댓글만 삭제할 수 있어요.",
    };
  }

  revalidatePath("/me/votes");
  revalidatePath(`/votes/${data.dilemma_id}`);

  return {
    status: "success",
    message: "댓글이 삭제됐어요.",
  };
}
