---
id: product-05a-profile
status: todo
sub: FE
layer: product
depends_on: [product-03-my-votes-and-comments]
estimate: 1.5h
demo_step: "프로필"
---

# 기본 프로필 화면

## Context

프로필은 사용자 기록 허브의 허브 화면이다. 이 태스크는 기본 프로필(닉네임, 생활 단계, 내 목록 진입)만 다룬다. 소비기록/회고는 `product-05b`로 분리한다.

연결 문서:

- `ONE_PAGER.md §11`
- `PRD.md FR-A-1`, `§2 사용자`

## Files

- `apps/web/app/profile/page.tsx` (create)
- `apps/web/src/features/profile/profile-summary.tsx` (create)
- `apps/web/src/features/profile/profile-summary.test.tsx` (create)
- `apps/web/src/features/profile/edit-profile-form.tsx` (create)

## Spec

- 기본 프로필: 닉네임, 생활 단계, 가입일.
- 내 투표/내 댓글/소비기록으로 이동하는 진입점 4개.
- 비로그인 접근 시 로그인 유도로 리다이렉트.
- 닉네임 편집(2~24자, Zod 검증) — 인라인 또는 모달.

## TDD

1. Red: 프로필 요약이 사용자 정보를 렌더링하는 테스트.
2. Green: `ProfileSummary` 구현.
3. Red: 비로그인 접근 시 로그인 유도 테스트.
4. Green: 서버 가드 추가.
5. Red: 닉네임 1글자 저장 시 에러.
6. Green: Zod + form error 연결.

## Acceptance Criteria

- [ ] 프로필 요약 화면이 있다.
- [ ] 내 투표/댓글/소비기록 진입 링크가 있다.
- [ ] 비로그인 사용자는 로그인 유도로 이동한다.
- [ ] 닉네임 수정이 Zod 검증과 함께 동작한다.
- [ ] Figma 구현 시점에 프로필 화면 프레임을 다시 확인한다.

## Test Cases

1. happy: 프로필 정보가 표시된다.
2. happy: 내 투표 링크가 `/me/votes`로 이동한다.
3. edge: 닉네임 1자 저장 시 form error.
4. permission: 비로그인 사용자는 로그인 화면으로 리다이렉트.

## References

- `Planning/ERD.md §3 profiles`
