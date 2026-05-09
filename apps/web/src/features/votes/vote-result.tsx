import { BuyButtonIcon, ShoppingBagIcon, SkipButtonIcon, SkipChoiceIcon } from "./icons";

type VoteResultBarProps = {
  label: string;
  percent: number;
  tone: "mint" | "orange" | "gray";
  selected: boolean;
  voted?: boolean;
  icon?: "buy" | "skip";
  onSelect: () => void;
};

export type VoteResultSummaryProps = {
  headline: string;
  headlinePercent: number;
  tone: "mint" | "orange";
  totalCount: number;
  icon?: "buy" | "skip";
};

function VotedSwooshIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 12 Q 6 18 9 14 Q 13 8 17 4" />
    </svg>
  );
}

export function VoteResultSummary({
  headline,
  headlinePercent,
  icon,
  tone,
  totalCount,
}: VoteResultSummaryProps) {
  if (totalCount === 0) {
    return (
      <div className="flex w-full items-center justify-between gap-3">
        <p className="min-w-0 text-base font-semibold leading-[1.3] text-[#334155]">
          아직 아무도 투표하지 않았어요
        </p>
        <p className="shrink-0 text-sm leading-[1.3] text-[#94a3b8]">총 0표</p>
      </div>
    );
  }

  const accent = tone === "mint" ? "text-[#32cfc6]" : "text-[#ff6842]";

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {icon === "buy" ? <ShoppingBagIcon className="h-6 w-6 shrink-0 text-[#32cfc6]" /> : null}
        {icon === "skip" ? <SkipChoiceIcon className="h-6 w-6 shrink-0 text-[#ff6842]" /> : null}
        <p className="min-w-0 text-base font-semibold leading-[1.3] text-[#0f172a]">
          <span className="sr-only">
            {headlinePercent}%{headline}
          </span>
          <span aria-hidden="true">
            <span className={accent}>{headlinePercent}%</span>
            {headline}
          </span>
        </p>
      </div>
      <p className="shrink-0 text-sm leading-[1.3] text-[#64748b]">총 {totalCount}표</p>
    </div>
  );
}

export function VoteResultBar({
  label,
  onSelect,
  percent,
  selected,
  tone,
  voted = false,
  icon,
}: VoteResultBarProps) {
  const fillClass =
    tone === "mint" ? "bg-[#aaecea]"
    : tone === "orange" ? "bg-[#ffddc6]"
    : "bg-[#dfe5ed]";
  const borderClass =
    selected ?
      tone === "orange" ? "border-[#ff6842]"
      : tone === "mint" ? "border-[#32cfc6]"
      : "border-[#dfe5ed]"
    : "border-[#dfe5ed]";
  const showVotedMark = voted && selected;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`relative h-11 w-full overflow-hidden rounded-xl border bg-white text-sm font-semibold leading-[1.3] text-[#0f172a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${borderClass}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 ${fillClass}`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
      {showVotedMark ?
        <span className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center text-[#0f172a]">
          <span className="sr-only">내 투표</span>
          <VotedSwooshIcon className="h-4 w-4" />
        </span>
      : null}
      <span
        className={`relative z-10 inline-flex items-center gap-2 ${showVotedMark ? "pl-6" : ""}`}
      >
        {icon === "buy" ? <BuyButtonIcon className="h-5 w-5 shrink-0" /> : null}
        {icon === "skip" ? <SkipButtonIcon className="h-5 w-5 shrink-0" /> : null}
        <span>{label}</span>
        <span>{percent}%</span>
      </span>
    </button>
  );
}
