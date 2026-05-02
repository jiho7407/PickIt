"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { VoteCommentForm } from "@/features/comments/vote-comment-form";
import type {
  DetailCommentActionState,
  DetailVoteActionState,
} from "./vote-actions";
import { AbVotePanel } from "./ab-vote-panel";
import { BuySkipVotePanel } from "./buy-skip-vote-panel";
import { ChevronLeftIcon } from "./icons";
import type { VoteDetailComment, VoteDetailItem } from "./vote-detail.server";

export type VoteSelection =
  | {
      kind: "choice";
      value: "buy" | "skip";
    }
  | {
      kind: "option";
      optionId: string;
    };

type VoteDetailProps = {
  detail: VoteDetailItem;
  recordVoteAction: (
    state: DetailVoteActionState,
    formData: FormData,
  ) => DetailVoteActionState | Promise<DetailVoteActionState>;
  submitCommentAction: (
    state: DetailCommentActionState,
    formData: FormData,
  ) => DetailCommentActionState | Promise<DetailCommentActionState>;
};

type BuySkipSelection = Extract<VoteSelection, { kind: "choice" }>;
type AbSelection = Extract<VoteSelection, { kind: "option" }>;

function formatKrw(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

function formatRelativeTime(createdAt: string, now: number = Date.now()) {
  const diffMs = now - new Date(createdAt).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return `${Math.round(diffHours / 24)}일 전`;
}

function AuthorLine({
  lifeStageLabel,
  nickname,
}: {
  lifeStageLabel: string | null;
  nickname: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <p className="truncate text-xs font-semibold leading-[1.3] text-[#334155]">{nickname}</p>
      {lifeStageLabel ?
        <span className="rounded-full bg-[#e8fafa] px-2 py-1 text-xs font-semibold leading-[1.3] text-[#32cfc6]">
          {lifeStageLabel}
        </span>
      : null}
    </div>
  );
}

function ProductImage({
  imageUrl,
  label,
}: {
  imageUrl: string | null;
  label?: "A" | "B";
}) {
  return (
    <div className="relative h-60 min-w-0 flex-1 overflow-hidden bg-white">
      <img
        src={imageUrl ?? "/votes/feed-checker.png"}
        alt=""
        className="h-full w-full object-cover"
      />
      {label ?
        <span
          className={`absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-sm font-semibold leading-[1.3] text-white ${
            label === "A" ? "bg-[#32cfc6]" : "bg-[#ff6842]"
          }`}
        >
          {label}
        </span>
      : null}
    </div>
  );
}

function DetailImages({ detail }: { detail: VoteDetailItem }) {
  if (detail.voteType === "ab" && detail.options.length >= 2) {
    const [optionA, optionB] = detail.options;
    return (
      <div className="flex">
        <ProductImage imageUrl={optionA.imageUrl} label="A" />
        <ProductImage imageUrl={optionB.imageUrl} label="B" />
      </div>
    );
  }

  return <ProductImage imageUrl={detail.imageUrl} />;
}

function ProductInfo({ detail }: { detail: VoteDetailItem }) {
  return (
    <section className="bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <AuthorLine
          nickname={detail.author.nickname}
          lifeStageLabel={detail.author.lifeStageLabel}
        />
        <p className="shrink-0 text-xs leading-[1.3] text-[#94a3b8]">
          {formatRelativeTime(detail.createdAt)}
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2 leading-[1.3]">
        <p className="text-xl font-bold text-[#0f172a]">{formatKrw(detail.price)}</p>
        <div className="flex flex-col gap-1 text-sm text-[#334155]">
          <p className="font-semibold">{detail.productName}</p>
          <p>{detail.situation}</p>
        </div>
      </div>
    </section>
  );
}

function CommentItem({ comment }: { comment: VoteDetailComment }) {
  return (
    <li className="border-b border-[#f1f5f9] bg-white px-5 py-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-[#d9d9d9]" aria-hidden="true" />
          <AuthorLine
            nickname={comment.authorName}
            lifeStageLabel={comment.authorLifeStageLabel}
          />
        </div>
        <p className="text-sm leading-[1.3] text-[#0f172a]">{comment.body}</p>
        <p className="text-right text-xs leading-[1.3] text-[#94a3b8]">
          {formatRelativeTime(comment.createdAt)}
        </p>
      </div>
    </li>
  );
}

function CommentsSection({ comments }: { comments: VoteDetailComment[] }) {
  return (
    <section className="bg-white">
      <div className="px-5 pb-2 pt-6">
        <h2 className="text-base font-semibold leading-[1.3] text-[#0f172a]">
          <span>댓글 </span>
          <span className="text-[#32cfc6]">{comments.length}</span>
        </h2>
      </div>
      {comments.length > 0 ?
        <ul>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ul>
      : null}
    </section>
  );
}

function leadingSelection(detail: VoteDetailItem): VoteSelection | null {
  if (detail.voteType === "ab") {
    const [optionA, optionB] = detail.options;
    if (!optionA || !optionB) {
      return null;
    }
    const winner = detail.summary.optionBRatio > detail.summary.optionARatio ? optionB : optionA;
    return { kind: "option", optionId: winner.id };
  }

  if (detail.summary.totalCount === 0) {
    return null;
  }
  return {
    kind: "choice",
    value: detail.summary.skipRatio > detail.summary.buyRatio ? "skip" : "buy",
  };
}

export function VoteDetail({ detail, recordVoteAction, submitCommentAction }: VoteDetailProps) {
  const fallbackSelection = useMemo(() => leadingSelection(detail), [detail]);
  const [voted, setVoted] = useState(detail.hasVoted);
  const [mySelection, setMySelection] = useState<VoteSelection | null>(
    detail.hasVoted ? fallbackSelection : null,
  );
  const [voteFeedback, setVoteFeedback] = useState<DetailVoteActionState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setVoted(detail.hasVoted);
    setMySelection(detail.hasVoted ? fallbackSelection : null);
  }, [detail.hasVoted, fallbackSelection]);

  const displayedSelection = mySelection ?? fallbackSelection;
  const buySkipDisplay: BuySkipSelection =
    displayedSelection?.kind === "choice" ? displayedSelection : { kind: "choice", value: "buy" };
  const abDisplay: AbSelection =
    displayedSelection?.kind === "option" ? displayedSelection : { kind: "option", optionId: "" };

  function handleSelect(next: VoteSelection) {
    const previousSelection = mySelection;
    const previousVoted = voted;
    setMySelection(next);
    setVoted(true);
    setVoteFeedback({ status: "idle" });

    const formData = new FormData();
    formData.set("dilemmaId", detail.id);
    if (next.kind === "choice") {
      formData.set("choice", next.value);
    } else {
      formData.set("optionId", next.optionId);
    }

    startTransition(async () => {
      const result = await recordVoteAction({ status: "idle" }, formData);
      setVoteFeedback(result);
      if (result.status !== "success") {
        setMySelection(previousSelection);
        setVoted(previousVoted);
      }
    });
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[360px] bg-white text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
      <header className="sticky top-0 z-30 flex h-10 items-center bg-white px-5">
        <Link
          href="/"
          aria-label="뒤로"
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-[#94a3b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
      </header>

      <DetailImages detail={detail} />
      <ProductInfo detail={detail} />

      <div className="h-2 bg-[#f8faff]" />
      <section className="bg-white">
        <div className="flex items-center justify-between px-5 pb-2 pt-6">
          <h2 className="text-base font-semibold leading-[1.3] text-[#0f172a]">투표하기</h2>
          {voted ?
            <span className="rounded-full bg-[#e8fafa] px-2 py-1 text-xs font-semibold text-[#32cfc6]">
              투표 완료 · 다시 눌러 변경 가능
            </span>
          : null}
        </div>
        <div className="px-5 pb-8 pt-4" aria-busy={isPending}>
          {detail.voteType === "ab" ?
            <AbVotePanel
              options={detail.options}
              optionARatio={detail.summary.optionARatio}
              optionBRatio={detail.summary.optionBRatio}
              totalCount={detail.summary.totalCount}
              selected={abDisplay}
              voted={voted}
              onSelect={handleSelect}
            />
          : <BuySkipVotePanel
              buyRatio={detail.summary.buyRatio}
              skipRatio={detail.summary.skipRatio}
              totalCount={detail.summary.totalCount}
              selected={buySkipDisplay}
              voted={voted}
              onSelect={handleSelect}
            />}
          {voteFeedback.status === "error" && voteFeedback.message ?
            <p role="alert" className="mt-3 text-xs leading-[1.3] text-[#ff6842]">
              {voteFeedback.message}
            </p>
          : null}
        </div>
      </section>

      <div className="h-2 bg-[#f8faff]" />
      <CommentsSection comments={detail.comments} />
      <VoteCommentForm action={submitCommentAction} dilemmaId={detail.id} />
    </main>
  );
}
