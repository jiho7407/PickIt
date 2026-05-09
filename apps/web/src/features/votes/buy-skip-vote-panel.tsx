import { VoteResultBar, VoteResultSummary } from "./vote-result";

type BuySkipSelection = {
  kind: "choice";
  value: "buy" | "skip";
};

type BuySkipVotePanelProps = {
  buyRatio: number;
  disabled?: boolean;
  onSelect: (selection: BuySkipSelection) => void;
  selected: BuySkipSelection;
  skipRatio: number;
  totalCount: number;
  voted?: boolean;
};

export function BuySkipVotePanel({
  buyRatio,
  disabled = false,
  onSelect,
  selected,
  skipRatio,
  totalCount,
  voted = false,
}: BuySkipVotePanelProps) {
  const buyWins = buyRatio >= skipRatio;
  const buyTone = voted ? (selected.value === "buy" ? "mint" : "gray") : buyWins ? "mint" : "gray";
  const skipTone =
    voted ? (selected.value === "skip" ? "orange" : "gray") : buyWins ? "gray" : "orange";

  return (
    <div className="flex flex-col gap-2">
      <VoteResultSummary
        headline={buyWins ? "가 사는 걸 추천했어요" : "가 참는 걸 추천했어요"}
        headlinePercent={buyWins ? buyRatio : skipRatio}
        icon={buyWins ? "buy" : "skip"}
        tone={buyWins ? "mint" : "orange"}
        totalCount={totalCount}
      />
      <div className="flex flex-col gap-2">
        <VoteResultBar
          label="사도 괜찮아"
          percent={buyRatio}
          selected={selected.value === "buy"}
          tone={buyTone}
          voted={voted}
          disabled={disabled}
          icon="buy"
          onSelect={() => onSelect({ kind: "choice", value: "buy" })}
        />
        <VoteResultBar
          label="참는 게 나아"
          percent={skipRatio}
          selected={selected.value === "skip"}
          tone={skipTone}
          voted={voted}
          disabled={disabled}
          icon="skip"
          onSelect={() => onSelect({ kind: "choice", value: "skip" })}
        />
      </div>
    </div>
  );
}
