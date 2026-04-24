# Iteration 1 Review

## Scope

검수 프롬프트 기준으로 `Planning/` 전체 문서를 다시 읽고 태스크 그래프, 명세 완성도, 누락 태스크를 점검했다.

검토 대상:

- `README.md`
- `ONE_PAGER.md`
- `PRD.md`
- `ERD.md`
- `STATE.md`
- `tasks/`
- `reviews/iteration-0.md`

## Findings Fixed

1. **인증/프로필 의존성 오류**
   - `infra-04-auth-providers`가 첫 로그인 profile bootstrapping을 다루지만 `profiles` 테이블 생성 태스크에 의존하지 않았다.
   - `depends_on`에 `data-01-dilemma-schema`를 추가했다.

2. **운영자 role 정의 누락**
   - PRD는 운영자 조회를 별도 role로 제한한다고 했지만 ERD에 role 컬럼/정책이 없었다.
   - `profiles.role = 'user' | 'operator'`를 추가하고 운영자 RPC/RLS 테스트 기준을 보강했다.

3. **빠른 투표/익명 세션 의존성 누락**
   - 홈 피드가 빠른 투표를 제공하지만 익명 세션 정책에 의존하지 않았다.
   - `product-01-home-vote-feed`가 `infra-05-anonymous-session`과 온보딩 플로우에 의존하도록 보정했다.

4. **E2E 그래프 누락**
   - MVP E2E 시나리오가 투표 생성으로 시작하지만 `product-04-create-vote-flow`에 직접 의존하지 않았다.
   - `test-01-mvp-e2e` depends_on에 추가했다.

5. **배포/env 검증 태스크 누락**
   - 기술 스택에 Vercel/Supabase 배포가 있으나 preview readiness 태스크가 없었다.
   - `infra-06-deployment-preview`를 생성했다.

## Remaining Risks

- Figma 화면은 planning에 고정하지 않는 정책이므로 product 태스크 착수 직전에 화면 프레임을 다시 받아야 한다.
- Kakao OAuth 실제 키와 외부 알림 발송은 MVP OUT으로 유지한다.

## Verdict

**READY FOR FOUNDATION IMPLEMENTATION.**

`infra-01-project-bootstrap`부터 TDD로 시작할 수 있다. Data/RLS와 product 태스크는 현재 depends_on 기준으로 순차 실행하면 된다.
