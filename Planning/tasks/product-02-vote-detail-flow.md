---
id: product-02-vote-detail-flow
status: todo
sub: FE
layer: product
depends_on: [product-01-home-vote-feed, infra-05-anonymous-session, data-04-vote-summary-views]
estimate: 2h
demo_step: "투표 상세"
---

# 투표 상세 플로우

## Context

투표 상세는 사용자가 결정을 돕는 핵심 화면이다. MVP는 `살지/말지` 투표를 우선 구현하고, A/B 투표는 같은 화면 구조로 확장한다.

## Files

- `apps/web/app/votes/[id]/page.tsx` (create)
- `apps/web/src/features/votes/vote-detail.tsx` (create)
- `apps/web/src/features/votes/buy-skip-vote-panel.tsx` (create)
- `apps/web/src/features/votes/ab-vote-panel.tsx` (create)
- `apps/web/src/features/votes/vote-result.tsx` (create)

## Spec

- 살지/말지 투표: `buy`, `skip`
- A/B 투표: `vote_options.position` 1/2를 렌더링하고 선택 시 해당 `option_id`로 투표한다.
- 투표 후 결과 비율과 댓글/한마디를 보여준다.
- 중복 투표는 막는다.

## TDD

1. Red: 살지/말지 상세가 상품 정보와 두 선택지를 렌더링한다.
2. Green: `BuySkipVotePanel` 구현.
3. Red: A/B 투표 상세가 두 옵션을 렌더링한다.
4. Green: `AbVotePanel` 구현 스켈레톤.

## Acceptance Criteria

- [ ] 살지/말지 상세 화면이 있다.
- [ ] A/B 상세 화면 구조가 있다.
- [ ] 투표 후 결과 비율을 보여준다.
- [ ] 중복 투표 에러를 보여준다.
- [ ] Figma 구현 시점에 상세 화면 프레임들을 다시 확인한다.

## Test Cases

1. happy: `buy` 투표 후 결과가 갱신된다.
2. happy: A/B 옵션 중 하나를 선택할 수 있다.
3. duplicate: 같은 세션의 두 번째 투표는 실패한다.
4. edge: 삭제된 투표는 에러 화면으로 보낸다.

## References

- `Planning/PRD.md FR-V-1~5`
