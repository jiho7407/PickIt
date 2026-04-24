---
id: product-01-home-vote-feed
status: todo
sub: FE
layer: product
depends_on: [data-01-dilemma-schema, data-04-vote-summary-views]
estimate: 2h
demo_step: "홈 = 투표"
---

# 홈 투표 피드

## Context

홈은 서비스의 첫 경험이자 투표 탐색 화면이다. 사용자는 로그인 전에도 투표 카드를 둘러볼 수 있어야 한다.

## Files

- `apps/web/app/page.tsx` (update)
- `apps/web/src/features/votes/vote-feed.tsx` (create)
- `apps/web/src/features/votes/vote-card.tsx` (create)
- `apps/web/src/features/votes/vote-feed.test.tsx` (create)

## Spec

- 최신 공개 투표를 카드 리스트로 보여준다.
- 카드에는 제목, 상품명, 가격, 카테고리, 대표 이미지, 현재 투표 수를 표시한다.
- 카드에서 빠른 투표 또는 상세 진입이 가능하다.
- 액션 시 온보딩/로그인 트리거 정책을 따른다.

## TDD

1. Red: 공개 투표 카드가 목록에 렌더링되는 테스트.
2. Green: `VoteFeed`, `VoteCard` 구현.
3. Red: 빈 목록 상태 테스트.
4. Green: empty state 구현.

## Acceptance Criteria

- [ ] 공개 투표 목록이 최신순으로 표시된다.
- [ ] 비로그인 사용자도 목록을 볼 수 있다.
- [ ] 빠른 투표/상세 진입 액션이 있다.
- [ ] 빈 목록 상태가 있다.
- [ ] Figma 구현 시점에 홈 화면 프레임을 다시 확인한다.

## Test Cases

1. happy: 공개 투표 3개가 카드로 렌더링된다.
2. edge: 투표가 없으면 empty state가 렌더링된다.
3. edge: 가격은 KRW 형식으로 표시된다.
4. interaction: 카드 클릭 시 상세 페이지로 이동한다.

## References

- `Planning/PRD.md FR-D-6`
