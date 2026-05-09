import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/features/auth/auth-actions";
import {
  isLifeStageValue,
  LIFE_STAGE_OPTIONS,
} from "@/features/onboarding/onboarding-trigger";
import { HomeIcon, PlusIcon, ProfileIcon } from "@/features/votes/icons";
import { getLoginHref } from "@/lib/redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const lifeStageLabels = new Map(LIFE_STAGE_OPTIONS.map((option) => [option.value, option.label]));

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(getLoginHref("/profile"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, life_stage, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const nickname = profile?.nickname ?? buildFallbackNickname(user.email, user.user_metadata);
  const lifeStage = getLifeStageLabel(profile?.life_stage);
  const joinedAt = profile?.created_at ? formatJoinedAt(profile.created_at) : "가입일 확인 중";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[360px] flex-col bg-[#f8fafc] text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
      <header className="flex h-14 items-center justify-center bg-white px-5">
        <h1 className="text-lg font-bold leading-[1.3]">프로필</h1>
      </header>

      <div className="flex-1 space-y-3 px-5 py-5 pb-28">
        <section className="rounded-2xl bg-white px-5 py-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e8fafa] text-2xl font-bold text-[#32cfc6]">
            {nickname.slice(0, 1)}
          </div>
          <h2 className="mt-4 text-xl font-bold leading-[1.3]">{nickname}</h2>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#64748b]">{lifeStage}</p>
          <p className="mt-1 text-xs leading-5 text-[#94a3b8]">{joinedAt}</p>
          <Link
            href="/profile/edit"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-[#dfe5ed] px-4 text-sm font-semibold text-[#475569] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            프로필 수정
          </Link>
        </section>

        <section className="rounded-2xl bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold leading-5 text-[#64748b]">총 절약 금액</p>
          <p className="mt-2 text-[28px] font-bold leading-[1.2] text-[#0f172a]">0원</p>
          <p className="mt-1 text-sm leading-5 text-[#94a3b8]">아직 참은 소비가 없어요.</p>
          <Link
            href="/report"
            className="mt-4 inline-flex text-sm font-semibold leading-5 text-[#32cfc6]"
          >
            소비 리포트 &gt;
          </Link>
        </section>

        <nav className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <ProfileLink href="/me/votes" label="내가 올린 투표" />
          <ProfileLink href="/me/votes" label="내가 선택한 투표" />
          <ProfileLink href="/me/votes" label="내가 남긴 한마디" />
        </nav>

        <form action={signOutAction}>
          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-white text-sm font-semibold text-[#94a3b8] shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            로그아웃
          </button>
        </form>
      </div>

      <BottomNavigation />
    </main>
  );
}

function ProfileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-14 items-center justify-between border-b border-[#f1f5f9] px-5 text-[15px] font-semibold leading-5 text-[#0f172a] last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#32cfc6]"
    >
      <span>{label}</span>
      <span className="text-[#94a3b8]" aria-hidden="true">
        &gt;
      </span>
    </Link>
  );
}

function BottomNavigation() {
  return (
    <nav aria-label="주요" className="sticky bottom-0 z-20 h-[86px] bg-white px-6 pt-3">
      <div className="mx-auto flex max-w-[320px] items-center justify-between">
        <Link
          href="/"
          className="flex w-[54px] flex-col items-center gap-1 rounded-xl text-xs leading-[1.3] text-[#94a3b8]"
        >
          <HomeIcon className="h-6 w-6" />
          투표
        </Link>
        <Link
          href="/votes/new"
          aria-label="투표 만들기"
          className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#32cfc6] bg-[#e8fafa] text-[#32cfc6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          <PlusIcon className="h-5 w-5" />
        </Link>
        <Link
          href="/profile"
          aria-current="page"
          className="flex w-[54px] flex-col items-center gap-1 rounded-xl text-xs font-semibold leading-[1.3] text-[#32cfc6]"
        >
          <ProfileIcon className="h-6 w-6" />
          프로필
        </Link>
      </div>
    </nav>
  );
}

function buildFallbackNickname(
  email: string | undefined,
  metadata: Record<string, unknown> | undefined,
) {
  const rawNickname =
    readMetadataString(metadata, "nickname") ??
    readMetadataString(metadata, "full_name") ??
    readMetadataString(metadata, "name") ??
    email?.split("@")[0] ??
    "PickIt user";

  const trimmed = rawNickname.trim();
  return trimmed.length >= 2 ? trimmed.slice(0, 24) : "PickIt user";
}

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function formatJoinedAt(value: string) {
  return `${new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value))} 가입`;
}

function getLifeStageLabel(value: string | null | undefined) {
  if (!value) {
    return "생활 단계 미설정";
  }

  return isLifeStageValue(value) ? (lifeStageLabels.get(value) ?? value) : value;
}
