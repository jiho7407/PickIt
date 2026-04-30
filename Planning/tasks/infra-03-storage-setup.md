---
id: infra-03-storage-setup
status: done
sub: INFRA
layer: infra
depends_on: [infra-02-supabase-local-and-ci]
estimate: 1.5h
demo_step: "고민 작성(이미지)"
---

# Supabase Storage 버킷/정책

## Context

고민/A-B 옵션에 이미지 업로드 기능이 필요하다 (PRD `FR-D-3`, `FR-D-8`, NFR-SEC-4). Storage 버킷을 생성하고 업로드 정책과 크기/MIME 제한을 정의한다.

연결 문서:

- `PRD.md FR-D-3`, `NFR-SEC-4`
- `ERD.md §3 dilemmas.image_path, vote_options.image_path`

## Files

- `supabase/migrations/{timestamp}_create_storage_buckets.sql` (create)
- `supabase/config.toml` (update — storage 설정)
- `apps/web/src/lib/storage.ts` (create)
- `apps/web/src/lib/storage.test.ts` (create)

## Spec

### 버킷

- `dilemma-images` — 고민 대표 이미지
- `vote-option-images` — A/B 옵션 이미지

### 접근 정책

- 읽기: 공개(public) — MVP에서는 공개 버킷으로 시작
- 쓰기: authenticated user, 해당 author_id/owner_id 본인만

### 업로드 제한

- MIME: `image/jpeg`, `image/png`, `image/webp`
- 최대 크기: 5MB
- 경로 규칙: `{user_id}/{uuid}.{ext}`

### 클라이언트 유틸

```ts
export async function uploadDilemmaImage(file: File): Promise<{ path: string }>;
export async function getPublicUrl(path: string): string;
```

## TDD

1. Red: 5MB 초과 파일 업로드가 거부되는 테스트.
2. Green: `uploadDilemmaImage`에 size/MIME 검증.
3. Red: 다른 user_id 경로에 업로드 실패(RLS).
4. Green: Storage RLS policy 마이그레이션.

## Acceptance Criteria

- [ ] `dilemma-images`, `vote-option-images` 버킷이 존재한다.
- [ ] MIME/크기 제한이 클라이언트 및 서버 모두에서 적용된다.
- [ ] 다른 사용자 경로 업로드가 차단된다.
- [ ] 업로드된 파일의 공개 URL 조회 함수가 있다.
- [ ] Storage 기본 smoke test가 local에서 통과한다.

## Test Cases

1. happy: 2MB jpeg 업로드 성공.
2. edge: 6MB 파일 업로드 거부.
3. edge: `application/pdf` 업로드 거부.
4. permission: 다른 사용자 경로 업로드 거부.

## Decisions

1. MVP Storage 이미지는 공개 버킷으로 시작한다.
2. MVP에서는 MIME/크기 제한만 필수로 두고, 이미지 리사이징/변환은 후속으로 미룬다.

## References

- Supabase Storage docs: https://supabase.com/docs/guides/storage
- `Planning/PRD.md NFR-SEC-4`
