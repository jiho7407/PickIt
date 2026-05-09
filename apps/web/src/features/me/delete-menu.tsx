"use client";

/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { DeleteActionState } from "@/features/comments/comment-actions";

type DeleteMenuProps = {
  action: (
    state: DeleteActionState,
    formData: FormData,
  ) => DeleteActionState | Promise<DeleteActionState>;
  fieldName: "commentId" | "dilemmaId";
  fieldValue: string;
  resourceLabel: "댓글" | "투표";
};

function CloseIcon() {
  return (
    <span aria-hidden="true" className="relative block h-6 w-6">
      <img
        alt=""
        className="absolute left-[5px] top-[5px] h-[14px] w-[14px]"
        src="/me/close-a.svg"
      />
      <img
        alt=""
        className="absolute left-[5px] top-[5px] h-[14px] w-[14px] rotate-90"
        src="/me/close-b.svg"
      />
    </span>
  );
}

function AlertIcon() {
  return (
    <span aria-hidden="true" className="relative block h-11 w-11 overflow-hidden">
      <img
        alt=""
        className="absolute left-1 top-1 h-9 w-9"
        src="/me/alert-circle.svg"
      />
      <img
        alt=""
        className="absolute left-[19.91px] top-[12.09px] h-[13.541px] w-[4.183px]"
        src="/me/alert-mark.svg"
      />
      <img
        alt=""
        className="absolute left-[19.69px] top-[27.28px] h-[4.624px] w-[4.624px]"
        src="/me/alert-dot.svg"
      />
    </span>
  );
}

function KebabIcon() {
  return (
    <span aria-hidden="true" className="relative block h-6 w-6">
      <img
        alt=""
        className="absolute left-[10px] top-[5px] h-[15px] w-[3px]"
        src="/me/kebab.svg"
      />
    </span>
  );
}

export function DeleteMenu({
  action,
  fieldName,
  fieldValue,
  resourceLabel,
}: DeleteMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const objectLabel = resourceLabel === "댓글" ? "댓글을" : "투표를";

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [menuOpen]);

  useEffect(() => {
    if (state.status === "success") {
      setModalOpen(false);
      setMenuOpen(false);
    }
  }, [state.status]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-label={`${resourceLabel} 삭제 메뉴`}
        onClick={() => setMenuOpen((open) => !open)}
        className="grid h-6 w-6 place-items-center rounded bg-[#f8faff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
      >
        <KebabIcon />
      </button>

      {menuOpen ?
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setModalOpen(true);
          }}
          className="absolute right-0 top-8 z-30 whitespace-nowrap rounded-lg border border-[#dfe5ed] bg-[#f8faff] p-2.5 text-sm leading-[1.3] text-[#334155] shadow-[5px_6px_17px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          삭제하기
        </button>
      : null}

      {modalOpen ?
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(18,18,18,0.5)]"
        >
          <form
            action={formAction}
            className="w-full max-w-[360px] rounded-t-2xl border-[1.5px] border-[#f1f5f9] bg-white px-5 pb-5 pt-4"
          >
            <input type="hidden" name={fieldName} value={fieldValue} />
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setModalOpen(false)}
                className="grid h-6 w-6 place-items-center text-[#94a3b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mt-2 flex flex-col items-center gap-3">
              <AlertIcon />
              <p
                id={titleId}
                className="text-center text-base font-semibold leading-[1.3] text-[#0f172a]"
              >
                정말 {objectLabel} 삭제하시겠습니까?
              </p>
            </div>
            <div className="mt-6 grid h-11 grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-[#dfe5ed] bg-[#f8faff] px-6 py-2 text-sm font-semibold leading-[1.3] text-[#64748b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
              >
                아니오
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-[#32cfc6] px-6 py-2 text-sm font-semibold leading-[1.3] text-[#e8fafa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] disabled:bg-[#dfe5ed]"
              >
                네
              </button>
            </div>
            {state.status === "error" && state.message ?
              <p role="alert" className="mt-3 text-center text-xs leading-[1.3] text-[#ff6842]">
                {state.message}
              </p>
            : null}
          </form>
        </div>
      : null}
    </div>
  );
}
