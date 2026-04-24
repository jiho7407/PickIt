# Tasks

이 폴더는 PickIt MVP를 이슈 단위로 쪼갠 구현 태스크를 담는다. 각 파일은 가능한 한 하나의 PR/커밋에 해당해야 한다.

## 네이밍 규칙

```text
{layer}-{NN}-{slug}.md

layer:
  - infra    # 프로젝트/빌드/배포/테스트 인프라
  - data     # Supabase schema, RLS, seed
  - product  # 사용자-facing 기능 구현
  - test     # 통합/E2E 테스트
```

## 태스크 파일 포맷

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
| `infra-01-project-bootstrap` | todo | Next.js/Supabase/uv 프로젝트 기반 |
| `infra-02-supabase-local-and-ci` | todo | Supabase local/CI/RLS 테스트 기반 |
| `data-01-dilemma-schema` | todo | 고민/프로필 schema |
| `data-02-vote-comment-schema` | todo | 투표/한마디 schema |
| `data-03-followup-schema` | todo | 7일 후 회고 schema |
| `product-00-splash-onboarding-flow` | todo | 스플래시/온보딩/소셜 로그인 진입 |
| `product-01-home-vote-feed` | todo | 홈 = 투표 피드 |
| `product-02-vote-detail-flow` | todo | 투표 상세: 살지/말지, A/B |
| `product-03-my-votes-and-comments` | todo | 나의 투표, 댓글 작성/삭제, 투표 삭제 |
| `product-04-create-vote-flow` | todo | 투표 만들기: 살지/말지, A/B |
| `product-05-profile-and-consumption-records` | todo | 프로필, 내 목록, 소비기록/리포트/소비여부 회고 |
| `product-06-notifications-and-errors` | todo | 알람, 에러 화면 |
| `test-01-mvp-e2e` | todo | MVP E2E |
