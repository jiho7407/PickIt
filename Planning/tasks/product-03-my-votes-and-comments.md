---
id: product-03-my-votes-and-comments
status: todo
sub: FE
layer: product
depends_on: [product-02-vote-detail-flow]
estimate: 2h
demo_step: "나의투표/댓글 관리"
---

# 나의 투표와 댓글 관리

## Context

사용자는 자신이 만든 투표, 참여한 투표, 작성한 댓글을 확인하고 필요한 경우 삭제할 수 있어야 한다.

## Files

- `apps/web/app/me/votes/page.tsx` (create)
- `apps/web/src/features/me/my-vote-list.tsx` (create)
- `apps/web/src/features/comments/comment-form.tsx` (create)
- `apps/web/src/features/comments/comment-actions.ts` (create)

## Spec

- 내가 만든 투표 목록
- 내가 참여한 투표 목록
- 댓글 작성
- 댓글 삭제
- 내 투표 삭제

## TDD

1. Red: 내 투표 목록이 작성자 기준으로 필터링되는 테스트.
2. Green: 목록 query/action 구현.
3. Red: 내 댓글만 삭제할 수 있는 테스트.
4. Green: 삭제 action과 권한 에러 매핑.

## Acceptance Criteria

- [ ] 내가 만든 투표 목록이 있다.
- [ ] 댓글 작성 UI가 있다.
- [ ] 내 댓글 삭제가 가능하다.
- [ ] 내 투표 삭제가 가능하다.
- [ ] 다른 사용자의 댓글/투표는 삭제할 수 없다.

## Test Cases

1. happy: 내 투표가 목록에 표시된다.
2. happy: 댓글 작성 후 목록에 표시된다.
3. permission: 남의 댓글 삭제는 실패한다.
4. permission: 남의 투표 삭제는 실패한다.

## References

- `Planning/ERD.md comments`
