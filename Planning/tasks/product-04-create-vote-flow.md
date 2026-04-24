---
id: product-04-create-vote-flow
status: todo
sub: FE
layer: product
depends_on: [data-01-dilemma-schema, data-02-vote-comment-schema, infra-03-storage-setup, infra-04-auth-providers]
estimate: 2h
demo_step: "투표 만들기"
---

# 투표 만들기 플로우

## Context

사용자가 직접 소비 고민 투표를 만든다. MVP의 핵심 생성 플로우이며, 살지/말지와 A/B 투표 타입을 모두 고려한다.

## Files

- `apps/web/app/votes/new/page.tsx` (create)
- `apps/web/src/features/votes/create-vote-form.tsx` (create)
- `apps/web/src/features/votes/create-vote-actions.ts` (create)
- `apps/web/src/features/votes/create-vote-schema.ts` (create)

## Spec

### VoteType

```ts
type VoteType = "buy_skip" | "ab";
```

### buy_skip fields

- title
- productName
- price
- category
- situation
- imagePath

### ab fields

- title
- optionAName
- optionBName
- optionAPrice
- optionBPrice
- optionAImagePath
- optionBImagePath
- situation

### 생성 규칙

- 작성자는 authenticated user여야 한다.
- 생성된 dilemma의 기본 status는 `open`이다.
- `ab` 타입은 `vote_options.position = 1, 2` row를 같은 transaction/server action에서 생성한다.

## TDD

1. Red: 투표 타입을 선택하지 않으면 다음 단계로 갈 수 없다.
2. Green: 타입 선택 UI 구현.
3. Red: buy_skip 필수 필드 validation.
4. Green: 생성 action 구현.
5. Red: ab 옵션 validation.
6. Green: A/B 스키마 구현.

## Acceptance Criteria

- [ ] 살지/말지 투표를 만들 수 있다.
- [ ] A/B 투표를 만들 수 있다.
- [ ] 필수 필드 validation이 있다.
- [ ] 생성 후 상세 화면으로 이동한다.
- [ ] A/B 생성 시 두 개의 vote_options가 함께 생성된다.
- [ ] Figma 구현 시점에 만들기 화면 프레임들을 다시 확인한다.

## Test Cases

1. happy: buy_skip 투표 생성 성공.
2. happy: A/B 투표 생성 성공.
3. edge: 가격 0원은 거부.
4. edge: A/B 옵션명이 비어 있으면 거부.

## References

- `Planning/PRD.md FR-D-1~6`
