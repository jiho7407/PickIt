"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeftIcon } from "@/features/votes/icons";

const tags = ["고등학생", "대학생", "취준생", "직장인"];

type EditProfileFormProps = {
  initialNickname: string;
  initialLifeStageLabel: string;
};

export function EditProfileForm({
  initialNickname,
  initialLifeStageLabel,
}: EditProfileFormProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [tag, setTag] = useState(initialLifeStageLabel);

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
        <h1 className="text-lg font-bold leading-[1.3]">프로필 수정</h1>
      </header>

      <div className="space-y-5 px-5 py-6">
        <section className="rounded-2xl bg-white px-5 py-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e8fafa] text-2xl font-bold text-[#32cfc6]">
            {nickname.trim().slice(0, 1) || "P"}
          </div>
          <button
            type="button"
            className="mt-4 h-10 rounded-xl border border-[#dfe5ed] px-4 text-sm font-semibold text-[#475569] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
          >
            설정
          </button>
        </section>

        <section className="space-y-3 rounded-2xl bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <label htmlFor="nickname" className="block text-sm font-semibold leading-5 text-[#334155]">
            닉네임
          </label>
          <input
            id="nickname"
            value={nickname}
            maxLength={10}
            onChange={(event) => setNickname(event.target.value)}
            className="h-12 w-full rounded-xl border border-[#dfe5ed] bg-white px-4 text-base font-semibold text-[#0f172a] outline-none focus:border-[#32cfc6] focus:ring-2 focus:ring-[#e8fafa]"
          />
          <p className="text-xs leading-5 text-[#94a3b8]">최대 10글자</p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold leading-5 text-[#334155]">태그</p>
          <div className="grid grid-cols-2 gap-2">
            {tags.map((item) => {
              const isSelected = tag === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTag(item)}
                  className={`h-11 rounded-xl border text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
                    isSelected ?
                      "border-[#32cfc6] bg-[#e8fafa] text-[#0f766e]"
                    : "border-[#dfe5ed] bg-white text-[#64748b]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          className="h-[52px] w-full rounded-2xl bg-[#32cfc6] text-base font-bold leading-5 text-white shadow-[0_8px_20px_rgba(50,207,198,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6]"
        >
          저장하기
        </button>
      </div>
    </main>
  );
}
