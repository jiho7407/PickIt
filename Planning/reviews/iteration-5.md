# Iteration 5 Review

## Scope

Iteration 2에서 정한 "핵심 의존성은 transitive가 아닌 직접 의존으로 표기" 규칙이 최근 분리된 product/test 태스크에도 일관되게 적용됐는지 점검했다.

검토 대상:

- `tasks/product-00-splash-onboarding-flow.md`
- `tasks/product-02-vote-detail-flow.md`
- `tasks/product-03-my-votes-and-comments.md`
- `tasks/test-01-mvp-e2e.md`
- `STATE.md`

## Findings Fixed

1. **온보딩 profile update 직접 의존성**
   - `product-00`은 로그인 후 `profiles.life_stage`를 업데이트하지만 `data-01`을 직접 의존으로 표시하지 않았다.
   - `depends_on`에 `data-01-dilemma-schema`를 추가했다.

2. **Kakao CTA 노출 조건**
   - Kakao OAuth는 deferred인데 product 화면에서는 카카오/구글 CTA를 같이 제공한다고 읽힐 수 있었다.
   - Google CTA는 기본 노출, Kakao CTA는 `NEXT_PUBLIC_AUTH_KAKAO_ENABLED=true`일 때만 렌더링하도록 명시했다.

3. **투표 상세 schema 직접 의존성**
   - `product-02`는 vote/comment insert와 vote-linked comment 표시를 직접 구현하지만 `data-02` 직접 의존이 없었다.
   - `depends_on`에 `data-02-vote-comment-schema`를 추가했다.

4. **나의 투표/한마디 schema 직접 의존성**
   - `product-03`은 votes/comments 목록과 삭제를 다루지만 `product-02`를 통한 간접 의존만 있었다.
   - `depends_on`에 `data-02-vote-comment-schema`를 추가했다.

5. **E2E 시나리오 직접 의존성**
   - `test-01` 시나리오는 투표 상세와 회고/소비기록 UI를 직접 통과하지만, 해당 product 태스크가 직접 depends_on에 없었다.
   - `product-02-vote-detail-flow`, `product-05b-consumption-records`를 직접 의존성에 추가했다.

## Verification

- 추가 의존성은 모두 기존 Phase 순서에서 앞선 태스크를 가리킨다.
- cycle/deprecated dependency는 없다.
- `ops-02-kakao-oauth-credentials`는 deferred 상태를 유지한다.

## Verdict

**READY FOR FOUNDATION IMPLEMENTATION.**

이번 변경은 실행 순서를 바꾸기보다 구현자가 반드시 필요한 선행 조건을 더 잘 보이게 하는 정합성 보강이다.
