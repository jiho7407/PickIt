"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "./icons";

const REVEAL_THRESHOLD_PX = 300;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > REVEAL_THRESHOLD_PX);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="맨 위로 이동"
      className={`fixed bottom-28 left-[calc(50%+148px)] z-30 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-xl bg-[#f8faff] text-[#94a3b8] shadow-[5px_6px_8.5px_rgba(0,0,0,0.06)] transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}
