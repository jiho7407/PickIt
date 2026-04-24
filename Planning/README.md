# Planning — PickIt

> 이 폴더는 PickIt 개발 착수 전의 기획 산출물이다.
> 목표는 "좋은 아이디어 메모"가 아니라, **TDD로 바로 구현 가능한 태스크 묶음**까지 도달하는 것이다.

## 먼저 읽을 것 (추천 순서)

1. **[ONE_PAGER.md](./ONE_PAGER.md)** — 제품 개요, 핵심 가설, MVP IN/OUT, 데모 장면
2. **[PRD.md](./PRD.md)** — 기능 요구사항(FR), 비기능 요구사항(NFR), 지표, 리스크
3. **[ERD.md](./ERD.md)** — Supabase/Postgres 기준 데이터 모델, RLS, 상태 전이
4. **[STATE.md](./STATE.md)** — 현재 상태, Quality Gate, 태스크 실행 순서
5. **[tasks/](./tasks/)** — 이슈 단위 구현 태스크
6. **[reviews/](./reviews/)** — 기획 리뷰 로그
7. **[research/](./research/)** — 외부 조사 및 기술 판단 노트(필요 시 생성)
8. **[fixes/](./fixes/)** — 리뷰에서 나온 수정 항목 처리 로그(필요 시 생성)

## 핵심 결정 요약

| 주제 | 결정 |
| --- | --- |
| 제품 | 구매 직전 소비 고민을 맥락 있는 투표와 7일 후 회고로 연결 |
| 1차 타겟 | 20~30대 직장인, 취준생, 1인 가구 |
| MVP 핵심 | 고민 작성 → 투표/의견 → 결과 확인 → 7일 후 회고 → 절약 금액 계산 |
| 프론트엔드 | Next.js App Router + TypeScript |
| 백엔드 | Supabase(Postgres/Auth/Storage/RLS) |
| 패키지 | 프론트엔드 `pnpm`, Python QA/운영 스크립트 `uv` |
| 테스트 | TDD: Vitest/Testing Library, Playwright, Supabase RLS 테스트 |
| 알림 | MVP는 이메일/앱 내 후보 생성 중심, 카카오톡은 지표 확인 후 |
| Figma | 제공 노드는 로고 조각. 실제 화면 노드 추가 확보 필요 |

## 태스크 목록 (초안)

### Ops (Pretasks — 외부 자원 확보)
- `ops-01-google-oauth-credentials` — Google OAuth client id/secret 발급
- `ops-02-kakao-oauth-credentials` — Kakao OAuth 키 (deferred, env flag만 준비)
- `ops-03-supabase-projects` — Supabase preview/prod project 생성, 키 관리
- `ops-04-vercel-project` — Vercel 프로젝트 연결, env 주입
- `ops-05-figma-access` — Figma 접근 권한, 화면 전달 프로세스

### Infrastructure
- `infra-01-project-bootstrap` — Next.js/Supabase/uv 개발 기반
- `infra-02-supabase-local-and-ci` — Supabase local/CI/type-gen 기반
- `infra-03-storage-setup` — Storage 버킷/정책(이미지 업로드)
- `infra-04-auth-providers` — Supabase Auth(Google/Kakao) + 세션 미들웨어
- `infra-05-anonymous-session` — 익명 투표 세션 쿠키/DB 연결
- `infra-06-deployment-preview` — Vercel/Supabase preview 배포와 운영 env 점검

### Data
- `data-01-dilemma-schema` — 고민/프로필/이미지 DB 모델
- `data-02-vote-comment-schema` — 투표/한마디/중복 방지 모델
- `data-03-followup-schema` — 7일 후 회고/절약 금액 모델
- `data-04-vote-summary-views` — 투표 요약 view, 후보 조회 RPC
- `data-05-rls-tests` — RLS 통합 테스트 스위트

### Product
- `product-00-splash-onboarding-flow` — 스플래시/온보딩/소셜 로그인 진입
- `product-01-home-vote-feed` — 홈 = 투표 피드
- `product-02-vote-detail-flow` — 투표 상세: 살지/말지, A/B
- `product-03-my-votes-and-comments` — 나의 투표, vote-linked 한마디 관리/삭제, 투표 삭제
- `product-04-create-vote-flow` — 투표 만들기: 살지/말지, A/B
- `product-05a-profile` — 기본 프로필 화면
- `product-05b-consumption-records` — 소비기록, 회고 prompt, 리포트 CTA
- `product-06-notifications-and-errors` — 알람, 에러 화면

### Testing
- `test-01-mvp-e2e` — 작성→투표→결과→회고 E2E

## 알려진 Deferred 항목

- 실제 카카오톡 알림 연동
- 정교한 비슷한 사용자 매칭 알고리즘
- 소비 패턴 월간 리포트
- 앱 전환
- 운영자 CRM 전체 자동화

## 원본 메모

- [../item.md](../item.md) — 문제 정의/시장/솔루션
- [../crm.md](../crm.md) — 알림/리텐션 아이디어

---

*이 폴더는 참조 프로젝트 `/Users/zyo/Programming/2026/Ampersand/Buidlweek_NearAI/planning`의 운영형 planning 구조를 PickIt에 맞게 적용한 것이다.*
