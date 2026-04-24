---
id: data-02-vote-comment-schema
status: todo
sub: BE
layer: data
depends_on: [data-01-dilemma-schema]
estimate: 2h
demo_step: "투표"
---

# 투표 옵션/투표/한마디 스키마

## Context

PickIt의 핵심 피드백 루프는 한 고민에 대해 여러 사용자가 `buy`/`skip` 투표와 짧은 한마디를 남기는 것이다. 중복 투표 방지는 DB 제약과 테스트로 보장한다.

연결 문서:

- `PRD.md FR-V-1~5`
- `ERD.md votes, comments`

## Files

- `supabase/migrations/{timestamp}_create_vote_options_votes_and_comments.sql` (create)
- `apps/web/src/features/votes/schema.ts` (create)
- `apps/web/src/features/votes/summary.ts` (create)
- `apps/web/src/features/votes/summary.test.ts` (create)

## Spec

### 타입

```ts
export type VoteChoice = "buy" | "skip";
export type VoteType = "buy_skip" | "ab";

export type VoteSummary = {
  buyCount: number;
  skipCount: number;
  totalCount: number;
  buyRatio: number;
  skipRatio: number;
};
```

### 함수

```ts
export function calculateVoteSummary(votes: VoteChoice[]): VoteSummary;
```

### DB constraints

- `choice in ('buy', 'skip')`
- `buy_skip` 투표는 `choice` 사용
- `ab` 투표는 `option_id` 사용
- `(voter_id is not null) != (anonymous_session_id is not null)`
- unique `(dilemma_id, voter_id)` where voter_id is not null
- unique `(dilemma_id, anonymous_session_id)` where anonymous_session_id is not null

## TDD

1. Red: `calculateVoteSummary(["buy", "skip"])`가 50/50을 반환해야 한다.
2. Green: 순수 함수 구현.
3. Red: 같은 사용자가 같은 고민에 두 번 투표하는 integration test 작성.
4. Green: unique index 구현.
5. Refactor: vote insert error를 UI에서 다루기 좋은 코드로 매핑.

## Acceptance Criteria

- [ ] vote_options/votes/comments/anonymous_sessions migration이 있다.
- [ ] 중복 투표 unique constraint가 있다.
- [ ] 투표 요약 view 또는 함수가 있다.
- [ ] 투표 집계 unit test가 통과한다.
- [ ] 댓글 body는 1~200자로 제한된다.

## Test Cases

1. happy: `buy=3`, `skip=1`이면 75/25를 반환한다.
2. edge: 투표가 없으면 0/0/0을 반환한다.
3. edge: 홀수 투표 비율 반올림이 안정적으로 동작한다.
4. permission: 같은 authenticated user는 중복 투표할 수 없다.
5. permission: 같은 anonymous session은 중복 투표할 수 없다.

## References

- `Planning/ERD.md §3 votes`
- PostgreSQL partial indexes: https://www.postgresql.org/docs/current/indexes-partial.html
