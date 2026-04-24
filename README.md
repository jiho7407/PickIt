# PickIt

PickIt은 구매 직전의 소비 고민을 투표와 짧은 의견으로 검증하고, 7일 뒤 실제
구매 여부를 기록해 소비 습관 데이터로 남기는 모바일 우선 웹 MVP다.

타겟은 한국 사용자다. 가격, 문구, 인증, 알림, UI 표현은 기본적으로 한국 시장과
한국어 사용자를 기준으로 설계한다.

## 현재 상태

현재 프로젝트는 구현 착수 단계다. `Planning/` 문서는 foundation 구현을 시작할
수 있는 수준으로 정리되어 있다. 다만 product 화면 작업은 앱 구조, Supabase,
인증, 투표 스키마의 기본 패턴이 잡힌 뒤 병렬화한다.

먼저 읽을 문서:

1. `AGENTS.md` - Codex, Claude Code, 사람 개발자가 공통으로 따를 구현 지침
2. `DEVELOPMENT_SPLIT.md` - 팀 분업, 합류 게이트, 병렬 작업 가능 시점
3. `Planning/STATE.md` - 현재 planning 상태와 task 실행 순서
4. `Planning/tasks/` - task 단위 구현 명세
5. `Planning/PRD.md`, `Planning/ERD.md` - 제품 요구사항과 데이터 계약

## 구현 원칙

- `Planning/tasks/*.md` task 하나를 브랜치 하나와 PR/merge 하나에 대응시킨다.
- foundation task는 순서대로 merge한다.
- product 작업은 `DEVELOPMENT_SPLIT.md`의 합류 게이트 이후 병렬화한다.
- deprecated task 파일은 active scope로 보지 않는다.
- task의 `Spec`, `Acceptance Criteria`, `Test Cases`를 현재 작업 범위로 본다.

초기 추천 브랜치:

```text
codex/infra-01-project-bootstrap
codex/infra-02-supabase-local-and-ci
codex/data-01-dilemma-schema
codex/data-02-vote-comment-schema
```

## 예상 개발 명령

아래 명령은 foundation task가 구현되면서 순차적으로 사용 가능해진다.

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm build
pnpm db:types
pnpm test:rls
pnpm test:e2e
uv sync
uv run pytest
```

아직 존재하지 않는 명령이 있다면, 새 convention을 임의로 추가하기 전에 현재
진행 중인 task와 foundation 진행 상태를 확인한다.

## 프로필/프론트엔드 담당자 안내

프로필 담당자는 먼저 `DEVELOPMENT_SPLIT.md`를 읽는다.

full 프로필 구현은 바로 시작하지 않는다. 프로필 영역은 auth, profile action,
vote/comment schema, "내 투표/한마디" 화면에 의존한다. 이 계약들이 안정화되기
전에 구현을 시작하면 재작업 가능성이 높다.

초기에 가능한 작업:

- Figma의 profile/consumption-record 화면 확인
- UI 메모와 컴포넌트 목록 정리
- 명시적으로 UI-only 브랜치로 합의된 경우에만 mocked props 기반 컴포넌트 작성

소민의 본격 작업은 `product-02-vote-detail-flow` merge 이후 시작한다. 작업 순서는
`product-03-my-votes-and-comments` → `product-05a-profile` →
`product-05b-consumption-records` → `product-06-notifications-and-errors`다.

## 한국 서비스 기준

- 기본 통화 표기는 KRW 기준이다.
- UI copy는 한국어를 기본으로 작성한다.
- 로그인 1차 수단은 Google이며, Kakao는 env flag로 준비 후 조건이 맞을 때
  활성화한다.
- MVP에서 카카오톡 실제 알림 발송은 제외한다. 앱 내 알림 후보와 수동 운영
  후보까지만 구현한다.
- 개인정보와 auth id, 이메일은 공개 화면에 노출하지 않는다.
