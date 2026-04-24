---
id: data-03-followup-schema
status: todo
sub: BE
layer: data
depends_on: [data-01-dilemma-schema]
estimate: 1.5h
demo_step: "7일 후 회고"
---

# 회고/절약 스키마

## Context

PickIt이 단순 투표 서비스에 머물지 않으려면 실제 구매 여부를 7일 후 기록하고, 절약 금액을 사용자에게 돌려줘야 한다.

연결 문서:

- `PRD.md FR-F-1~5`
- `ERD.md followups`

## Files

- `supabase/migrations/{timestamp}_create_followups.sql` (create)
- `apps/web/src/features/followups/schema.ts` (create)
- `apps/web/src/features/followups/savings.ts` (create)
- `apps/web/src/features/followups/savings.test.ts` (create)

## Spec

### 타입/함수

```ts
export type FollowupOutcome = "bought" | "skipped";

export function calculateSavedAmount(params: {
  outcome: FollowupOutcome;
  price: number;
}): number;

export function calculateFollowupDueAt(createdAt: Date): Date;
```

### DB constraints

- `outcome in ('bought', 'skipped')`
- `saved_amount >= 0`
- `satisfaction_score between 1 and 5`
- `dilemma_id unique`

## TDD

1. Red: `skipped` outcome은 price를 saved amount로 반환해야 한다.
2. Green: `calculateSavedAmount` 구현.
3. Red: 작성자가 아닌 사용자가 followup insert 실패하는 RLS test.
4. Green: RLS policy 구현.
5. Refactor: followup 후보 조회 RPC 이름 정리.

## Acceptance Criteria

- [ ] followups migration이 있다.
- [ ] 작성자만 followup을 작성할 수 있다.
- [ ] 한 고민에는 followup이 하나만 존재한다.
- [ ] `skipped`는 price만큼 절약 금액을 저장한다.
- [ ] 회고 후보 조회 쿼리 또는 RPC가 있다.

## Test Cases

1. happy: `skipped`, `price=148720`이면 `savedAmount=148720`.
2. happy: `bought`, `price=148720`이면 `savedAmount=0`.
3. edge: created_at 기준 정확히 7일 뒤 due date 계산.
4. permission: 작성자가 아닌 사용자는 회고를 작성할 수 없다.

## References

- `Planning/ERD.md §6`
