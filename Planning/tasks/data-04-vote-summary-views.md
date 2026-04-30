---
id: data-04-vote-summary-views
status: done
sub: BE
layer: data
depends_on: [data-02-vote-comment-schema, data-03-followup-schema]
estimate: 1.5h
demo_step: "결과/운영 조회"
---

# 투표 요약 View와 후보 조회 RPC

## Context

`ERD.md §4`가 정의한 집계 view와 RPC가 실제로 만들어져야 한다. 투표 비율 표시, 회고 후보 조회, 알림 후보 조회는 뷰/함수를 통해 일관되게 제공된다.

연결 문서:

- `PRD.md FR-V-3`, `FR-F-1`, `FR-N-1`, `FR-N-2`
- `ERD.md §4, §6`

## Files

- `supabase/migrations/{timestamp}_create_vote_summary_view.sql` (create)
- `supabase/migrations/{timestamp}_create_followup_candidate_rpc.sql` (create)
- `supabase/migrations/{timestamp}_create_notification_candidate_rpcs.sql` (create)
- `apps/web/src/features/votes/summary.server.ts` (create — view 조회)
- `apps/web/src/features/votes/summary.integration.test.ts` (create)

## Spec

### View: `dilemma_vote_summaries`

| 컬럼 | 타입 |
| --- | --- |
| dilemma_id | uuid |
| buy_count | int |
| skip_count | int |
| option_a_count | int |
| option_b_count | int |
| total_count | int |
| buy_ratio | numeric |
| skip_ratio | numeric |

### RPC: `get_followup_candidates(now_ts timestamptz)`

- 목적: 현재 authenticated author의 프로필/소비기록 회고 prompt.
- 조건: `dilemmas.author_id = auth.uid()` AND `dilemmas.followup_due_at <= now_ts` AND 상태가 `open|decided|followup_due` AND 해당 dilemma의 followups row 없음.
- 반환: dilemma 요약 + due 경과 일수.

### RPC: `get_my_notification_candidates()`

- 목적: 현재 authenticated author의 앱 내 알림 화면.
- `FR-N-1`: 내 고민 중 투표 수가 임계값(예: 10) 이상인 open 고민.
- `FR-N-2`: 내 고민 중 followup_due 경과 고민.
- 반환: `{ kind: 'result' | 'followup', dilemma_id, author_id }`.

### RPC: `get_operator_notification_candidates()`

- `FR-N-1`: 투표 수가 임계값(예: 10) 이상인 open 고민.
- `FR-N-2`: followup_due 경과 고민.
- 반환: `{ kind: 'result' | 'followup', dilemma_id, author_id }`.

### 권한

- view select: public (open/decided/followup_due/followed_up 상태만 노출)
- `get_followup_candidates`, `get_my_notification_candidates`: authenticated user 본인 `author_id` 범위만 반환.
- `get_operator_notification_candidates`: `security definer` + `profiles.role = 'operator'` 확인, 또는 service role 전용 admin endpoint에서만 호출.
- 운영자 role 판별 기준은 `profiles.role in ('user', 'operator')`이다.

## TDD

1. Red: 투표 3 buy / 1 skip 시 view가 75/25를 반환.
2. Green: view SQL 작성.
3. Red: 8일 전 생성된 고민 + followups 없음 → 후보에 포함.
4. Green: RPC 구현.
5. Red: 같은 고민에 followup이 있으면 후보에서 제외.
6. Refactor: 인덱스 점검.

## Acceptance Criteria

- [ ] `dilemma_vote_summaries` view가 있다.
- [ ] `get_followup_candidates` RPC가 있다.
- [ ] `get_my_notification_candidates` RPC가 있다.
- [ ] `get_operator_notification_candidates` RPC가 있다.
- [ ] view/RPC를 호출하는 integration test가 통과한다.
- [ ] 임계값은 상수 또는 파라미터로 분리돼 있다.
- [ ] 운영자 전용 RPC는 비운영자 호출이 차단된다.

## Test Cases

1. happy: buy=3/skip=1 → 75/25.
2. edge: 투표 0건 → 0/0/0.
3. happy: `followup_due_at` 과거 + followup 없음 → 후보 포함.
4. edge: followup이 이미 있는 dilemma → 제외.
5. permission: user_a의 `get_followup_candidates`는 user_b의 dilemma를 반환하지 않는다.
6. permission: 비운영자가 operator notification RPC 호출 시 차단.

## References

- `../ERD.md §4, §6`
- `../PRD.md §4.5`
