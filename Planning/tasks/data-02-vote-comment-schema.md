---
id: data-02-vote-comment-schema
status: done
sub: BE
layer: data
depends_on: [data-01-dilemma-schema]
estimate: 2h
demo_step: "투표"
---

# 투표 옵션/투표/한마디 스키마

## Context

PickIt의 핵심 피드백 루프는 한 고민에 대해 여러 사용자가 `buy`/`skip` 투표와 짧은 한마디를 남기는 것이다. 중복 투표 방지는 DB 제약과 테스트로 보장한다.

익명 투표 쿠키/미들웨어는 `infra-05-anonymous-session`에서 구현한다. 이 태스크는 votes가 참조할 `anonymous_sessions` 기본 테이블과 제약만 만든다.

연결 문서:

- `PRD.md FR-V-1~5`
- `ERD.md votes, vote_options, comments, anonymous_sessions`

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
- `ab` dilemma는 `vote_options.position = 1, 2` 두 row를 가진다.
- `(voter_id is not null) != (anonymous_session_id is not null)`
- unique `(dilemma_id, voter_id)` where voter_id is not null
- unique `(dilemma_id, anonymous_session_id)` where anonymous_session_id is not null
- 작성자는 자기 dilemma에 vote를 insert할 수 없다.
- `comments.vote_id`는 not null + unique이며, 같은 `dilemma_id`의 vote에 연결된다.
- 익명 comment는 vote-linked flow에서만 생성되며, MVP에서는 수정/삭제하지 않는다.

## TDD

1. Red: `calculateVoteSummary(["buy", "skip"])`가 50/50을 반환해야 한다.
2. Green: 순수 함수 구현.
3. Red: 같은 사용자가 같은 고민에 두 번 투표하는 integration test 작성.
4. Green: unique index 구현.
5. Refactor: vote insert error를 UI에서 다루기 좋은 코드로 매핑.

## Acceptance Criteria

- [ ] vote_options/votes/comments/anonymous_sessions migration이 있다.
- [ ] anonymous_sessions는 쿠키 원문이 아니라 해시된 식별자만 저장하도록 설계돼 있다.
- [ ] 중복 투표 unique constraint가 있다.
- [ ] 작성자 자기 투표 방지 constraint/policy/test가 있다.
- [ ] A/B 투표는 position 1/2 옵션 제약을 가진다.
- [ ] vote-linked comment 제약(`vote_id` not null, unique, same dilemma)이 있다.
- [ ] `calculateVoteSummary` 순수 함수가 있다. DB view/RPC는 `data-04`에서 만든다.
- [ ] 투표 집계 unit test가 통과한다.
- [ ] 댓글 body는 1~200자로 제한된다.

## Test Cases

1. happy: `buy=3`, `skip=1`이면 75/25를 반환한다.
2. edge: 투표가 없으면 0/0/0을 반환한다.
3. edge: 홀수 투표 비율 반올림이 안정적으로 동작한다.
4. permission: 같은 authenticated user는 중복 투표할 수 없다.
5. permission: 같은 anonymous session은 중복 투표할 수 없다.
6. permission: 작성자는 자기 고민에 투표할 수 없다.
7. edge: vote 없이 comment만 단독 생성하려 하면 거부된다.

## References

- `../ERD.md §3 votes, vote_options, comments`
- PostgreSQL partial indexes: https://www.postgresql.org/docs/current/indexes-partial.html
