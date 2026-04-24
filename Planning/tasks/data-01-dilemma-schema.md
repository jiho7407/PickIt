---
id: data-01-dilemma-schema
status: todo
sub: BE
layer: data
depends_on: [infra-02-supabase-local-and-ci]
estimate: 2h
demo_step: "고민 작성"
---

# 고민/프로필 스키마

## Context

MVP의 시작점은 사용자가 소비 고민을 작성하고 공개하는 것이다. `profiles`와 `dilemmas` 테이블, 기본 RLS, seed 데이터를 먼저 만든다.

연결 문서:

- `ONE_PAGER.md §6`
- `PRD.md FR-D-1~6`
- `ERD.md §3 profiles, dilemmas`

## Files

- `supabase/migrations/{timestamp}_create_profiles_and_dilemmas.sql` (create)
- `supabase/seed.sql` (create/update)
- `apps/web/src/lib/database.types.ts` (generate)
- `apps/web/src/features/dilemmas/schema.ts` (create)
- `apps/web/src/features/dilemmas/schema.test.ts` (create)

## Spec

### Zod schema

```ts
export const createDilemmaSchema = z.object({
  voteType: z.enum(["buy_skip", "ab"]).default("buy_skip"),
  title: z.string().min(2).max(80),
  productName: z.string().min(1).max(80),
  price: z.number().int().positive(),
  category: z.string().min(1).max(40),
  situation: z.string().min(10).max(1000),
  imagePath: z.string().nullable().optional()
});
```

### DB constraints

- `price > 0`
- `profiles.role in ('user', 'operator')`, default `'user'`
- `vote_type in ('buy_skip', 'ab')`
- `status in ('draft', 'open', 'decided', 'followup_due', 'followed_up', 'archived')`
- `followup_due_at = created_at + interval '7 days'` 또는 insert 시 기본값 처리

### RLS

- 공개 상태 고민은 누구나 읽을 수 있다.
- insert는 authenticated user만 가능하다.
- update/delete는 작성자만 가능하다.

## TDD

1. Red: `createDilemmaSchema`가 0원 가격을 거부하는 테스트 작성.
2. Green: Zod schema 구현.
3. Red: RLS 테스트에서 다른 사용자가 update할 수 없음을 검증.
4. Green: migration RLS policy 구현.
5. Refactor: schema와 DB constraint 이름 정리.

## Acceptance Criteria

- [ ] migration이 `profiles`, `dilemmas`를 생성한다.
- [ ] `profiles.role`이 기본 사용자와 운영자를 구분한다.
- [ ] RLS가 활성화되어 있다.
- [ ] 공개 고민 select policy가 있다.
- [ ] 작성자 insert/update/delete policy가 있다.
- [ ] Zod schema unit test가 통과한다.
- [ ] Supabase type generation이 가능하다.

## Test Cases

1. happy: 인증 사용자가 유효한 고민을 생성한다.
2. edge: `price = 0`이면 schema와 DB 모두 거부한다.
3. edge: `situation`이 10자 미만이면 schema가 거부한다.
4. permission: 다른 사용자는 고민을 수정할 수 없다.
5. permission: 비로그인 사용자는 공개 고민을 읽을 수 있다.

## References

- `Planning/ERD.md §3`
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
