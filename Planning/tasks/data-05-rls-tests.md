---
id: data-05-rls-tests
status: todo
sub: QA
layer: data
depends_on: [data-01-dilemma-schema, data-02-vote-comment-schema, data-03-followup-schema, data-04-vote-summary-views, infra-03-storage-setup, infra-05-anonymous-session]
estimate: 2h
demo_step: "권한 회귀 방지"
---

# RLS 통합 테스트 스위트

## Context

`infra-02`는 "RLS integration test는 후속 data 태스크에서 추가한다"고 연기했다. data/infra 스키마가 안정된 이 지점에서 모든 RLS 정책을 한 번에 회귀 테스트한다(`NFR-SEC-3`).

연결 문서:

- `PRD.md NFR-SEC-3, FR-A-3`
- `ERD.md §5 RLS`
- `STATE.md Quality Gate — 데이터/RLS`

## Files

- `apps/web/tests/rls/dilemmas.rls.test.ts` (create)
- `apps/web/tests/rls/votes.rls.test.ts` (create)
- `apps/web/tests/rls/comments.rls.test.ts` (create)
- `apps/web/tests/rls/followups.rls.test.ts` (create)
- `apps/web/tests/rls/storage.rls.test.ts` (create)
- `apps/web/tests/rls/fixtures.ts` (create)
- `scripts/qa/reset_rls_fixtures.ts` (create)

## Spec

### 접근 방식

- Supabase local에서 service role로 fixture를 seed.
- 각 역할별 client(`anon`, `user_a`, `user_b`, `operator`)를 준비.
- 각 정책을 `allow`/`deny` 기대값으로 단언.

### 커버리지

#### dilemmas
- 공개 상태 select: anon/user_b 허용
- draft/archived select: 작성자만
- insert: authenticated + `auth.uid() = author_id`
- update/delete: 작성자만

#### votes
- insert: authenticated user 또는 valid anonymous session
- 작성자 자기 투표 금지
- 중복 투표 금지 (unique constraint)
- update/delete: MVP에서는 disallow

#### comments
- insert: authenticated 또는 vote-linked anonymous
- delete: author only
- 다른 사용자의 comment delete 거부

#### followups
- insert: `auth.uid() = author_id`
- 작성자가 아닌 사용자의 insert 거부
- 한 dilemma에 하나만 insert 가능

#### storage (dilemma-images, vote-option-images)
- 다른 사용자 경로 업로드 거부
- 공개 읽기 허용 (MVP 공개 버킷 가정)

## TDD

1. Red: 각 파일별 핵심 deny 케이스부터 작성.
2. Green: RLS policy 또는 fixture 보강.
3. Refactor: 공용 fixture 헬퍼 분리.

## Acceptance Criteria

- [ ] 5개 RLS 테스트 파일이 local Supabase에 연결돼 실행된다.
- [ ] 각 파일당 allow/deny 케이스가 모두 있다.
- [ ] 실행 커맨드가 `pnpm test:rls`로 문서화된다.
- [ ] CI에서 선택적으로 실행되거나, 최소 로컬 실행 방법이 기술돼 있다.

## Test Cases

1. deny: user_b가 user_a의 dilemma update 시도 → 거부.
2. deny: 작성자가 자기 dilemma에 vote insert → 거부.
3. deny: 중복 anonymous vote insert → unique 제약 위반.
4. deny: 다른 사용자의 comment delete → 거부.
5. deny: 비작성자의 followup insert → 거부.
6. allow: anon이 open dilemma select → 허용.
7. deny: user_b가 user_a 경로에 storage 업로드 → 거부.

## References

- `Planning/ERD.md §5`
- Supabase RLS testing: https://supabase.com/docs/guides/database/postgres/row-level-security
