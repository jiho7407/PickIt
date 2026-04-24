# Iteration 0 Review

## Scope

참조 프로젝트 `/Users/zyo/Programming/2026/Ampersand/Buidlweek_NearAI/planning`의 planning 구조를 PickIt에 적용했다.

검토 대상:

- `README.md`
- `ONE_PAGER.md`
- `PRD.md`
- `ERD.md`
- `STATE.md`
- `tasks/`

## What Improved

1. **진입 순서 명확화** — README가 `ONE_PAGER → PRD → ERD → STATE → tasks` 순서를 안내한다.
2. **제품 범위 선명화** — MVP IN/OUT과 완료 기준이 `ONE_PAGER.md`에 들어갔다.
3. **FR/NFR 분리** — PRD에서 기능 요구사항과 비기능 요구사항을 ID로 추적할 수 있다.
4. **DB/RLS 기준점 생성** — ERD가 Supabase 테이블, 제약, RLS 초안을 정의한다.
5. **구현 순서 초안** — STATE가 Phase 1~4 topological draft를 가진다.
6. **TDD 태스크화 시작** — 주요 data/product/test 태스크에 Red-Green-Refactor, acceptance criteria, test cases가 있다.

## Current Gaps

### Blockers Before Implementation

1. **Figma 레퍼런스 정책 정리 필요**
   - Figma에서 임시 그룹을 만들고 풀며 화면을 전달받는 방식이므로 node-id를 고정 레퍼런스로 남기면 안 된다.
   - Planning은 화면 IA와 구현 태스크만 고정하고, 실제 node-id는 개발 직전에 필요한 화면별로 다시 읽는다.
   - 섹션 단위는 흐름 파악용, 개별 폰 화면 프레임은 구현 스펙 추출용으로 사용한다.

2. **인증 정책 미확정**
   - PRD는 "고민 작성자는 인증 사용자"로 가정한다.
   - 원본 메모에는 "고민 올릴 때 로그인 유도"로 적혀 있어 UX 정책을 확정해야 한다.

3. **익명 투표 방식 미확정**
   - ERD는 `anonymous_sessions`를 둔다.
   - 실제 생성 방식(cookie, signed token, DB row 생성 시점)이 아직 태스크에 충분히 구체화되지 않았다.

### Major

4. **Supabase local/CI 태스크가 아직 얕다**
   - 실제 명령, CI 환경 변수, type generation 흐름을 더 구체화해야 한다.

5. **Storage 정책 미정**
   - 이미지 업로드가 P1이지만, 공개 버킷 vs signed URL이 미정이다.

6. **운영자/알림 후보는 PRD에 있으나 태스크가 없다**
   - MVP에서 수동 운영으로 남길지, 최소 query만 만들지 결정 필요.

### Minor

7. `Planning` 대문자 폴더를 유지할지, 참조처럼 `planning` 소문자로 맞출지 결정 필요.
8. 기존 `00_*` 문서와 신규 `ONE_PAGER/PRD/ERD` 사이 중복 내용이 있다. 당장은 보조 문서로 유지해도 된다.

## Verdict

**NOT READY FOR IMPLEMENTATION.**

구조는 참조 프로젝트와 유사한 운영형 planning으로 이동했다. 다만 참조 프로젝트가 가진 "개발만 하면 될 퀄리티"에는 아직 못 미친다. 다음 iteration에서는 화면 IA 기준 태스크 재분해, 인증/익명 투표 정책 확정, Supabase local/CI 태스크 구체화가 필요하다.

## Recommended Next Iteration

1. 화면 IA를 기준으로 `product-*` 태스크를 재분해한다. Figma node-id는 개발 직전에만 연결한다.
2. 인증/익명 투표 정책을 `STATE.md Open Questions`에서 닫는다.
3. `infra-02`, `data-*` 태스크를 migration SQL 수준까지 구체화한다.
4. 리뷰 iteration-1에서 PRD/ERD/tasks 간 용어 드리프트를 잡는다.
