"use client";

import { useActionState } from "react";
import { SendArrowIcon } from "@/features/votes/icons";
import type { DetailVoteActionState } from "@/features/votes/vote-actions";

export type VoteSelection =
  | {
      kind: "choice";
      value: "buy" | "skip";
    }
  | {
      kind: "option";
      optionId: string;
    };

type VoteCommentFormProps = {
  action: (
    state: DetailVoteActionState,
    formData: FormData,
  ) => DetailVoteActionState | Promise<DetailVoteActionState>;
  dilemmaId: string;
  selection: VoteSelection;
};

export function VoteCommentForm({ action, dilemmaId, selection }: VoteCommentFormProps) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });

  return (
    <form
      action={formAction}
      className="sticky bottom-0 z-20 border-t border-[#f1f5f9] bg-white px-5 py-3"
    >
      <input type="hidden" name="dilemmaId" value={dilemmaId} />
      {selection.kind === "choice" ?
        <input type="hidden" name="choice" value={selection.value} />
      : <input type="hidden" name="optionId" value={selection.optionId} />}
      <div className="flex gap-2">
        <input
          name="comment"
          maxLength={200}
          placeholder="댓글을 입력해주세요"
          className="h-[51px] min-w-0 flex-1 rounded-xl border border-[#dfe5ed] bg-white px-3 text-base leading-[1.3] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus-visible:border-[#32cfc6] focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="투표와 댓글 제출"
          className="grid h-[51px] w-[51px] shrink-0 place-items-center rounded-xl bg-[#32cfc6] text-white transition disabled:bg-[#dfe5ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          <SendArrowIcon className="h-6 w-6" />
        </button>
      </div>
      {state.message ?
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`mt-2 text-xs leading-[1.3] ${
            state.status === "error" ? "text-[#ff6842]" : "text-[#32cfc6]"
          }`}
        >
          {state.message}
        </p>
      : null}
    </form>
  );
}
