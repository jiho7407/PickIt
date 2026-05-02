"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import { VoteCommentForm, type VoteSelection } from "@/features/comments/vote-comment-form";
import type { DetailVoteActionState } from "./vote-actions";
import { AbVotePanel } from "./ab-vote-panel";
import { BuySkipVotePanel } from "./buy-skip-vote-panel";
import { ChevronLeftIcon } from "./icons";
import type { VoteDetailComment, VoteDetailItem } from "./vote-detail.server";

type VoteDetailProps = {
  detail: VoteDetailItem;
  voteAction: (
    state: DetailVoteActionState,
    formData: FormData,
  ) => DetailVoteActionState | Promise<DetailVoteActionState>;
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

function defaultSelection(detail: VoteDetailItem): VoteSelection {
  if (detail.voteType === "ab") {
    const [optionA, optionB] = detail.options;
    const option =
      detail.summary.optionBRatio > detail.summary.optionARatio ? optionB ?? optionA : optionA;
    return { kind: "option", optionId: option?.id ?? "" };
  }

  return {
    kind: "choice",
    value: detail.summary.skipRatio > detail.summary.buyRatio ? "skip" : "buy",
  };
}

function hasValidSelection(selection: VoteSelection) {
  return selection.kind === "choice" || selection.optionId.length > 0;
}

export function VoteDetail({ detail, voteAction }: VoteDetailProps) {
  const initialSelection = useMemo(() => defaultSelection(detail), [detail]);
  const [selection, setSelection] = useState<VoteSelection>(initialSelection);
  const selectedChoice: BuySkipSelection =
    selection.kind === "choice" ? selection : { kind: "choice", value: "buy" };
  const selectedOption: AbSelection =
    selection.kind === "option" ? selection : { kind: "option", optionId: "" };

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
        <div className="px-5 pb-2 pt-6">
          <h2 className="text-base font-semibold leading-[1.3] text-[#0f172a]">투표 결과</h2>
        </div>
        <div className="px-5 pb-8 pt-4">
          {detail.voteType === "ab" ?
            <AbVotePanel
              options={detail.options}
              optionARatio={detail.summary.optionARatio}
              optionBRatio={detail.summary.optionBRatio}
              totalCount={detail.summary.totalCount}
              selected={selectedOption}
              onSelect={setSelection}
            />
          : <BuySkipVotePanel
              buyRatio={detail.summary.buyRatio}
              skipRatio={detail.summary.skipRatio}
              totalCount={detail.summary.totalCount}
              selected={selectedChoice}
              onSelect={setSelection}
            />}
        </div>
      </section>

      <div className="h-2 bg-[#f8faff]" />
      <CommentsSection comments={detail.comments} />
      {hasValidSelection(selection) ?
        <VoteCommentForm action={voteAction} dilemmaId={detail.id} selection={selection} />
      : null}
    </main>
  );
}
