# Planning Loop State

> 이 파일은 PickIt planning의 single source of truth다.
> 구현 전에 이 파일의 Quality Gate를 통과하는 것이 목표다.

---

## Current Iteration

- **Iteration**: 0
- **Phase**: planning structure migrated from reference project
- **Last Updated**: 2026-04-24
- **Mode**: human-guided planning
- **Implementation Status**: NOT READY

## 다음 목표

1. 화면 IA 기준으로 task 재분해. Figma 임시 node-id는 고정 레퍼런스로 남기지 않고 개발 직전에 필요한 화면만 다시 읽는다.
2. PRD/ERD 1차 리뷰
3. tasks/를 "1태스크 = 1PR = 30분~2시간" 수준으로 세분화
4. Quality Gate 통과 후 프로젝트 스캐폴딩 시작

---

## 태스크 실행 순서 (topological draft)

### Phase 1 — Foundation

1. `infra-01-project-bootstrap`
2. `infra-02-supabase-local-and-ci`

### Phase 2 — Data Model

3. `data-01-dilemma-schema`
4. `data-02-vote-comment-schema`
5. `data-03-followup-schema`

### Phase 3 — Product Flows

6. `product-00-splash-onboarding-flow`
7. `product-01-home-vote-feed`
8. `product-02-vote-detail-flow`
9. `product-03-my-votes-and-comments`
10. `product-04-create-vote-flow`
11. `product-05-profile-and-consumption-records`
12. `product-06-notifications-and-errors`

### Phase 4 — Integration

13. `test-01-mvp-e2e`

---

## Quality Gate (기획 단계 종료 조건)

### 계획서 품질

- [x] ONE_PAGER가 제품 가설과 MVP 범위를 설명한다.
- [x] PRD가 FR/NFR을 ID로 정의한다.
- [x] ERD가 주요 테이블과 권한을 정의한다.
- [~] 모든 태스크가 이슈 단위로 쪼개져 있다.
- [~] 각 태스크에 acceptance criteria가 측정 가능하게 적혀 있다.
- [~] 각 태스크의 depends_on이 명시돼 있다.
- [~] 각 태스크의 예상 소요 시간이 30분~2시간 범위 안이다.
- [~] 각 태스크에 작업할 파일 경로가 명시돼 있다.
- [~] 각 태스크에 테스트 케이스가 최소 3개 있다.
- [~] 화면 IA가 태스크와 연결돼 있다. Figma 노드는 개발 직전에 연결한다.
- [ ] PRD/ERD/tasks 제3자 리뷰가 최소 1회 수행됐다.

### MVP 정합성

- [x] `ONE_PAGER.md §6` 데모 장면이 정의돼 있다.
- [x] `ONE_PAGER.md §10` 완료 기준이 정의돼 있다.
- [~] 완료 기준이 tasks로 전부 커버된다.
- [x] OUT 범위가 PRD와 README에 반영돼 있다.

### 데이터/RLS

- [x] 핵심 엔티티가 ERD에 정의돼 있다.
- [x] 중복 투표 방지 제약이 정의돼 있다.
- [x] 회고/절약 계산 규칙이 정의돼 있다.
- [~] RLS 정책이 테스트 태스크에 연결돼 있다.

### TDD

- [x] TDD 원칙이 각 task의 `TDD` 섹션과 `test-01-mvp-e2e`에 반영돼 있다.
- [~] 각 태스크가 Red-Green-Refactor 순서를 포함한다.
- [ ] 첫 구현 태스크의 실패 테스트 파일명이 확정돼 있다.

---

## Open Questions

### Product

1. 서비스 이름은 PickIt으로 확정인가?
2. 투표 문구는 "사도 된다 / 사지 말자"로 확정인가?
3. 댓글은 MVP에 포함할 것인가, 투표 한마디만 둘 것인가?
4. 공개 범위는 전체 공개만 둘 것인가, 링크 공개도 둘 것인가?

### Auth

5. 고민 작성은 로그인 필수인가, 작성 후 인증 유도인가?
6. 익명 투표 중복 방지는 쿠키 기반으로 충분한가?
7. 첫 로그인 수단은 Google인가 이메일 magic link인가?

### Figma

8. 개발 시점에 각 태스크별 개별 폰 화면 프레임을 다시 전달받는다. 임시 node-id는 Planning에 고정하지 않는다.
9. 모바일 우선만 구현할 것인가, 데스크톱도 동시에 대응할 것인가?
10. 디자인 시스템 토큰 페이지가 별도로 있는가?

### Technical

11. Supabase local 개발을 Docker로 할 것인가?
12. Storage 이미지는 공개 버킷인가 signed URL인가?
13. 카카오톡 알림은 언제부터 실제 연동할 것인가?

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
