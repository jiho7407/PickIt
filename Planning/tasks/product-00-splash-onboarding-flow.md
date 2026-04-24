---
id: product-00-splash-onboarding-flow
status: todo
sub: FE
layer: product
depends_on: [infra-04-auth-providers]
estimate: 2h
demo_step: "스플래시/온보딩"
---

# 스플래시/온보딩 플로우

## Context

앱 첫 진입 화면이다. 원칙은 "홈의 투표를 둘러볼 수 있도록 처음부터 온보딩을 강제하지 않는다"이다. 온보딩은 사용자가 의미 있는 액션을 할 때 트리거한다.

트리거 후보:

- 홈 투표 카드에서 버튼 클릭
- 홈 투표 카드에서 상세 화면 진입
- 프로필 화면 진입
- 투표 만들기 버튼 진입

## Files

- `apps/web/app/page.tsx` (create/update)
- `apps/web/src/features/onboarding/onboarding-screen.tsx` (create)
- `apps/web/src/features/onboarding/onboarding-trigger.ts` (create)
- `apps/web/src/features/auth/social-login-buttons.tsx` (create)
- `apps/web/src/features/onboarding/onboarding-screen.test.tsx` (create)

## Spec

- 스플래시는 앱 로고/브랜드를 짧게 보여준다.
- 온보딩은 강제 첫 화면이 아니라 액션 시점 모달/페이지로 진입한다.
- 카카오/구글 로그인 CTA를 제공한다.
- 생활 단계 태그 선택은 1개 선택을 기본으로 한다.

## TDD

1. Red: 첫 홈 진입 시 온보딩이 자동으로 막지 않는 테스트.
2. Green: 홈 렌더링과 온보딩 트리거 조건 구현.
3. Red: 로그인 CTA 클릭이 auth provider 함수로 이어지는 테스트.
4. Green: 소셜 로그인 버튼 연결.

## Acceptance Criteria

- [ ] 첫 방문자는 홈 투표 피드를 볼 수 있다.
- [ ] 의미 있는 액션 시 온보딩/로그인 유도가 열린다.
- [ ] 카카오/구글 로그인 CTA가 있다.
- [ ] 생활 단계 태그 선택 UI가 있다.
- [ ] Figma 구현 시점에 개별 화면 프레임을 다시 확인한다.

## Test Cases

1. happy: 홈 진입 시 온보딩이 자동으로 전체 화면을 막지 않는다.
2. happy: 투표 버튼 클릭 시 온보딩/로그인 유도가 열린다.
3. edge: 생활 단계 태그는 하나만 선택된다.
4. edge: 선택 전 완료 버튼은 비활성이다.

## References

- `Planning/ONE_PAGER.md §11`
