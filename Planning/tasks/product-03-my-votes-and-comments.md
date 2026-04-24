---
id: product-03-my-votes-and-comments
status: todo
sub: FE
layer: product
depends_on: [product-02-vote-detail-flow, data-02-vote-comment-schema]
estimate: 2h
demo_step: "나의투표/댓글 관리"
---

# 나의 투표와 한마디 관리

## Context

사용자는 자신이 만든 투표, 참여한 투표, 작성한 vote-linked 한마디를 확인하고 필요한 경우 삭제할 수 있어야 한다. 독립 댓글 스레드 작성은 MVP 범위 밖이다.

## Files

- `apps/web/app/me/votes/page.tsx` (create)
- `apps/web/src/features/me/my-vote-list.tsx` (create)
- `apps/web/src/features/comments/vote-comment-form.tsx` (update/reuse from `product-02`)
- `apps/web/src/features/comments/comment-actions.ts` (create — authenticated author delete only)

## Spec

- 내가 만든 투표 목록
- 내가 참여한 투표 목록
- 작성한 vote-linked 한마디 목록
- 내 한마디 삭제
- 내 투표 삭제
- 익명 한마디는 MVP에서 내 목록/삭제 대상에 포함하지 않는다.

## TDD

1. Red: 내 투표 목록이 작성자 기준으로 필터링되는 테스트.
2. Green: 목록 query/action 구현.
3. Red: 내 vote-linked 한마디만 삭제할 수 있는 테스트.
4. Green: 삭제 action과 권한 에러 매핑.

## Acceptance Criteria

- [ ] 내가 만든 투표 목록이 있다.
- [ ] 내가 작성한 vote-linked 한마디 목록이 있다.
- [ ] 내 한마디 삭제가 가능하다.
- [ ] 내 투표 삭제가 가능하다.
- [ ] 다른 사용자의 한마디/투표는 삭제할 수 없다.

## Test Cases

1. happy: 내 투표가 목록에 표시된다.
2. happy: 내가 작성한 한마디가 목록에 표시된다.
3. permission: 남의 한마디 삭제는 실패한다.
4. permission: 남의 투표 삭제는 실패한다.

## References

- `../ERD.md comments`
