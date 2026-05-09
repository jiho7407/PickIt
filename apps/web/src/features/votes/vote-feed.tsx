import Link from "next/link";
import { signOutAction } from "@/features/auth/auth-actions";
import { LIFE_STAGE_OPTIONS, type LifeStageValue } from "@/features/onboarding/onboarding-trigger";
import { BellIcon, HomeIcon, PickItLogo, PlusIcon, ProfileIcon } from "./icons";
import { ScrollToTopButton } from "./scroll-to-top";
import { VoteCard, type VoteFeedItem } from "./vote-card";

export { type VoteFeedItem } from "./vote-card";

type VoteFeedProps = {
  items: VoteFeedItem[];
  quickVoteAction: (formData: FormData) => void | Promise<void>;
  activeStage?: LifeStageValue;
  isAuthenticated?: boolean;
};

type FilterOption = {
  value: LifeStageValue | null;
  label: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { value: null, label: "전체" },
  ...LIFE_STAGE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

function buildFilterHref(value: LifeStageValue | null): string {
  if (!value) {
    return "/";
  }
  return `/?stage=${value}`;
}

function EmptyFeed() {
  return (
    <section className="px-5 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8fafa] text-2xl font-semibold text-[#32cfc6]">
        +
      </div>
      <h2 className="mt-5 text-lg font-semibold leading-[1.3] text-[#0f172a]">
        아직 올라온 소비 고민이 없어요.
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#64748b]">
        첫 고민을 올리면 이곳에서 함께 투표할 수 있어요.
      </p>
    </section>
  );
}

function BottomNavigation() {
  return (
    <nav
      aria-label="주요"
      className="sticky bottom-0 z-20 h-[86px] bg-white px-6 pt-3"
    >
      <div className="mx-auto flex max-w-[320px] items-center justify-between">
        <Link
          href="/"
          aria-current="page"
          className="flex w-[54px] flex-col items-center gap-1 rounded-xl text-xs font-semibold leading-[1.3] text-[#32cfc6]"
        >
          <HomeIcon active className="h-6 w-6" />
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
          className="flex w-[54px] flex-col items-center gap-1 rounded-xl text-xs leading-[1.3] text-[#94a3b8]"
        >
          <ProfileIcon className="h-6 w-6" />
          프로필
        </Link>
      </div>
    </nav>
  );
}

export function VoteFeed({
  items,
  quickVoteAction,
  activeStage,
  isAuthenticated = false,
}: VoteFeedProps) {
  return (
    <main
      id="top"
      className="mx-auto min-h-dvh w-full max-w-[360px] bg-white text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]"
    >
      <header className="sticky top-0 z-10 bg-white">
        <div className="flex h-14 items-center justify-between px-5">
          <h1 className="sr-only">PICKIT</h1>
          <PickItLogo className="h-6 w-[85px]" />
          <div className="flex items-center gap-2">
            {isAuthenticated ?
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-1 text-sm font-semibold text-[#94a3b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
                >
                  로그아웃
                </button>
              </form>
            : <Link
                href="/login"
                className="rounded-full px-3 py-1 text-sm font-semibold text-[#32cfc6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
              >
                로그인
              </Link>
            }
            <Link
              href="/notifications"
              aria-label="알림"
              className="grid h-8 w-8 place-items-center rounded-full text-[#94a3b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
            >
              <BellIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div
          aria-label="생활 단계 필터"
          className="overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max gap-1">
            {FILTER_OPTIONS.map((filter) => {
              const isActive =
                filter.value === null ?
                  activeStage === undefined
                : activeStage === filter.value;

              return (
                <Link
                  key={filter.label}
                  href={buildFilterHref(filter.value)}
                  scroll={false}
                  aria-pressed={isActive}
                  className={`rounded-lg border px-3 py-2 text-sm leading-[1.3] ${
                    isActive ?
                      "border-[#64748b] bg-[#64748b] font-semibold text-white"
                    : "border-[#dfe5ed] bg-white text-[#64748b]"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {items.length > 0 ?
        <section aria-label="공개 투표 목록">
          {items.map((item) => (
            <VoteCard
              key={item.id}
              item={item}
              quickVoteAction={quickVoteAction}
              redirectTo={buildFilterHref(activeStage ?? null)}
            />
          ))}
        </section>
      : <EmptyFeed />}

      <ScrollToTopButton />

      <BottomNavigation />
    </main>
  );
}
