---
id: product-06-notifications-and-errors
status: todo
sub: FE
layer: product
depends_on: [product-05-profile-and-consumption-records]
estimate: 1.5h
demo_step: "알람/에러"
---

# 알람과 에러 화면

## Context

MVP에서 실제 카카오톡 알림 발송은 제외하지만, 앱 내 알람 화면과 주요 에러 상태는 필요하다.

## Files

- `apps/web/app/notifications/page.tsx` (create)
- `apps/web/app/not-found.tsx` (create)
- `apps/web/app/error.tsx` (create)
- `apps/web/src/features/notifications/notification-list.tsx` (create)

## Spec

- 투표 결과 알림 후보
- 7일 후 회고 알림 후보
- 비슷한 상황의 고민 알림 후보는 후속
- not found/error 화면

## TDD

1. Red: 알림 목록 empty state 테스트.
2. Green: notification list 구현.
3. Red: 삭제된 투표 접근 시 not found 테스트.
4. Green: error/not-found 화면 구현.

## Acceptance Criteria

- [ ] 알림 목록 화면이 있다.
- [ ] 알림 empty state가 있다.
- [ ] not found 화면이 있다.
- [ ] error boundary 화면이 있다.
- [ ] 실제 외부 알림 발송은 포함하지 않는다.

## Test Cases

1. happy: 회고 알림 후보가 목록에 표시된다.
2. edge: 알림이 없으면 empty state.
3. edge: 존재하지 않는 투표 상세는 not found.
4. edge: 서버 에러는 error 화면.

## References

- `Planning/crm.md` 알림 아이디어
