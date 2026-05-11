---
id: bug-01-create-vote-duplicate-submission
status: todo
sub: FE
layer: product
depends_on: [product-04-create-vote-flow]
estimate: 30m
demo_step: "투표 만들기 — 빠른 더블 클릭 시에도 1개만 생성"
---

# 투표 만들기에서 중복 제출 방지

## Context

사용자 보고: "글 올릴 때 여러 개씩 업로드됨".

`apps/web/src/features/votes/create-vote-form.tsx`의 폼은
`useActionState`를 사용하지만 세 번째 반환값 `isPending`을 받지 않는다.
마지막 단계의 `BottomAction`(type=`submit`) 버튼은 입력 유효성
(`!canSubmit`)으로만 disabled되므로, 사용자가 "투표 업로드하기"를
빠르게 두 번 누르거나 네트워크가 느려 응답이 늦어질 경우 server action
`createVote`가 여러 번 호출되어 `dilemmas` 행이 중복으로 INSERT된다.
서버 액션에는 idempotency 키, unique constraint, dedupe 로직이 없어
완전히 사용자 입력에 의존한다.

## Files

- `apps/web/src/features/votes/create-vote-form.tsx` (edit)
- `apps/web/src/features/votes/create-vote-form.test.tsx` (edit)

## Spec

- `useActionState(action, initialActionState)`를 `[state, formAction, isPending]`
  형태로 받는다.
- 마지막 단계의 submit `BottomAction` `disabled`를 `!canSubmit || isPending`으로
  변경한다.
- 업로드 중과 동일한 표기 패턴을 유지하되, 라벨은 그대로 "투표 업로드하기"로 둔다.
- 사용자 안내 문구나 추가 토스트는 추가하지 않는다(스코프 최소화).

## TDD

Red

- `CreateVoteForm`에 in-flight action을 흉내내는 mock(예: `vi.fn()`이
  `new Promise(() => {})`를 반환)으로 submit 후 두 번 클릭한다.
- `action`이 1회만 호출되는 것을 기대해 실패시킨다.

Green

- `isPending`을 사용해 submit 버튼을 비활성화한다.

Refactor

- 다른 step의 "다음" 버튼은 변경하지 않는다(서버 액션과 무관).

## Acceptance Criteria

- [ ] submit 버튼을 빠르게 두 번 클릭해도 `createVote`가 1회만 호출된다.
- [ ] 기존 폼 유효성/스텝 전환 동작은 변하지 않는다.
- [ ] `pnpm --filter web test create-vote-form` 통과.

## Test Cases

1. happy path: submit 클릭 1회 → action 1회 호출.
2. 중복 클릭: pending 동안 추가 클릭은 무시 → action 1회 호출.
3. action이 error로 끝난 경우: 사용자는 다시 submit 가능.

## References

- `apps/web/src/features/votes/create-vote-form.tsx:630`
- `apps/web/src/features/votes/create-vote-actions.ts`
- React 19 `useActionState` 반환값
