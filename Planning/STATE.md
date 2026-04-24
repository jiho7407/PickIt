# Planning Loop State

> 이 파일은 PickIt planning의 single source of truth다.
> 구현 전에 이 파일의 Quality Gate를 통과하는 것이 목표다.

---

## Current Iteration

- **Iteration**: 1
- **Phase**: planning audit complete
- **Last Updated**: 2026-04-24
- **Mode**: human-guided planning
- **Implementation Status**: READY FOR FOUNDATION IMPLEMENTATION

## 다음 목표

1. `infra-01-project-bootstrap`부터 TDD로 구현을 시작한다.
2. Figma 임시 node-id는 고정 레퍼런스로 남기지 않고, 각 product 태스크 착수 직전에 필요한 화면만 다시 읽는다.
3. Supabase local/CI와 schema 태스크는 migration/RLS 테스트를 먼저 작성한다.

---

## 태스크 실행 순서 (topological draft)

### Phase 1 — Foundation

1. `infra-01-project-bootstrap`
2. `infra-02-supabase-local-and-ci`

### Phase 2 — Data Model

3. `data-01-dilemma-schema`
4. `data-02-vote-comment-schema`
5. `data-03-followup-schema`

### Phase 3 — Platform Services

6. `infra-03-storage-setup`
7. `infra-04-auth-providers`
8. `infra-05-anonymous-session`
9. `data-04-vote-summary-views`
10. `data-05-rls-tests`

### Phase 4 — Product Flows

11. `product-00-splash-onboarding-flow`
12. `product-01-home-vote-feed`
13. `product-02-vote-detail-flow`
14. `product-04-create-vote-flow`
15. `product-03-my-votes-and-comments`
16. `product-05a-profile`
17. `product-05b-consumption-records`
18. `product-06-notifications-and-errors`

### Phase 5 — Integration

19. `test-01-mvp-e2e`
20. `infra-06-deployment-preview`

---

## Quality Gate (기획 단계 종료 조건)

### 계획서 품질

- [x] ONE_PAGER가 제품 가설과 MVP 범위를 설명한다.
- [x] PRD가 FR/NFR을 ID로 정의한다.
- [x] ERD가 주요 테이블과 권한을 정의한다.
- [x] 모든 태스크가 이슈 단위로 쪼개져 있다.
- [x] 각 태스크에 acceptance criteria가 측정 가능하게 적혀 있다.
- [x] 각 태스크의 depends_on이 명시돼 있다.
- [x] 각 태스크의 예상 소요 시간이 30분~2시간 범위 안이다.
- [x] 각 태스크에 작업할 파일 경로가 명시돼 있다.
- [x] 각 태스크에 테스트 케이스가 최소 3개 있다.
- [x] 화면 IA가 태스크와 연결돼 있다. Figma 노드는 개발 직전에 연결한다.
- [x] PRD/ERD/tasks 제3자 리뷰가 최소 1회 수행됐다.

### MVP 정합성

- [x] `ONE_PAGER.md §6` 데모 장면이 정의돼 있다.
- [x] `ONE_PAGER.md §10` 완료 기준이 정의돼 있다.
- [x] 완료 기준이 tasks로 전부 커버된다.
- [x] OUT 범위가 PRD와 README에 반영돼 있다.

### 데이터/RLS

- [x] 핵심 엔티티가 ERD에 정의돼 있다.
- [x] 중복 투표 방지 제약이 정의돼 있다.
- [x] 회고/절약 계산 규칙이 정의돼 있다.
- [x] RLS 정책이 테스트 태스크에 연결돼 있다.

### TDD

- [x] TDD 원칙이 각 task의 `TDD` 섹션과 `test-01-mvp-e2e`에 반영돼 있다.
- [x] 각 태스크가 Red-Green-Refactor 순서를 포함한다.
- [x] 첫 구현 태스크의 실패 테스트 파일명이 확정돼 있다: `apps/web/app/page.test.tsx`.

---

## Decisions

### Product

1. 서비스 이름은 PickIt으로 확정한다.
2. 투표 문구는 MVP에서 "사도 된다 / 사지 말자"로 확정한다.
3. 댓글은 독립 스레드가 아니라 투표 한마디만 MVP에 포함한다.
4. 공개 범위는 MVP에서 전체 공개만 둔다. 링크 공개는 후속이다.

### Auth

5. 고민 작성은 로그인 필수다.
6. 익명 투표 중복 방지는 MVP에서 httpOnly 쿠키 + hashed DB row로 충분하다고 본다.
7. 첫 로그인 수단은 Google이다. Kakao는 env flag로 준비하고 키 확보 후 활성화한다.

### Figma

8. 개발 시점에 각 태스크별 개별 폰 화면 프레임을 다시 전달받는다. 임시 node-id는 Planning에 고정하지 않는다.
9. 모바일 우선으로 구현하되 데스크톱은 깨지지 않는 responsive layout을 유지한다.
10. 디자인 시스템 토큰 페이지가 없으면 Tailwind token으로 먼저 고정하고, Figma 토큰 확보 시 보정한다.

### Technical

11. Supabase local 개발은 Supabase CLI의 Docker 기반 실행을 표준으로 한다.
12. Storage 이미지는 MVP에서 공개 버킷으로 시작한다.
13. 카카오톡 실제 알림 연동은 MVP OUT이며, 알림 후보/앱 내 알림까지만 구현한다.

---

## Iteration Log

### Iteration 0 — Structure Migration (2026-04-24)

참조 planning 구조(`/Buidlweek_NearAI/planning`)를 분석해 PickIt에 맞게 반영.

산출물:

- `README.md` 재작성
- `ONE_PAGER.md` 신규 작성
- `PRD.md` 신규 작성
- `ERD.md` 신규 작성
- `STATE.md` 신규 작성
- `tasks/` 구조 생성 예정

판정:

- 제품 방향은 명확하나, 실제 구현 전 화면 IA 기준 task 세분화와 일부 정책 확정이 더 필요하다.

### Iteration 1 — Planning Audit (2026-04-24)

검수 프롬프트 기준으로 `Planning/` 전체를 재검토했다.

수정 사항:

- `infra-04-auth-providers`가 `profiles` 스키마 생성 후 실행되도록 의존성을 보정했다.
- `profiles.role`과 운영자 RPC 권한 기준을 ERD/data 태스크/RLS 테스트에 추가했다.
- `product-01`의 빠른 투표가 온보딩/익명 세션 정책에 의존하도록 그래프를 보정했다.
- `test-01-mvp-e2e`가 투표 생성 플로우에 직접 의존하도록 보정했다.
- preview 배포/env 검증 태스크 `infra-06-deployment-preview`를 추가했다.

판정:

- Foundation 구현을 시작할 수 있다. Product UI 구현 전에는 해당 태스크별 Figma 화면 프레임만 다시 확인한다.
