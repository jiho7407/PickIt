"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <main>
      <h1>프로필</h1>

      <section>
        <div>프로필 이미지</div>
        <h2>익명의 아나콘다</h2>
        <p>대학생</p>
        <Link href="/profile/edit">프로필 수정 &gt;</Link>
      </section>

      <section>
        <p>총 절약 금액</p>
        <h2>0원</h2>
        <p>아직 참은 소비가 없어요.</p>
        <Link href="/report">소비 리포트 &gt;</Link>
      </section>

      <nav>
        <Link href="/votes/my">내가 올린 투표 &gt;</Link>
        <br />
        <Link href="/votes/joined">내가 참여한 투표 &gt;</Link>
        <br />
        <Link href="/votes/commented">댓글 단 투표 &gt;</Link>
        <br />

        <button type="button" onClick={() => setIsLogoutOpen(true)}>
          로그아웃
        </button>
      </nav>

      {isLogoutOpen && (
        <div>
          <p>정말 로그아웃하시겠습니까?</p>

          <button type="button" onClick={() => setIsLogoutOpen(false)}>
            아니요
          </button>

          <button type="button">네</button>
        </div>
      )}
    </main>
  );
}

