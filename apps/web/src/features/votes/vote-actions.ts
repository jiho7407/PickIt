"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLoginHref, getSafeRedirectPath } from "@/lib/redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { voteChoiceSchema, voteCommentSchema } from "./schema";

export type DetailVoteActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type DetailCommentActionState = {
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

function readOptionalFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function castQuickVote(formData: FormData) {
  const dilemmaId = readRequiredFormValue(formData, "dilemmaId");
  const optionId = formData.get("optionId");
  const rawChoice = formData.get("choice");
  const redirectTo = getSafeRedirectPath(readOptionalFormValue(formData, "redirectTo"));
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLoginHref(redirectTo));
  }

  const votePayload =
    typeof optionId === "string" && optionId.length > 0 ?
      {
        dilemma_id: dilemmaId,
        option_id: optionId,
        choice: null,
        voter_id: user.id,
        anonymous_session_id: null,
      }
    : {
        dilemma_id: dilemmaId,
        option_id: null,
        choice: voteChoiceSchema.parse(rawChoice),
        voter_id: user.id,
        anonymous_session_id: null,
      };

  const { error } = await supabase.from("votes").insert(votePayload);

  // 23505: duplicate vote (already voted from the home card).
  // 23514: validate_vote check_violation (e.g., authors voting on their own dilemma).
  // We swallow both so the home card never throws into the error boundary.
  if (error && error.code !== "23505" && error.code !== "23514") {
    throw error;
  }

  revalidatePath("/");
}

type SupabaseWriteError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
};

function mapVoteWriteError(
  error: SupabaseWriteError,
  kind: "insert" | "update",
): DetailVoteActionState {
  if (error.code === "23514") {
    if (error.message?.includes("authors cannot vote on their own dilemmas")) {
      return {
        status: "error",
        message: "본인이 만든 투표에는 투표할 수 없어요.",
      };
    }
    return {
      status: "error",
      message: "투표 내용을 처리할 수 없어요. 다시 시도해주세요.",
    };
  }

  if (error.code === "42501") {
    return {
      status: "error",
      message: "투표 권한이 없어요. 다시 로그인한 뒤 시도해주세요.",
    };
  }

  return {
    status: "error",
    message:
      kind === "update" ?
        "투표를 변경하지 못했어요. 잠시 후 다시 시도해주세요."
      : "투표를 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
  };
}

async function findExistingVoteId(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  dilemmaId: string,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("votes")
    .select("id")
    .eq("dilemma_id", dilemmaId)
    .eq("voter_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

export async function recordDetailVote(
  _state: DetailVoteActionState,
  formData: FormData,
): Promise<DetailVoteActionState> {
  const dilemmaId = readRequiredFormValue(formData, "dilemmaId");
  const optionId = readOptionalFormValue(formData, "optionId");
  const rawChoice = readOptionalFormValue(formData, "choice");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "로그인한 뒤 투표할 수 있어요.",
    };
  }

  console.info("[recordDetailVote]", {
    dilemmaId,
    payload: optionId ? { optionId } : { choice: rawChoice },
  });

  const choicePayload =
    optionId ?
      { option_id: optionId, choice: null }
    : { option_id: null, choice: voteChoiceSchema.parse(rawChoice) };

  const existingVoteId = await findExistingVoteId(supabase, dilemmaId, user.id);

  if (existingVoteId) {
    const { error: updateError } = await supabase
      .from("votes")
      .update(choicePayload)
      .eq("id", existingVoteId);

    if (updateError) {
      console.error("[recordDetailVote] update failed", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
      });
      return mapVoteWriteError(updateError, "update");
    }
  } else {
    const { error: insertError } = await supabase.from("votes").insert({
      dilemma_id: dilemmaId,
      ...choicePayload,
      voter_id: user.id,
      anonymous_session_id: null,
    });

    if (insertError) {
      console.error("[recordDetailVote] insert failed", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
      });
      return mapVoteWriteError(insertError, "insert");
    }
  }

  revalidatePath("/");
  revalidatePath(`/votes/${dilemmaId}`);

  return {
    status: "success",
    message: "투표가 반영됐어요.",
  };
}

export async function submitDetailComment(
  _state: DetailCommentActionState,
  formData: FormData,
): Promise<DetailCommentActionState> {
  const dilemmaId = readRequiredFormValue(formData, "dilemmaId");
  const rawComment = readOptionalFormValue(formData, "comment");

  if (!rawComment || rawComment.trim().length === 0) {
    return {
      status: "error",
      message: "댓글 내용을 입력해주세요.",
    };
  }

  const commentBody = voteCommentSchema.parse({ body: rawComment.trim() }).body;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "로그인한 뒤 댓글을 남길 수 있어요.",
    };
  }

  console.info("[submitDetailComment]", { dilemmaId });

  const voteId = await findExistingVoteId(supabase, dilemmaId, user.id);

  if (!voteId) {
    return {
      status: "error",
      message: "먼저 투표한 뒤 댓글을 남겨주세요.",
    };
  }

  const { error: commentError } = await supabase.from("comments").insert({
    author_id: user.id,
    body: commentBody,
    dilemma_id: dilemmaId,
    vote_id: voteId,
  });

  if (commentError) {
    console.error("[submitDetailComment] insert failed", { code: commentError.code });
    return {
      status: "error",
      message: "댓글을 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
    };
  }

  revalidatePath(`/votes/${dilemmaId}`);

  return {
    status: "success",
    message: "댓글이 등록됐어요.",
  };
}
