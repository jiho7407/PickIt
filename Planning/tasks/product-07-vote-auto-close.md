---
id: product-07-vote-auto-close
status: todo
sub: FE+BE
layer: product
depends_on: [data-01-dilemma-schema, data-02-vote-comment-schema, data-04-vote-summary-views]
estimate: 3h
demo_step: "투표 생성 72시간 후 자동 마감 — 투표 불가, 댓글은 허용"
---

# 투표 자동 마감 (72시간)

## Context

사용자 요청: "투표 마감 자동으로 되게 하기 — 3일/72시간 지나면 마감".

현재 `dilemmas` 테이블에는 `status`(open/decided/...)와 `created_at`만 있고
시간 기반 마감 개념이 없다. 피드/상세는 `status='open'`만 가져오며 투표
액션도 마감 검사 없이 INSERT한다. `followup_due_at`이 이미 default
`now() + interval '7 days'`로 잡혀 있어 동일 패턴을 따른다.

운영 결정(사용자 확정):
- (a) 마감 후에도 댓글은 허용한다.
- (b) 마감 시 `dilemmas.status`도 함께 갱신한다.

## Files

- `supabase/migrations/202605110001_add_dilemmas_closes_at.sql` (create)
- `supabase/migrations/202605110002_expire_open_dilemmas_rpc.sql` (create)
- `apps/web/src/lib/database.types.ts` (regenerate via `pnpm db:types`)
- `apps/web/src/features/votes/vote-feed.server.ts` (edit)
- `apps/web/src/features/votes/vote-detail.server.ts` (edit)
- `apps/web/src/features/votes/vote-actions.ts` (edit — 투표만 차단)
- `apps/web/src/features/votes/vote-card.tsx` (edit — 마감 배지)
- `apps/web/src/features/votes/vote-detail-view.tsx` 또는 동등 위치 (edit — 마감 시 투표 영역 비활성)
- 관련 테스트 파일 보강

## Spec

### 데이터 모델

마이그레이션 `202605110001_add_dilemmas_closes_at.sql`:

```sql
alter table public.dilemmas
  add column closes_at timestamptz not null
  default (now() + interval '3 days');

update public.dilemmas
  set closes_at = created_at + interval '3 days'
  where closes_at is null;

alter table public.dilemmas drop constraint dilemmas_status_check;
alter table public.dilemmas add constraint dilemmas_status_check check (
  status in ('draft','open','closed','decided','followup_due','followed_up','archived')
);

create index dilemmas_open_closes_at_idx
  on public.dilemmas (closes_at)
  where status = 'open';
```

RLS 정책 `public dilemmas are readable`와 `dilemma_vote_summaries` 뷰의
status 화이트리스트에 `'closed'`를 추가한다(기존 마이그레이션을 수정하지 않고
새 마이그레이션에서 `create or replace policy`/`create or replace view` 형태로 재생성).

### 자동 마감 RPC

마이그레이션 `202605110002_expire_open_dilemmas_rpc.sql`:

```sql
create or replace function public.expire_open_dilemmas()
returns void
language sql
security definer
set search_path = public
as $$
  update public.dilemmas
     set status = 'closed'
   where status = 'open'
     and closes_at <= now();
$$;

grant execute on function public.expire_open_dilemmas() to anon, authenticated;
```

- cron 없이 lazy update: `getPublicVoteFeedItems`와 `getVoteDetail` 첫 호출 직전에
  `supabase.rpc('expire_open_dilemmas')`를 호출한다. 작업은 idempotent.

### 서버 데이터 레이어

- `vote-feed.server.ts`: status filter를 `'open'` 그대로 유지하되, 호출 시작 부분에
  `expire_open_dilemmas()`를 await 후 진행. (마감된 행은 자연스럽게 피드에서 사라짐)
- `vote-detail.server.ts`: 호출 시작에 `expire_open_dilemmas()` 호출. select에서
  `status in ('open','closed')`로 허용해 마감된 페이지에 접근 가능하게 한다.
  반환 타입 `VoteDetailItem`에 `isClosed: boolean` 또는 `closesAt: string` 추가.
- `vote-actions.ts`
  - `castQuickVote`, `recordDetailVote`: dilemma 상태/마감 시각을 조회하거나
    insert 직전에 closes_at을 비교해 `now()` 이후이면 friendly 에러 반환.
  - `submitDetailComment`: 변경 없음(댓글은 마감 후에도 허용).

### UI

- `vote-card.tsx`: `isClosed`(또는 `closesAt`)를 받아 "마감됨" 배지 표시. 카드의
  투표 버튼은 숨기거나 비활성화.
- 상세 페이지: 마감 시 투표 영역에 안내 문구("마감된 투표입니다") + 버튼 비활성.
  댓글 영역은 그대로 노출.

## TDD

Red → Green → Refactor

1. `vote-actions` 테스트: 마감된 dilemma에 투표 시 error state 반환.
2. `vote-detail.server` 테스트: 마감된 dilemma 조회 시 `isClosed=true`.
3. `vote-feed.server` 테스트: 마감된 dilemma는 피드에서 제외.
4. `vote-card` 컴포넌트 테스트: `isClosed=true`일 때 배지 노출, 투표 버튼 비활성.
5. 마이그레이션 RLS 테스트: 'closed' 상태 dilemma도 anon/auth가 read 가능.

## Acceptance Criteria

- [ ] `dilemmas.closes_at` 컬럼이 존재하고 신규 행은 `now()+72h`로 자동 설정.
- [ ] 기존 행도 backfill 되어 `closes_at = created_at + 72h`.
- [ ] `expire_open_dilemmas()` 호출 후 `closes_at <= now()`이고 `status='open'`인
      행은 `status='closed'`가 된다.
- [ ] 피드에서는 마감된 dilemma가 보이지 않는다.
- [ ] 상세 페이지에서는 마감된 dilemma 접근 시 "마감됨" 표기 + 투표 불가.
- [ ] 댓글 작성은 마감 후에도 가능.
- [ ] 기존 RLS/뷰는 깨지지 않는다 (`pnpm test:rls` 통과).

## Test Cases

1. 신규 dilemma 생성 → 72시간 후 자동 마감, 피드에서 제거.
2. 마감 시 다른 사용자가 투표 시도 → friendly error 메시지.
3. 마감 후 댓글 작성 → 정상 등록.
4. 마감 후 작성자 본인이 페이지 진입 → "마감됨" 배지, 결과는 계속 조회 가능.
5. cron 없이 lazy update만으로도 동작(다른 사용자가 피드를 열면 자동 갱신).

## Out of scope

- 작성자가 수동으로 마감하는 버튼(추후 follow-up task).
- pg_cron 기반 주기적 expire.
- 마감 시각 연장/취소.

## References

- `supabase/migrations/202604250001_create_profiles_and_dilemmas.sql`
- `supabase/migrations/202604250008_create_vote_summary_view.sql`
- `apps/web/src/features/votes/vote-feed.server.ts`
- `apps/web/src/features/votes/vote-detail.server.ts`
- `apps/web/src/features/votes/vote-actions.ts`
