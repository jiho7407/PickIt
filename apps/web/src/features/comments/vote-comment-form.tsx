"use client";

import { useActionState, useEffect, useRef } from "react";
import { SendArrowIcon } from "@/features/votes/icons";
import type { DetailCommentActionState } from "@/features/votes/vote-actions";

type VoteCommentFormProps = {
  action: (
    state: DetailCommentActionState,
    formData: FormData,
  ) => DetailCommentActionState | Promise<DetailCommentActionState>;
  dilemmaId: string;
};

export function VoteCommentForm({ action, dilemmaId }: VoteCommentFormProps) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="sticky bottom-0 z-20 border-t border-[#f1f5f9] bg-white px-5 py-3"
    >
      <input type="hidden" name="dilemmaId" value={dilemmaId} />
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
          aria-label="댓글 등록"
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
