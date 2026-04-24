# Planning Loop State

> 이 파일은 PickIt planning의 single source of truth다.
> 구현 전에 이 파일의 Quality Gate를 통과하는 것이 목표다.

---

## Current Iteration

- **Iteration**: 4
- **Phase**: planning audit complete
- **Last Updated**: 2026-04-24
- **Mode**: human-guided planning
- **Implementation Status**: READY FOR FOUNDATION IMPLEMENTATION (ops pretask 병행 진행)

## 다음 목표

1. `infra-01-project-bootstrap`부터 TDD로 구현을 시작한다.
2. Figma 임시 node-id는 고정 레퍼런스로 남기지 않고, 각 product 태스크 착수 직전에 필요한 화면만 다시 읽는다.
3. Supabase local/CI와 schema 태스크는 migration/RLS 테스트를 먼저 작성한다.

---

## 태스크 실행 순서 (topological draft)

### Phase 0 — Pretasks (외부 자원 확보, 코드 작업과 병행 가능)

- `ops-01-google-oauth-credentials` — `infra-04` 착수 전까지 필수
- `ops-02-kakao-oauth-credentials` — deferred, activation trigger 도달 시 전환
- `ops-03-supabase-projects` — `infra-06` 착수 전까지 필수
- `ops-04-vercel-project` — `infra-06` 착수 전까지 필수 (ops-01/03 의존)
- `ops-05-figma-access` — 첫 `product-*` 착수 전까지 필수

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
- [x] 각 구현 태스크에 테스트 케이스가 최소 3개 있다. 코드가 없는 `ops` pretask는 수동 Deliverables/Acceptance Criteria로 검증한다.
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

### Iteration 2 — Planning Audit (2026-04-24)

태스크별 명세 완성도와 의존성 정합성을 한 번 더 점검했다.

수정 사항:

- `data-05-rls-tests` depends_on에 `infra-04-auth-providers`를 추가했다. RLS 테스트 fixture는 Supabase Auth와 `profiles` auto-create trigger에 의존한다.
- `data-01-dilemma-schema` Spec/Acceptance에 ERD §3 `profiles` 전체 컬럼(nickname/birth_year/gender/life_stage/role)과 nickname 2~24자 check constraint, 필수 인덱스를 명시했다.
- `product-01-home-vote-feed` depends_on에 `data-02-vote-comment-schema`를 명시했다. "빠른 투표" = votes insert이며, 핵심 의존성을 transitive가 아닌 직접 의존으로 표시한다.
- `product-00-splash-onboarding-flow`에 로그인 전 선택한 생활 단계 태그가 OAuth 콜백 이후 `profiles.life_stage`로 전달되는 경로를 명시했다. 저장 action은 `product-05a`의 `edit-profile-form`을 재사용한다.

판정:

- 태스크 그래프는 TDD로 순차 구현 가능하다. 외부 키(Kakao OAuth, 운영 env) 확보와 Figma 화면 프레임은 각 태스크 착수 직전에 보강한다.

### Iteration 3 — Pretask Extraction (2026-04-24)

외부 자원 확보(코드 없음)를 별도 `ops` 레이어의 pretask로 분리해, 실제 구현 태스크의 depends_on으로 연결했다.

신규 태스크:

- `ops-01-google-oauth-credentials` (todo)
- `ops-02-kakao-oauth-credentials` (deferred, activation trigger 명시)
- `ops-03-supabase-projects` (todo)
- `ops-04-vercel-project` (todo, ops-01/ops-03 의존)
- `ops-05-figma-access` (todo)

의존성 반영:

- `infra-04-auth-providers` depends_on에 `ops-01` 추가, Kakao는 References에만 표시.
- `infra-06-deployment-preview` depends_on에 `ops-03`, `ops-04` 추가.

문서 갱신:

- `tasks/README.md`에 `ops` 레이어와 5개 태스크 표 반영.
- `Planning/README.md` 태스크 목록에 Ops 섹션 신설.
- `STATE.md`에 Phase 0 Pretasks 섹션 신설.

판정:

- Phase 0 pretask와 Phase 1 Foundation은 병렬 진행 가능하다. `infra-04` 착수 시 `ops-01`이, `infra-06` 착수 시 `ops-03/ops-04`가 완료돼 있어야 한다. Figma(`ops-05`)는 첫 `product-*` 구현 직전까지 완료한다.

### Iteration 4 — Planning Audit (2026-04-24)

검수 프롬프트 기준으로 `planning/` 전체를 다시 읽고 숨은 의존성, vote-linked comment 모델, ops 태스크 예외 규칙을 보정했다.

수정 사항:

- `product-00`의 로그인 후 생활 단계 저장이 미래 태스크(`product-05a`)를 참조하던 숨은 역방향 의존성을 제거했다. 공용 `profile-actions.ts`를 `product-00`에서 먼저 만들고, `product-05a`가 재사용/확장하도록 변경했다.
- 첫 product 태스크가 Figma 전달 프로세스에 의존한다는 정책을 frontmatter에 반영했다(`product-00` depends_on에 `ops-05` 추가).
- `comments`를 독립 댓글이 아니라 `vote_id`에 연결된 "투표 한마디"로 고정했다. ERD, `data-02`, `data-05`, `product-02`, `product-03`의 책임을 이에 맞게 정리했다.
- `data-02`의 vote summary DB view 요구를 제거하고, 순수 함수는 `data-02`, DB view/RPC는 `data-04`가 담당하도록 중복을 해소했다.
- 회고/알림 후보 RPC를 author-facing(`get_followup_candidates`, `get_my_notification_candidates`)과 operator-only(`get_operator_notification_candidates`)로 분리했다.
- 코드가 없는 `ops` pretask는 TDD/Test Cases 대신 Deliverables/Acceptance Criteria로 검증한다는 예외를 `tasks/README.md`와 Quality Gate에 명시했다.
- 저장소 구조 예시의 `Planning/` 표기를 실제 경로인 `planning/`으로 수정했다.

판정:

- 구현 태스크 그래프는 사이클 없이 유지된다. Foundation 구현을 시작할 수 있고, product 구현 전에는 `ops-05`를 완료해야 한다.
