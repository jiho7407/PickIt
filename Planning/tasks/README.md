# Tasks

이 폴더는 PickIt MVP를 이슈 단위로 쪼갠 구현 태스크를 담는다. 각 파일은 가능한 한 하나의 PR/커밋에 해당해야 한다.

## 네이밍 규칙

```text
{layer}-{NN}-{slug}.md

layer:
  - ops      # 외부 자원/자격증명/계정 준비 (코드 없음, pretask)
  - infra    # 프로젝트/빌드/배포/테스트 인프라
  - data     # Supabase schema, RLS, seed
  - product  # 사용자-facing 기능 구현
  - test     # 통합/E2E 테스트
```

## 태스크 파일 포맷

구현 태스크(`infra`, `data`, `product`, `test`)는 아래 포맷을 따른다. 코드가 없는 `ops` pretask는 `TDD`/`Test Cases` 대신 `Out of scope`, `Deliverables`, `Acceptance Criteria`로 수동 검증 기준을 명시할 수 있다.

```markdown
---
id: product-04-create-vote-flow
status: todo
sub: FE
layer: product
depends_on: [data-01-dilemma-schema, data-02-vote-comment-schema]
estimate: 2h
demo_step: "투표 만들기"
---

# 제목

## Context
왜 이 태스크가 필요한가. ONE_PAGER/PRD의 어느 부분과 연결되는가.

## Files
- `apps/web/...` (create)

## Spec
구조체, 함수 시그니처, 라우트, DB 계약, 에러 케이스.

## TDD
Red-Green-Refactor 순서.

## Acceptance Criteria
- [ ] 측정 가능한 완료 조건

## Test Cases
1. happy path
2. edge case
3. permission/error case

## References
- 관련 문서 또는 개발 시점에 다시 확인할 Figma 화면
```

## 현재 태스크

| ID | 상태 | 설명 |
| --- | --- | --- |
| `ops-01-google-oauth-credentials` | done | Google OAuth client id/secret 확보 |
| `ops-02-kakao-oauth-credentials` | deferred | Kakao OAuth 키 (env flag 준비만, 실제 활성화는 후속) |
| `ops-03-supabase-projects` | done | Supabase preview/prod project 생성과 키 관리 |
| `ops-04-vercel-project` | todo | Vercel 프로젝트 연결과 env 주입 |
| `ops-05-figma-access` | done | Figma 접근 권한, 화면 전달 프로세스 |
| `infra-01-project-bootstrap` | done | Next.js/Supabase/uv 프로젝트 기반 |
| `infra-02-supabase-local-and-ci` | done | Supabase local/CI/type-gen 기반 |
| `infra-03-storage-setup` | done | Storage 버킷/정책(이미지 업로드) |
| `infra-04-auth-providers` | done | Supabase Auth(Google/Kakao) + 세션 미들웨어 |
| `infra-05-anonymous-session` | done | 익명 투표 세션 쿠키/DB 연결 |
| `infra-06-deployment-preview` | todo | Vercel/Supabase preview 배포와 운영 env 점검 |
| `data-01-dilemma-schema` | done | 고민/프로필 schema |
| `data-02-vote-comment-schema` | done | 투표/한마디 schema |
| `data-03-followup-schema` | done | 7일 후 회고 schema |
| `data-04-vote-summary-views` | done | 투표 요약 view, 후보 조회 RPC |
| `data-05-rls-tests` | done | RLS 통합 테스트 스위트 |
| `product-00-splash-onboarding-flow` | todo | 스플래시/온보딩/소셜 로그인 진입 |
| `product-01-home-vote-feed` | todo | 홈 = 투표 피드 |
| `product-02-vote-detail-flow` | todo | 투표 상세: 살지/말지, A/B |
| `product-03-my-votes-and-comments` | todo | 나의 투표, vote-linked 한마디 관리/삭제, 투표 삭제 |
| `product-04-create-vote-flow` | todo | 투표 만들기: 살지/말지, A/B |
| `product-05-profile-and-consumption-records` | deprecated | 분할됨 → `05a`, `05b` |
| `product-05a-profile` | todo | 기본 프로필 화면 |
| `product-05b-consumption-records` | todo | 소비기록, 회고 prompt, 리포트 CTA |
| `product-06-notifications-and-errors` | todo | 알람, 에러 화면 |
| `test-01-mvp-e2e` | todo | MVP E2E |
