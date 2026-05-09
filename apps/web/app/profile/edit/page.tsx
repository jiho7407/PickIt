"use client";

import { useState } from "react";
import Link from "next/link";

const tags = ["고등학생", "대학생", "취준생", "직장인"];

export default function ProfileEditPage() {
  const [nickname, setNickname] = useState("익명의 아나콘다");
  const [tag, setTag] = useState("대학생");

  return (
    <main>
      <Link href="/profile">뒤로</Link>

      <h1>프로필 수정</h1>

      <div>
        <div>프로필 이미지</div>
        <button type="button">설정</button>
      </div>

      <label>닉네임</label>
      <input
        value={nickname}
        maxLength={10}
        onChange={(e) => setNickname(e.target.value)}
      />
      <p>최대 10글자</p>

      <p>태그</p>
      {tags.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setTag(item)}
          style={{
            backgroundColor: tag === item ? "#64748b" : "white",
            color: tag === item ? "white" : "#64748b",
          }}
        >
          {item}
        </button>
      ))}

      <button type="button">저장하기</button>
    </main>
  );
}
