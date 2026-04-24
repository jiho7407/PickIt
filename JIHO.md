# 지호 작업 범위

이 문서는 지호가 소민에게 작업을 넘기기 전까지 완료해야 하는 범위를 정리한다.

## 목표

지호는 `product-02-vote-detail-flow`까지 main에 merge한 뒤 소민에게 넘긴다.

이 시점에는 소민이 `product-03-my-votes-and-comments`부터 이어서 작업할 수
있어야 한다.

## 지호가 먼저 완료할 task

아래 순서대로 작업하고 merge한다.

```text
1. infra-01-project-bootstrap
2. infra-02-supabase-local-and-ci
3. data-01-dilemma-schema
4. data-02-vote-comment-schema
5. data-03-followup-schema
6. infra-03-storage-setup
7. infra-04-auth-providers
8. infra-05-anonymous-session
9. data-04-vote-summary-views
10. product-00-splash-onboarding-flow
11. product-01-home-vote-feed
12. product-02-vote-detail-flow
```

## 브랜치 이름

task 하나당 브랜치 하나를 만든다.

```text
codex/<task-id>
```

예시:

```text
codex/infra-01-project-bootstrap
codex/data-02-vote-comment-schema
codex/product-02-vote-detail-flow
```

## 넘기기 전 확인할 것

`product-02-vote-detail-flow`까지 끝낸 뒤 아래 항목을 확인한다.

- Auth helper가 실제 product 코드에서 쓰이고 있다.
- Anonymous session 생성/조회 흐름이 투표 action에서 쓰이고 있다.
- Vote/comment schema와 generated DB type이 최신이다.
- Vote detail 화면에서 투표와 vote-linked comment 생성 흐름이 동작한다.
- Vote summary view/RPC 조회 패턴이 코드에 있다.
- `pnpm test`, `pnpm lint`, `pnpm build` 중 실행 가능한 항목의 결과를 정리한다.

## 소민에게 넘길 때 공유할 것

소민에게 아래 형식으로 공유한다.

```text
소민님, 프로필 주변 화면 작업 시작하시면 됩니다.

완료 및 merge:
- product-02-vote-detail-flow

다음 작업 순서:
1. dev/product-03-my-votes-and-comments
2. dev/product-05a-profile
3. dev/product-05b-consumption-records
4. dev/product-06-notifications-and-errors

확인할 문서:
- DEVELOPMENT_SPLIT.md
- Planning/tasks/product-03-my-votes-and-comments.md
- Planning/tasks/product-05a-profile.md
- Planning/tasks/product-05b-consumption-records.md
- Planning/tasks/product-06-notifications-and-errors.md

참고할 코드:
- Auth helper:
- Anonymous session helper:
- Vote detail page:
- Vote/comment action:
- Vote summary query:
- Profile action:
- Generated DB types:

수정 전 확인할 파일:
- apps/web/src/lib/supabase/*
- apps/web/src/lib/database.types.ts
- supabase/migrations/*
```

## 지호가 이후 병렬로 진행할 task

소민이 프로필 주변 화면을 진행하는 동안 지호는 아래 작업을 이어서 진행한다.

```text
product-04-create-vote-flow
data-05-rls-tests
test-01-mvp-e2e
infra-06-deployment-preview
```

