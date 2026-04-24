---
id: product-05b-consumption-records
status: todo
sub: FE
layer: product
depends_on: [data-03-followup-schema, data-04-vote-summary-views, product-05a-profile]
estimate: 2h
demo_step: "소비기록/회고"
---

# 소비기록, 회고 Prompt, 리포트 이동

## Context

프로필 하위의 "소비기록" 영역이다. 7일 후 회고 prompt, 절약 금액 누적, 소비리포트 진입 CTA를 포함한다. `ONE_PAGER.md §6` 데모 장면의 마지막 두 단계와 직접 연결된다.

연결 문서:

- `ONE_PAGER.md §6 데모 장면(6~7)`
- `PRD.md FR-F-1~5`
- `ERD.md followups`

## Files

- `apps/web/app/profile/records/page.tsx` (create)
- `apps/web/src/features/records/consumption-records.tsx` (create)
- `apps/web/src/features/records/consumption-records.test.tsx` (create)
- `apps/web/src/features/followups/followup-prompt.tsx` (create)
- `apps/web/src/features/followups/followup-form.tsx` (create)
- `apps/web/src/features/followups/followup-actions.ts` (create)

## Spec

### 소비기록 목록

- 내 followup이 있는 dilemma를 최신순으로 나열.
- 각 항목: 제목, outcome(bought/skipped), saved_amount, responded_at.
- 누적 절약 금액 헤더.

### 회고 Prompt

- `data-04` RPC `get_followup_candidates(now)` 또는 동등 쿼리 기반.
- 프로필 페이지와 소비기록 페이지 상단에 동일한 컴포넌트로 노출(두 위치 모두).
- 각 prompt에서 "샀다 / 참았다" 선택 폼으로 진입.

### 회고 Form

- outcome: bought | skipped
- bought → satisfaction_score 1~5, 후회 여부
- skipped → note(선택)
- 제출 후 `calculateSavedAmount` 결과 노출(절약 금액 애니메이션은 후속).

### 소비리포트 이동

- MVP: 향후 리포트 예정 CTA + disabled 상태 표시 (완전 구현은 OUT).

## TDD

1. Red: 회고 대상이 있으면 prompt가 표시되는 테스트.
2. Green: candidate query + prompt 구현.
3. Red: `skipped` 제출 시 `saved_amount = price` 확인.
4. Green: followup action 구현.
5. Red: 누적 절약 금액 헤더가 합계와 일치.
6. Green: aggregate 쿼리 구현.

## Acceptance Criteria

- [ ] 회고 대상이 있으면 prompt가 표시된다.
- [ ] 프로필/소비기록 두 위치 모두에서 prompt 진입이 가능하다.
- [ ] `skipped`는 `price`만큼 누적에 반영된다.
- [ ] `bought`는 누적에 반영되지 않는다.
- [ ] 소비기록이 없으면 empty state가 표시된다.
- [ ] 소비리포트 CTA가 존재(disabled)한다.

## Test Cases

1. happy: 회고 대상 2건이 prompt에 표시된다.
2. happy: skipped 제출 후 누적 절약 금액이 증가한다.
3. happy: bought 제출 후 누적 절약 금액이 변하지 않는다.
4. edge: 회고 대상 0건이면 prompt empty state.
5. edge: 소비기록 0건이면 list empty state.
6. permission: 다른 사용자 dilemma의 followup URL 접근 차단.

## References

- `Planning/ONE_PAGER.md §6`
- `Planning/PRD.md §4.3`
