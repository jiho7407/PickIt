import Link from "next/link";
import { VoteCard, type VoteFeedItem } from "./vote-card";

/* eslint-disable @next/next/no-img-element */

export { type VoteFeedItem } from "./vote-card";

type VoteFeedProps = {
  items: VoteFeedItem[];
  quickVoteAction: (formData: FormData) => void | Promise<void>;
};

const filters = ["전체", "고등학생", "대학생", "취준생", "직장인"];
const PICKIT_LOGO = "https://www.figma.com/api/mcp/asset/782f5faa-889b-441f-99d0-0545f797a017";
const BELL_ICON = "https://www.figma.com/api/mcp/asset/f31251e5-12ad-4fee-a6f3-7556ae0b2d49";
const HOME_ICON_MAIN = "https://www.figma.com/api/mcp/asset/1573f5f7-aef4-46d8-a1b3-d33141c8d932";
const HOME_ICON_DOT = "https://www.figma.com/api/mcp/asset/19146451-b2b0-495f-b399-31a5bc37b318";
const PLUS_ICON = "https://www.figma.com/api/mcp/asset/c7b91d85-8c44-4cd0-b865-2c64024ab060";
const PROFILE_ICON_MAIN = "https://www.figma.com/api/mcp/asset/ee7aabe6-9f0a-479b-8cf2-81e6173ea025";
const PROFILE_ICON_FACE = "https://www.figma.com/api/mcp/asset/c0fae41d-48f5-454a-b923-520810527ec8";
const TOP_ARROW_HEAD = "https://www.figma.com/api/mcp/asset/fc7cb968-9523-461d-b0dd-b43b28b12ac5";
const TOP_ARROW_STEM = "https://www.figma.com/api/mcp/asset/10313e44-c973-44f8-91d9-07ff51ed7f3d";

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
          <span className="relative h-6 w-6">
            <img src={HOME_ICON_MAIN} alt="" aria-hidden="true" className="absolute left-0 top-0 h-[20px] w-[20px]" />
            <img src={HOME_ICON_DOT} alt="" aria-hidden="true" className="absolute left-[13px] top-[13px] h-[7px] w-[7px]" />
          </span>
          투표
        </Link>
        <Link
          href="/votes/new"
          aria-label="투표 만들기"
          className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#32cfc6] bg-[#e8fafa] text-xl font-medium leading-none text-[#32cfc6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          <img src={PLUS_ICON} alt="" aria-hidden="true" className="h-[14px] w-[13px]" />
        </Link>
        <Link
          href="/me"
          className="flex w-[54px] flex-col items-center gap-1 rounded-xl text-xs leading-[1.3] text-[#94a3b8]"
        >
          <span className="relative h-6 w-6">
            <img src={PROFILE_ICON_MAIN} alt="" aria-hidden="true" className="absolute left-[2px] top-[2px] h-5 w-5" />
            <img src={PROFILE_ICON_FACE} alt="" aria-hidden="true" className="absolute left-[9px] top-[7px] h-1 w-1.5" />
          </span>
          프로필
        </Link>
      </div>
    </nav>
  );
}

export function VoteFeed({ items, quickVoteAction }: VoteFeedProps) {
  return (
    <main
      id="top"
      className="mx-auto min-h-dvh w-full max-w-[360px] bg-white text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]"
    >
      <header className="sticky top-0 z-10 bg-white">
        <div className="flex h-[94px] items-end justify-between px-5 pb-2.5">
          <h1 className="sr-only">PICKIT</h1>
          <img src={PICKIT_LOGO} alt="" aria-hidden="true" className="h-6 w-[85px] object-contain" />
          <Link
            href="/notifications"
            aria-label="알림"
            className="grid h-8 w-8 place-items-center rounded-full text-[#94a3b8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            <img src={BELL_ICON} alt="" aria-hidden="true" className="h-5 w-[18px]" />
          </Link>
        </div>
        <div className="overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-1">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                aria-pressed={index === 0}
                className={`rounded-lg border px-3 py-2 text-sm leading-[1.3] ${
                  index === 0 ?
                    "border-[#64748b] bg-[#64748b] font-semibold text-white"
                  : "border-[#dfe5ed] bg-white text-[#64748b]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {items.length > 0 ?
        <section aria-label="공개 투표 목록">
          {items.map((item) => (
            <VoteCard key={item.id} item={item} quickVoteAction={quickVoteAction} />
          ))}
        </section>
      : <EmptyFeed />}

      <a
        href="#top"
        aria-label="맨 위로 이동"
        className="fixed bottom-28 left-[calc(50%+112px)] z-30 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-xl bg-[#f8faff] text-lg text-[#94a3b8] shadow-[5px_6px_8.5px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
      >
        <span className="relative h-6 w-6">
          <img src={TOP_ARROW_HEAD} alt="" aria-hidden="true" className="absolute left-1 top-2 h-2 w-1 rotate-90" />
          <img src={TOP_ARROW_STEM} alt="" aria-hidden="true" className="absolute left-[5px] top-3 h-3.5 w-px rotate-90" />
        </span>
      </a>

      <BottomNavigation />
    </main>
  );
}
