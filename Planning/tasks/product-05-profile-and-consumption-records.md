---
id: product-05-profile-and-consumption-records
status: todo
sub: FE
layer: product
depends_on: [data-03-followup-schema, product-03-my-votes-and-comments]
estimate: 2h
demo_step: "프로필/소비기록"
---

# 프로필과 소비기록

## Context

프로필은 사용자의 개인 기록 허브다. 기본 프로필, 내 목록, 소비기록, 소비리포트 이동, 소비여부 회고 진입을 포함한다.

## Files

- `apps/web/app/profile/page.tsx` (create)
- `apps/web/app/profile/records/page.tsx` (create)
- `apps/web/src/features/profile/profile-summary.tsx` (create)
- `apps/web/src/features/records/consumption-records.tsx` (create)
- `apps/web/src/features/followups/followup-prompt.tsx` (create)

## Spec

- 기본 프로필 정보
- 프로필 내 목록
- 소비기록
- 소비리포트 이동 CTA
- 소비여부 물어보기: 프로필 안에서
- 소비여부 물어보기: 소비리포트 안에서

## TDD

1. Red: 프로필 요약이 사용자 정보를 렌더링한다.
2. Green: profile summary 구현.
3. Red: 회고 대상이 있으면 prompt가 표시된다.
4. Green: followup prompt 구현.

## Acceptance Criteria

- [ ] 기본 프로필 화면이 있다.
- [ ] 내 투표/댓글/소비기록으로 이동할 수 있다.
- [ ] 회고 대상이 있으면 소비여부 prompt가 표시된다.
- [ ] 소비기록에서 절약 금액을 볼 수 있다.
- [ ] 소비리포트 이동 CTA가 있다.

## Test Cases

1. happy: 프로필 정보가 표시된다.
2. happy: 회고 대상이 있으면 prompt가 표시된다.
3. edge: 소비기록이 없으면 empty state가 표시된다.
4. permission: 로그인하지 않으면 로그인 유도로 이동한다.

## References

- `Planning/PRD.md FR-F-1~5`
