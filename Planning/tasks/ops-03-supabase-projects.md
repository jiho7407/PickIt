---
id: ops-03-supabase-projects
status: done
sub: OPS
layer: ops
depends_on: []
estimate: 45m
demo_step: N/A
---

# Supabase 원격 프로젝트 준비

## Context

`infra-02-supabase-local-and-ci`는 CLI 기반 local 개발을 커버한다. 하지만 `infra-06-deployment-preview`에서 preview URL로 데모를 하려면 원격 Supabase project가 필요하다. 이 태스크는 원격 project 생성, 키 확보, migration 적용 경로를 준비한다.

연결 문서:

- `infra-06-deployment-preview`
- `ERD.md §7 마이그레이션 순서`

## Out of scope

- 코드 작업 없음.
- prod 공개 전 도메인/보안 감사 항목은 후속.

## Deliverables

- [x] Supabase organization 확인 또는 생성
- [x] `pickit-preview` project 생성 (리전: 가장 가까운 AP 리전)
- [x] DB 비밀번호, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 확보 후 팀 비밀 저장소 보관
- [ ] Auth redirect URL allow list에 Vercel preview 도메인 추가
- [x] Supabase Storage 버킷 공개 설정이 `infra-03-storage-setup` 정책과 일치하는지 확인
- [x] `supabase link` 절차와 `supabase db push` 흐름을 README에 문서화
- [ ] (선택) `pickit-prod` project 네이밍 예약 — 실 공개 전 결정

## Acceptance Criteria

- [x] preview project URL과 3개 키가 비밀 저장소에 있다.
- [x] 로컬에서 `supabase link --project-ref {ref}` → `supabase db push`가 성공한다.
- [x] preview project가 local과 동일한 migration set으로 부팅된다.
- [x] service role key 취급 규칙(클라이언트 노출 금지)이 README에 적혀 있다.

## Completion Notes

- Project URL: `https://iuqfujdccqqekwuzoknk.supabase.co`
- Project ref: `iuqfujdccqqekwuzoknk`
- `supabase migration list` confirmed local and remote migrations match through `202604260001`.
- Remote smoke checks:
  - `dilemmas` REST endpoint: HTTP 200
  - `dilemma-images` storage bucket: HTTP 200
- Vercel preview redirect URL is still pending `ops-04-vercel-project`.

## References

- Supabase project management: https://supabase.com/docs/guides/platform
- Supabase migrations: https://supabase.com/docs/guides/deployment/database-migrations
