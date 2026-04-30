import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

const MESSAGE_CIRCLE_ICON = "https://www.figma.com/api/mcp/asset/3f867db4-ff85-4170-b640-60281f359c0f";
const COMMENT_ICON = "https://www.figma.com/api/mcp/asset/db562f19-e896-42ce-9b33-1c83614ece18";

export type VoteFeedOption = {
  id: string;
  label: string;
  price: number | null;
  imageUrl: string | null;
  position: 1 | 2;
};

export type VoteFeedItem = {
  id: string;
  title: string;
  productName: string;
  price: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  voteType: "buy_skip" | "ab";
  totalVotes: number;
  commentCount: number;
  previewComment: {
    authorName: string;
    body: string;
  } | null;
  options?: VoteFeedOption[];
};

type VoteCardProps = {
  item: VoteFeedItem;
  quickVoteAction: (formData: FormData) => void | Promise<void>;
};

function formatKrw(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

function formatRelativeTime(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours}시간 전`;
}

function ProductImage({ imageUrl, label }: { imageUrl: string | null; label?: "A" | "B" }) {
  return (
    <div className="pickit-checker relative h-40 min-w-0 flex-1 overflow-hidden bg-[#f8faff]">
      {imageUrl ?
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      : null}
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

function QuickVoteButton({
  children,
  dilemmaId,
  choice,
  optionId,
  quickVoteAction,
}: {
  children: React.ReactNode;
  dilemmaId: string;
  choice?: "buy" | "skip";
  optionId?: string;
  quickVoteAction: VoteCardProps["quickVoteAction"];
}) {
  return (
    <form action={quickVoteAction} className="w-full">
      <input type="hidden" name="dilemmaId" value={dilemmaId} />
      {choice ?
        <input type="hidden" name="choice" value={choice} />
      : null}
      {optionId ?
        <input type="hidden" name="optionId" value={optionId} />
      : null}
      <button
        type="submit"
        className="h-11 w-full rounded-xl border border-[#dfe5ed] bg-white px-4 text-sm font-semibold leading-[1.3] text-[#0f172a] transition hover:border-[#32cfc6] hover:text-[#1fa89f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
      >
        {children}
      </button>
    </form>
  );
}

function VoteActions({ item, quickVoteAction }: VoteCardProps) {
  if (item.voteType === "ab" && item.options?.length) {
    const options = [...item.options].sort((a, b) => a.position - b.position).slice(0, 2);

    return (
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <QuickVoteButton
            key={option.id}
            dilemmaId={item.id}
            optionId={option.id}
            quickVoteAction={quickVoteAction}
          >
            {option.position === 1 ? "A" : "B"}가 나아
          </QuickVoteButton>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <QuickVoteButton dilemmaId={item.id} choice="buy" quickVoteAction={quickVoteAction}>
        사도 괜찮아
      </QuickVoteButton>
      <QuickVoteButton dilemmaId={item.id} choice="skip" quickVoteAction={quickVoteAction}>
        참는 게 나아
      </QuickVoteButton>
    </div>
  );
}

function ProductDetails({ item }: { item: VoteFeedItem }) {
  if (item.voteType === "ab" && item.options?.length) {
    const options = [...item.options].sort((a, b) => a.position - b.position).slice(0, 2);

    return (
      <div className="grid grid-cols-2 gap-4 px-4">
        {options.map((option) => (
          <div key={option.id} className="min-w-0">
            <p className="truncate text-base font-semibold leading-[1.3] text-[#0f172a]">
              {formatKrw(option.price ?? item.price)}
            </p>
            <p className="mt-1 truncate text-sm leading-[1.3] text-[#334155]">{option.label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4">
      <p className="text-base font-semibold leading-[1.3] text-[#0f172a]">
        {formatKrw(item.price)}
      </p>
      <p className="mt-1 text-sm leading-[1.3] text-[#334155]">{item.productName}</p>
    </div>
  );
}

function CardStatus({ item }: { item: VoteFeedItem }) {
  return (
    <div className="flex items-center justify-end gap-1 text-xs leading-[1.3] text-[#94a3b8]">
      <span>{formatRelativeTime(item.createdAt)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <img src={MESSAGE_CIRCLE_ICON} alt="" aria-hidden="true" className="h-4 w-4" />
        <span>{item.commentCount}</span>
      </span>
    </div>
  );
}

export function VoteCard({ item, quickVoteAction }: VoteCardProps) {
  const options = [...(item.options ?? [])].sort((a, b) => a.position - b.position);
  const detailLabel = `${item.productName} 상세 보기`;

  return (
    <article className="border-b border-[#eef2f7] bg-white">
      <div className="px-5 py-4">
        <div className="space-y-2">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold leading-[1.3] text-[#1fa89f]">투표 진행 중</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold leading-[1.3] text-[#334155]">
                익명의 아나콘다
              </p>
              <span className="rounded-full bg-[#e8fafa] px-2 py-1 text-xs font-semibold leading-[1.3] text-[#32cfc6]">
                대학생
              </span>
            </div>
          </div>

          <Link
            href={`/votes/${item.id}`}
            aria-label={detailLabel}
            className="block text-base font-semibold leading-[1.3] text-[#0f172a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            {item.title}
          </Link>
        </div>
      </div>

      <div className="flex">
        {item.voteType === "ab" && options.length >= 2 ?
          <>
            <ProductImage imageUrl={options[0].imageUrl} label="A" />
            <ProductImage imageUrl={options[1].imageUrl} label="B" />
          </>
        : <ProductImage imageUrl={item.imageUrl} />}
      </div>

      <div className="space-y-4 px-5 py-4">
        <ProductDetails item={item} />
        <VoteActions item={item} quickVoteAction={quickVoteAction} />
        <CardStatus item={item} />
      </div>

      {item.previewComment ?
        <div className="bg-[#f8faff] px-5 py-3 text-xs leading-[1.3] text-[#334155]">
          <Link
            href={`/votes/${item.id}`}
            className="flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <img src={COMMENT_ICON} alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="min-w-0 truncate">
                <span className="font-semibold">{item.previewComment.authorName}</span>
                <span>: {item.previewComment.body}</span>
              </span>
            </span>
            <span className="flex shrink-0 items-center text-[#94a3b8]">
              더보기
              <span
                aria-hidden="true"
                className="ml-1 h-2.5 w-2.5 rotate-45 border-r-2 border-t-2 border-[#94a3b8]"
              />
            </span>
          </Link>
        </div>
      : null}
    </article>
  );
}
