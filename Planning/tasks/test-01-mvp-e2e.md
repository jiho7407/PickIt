---
id: test-01-mvp-e2e
status: todo
sub: QA
layer: test
depends_on: [product-04-create-vote-flow, product-06-notifications-and-errors, data-05-rls-tests]
estimate: 2h
demo_step: "End-to-End"
---

# MVP End-to-End 테스트

## Context

`ONE_PAGER.md §10` 완료 기준을 Playwright로 검증한다. 이 테스트는 데모 흐름의 최종 안전망이다.

## Files

- `apps/web/tests/e2e/mvp.spec.ts` (create)
- `apps/web/tests/e2e/fixtures.ts` (create)
- `apps/web/playwright.config.ts` (update)

## Spec

### Scenario

```text
작성자 로그인
→ 투표 만들기
→ 투표자 세션으로 고민 상세 접근
→ skip 투표 + 한마디
→ 작성자 결과 확인
→ followup_due 상태로 테스트 데이터 조정
→ 프로필/소비기록에서 작성자 회고 skipped 제출
→ 절약 금액 확인
```

## TDD

1. Red: E2E scenario를 먼저 작성하고 실패 확인.
2. Green: 필요한 test id와 fixture 보강.
3. Refactor: seed/reset 헬퍼를 분리.

## Acceptance Criteria

- [ ] E2E가 고민 작성부터 회고까지 통과한다.
- [ ] 테스트 데이터는 반복 실행 가능하다.
- [ ] 실패 시 어느 단계에서 깨졌는지 로그가 명확하다.
- [ ] CI에서 실행 가능하거나 로컬 전용임이 명시돼 있다.

## Test Cases

1. happy: 작성→투표→결과→회고 full path.
2. duplicate: 같은 투표자 두 번째 투표 실패.
3. permission: 다른 사용자가 회고 URL에 접근하면 차단.

## References

- `Planning/ONE_PAGER.md §10`
- Playwright docs: https://playwright.dev/
