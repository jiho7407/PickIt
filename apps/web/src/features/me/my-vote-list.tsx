"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { DeleteActionState } from "@/features/comments/comment-actions";
import { ChevronLeftIcon, MessageCircleIcon } from "@/features/votes/icons";
import { DeleteMenu } from "./delete-menu";
import type {
  MyCommentItem,
  MyParticipatedVoteItem,
  MyVoteCardItem,
  MyVoteListData,
} from "./my-votes.server";

type DeleteAction = (
  state: DeleteActionState,
  formData: FormData,
) => DeleteActionState | Promise<DeleteActionState>;

type MyVoteListProps = {
  data: MyVoteListData;
  deleteCommentAction: DeleteAction;
  deleteDilemmaAction: DeleteAction;
};

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

function ProductImage({ item }: { item: MyVoteCardItem }) {
  if (item.voteType === "ab" && item.options.length >= 2) {
    const [optionA, optionB] = item.options;
    return (
      <div className="flex">
        <img
          alt=""
          className="h-28 min-w-0 flex-1 object-cover"
          src={optionA.imageUrl ?? "/votes/feed-checker.png"}
        />
        <img
          alt=""
          className="h-28 min-w-0 flex-1 object-cover"
          src={optionB.imageUrl ?? "/votes/feed-checker.png"}
        />
      </div>
    );
  }

  return (
    <img
      alt=""
      className="h-28 w-full object-cover"
      src={item.imageUrl ?? "/votes/feed-checker.png"}
    />
  );
}

function CardMeta({ item }: { item: MyVoteCardItem }) {
  return (
    <div className="flex items-center justify-end gap-2 text-xs leading-[1.3] text-[#94a3b8]">
      <span>투표 {item.totalVotes}</span>
      <span aria-hidden="true">·</span>
      <span>{formatRelativeTime(item.createdAt)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <MessageCircleIcon className="h-4 w-4" />
        <span>{item.commentCount}</span>
      </span>
    </div>
  );
}

function VoteCard({
  badge,
  deleteAction,
  item,
}: {
  badge: string;
  deleteAction?: DeleteAction;
  item: MyVoteCardItem | MyParticipatedVoteItem;
}) {
  return (
    <article className="border-b border-[#eef2f7] bg-white">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold leading-[1.3] text-[#1fa89f]">{badge}</p>
          {"myChoiceLabel" in item ?
            <p className="text-xs font-semibold leading-[1.3] text-[#334155]">
              내 선택 · {item.myChoiceLabel}
            </p>
          : null}
          <Link
            href={`/votes/${item.id}`}
            className="block text-base font-semibold leading-[1.3] text-[#0f172a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            {item.title}
          </Link>
        </div>
        {deleteAction ?
          <DeleteMenu
            action={deleteAction}
            fieldName="dilemmaId"
            fieldValue={item.id}
            resourceLabel="투표"
          />
        : null}
      </div>

      <Link
        href={`/votes/${item.id}`}
        aria-label={`${item.productName} 상세 보기`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
      >
        <ProductImage item={item} />
        <div className="px-5 py-4">
          <p className="text-base font-semibold leading-[1.3] text-[#0f172a]">
            {formatKrw(item.price)}
          </p>
          <p className="mt-1 text-sm leading-[1.3] text-[#334155]">{item.productName}</p>
        </div>
      </Link>
      <div className="px-5 pb-4">
        <CardMeta item={item} />
      </div>
    </article>
  );
}

function CommentCard({
  comment,
  deleteCommentAction,
}: {
  comment: MyCommentItem;
  deleteCommentAction: DeleteAction;
}) {
  return (
    <article className="border-b border-[#eef2f7] bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold leading-[1.3] text-[#1fa89f]">내가 남긴 한마디</p>
          <Link
            href={`/votes/${comment.dilemma.id}`}
            className="block text-sm font-semibold leading-[1.3] text-[#334155] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            {comment.dilemma.productName}
          </Link>
        </div>
        <DeleteMenu
          action={deleteCommentAction}
          fieldName="commentId"
          fieldValue={comment.id}
          resourceLabel="댓글"
        />
      </div>
      <p className="mt-3 text-sm leading-[1.3] text-[#0f172a]">{comment.body}</p>
      <p className="mt-2 text-right text-xs leading-[1.3] text-[#94a3b8]">
        {formatRelativeTime(comment.createdAt)}
      </p>
    </article>
  );
}

function Section({
  children,
  count,
  emptyText,
  title,
}: {
  children: React.ReactNode;
  count: number;
  emptyText: string;
  title: string;
}) {
  return (
    <section className="bg-white">
      <div className="flex h-[53px] items-center px-5 pb-2 pt-6">
        <h2 className="text-base font-semibold leading-[1.3] text-[#0f172a]">
          <span>{title} </span>
          <span className="text-[#32cfc6]">{count}</span>
        </h2>
      </div>
      {count > 0 ?
        children
      : <p className="border-b border-[#eef2f7] px-5 py-6 text-sm leading-[1.3] text-[#64748b]">
          {emptyText}
        </p>}
    </section>
  );
}

export function MyVoteList({
  data,
  deleteCommentAction,
  deleteDilemmaAction,
}: MyVoteListProps) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[360px] bg-white text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
      <header className="sticky top-0 z-30 flex h-10 items-center justify-between bg-white px-5">
        <Link
          href="/"
          aria-label="뒤로"
          className="-ml-1 grid h-8 w-8 place-items-center rounded-full text-[#94a3b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-base font-semibold leading-[1.3] text-[#0f172a]">나의 투표</h1>
        <span className="h-8 w-8" aria-hidden="true" />
      </header>

      <Section
        title="내가 올린 투표"
        count={data.created.length}
        emptyText="아직 올린 투표가 없어요."
      >
        {data.created.map((item) => (
          <VoteCard
            key={item.id}
            item={item}
            badge="나의 투표"
            deleteAction={deleteDilemmaAction}
          />
        ))}
      </Section>

      <div className="h-2 bg-[#f8faff]" />

      <Section
        title="내가 선택한 투표"
        count={data.participated.length}
        emptyText="아직 선택한 투표가 없어요."
      >
        {data.participated.map((item) => (
          <VoteCard key={item.id} item={item} badge="내가 선택한 투표" />
        ))}
      </Section>

      <div className="h-2 bg-[#f8faff]" />

      <Section
        title="내가 남긴 한마디"
        count={data.comments.length}
        emptyText="아직 남긴 한마디가 없어요."
      >
        {data.comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            deleteCommentAction={deleteCommentAction}
          />
        ))}
      </Section>
    </main>
  );
}
