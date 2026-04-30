---
id: infra-05-anonymous-session
status: done
sub: INFRA
layer: infra
depends_on: [data-02-vote-comment-schema, infra-04-auth-providers]
estimate: 1.5h
demo_step: "비로그인 투표"
---

# 익명 투표 세션 미들웨어

## Context

`FR-V-2`는 로그인 없는 투표를 허용한다. 중복 투표 방지를 위해 익명 세션을 쿠키로 관리하고 `anonymous_sessions` row와 연결한다. 이 태스크는 쿠키 생성·읽기·DB 연결의 cross-cutting 기반이다.

연결 문서:

- `PRD.md FR-V-2`, `NFR-SEC-2`
- `ERD.md §3 anonymous_sessions, votes`
- `reviews/iteration-0.md §Blockers #3`

## Files

- `apps/web/src/lib/session/anonymous-session.ts` (create)
- `apps/web/src/lib/session/anonymous-session.test.ts` (create)
- `apps/web/middleware.ts` (update — 익명 세션 쿠키 세팅)
- `apps/web/src/lib/session/schema.ts` (create)

## Spec

### 쿠키

- 이름: `pickit_anon_sid`
- 속성: `httpOnly`, `secure`, `sameSite=lax`, `maxAge=180d`, path=`/`
- 값: 불투명 UUID v4 (원문 session_hash는 서버에서 해시 저장)

### DB 규칙

- 첫 요청 시 `anonymous_sessions` insert.
- `session_hash`는 쿠키 원문의 SHA-256 hex.
- row가 있으면 재사용.

### API

```ts
export async function getOrCreateAnonymousSessionId(): Promise<string>;
export async function getAnonymousSessionIdIfPresent(): Promise<string | null>;
```

### 사용 위치

- 투표 insert: `voter_id` 또는 `anonymous_session_id` 중 하나 필수(ERD 불변성).
- 인증 사용자는 익명 세션을 발급하지 않는다.

## TDD

1. Red: 쿠키가 없을 때 `getOrCreateAnonymousSessionId()`가 세션을 생성하고 쿠키를 세팅.
2. Green: 쿠키 헬퍼와 DB insert 구현.
3. Red: 쿠키가 있을 때 DB row가 재사용되고 새 row가 생기지 않음.
4. Green: `session_hash` lookup 구현.
5. Red: 인증 사용자는 익명 세션을 받지 않음.
6. Green: auth user guard 추가.

## Acceptance Criteria

- [ ] 쿠키가 없는 첫 요청이 세션을 생성한다.
- [ ] 동일 쿠키 재요청 시 DB row가 재사용된다.
- [ ] 해시된 `session_hash`가 저장된다(원문 저장 금지).
- [ ] 인증 사용자는 익명 세션을 발급받지 않는다.
- [ ] 쿠키는 `httpOnly` + `secure` 속성을 가진다.

## Test Cases

1. happy: 새 방문자가 첫 요청에서 세션 id를 받는다.
2. happy: 두 번째 요청이 같은 id를 반환한다.
3. edge: 만료된 쿠키 id가 DB에 없으면 새 세션을 생성한다.
4. permission: 인증 쿠키가 있으면 익명 세션은 생성되지 않는다.
5. security: 응답에 원문 session_hash가 노출되지 않는다.

## References

- `Planning/ERD.md §3 anonymous_sessions`
- `Planning/PRD.md FR-V-2, NFR-SEC-2`
