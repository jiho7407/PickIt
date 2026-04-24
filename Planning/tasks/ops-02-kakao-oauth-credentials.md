---
id: ops-02-kakao-oauth-credentials
status: deferred
sub: OPS
layer: ops
depends_on: []
estimate: 1h
demo_step: N/A
---

# Kakao OAuth 자격증명 확보 (Deferred)

## Context

PickIt의 1차 로그인 수단은 Google이다(`STATE.md Decisions §Auth`). Kakao는 `NEXT_PUBLIC_AUTH_KAKAO_ENABLED` env flag로 비활성 상태에서 준비만 해두고, 키 확보 및 지표 확인 후 활성화한다. MVP에서 실제 Kakao 알림톡 발송은 범위 밖(`ONE_PAGER.md §7 OUT`).

## Out of scope

- 코드 작업 없음.
- Kakao 알림톡(`crm.md`) 발송은 별도 과제.

## Deliverables

- [ ] Kakao Developers 앱 등록 (개인 또는 비즈 채널)
- [ ] 플랫폼에 Web 도메인 추가 (preview 도메인 포함)
- [ ] Redirect URI에 Supabase callback 등록:
  - `{SUPABASE_PROJECT_URL}/auth/v1/callback`
- [ ] 동의항목(이메일/닉네임 등) 범위 확정
- [ ] `KAKAO_OAUTH_CLIENT_ID`, `KAKAO_OAUTH_CLIENT_SECRET` 발급 및 비밀 저장소 보관
- [ ] Supabase preview project Auth → Kakao provider 연결
- [ ] `NEXT_PUBLIC_AUTH_KAKAO_ENABLED=true` 전환 여부 판단 및 문서화

## Activation Trigger

다음 조건 중 하나를 만족할 때 이 태스크를 `todo`로 전환한다:

- Google 로그인 기준 주간 활성 사용자가 100명을 넘었다.
- 제품 오너가 Kakao 로그인을 MVP 범위로 재지정했다.

## Acceptance Criteria (활성화 시)

- [ ] Kakao provider로 수동 로그인 테스트가 통과한다.
- [ ] env flag를 true로 바꿨을 때만 UI에 버튼이 노출된다.

## References

- Supabase Auth — Kakao: https://supabase.com/docs/guides/auth/social-login/auth-kakao
- Kakao Developers: https://developers.kakao.com/docs/latest/ko/kakaologin/common
