---
id: product-00-splash-onboarding-flow
status: in_progress
sub: FE
layer: product
depends_on: [ops-05-figma-access, infra-04-auth-providers, data-01-dilemma-schema]
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

### Current Implementation Scope Override

2026-04-30 user direction supersedes the original broader onboarding trigger
plan for this branch:

- Implement only the five screens explicitly provided from Figma:
  1. Splash
  2. Onboarding slide 1
  3. Onboarding slide 2
  4. Life-stage/tag selection with no selection
  5. Life-stage/tag selection with one selected tag
- Do not add a home/feed preview, placeholder content, marketing copy, empty
  state, or any extra route/screen that was not provided.
- Treat the phone status bar in Figma as device chrome and omit it from the web
  implementation.
- Keep Google/Kakao login as a product-00 mock transition into the tag
  selection screen. Real OAuth, signup, account creation, and callback behavior
  belong to auth tasks, not this visual flow.
- Render Kakao and Google CTAs to match the provided layout even if the provider
  is not yet operational.
- For the onboarding phone artwork, use exact exported frame PNG assets from
  Figma. Do not rebuild the phone frame, side buttons, internal screenshots, or
  bottom fade with CSS/SVG because small positioning differences are visible.
- The current exported artwork source nodes are:
  - Onboarding image 1: <https://www.figma.com/design/wmYEX4Dwx7ohz93MklwAiQ/Ampersand_-Batch1?node-id=215-6912>
  - Onboarding image 2: <https://www.figma.com/design/wmYEX4Dwx7ohz93MklwAiQ/Ampersand_-Batch1?node-id=215-6910>

## Files

- `apps/web/app/page.tsx` (create/update)
- `apps/web/src/features/onboarding/onboarding-screen.tsx` (create)
- `apps/web/src/features/onboarding/onboarding-trigger.ts` (create)
- `apps/web/src/features/auth/social-login-buttons.tsx` (create)
- `apps/web/src/features/profile/profile-actions.ts` (create — minimal `life_stage` update)
- `apps/web/src/features/onboarding/onboarding-screen.test.tsx` (create)

## Spec

- 스플래시는 앱 로고/브랜드를 짧게 보여준다.
- 온보딩은 강제 첫 화면이 아니라 액션 시점 모달/페이지로 진입한다.
- 구글 로그인 CTA를 기본 노출한다. 카카오 로그인 CTA는 `NEXT_PUBLIC_AUTH_KAKAO_ENABLED=true`일 때만 렌더링한다(`ops-02` activation trigger 도달 전에는 숨김).
- 생활 단계 태그 선택은 1개 선택을 기본으로 한다.

### 생활 단계 저장 경로

- 로그인 전 선택한 값은 클라이언트(sessionStorage 또는 in-memory)에 임시 저장한다.
- OAuth 콜백 이후 첫 접근 시 `profiles.life_stage`를 업데이트한다.
- 공용 `profile-actions.ts`에 최소 `life_stage` update action을 먼저 만든다.
- `product-05a-profile`은 이 action을 재사용/확장해 닉네임 편집과 전체 프로필 편집을 처리한다.
- 실패 시 프로필 편집에서 다시 설정할 수 있음을 안내한다.

## TDD

1. Red: 첫 홈 진입 시 온보딩이 자동으로 막지 않는 테스트.
2. Green: 홈 렌더링과 온보딩 트리거 조건 구현.
3. Red: 로그인 CTA 클릭이 auth provider 함수로 이어지는 테스트.
4. Green: 소셜 로그인 버튼 연결.
5. Red: OAuth 이후 pending `life_stage` 값이 profile update action으로 저장되는 테스트.
6. Green: 공용 profile action과 pending value consume 흐름 구현.

## Acceptance Criteria

- [x] 첫 방문자는 스플래시 후 제공된 온보딩 화면으로 자연스럽게 진입한다.
- [x] 제공되지 않은 홈/피드/프리뷰 화면이 렌더링되지 않는다.
- [x] 구글/카카오 로그인 CTA가 제공된 레이아웃대로 노출된다.
- [x] 생활 단계 태그 선택 UI가 있다.
- [x] 로그인 CTA는 product-00 범위에서 태그 선택 화면으로 mock 전환된다.
- [x] 로그인 전 선택한 생활 단계 값이 로그인 후 `profiles.life_stage`로 전달될 수 있는 공용 action/pending consume 경로가 존재한다.
- [x] `product-05a-profile`에 대한 역방향 의존 없이 공용 profile action이 존재한다.
- [x] Figma 구현 시점에 개별 화면 프레임을 다시 확인한다.
- [x] 온보딩 phone artwork는 Figma 묶음 프레임을 PNG asset으로 사용한다.

## Test Cases

1. happy: 첫 진입 시 스플래시가 보이고 제공되지 않은 홈 피드가 보이지 않는다.
2. happy: 스플래시 후 온보딩 로그인 CTA가 보인다.
3. edge: 생활 단계 태그는 하나만 선택된다.
4. edge: 선택 전 완료 버튼은 비활성이다.
5. happy: product-00 mock 로그인 클릭 시 태그 선택 화면으로 이동한다.
6. happy: 로그인 후 pending 생활 단계 값이 `profiles.life_stage`에 저장될 수 있다.

## References

- `../ONE_PAGER.md §11`
- Splash frame: <https://www.figma.com/design/wmYEX4Dwx7ohz93MklwAiQ/Ampersand_-Batch1?node-id=274-7668>
- Onboarding frame: <https://www.figma.com/design/wmYEX4Dwx7ohz93MklwAiQ/Ampersand_-Batch1?node-id=274-7669>
