import type { VoteDetailOption } from "./vote-detail.server";
import { VoteResultBar, VoteResultSummary } from "./vote-result";

type AbSelection = {
  kind: "option";
  optionId: string;
};

type AbVotePanelProps = {
  onSelect: (selection: AbSelection) => void;
  optionARatio: number;
  optionBRatio: number;
  options: VoteDetailOption[];
  selected: AbSelection;
  totalCount: number;
  voted?: boolean;
};

export function AbVotePanel({
  onSelect,
  optionARatio,
  optionBRatio,
  options,
  selected,
  totalCount,
  voted = false,
}: AbVotePanelProps) {
  const [optionA, optionB] = options;
  const aWins = optionARatio >= optionBRatio;

  if (!optionA || !optionB) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <VoteResultSummary
        headline={aWins ? "가 A를 추천했어요" : "가 B를 추천했어요"}
        headlinePercent={aWins ? optionARatio : optionBRatio}
        tone={aWins ? "mint" : "orange"}
        totalCount={totalCount}
      />
      <div className="flex flex-col gap-2">
        <VoteResultBar
          label="A가 나아"
          percent={optionARatio}
          selected={selected.optionId === optionA.id}
          tone={aWins ? "mint" : "gray"}
          voted={voted}
          onSelect={() => onSelect({ kind: "option", optionId: optionA.id })}
        />
        <VoteResultBar
          label="B가 나아"
          percent={optionBRatio}
          selected={selected.optionId === optionB.id}
          tone={aWins ? "gray" : "orange"}
          voted={voted}
          onSelect={() => onSelect({ kind: "option", optionId: optionB.id })}
        />
      </div>
    </div>
  );
}
