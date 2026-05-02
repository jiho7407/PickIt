"use server";

import { revalidatePath } from "next/cache";
import {
  getAnonymousSessionIdIfPresent,
  getOrCreateAnonymousSessionId,
} from "@/lib/session/anonymous-session";
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
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.info("[castQuickVote]", {
    dilemmaId,
    voterMode: user ? "authenticated" : "anonymous",
  });

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

type VoterIdentity =
  | { kind: "authenticated"; userId: string }
  | { kind: "anonymous"; sessionId: string };

async function resolveVoterIdentity(): Promise<VoterIdentity> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { kind: "authenticated", userId: user.id };
  }

  const sessionId = await getOrCreateAnonymousSessionId();
  return { kind: "anonymous", sessionId };
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
  identity: VoterIdentity,
): Promise<string | null> {
  let query = supabase.from("votes").select("id").eq("dilemma_id", dilemmaId);

  if (identity.kind === "authenticated") {
    query = query.eq("voter_id", identity.userId);
  } else {
    query = query.eq("anonymous_session_id", identity.sessionId);
  }

  const { data } = await query.maybeSingle();
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
  const identity = await resolveVoterIdentity();

  console.info("[recordDetailVote]", {
    dilemmaId,
    voterMode: identity.kind,
    payload: optionId ? { optionId } : { choice: rawChoice },
  });

  const voter =
    identity.kind === "authenticated" ?
      { voter_id: identity.userId, anonymous_session_id: null }
    : { voter_id: null, anonymous_session_id: identity.sessionId };

  const choicePayload =
    optionId ?
      { option_id: optionId, choice: null }
    : { option_id: null, choice: voteChoiceSchema.parse(rawChoice) };

  const existingVoteId = await findExistingVoteId(supabase, dilemmaId, identity);

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
      ...voter,
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
  const identity: VoterIdentity =
    user ?
      { kind: "authenticated", userId: user.id }
    : await (async () => {
        const sessionId = await getAnonymousSessionIdIfPresent();
        if (!sessionId) {
          return { kind: "anonymous", sessionId: await getOrCreateAnonymousSessionId() };
        }
        return { kind: "anonymous" as const, sessionId };
      })();

  console.info("[submitDetailComment]", {
    dilemmaId,
    voterMode: identity.kind,
  });

  const voteId = await findExistingVoteId(supabase, dilemmaId, identity);

  if (!voteId) {
    return {
      status: "error",
      message: "먼저 투표한 뒤 댓글을 남겨주세요.",
    };
  }

  const { error: commentError } = await supabase.from("comments").insert({
    author_id: identity.kind === "authenticated" ? identity.userId : null,
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
