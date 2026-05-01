"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateAnonymousSessionId } from "@/lib/session/anonymous-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { voteChoiceSchema } from "./schema";

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
