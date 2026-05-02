"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateAnonymousSessionId } from "@/lib/session/anonymous-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { voteChoiceSchema, voteCommentSchema } from "./schema";

export type DetailVoteActionState = {
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

export async function castQuickVote(formData: FormData) {
  const dilemmaId = readRequiredFormValue(formData, "dilemmaId");
  const optionId = formData.get("optionId");
  const rawChoice = formData.get("choice");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const voter =
    user ?
      { voter_id: user.id, anonymous_session_id: null }
    : { voter_id: null, anonymous_session_id: await getOrCreateAnonymousSessionId() };

  const votePayload =
    typeof optionId === "string" && optionId.length > 0 ?
      {
        dilemma_id: dilemmaId,
        option_id: optionId,
        choice: null,
        ...voter,
      }
    : {
        dilemma_id: dilemmaId,
        option_id: null,
        choice: voteChoiceSchema.parse(rawChoice),
        ...voter,
      };

  const { error } = await supabase.from("votes").insert(votePayload);

  if (error && error.code !== "23505") {
    throw error;
  }

  revalidatePath("/");
}

function readOptionalFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function duplicateVoteState(): DetailVoteActionState {
  return {
    status: "error",
    message: "이미 이 투표에 참여했어요.",
  };
}

export async function castDetailVote(
  _state: DetailVoteActionState,
  formData: FormData,
): Promise<DetailVoteActionState> {
  const dilemmaId = readRequiredFormValue(formData, "dilemmaId");
  const optionId = readOptionalFormValue(formData, "optionId");
  const rawChoice = readOptionalFormValue(formData, "choice");
  const rawComment = readOptionalFormValue(formData, "comment");
  const commentBody =
    rawComment && rawComment.trim().length > 0 ?
      voteCommentSchema.parse({ body: rawComment.trim() }).body
    : null;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const voter =
    user ?
      { voter_id: user.id, anonymous_session_id: null }
    : { voter_id: null, anonymous_session_id: await getOrCreateAnonymousSessionId() };
  const voteId = crypto.randomUUID();
  const votePayload =
    optionId ?
      {
        id: voteId,
        dilemma_id: dilemmaId,
        option_id: optionId,
        choice: null,
        ...voter,
      }
    : {
        id: voteId,
        dilemma_id: dilemmaId,
        option_id: null,
        choice: voteChoiceSchema.parse(rawChoice),
        ...voter,
      };

  const { error: voteError } = await supabase.from("votes").insert(votePayload);

  if (voteError?.code === "23505") {
    return duplicateVoteState();
  }

  if (voteError) {
    return {
      status: "error",
      message: "투표를 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
    };
  }

  if (commentBody) {
    const { error: commentError } = await supabase.from("comments").insert({
      author_id: user?.id ?? null,
      body: commentBody,
      dilemma_id: dilemmaId,
      vote_id: voteId,
    });

    if (commentError) {
      return {
        status: "error",
        message: "한마디를 저장하지 못했어요. 투표는 반영됐습니다.",
      };
    }
  }

  revalidatePath("/");
  revalidatePath(`/votes/${dilemmaId}`);

  return {
    status: "success",
    message: "투표가 반영됐어요.",
  };
}
