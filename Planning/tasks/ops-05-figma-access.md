---
id: ops-05-figma-access
status: todo
sub: OPS
layer: ops
depends_on: []
estimate: 30m
demo_step: N/A
---

# Figma 접근과 화면 전달 프로세스

## Context

`STATE.md Decisions §Figma`에 따라 planning에는 Figma node-id를 고정 레퍼런스로 남기지 않는다. 각 `product-*` 태스크 착수 직전에 필요한 폰 화면 프레임만 다시 전달받는다. 이 태스크는 프로세스와 접근 권한을 미리 정비해, 제품 구현 시점에 병목이 생기지 않게 한다.

연결 문서:

- `ONE_PAGER.md §11 UI IA / Screen Map`
- `STATE.md Decisions §Figma`

## Out of scope

- 실제 화면 node-id 수집과 문서화 (구현 태스크에서 수행).
- Tailwind 토큰/디자인 시스템 확정 (현 시점엔 갭만 식별).

## Deliverables

- [ ] 개발자 계정이 Figma 파일에 최소 뷰어 권한을 가진다.
- [ ] Figma 파일 내 "화면 IA 섹션"과 "개별 폰 화면 프레임" 폴더가 구분돼 있다.
- [ ] product 태스크 착수 시 프레임 전달에 쓸 채널(슬랙/Notion) 합의.
- [ ] Tailwind 초기 토큰과 Figma 토큰 간 갭 목록 초안 작성.

## Handoff Checklist (각 product 태스크 착수 직전 반복)

- [ ] 대상 태스크에 필요한 폰 화면 프레임 3~5개 id 식별.
- [ ] 텍스트/아이콘/컬러 토큰 변경분 확인.
- [ ] 모달/토스트 등 인터랙션 프레임 별도 확인.
- [ ] 프레임 링크와 전제 조건을 해당 태스크의 "References"에 임시로 첨부.

## Acceptance Criteria

- [ ] 개발자가 Figma 파일을 열 수 있다.
- [ ] 전달 프로세스가 README 또는 STATE에 기록돼 있다.
- [ ] 토큰 갭 목록이 product 태스크 착수 전에 참고 가능한 곳에 있다.

## References

- `Planning/ONE_PAGER.md §11`
- `Planning/STATE.md Decisions §Figma`
