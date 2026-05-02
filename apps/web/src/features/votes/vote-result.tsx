import { ShoppingBagIcon, SkipChoiceIcon } from "./icons";

type VoteResultBarProps = {
  label: string;
  percent: number;
  tone: "mint" | "orange" | "gray";
  selected: boolean;
  onSelect: () => void;
};

export type VoteResultSummaryProps = {
  headline: string;
  headlinePercent: number;
  tone: "mint" | "orange";
  totalCount: number;
  icon?: "buy" | "skip";
};

export function VoteResultSummary({
  headline,
  headlinePercent,
  icon,
  tone,
  totalCount,
}: VoteResultSummaryProps) {
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

export function VoteResultBar({ label, onSelect, percent, selected, tone }: VoteResultBarProps) {
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
      <span className="relative z-10 inline-flex items-center gap-2">
        <span>{label}</span>
        <span>{percent}%</span>
      </span>
    </button>
  );
}
