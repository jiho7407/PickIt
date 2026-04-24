# 소민 작업 인수인계

이 문서는 소민이 PickIt의 프로필 주변 화면 작업을 시작할 시점과 작업 순서를
정리한 문서다.

## 지호가 먼저 끝내는 범위

소민은 아래 작업이 main에 merge된 뒤 시작한다.

```text
product-02-vote-detail-flow
```

즉, 지호가 아래 흐름을 먼저 끝낸 뒤 소민에게 넘긴다.

```text
foundation
→ Supabase schema
→ auth/session
→ vote feed
→ vote detail
```

이 시점에는 auth helper, vote/comment schema, vote-linked comment 패턴,
결과 조회 패턴이 코드에 잡혀 있어야 한다. 소민은 이 기반 위에서 내 투표/댓글,
프로필, 소비기록, 알림/에러 화면을 이어서 구현한다.

## 소민이 맡는 작업

소민은 아래 네 task를 순서대로 작업한다.

```text
1. product-03-my-votes-and-comments
2. product-05a-profile
3. product-05b-consumption-records
4. product-06-notifications-and-errors
```

## 작업 순서

### 1. 내 투표/한마디 관리

브랜치:

```text
dev/product-03-my-votes-and-comments
```

기준 문서:

```text
Planning/tasks/product-03-my-votes-and-comments.md
```

완료 후 확인:

```bash
pnpm test
pnpm lint
pnpm build
```

### 2. 프로필 화면

`product-03-my-votes-and-comments`가 merge된 뒤 시작한다.

브랜치:

```text
dev/product-05a-profile
```

기준 문서:

```text
Planning/tasks/product-05a-profile.md
```

완료 후 확인:

```bash
pnpm test
pnpm lint
pnpm build
```

### 3. 소비기록 화면

`product-05a-profile`이 merge된 뒤 시작한다.

브랜치:

```text
dev/product-05b-consumption-records
```

기준 문서:

```text
Planning/tasks/product-05b-consumption-records.md
```

완료 후 확인:

```bash
pnpm test
pnpm lint
pnpm build
```

### 4. 알림/에러 화면

`product-05b-consumption-records`가 merge된 뒤 시작한다.

브랜치:

```text
dev/product-06-notifications-and-errors
```

기준 문서:

```text
Planning/tasks/product-06-notifications-and-errors.md
```

완료 후 확인:

```bash
pnpm test
pnpm lint
pnpm build
```

## 브랜치 규칙

- task 하나당 브랜치 하나를 만든다.
- 브랜치 이름은 `dev/<task-id>`를 사용한다.
- 작업 시작 전 main을 최신 상태로 맞춘다.
- 한 브랜치에서 두 개 이상의 task를 처리하지 않는다.

## 수정 전 확인이 필요한 파일

아래 파일은 프로젝트 전반에 영향이 크므로, 수정이 필요하면 먼저 지호와 확인한다.

```text
package.json
apps/web/package.json
apps/web/middleware.ts
apps/web/src/lib/supabase/*
apps/web/src/lib/database.types.ts
supabase/migrations/*
supabase/seed.sql
```

소민 작업에서는 기본적으로 아래 영역을 중심으로 작업한다.

```text
apps/web/app/me/*
apps/web/src/features/profile/*
apps/web/src/features/followups/*
apps/web/src/features/records/*
apps/web/src/features/notifications/*
apps/web/app/profile/*
apps/web/app/notifications/*
```

## 지호가 넘겨줄 때 공유할 내용

소민에게 작업을 넘길 때 아래 항목을 같이 공유한다.

```text
프로필 작업 시작 가능.

완료된 기준:
- product-02-vote-detail-flow merge 완료

소민 작업 순서:
1. dev/product-03-my-votes-and-comments
2. dev/product-05a-profile
3. dev/product-05b-consumption-records
4. dev/product-06-notifications-and-errors

확인할 문서:
- Planning/tasks/product-03-my-votes-and-comments.md
- Planning/tasks/product-05a-profile.md
- Planning/tasks/product-05b-consumption-records.md
- Planning/tasks/product-06-notifications-and-errors.md

참고할 코드:
- Auth helper:
- Generated DB types:
- Vote detail:
- Vote/comment action:
- Profile action:
- Figma frame:

수정 전 확인할 파일:
- apps/web/src/lib/supabase/*
- apps/web/src/lib/database.types.ts
- supabase/migrations/*
```
