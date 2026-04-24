# Iteration 4 Review

## Scope

검수 프롬프트 기준으로 `planning/` 전체 문서를 다시 읽고, 명세 완성도, 의존성/순서, 태스크 범위, 누락 태스크를 점검했다.

검토 대상:

- `README.md`
- `ONE_PAGER.md`
- `PRD.md`
- `ERD.md`
- `STATE.md`
- `tasks/`
- `reviews/iteration-0.md`
- `reviews/iteration-1.md`

## Findings Fixed

1. **온보딩 ↔ 프로필 숨은 역방향 의존성**
   - `product-00`이 로그인 후 생활 단계 저장을 위해 `product-05a`의 edit profile action을 재사용한다고 적혀 있었다.
   - 실제 실행 순서는 `product-00`이 먼저이므로, 공용 `profile-actions.ts`를 `product-00`에서 최소 구현하고 `product-05a`가 재사용/확장하도록 수정했다.

2. **Figma pretask 의존성 누락**
   - `STATE.md`는 `ops-05`가 첫 product 태스크 전 필수라고 했지만 `depends_on`에는 반영되지 않았다.
   - 첫 product 태스크인 `product-00`의 `depends_on`에 `ops-05-figma-access`를 추가했다.

3. **투표 한마디 모델 불명확**
   - PRD는 한마디를 투표와 함께 남기는 것으로 설명하지만, ERD와 product 태스크 일부는 독립 댓글처럼 읽혔다.
   - `comments.vote_id`를 not null + unique로 고정하고, 익명 한마디는 vote-linked flow에서만 생성되도록 ERD/data/product/RLS 태스크를 정리했다.

4. **vote summary 책임 중복**
   - `data-02`가 DB view 또는 함수 생성을 요구하고, `data-04`도 vote summary view를 담당해 책임이 겹쳤다.
   - `data-02`는 순수 계산 함수와 schema/constraint, `data-04`는 DB view/RPC로 분리했다.

5. **회고/알림 후보 RPC 권한 범위 혼선**
   - 프로필의 회고 prompt와 앱 내 알림은 사용자 본인 범위여야 하지만, 운영자 후보 RPC와 같은 이름/권한으로 읽힐 수 있었다.
   - author-facing RPC(`get_followup_candidates`, `get_my_notification_candidates`)와 operator-only RPC(`get_operator_notification_candidates`)를 분리했다.

6. **ops 태스크와 Quality Gate 형식 불일치**
   - `ops`는 코드가 없는 pretask라 TDD/Test Cases가 자연스럽지 않은데 Quality Gate는 모든 태스크에 테스트 케이스를 요구했다.
   - `ops`는 Deliverables/Acceptance Criteria로 수동 검증한다는 예외를 명시했다.

7. **경로 표기 드리프트**
   - 저장소 구조 예시가 실제 폴더명 `planning/`이 아니라 `Planning/`으로 적혀 있었다.
   - `ONE_PAGER.md`의 구조 예시를 소문자로 수정했다.

## Remaining Risks

- Google/Kakao/Supabase/Vercel/Figma는 외부 콘솔 작업이므로 문서만으로 완료 처리할 수 없다.
- Product UI 구현 전 개별 Figma 화면 프레임은 여전히 태스크 착수 직전에 다시 받아야 한다.

## Verdict

**READY FOR FOUNDATION IMPLEMENTATION.**

그래프에는 사이클이 없고, deprecated 태스크는 실행 그래프에서 참조되지 않는다. `infra-01-project-bootstrap`부터 구현을 시작할 수 있다.
