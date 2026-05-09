"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon } from "@/features/votes/icons";

const reports = {
  all: {
    label: "전체",
    amount: "0원",
    message: "아직 소비 리포트가 없어요.",
  },
  saved: {
    label: "참은 소비",
    amount: "0원",
    message: "아직 참은 소비가 없어요.",
  },
  bought: {
    label: "구매한 소비",
    amount: "0원",
    message: "아직 구매한 소비가 없어요.",
  },
};

type ReportTab = keyof typeof reports;

export default function ReportPage() {
  const [tab, setTab] = useState<ReportTab>("all");
  const currentReport = reports[tab];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[360px] bg-[#f8fafc] text-[#0f172a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-center bg-white px-5">
        <Link
          href="/profile"
          aria-label="프로필로 돌아가기"
          className="absolute left-4 grid h-9 w-9 place-items-center rounded-full text-[#64748b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold leading-[1.3]">소비 리포트</h1>
      </header>

      <div className="space-y-5 px-5 py-6">
        <nav
          aria-label="소비 리포트 필터"
          className="grid grid-cols-3 gap-1 rounded-2xl bg-[#e2e8f0] p-1"
        >
          {(Object.keys(reports) as ReportTab[]).map((key) => {
            const isSelected = tab === key;

            return (
              <button
                key={key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setTab(key)}
                className={`h-10 rounded-xl text-sm font-semibold leading-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
                  isSelected ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"
                }`}
              >
                {reports[key].label}
              </button>
            );
          })}
        </nav>

        <section className="rounded-2xl bg-white px-5 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold leading-5 text-[#64748b]">총 절약 금액</p>
          <h2 className="mt-3 text-[32px] font-bold leading-[1.2] text-[#0f172a]">
            {currentReport.amount}
          </h2>
          <p className="mt-2 text-sm leading-5 text-[#94a3b8]">{currentReport.message}</p>
        </section>
      </div>
    </main>
  );
}
