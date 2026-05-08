"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function ReportPage() {
  const [tab, setTab] = useState<"all" | "saved" | "bought">("all");
  const currentReport = reports[tab];

  return (
    <main>
      <Link href="/profile">뒤로</Link>

      <h1>소비 리포트</h1>

      <nav>
        <button type="button" onClick={() => setTab("all")}>
          전체
        </button>
        <button type="button" onClick={() => setTab("saved")}>
          참은 소비
        </button>
        <button type="button" onClick={() => setTab("bought")}>
          구매한 소비
        </button>
      </nav>

      <section>
        <p>총 절약 금액</p>
        <h2>{currentReport.amount}</h2>
        <p>{currentReport.message}</p>
      </section>
    </main>
  );
}
