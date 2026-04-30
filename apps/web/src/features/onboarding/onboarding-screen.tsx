"use client";

/* eslint-disable @next/next/no-img-element */

import { type UIEvent, useCallback, useEffect, useRef, useState } from "react";
import { SocialLoginButtons } from "@/features/auth/social-login-buttons";
import { updateMyLifeStage } from "@/features/profile/profile-actions";
import {
  LIFE_STAGE_OPTIONS,
  consumePendingLifeStage,
  type LifeStageValue,
} from "./onboarding-trigger";

type OnboardingScreenProps = {
  activeSlide?: 0 | 1;
  onLoginClick?: () => void;
};

type LifeStageSelectionScreenProps = {
  initialLifeStage?: LifeStageValue | null;
};

const onboardingSlides = [
  {
    title: (
      <>
        살까 말까..
        <br />
        어떤 것을 구매할지 고민된다면?
      </>
    ),
    body: "투표를 통해 현명한 소비를 경험해보세요",
    image: "/onboarding/onboarding-vote-frame.png",
    imageAlt: "투표 화면 미리보기",
  },
  {
    title: "나는 어떻게 소비할까?",
    body: (
      <>
        소비기록을 통해
        <br />
        나만의 소비 스타일을 파악해보세요
      </>
    ),
    image: "/onboarding/onboarding-report-frame.png",
    imageAlt: "소비 리포트 화면 미리보기",
  },
] as const;

export function SplashScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#32cfc6] text-white">
      <div className="flex w-64 flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/onboarding/splash-bag.svg"
            alt=""
            aria-hidden="true"
            className="h-[100px] w-[100px]"
          />
          <h1 className="sr-only">PICKIT</h1>
          <img
            src="/onboarding/splash-logo.svg"
            alt=""
            aria-hidden="true"
            className="h-[34px] w-[136px]"
          />
        </div>
        <p className="text-base font-semibold leading-[1.3]">
          모두의 소비 고민이 모여
          <br />더 나은 선택이 되는 곳
        </p>
      </div>
    </main>
  );
}

function SlideDots({ activeSlide }: { activeSlide: 0 | 1 }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`${activeSlide + 1}/2`}>
      {[0, 1].map((index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-full ${activeSlide === index ? "bg-[#32cfc6]" : "bg-[#dfe5ed]"}`}
        />
      ))}
    </div>
  );
}

export function OnboardingScreen({ activeSlide, onLoginClick }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(activeSlide ?? 0);
  const slideTrackRef = useRef<HTMLDivElement | null>(null);

  const scrollToSlide = useCallback((nextSlide: 0 | 1, behavior: ScrollBehavior = "smooth") => {
    const track = slideTrackRef.current;
    if (!track) {
      setCurrentSlide(nextSlide);
      return;
    }

    track.scrollTo({
      left: track.clientWidth * nextSlide,
      behavior,
    });
    setCurrentSlide(nextSlide);
  }, []);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    const nextSlide = Math.round(target.scrollLeft / target.clientWidth) as 0 | 1;
    setCurrentSlide(nextSlide);
  }

  useEffect(() => {
    if (activeSlide === undefined) {
      return;
    }

    scrollToSlide(activeSlide, "auto");
  }, [activeSlide, scrollToSlide]);

  useEffect(() => {
    if (activeSlide !== undefined) {
      return undefined;
    }

    const slideTimer = window.setInterval(() => {
      setCurrentSlide((current) => {
        const next = current === 0 ? 1 : 0;
        const track = slideTrackRef.current;
        track?.scrollTo({
          left: track.clientWidth * next,
          behavior: "smooth",
        });
        return next;
      });
    }, 4000);

    return () => window.clearInterval(slideTimer);
  }, [activeSlide]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[360px] overflow-hidden bg-white text-[#0f172a]">
      <section className="px-5 pb-8 pt-[78px]">
        <div
          ref={slideTrackRef}
          onScroll={handleScroll}
          className="-mx-5 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {onboardingSlides.map((slide, index) => (
            <div
              key={slide.image}
              aria-hidden={currentSlide !== index}
              className="min-w-full snap-center px-5"
            >
              <div className="space-y-2 text-center leading-[1.3]">
                <h1 className="text-xl font-bold text-[#0f172a]">{slide.title}</h1>
                <p className="text-base text-[#64748b]">{slide.body}</p>
              </div>

              <div className="mt-5 flex justify-center">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className="h-[340px] w-[340px] max-w-none"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2">
          <SlideDots activeSlide={currentSlide} />
        </div>

        <div className="mt-5">
          <SocialLoginButtons redirectTo="/" onLoginClick={onLoginClick} />
        </div>
      </section>
    </main>
  );
}

function StageIcon({ icon }: { icon: string }) {
  const common = "relative h-11 w-11";

  if (icon === "book") {
    return (
      <span className={common} aria-hidden="true">
        <span className="absolute left-[7px] top-[5px] h-5 w-8 rounded border-2 border-[#32cfc6]" />
        <span className="absolute left-[10px] top-[17px] h-5 w-8 rounded border-2 border-[#ff725e]" />
        <span className="absolute left-[13px] top-[29px] h-1 w-6 rounded bg-[#32cfc6]" />
      </span>
    );
  }

  if (icon === "cap") {
    return (
      <span className={common} aria-hidden="true">
        <span className="absolute left-[4px] top-[14px] h-4 w-9 rotate-[-15deg] rounded bg-[#5f586d]" />
        <span className="absolute left-[12px] top-[23px] h-3 w-6 rounded bg-[#5f586d]" />
        <span className="absolute left-[32px] top-[24px] h-4 w-px bg-[#ffd33d]" />
        <span className="absolute left-[30px] top-[36px] h-2 w-2 rounded-full bg-[#ffd33d]" />
      </span>
    );
  }

  if (icon === "briefcase") {
    return (
      <span className={common} aria-hidden="true">
        <span className="absolute left-[15px] top-[6px] h-3 w-4 rounded-t-lg border-2 border-[#5f586d]" />
        <span className="absolute left-[5px] top-[15px] h-7 w-9 rounded bg-[#5f586d]" />
        <span className="absolute left-[19px] top-[25px] h-2 w-2 rounded-sm bg-[#ffb33d]" />
      </span>
    );
  }

  return (
    <span className={common} aria-hidden="true">
      <span className="absolute left-[11px] top-[5px] h-9 w-7 rounded-b-lg rounded-t-xl bg-[#32cfc6]" />
      <span className="absolute left-[14px] top-[1px] h-4 w-5 rounded-t-full border-4 border-[#32cfc6] border-b-0" />
      <span className="absolute left-[8px] top-[24px] h-3 w-1 rounded bg-[#32cfc6]" />
      <span className="absolute right-[8px] top-[24px] h-3 w-1 rounded bg-[#32cfc6]" />
    </span>
  );
}

export function LifeStageSelectionScreen({
  initialLifeStage = null,
}: LifeStageSelectionScreenProps) {
  const [selectedLifeStage, setSelectedLifeStage] = useState<LifeStageValue | null>(
    initialLifeStage,
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[360px] overflow-hidden bg-white text-[#0f172a]">
      <section className="flex min-h-dvh flex-col px-5 pb-8 pt-[102px]">
        <div className="space-y-2 leading-[1.3]">
          <h1 className="text-xl font-bold text-[#0f172a]">나에게 맞는 태그를 선택해주세요</h1>
          <p className="text-base text-[#64748b]">1개만 선택할 수 있어요</p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-3">
          {LIFE_STAGE_OPTIONS.map((option) => {
            const selected = selectedLifeStage === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedLifeStage(option.value)}
                className={`flex h-[133px] flex-col items-center justify-center gap-2 rounded-xl border bg-white text-base font-semibold leading-[1.3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
                  selected ? "border-[#32cfc6] text-[#1fa89f]" : "border-[#dfe5ed] text-[#0f172a]"
                }`}
              >
                <StageIcon icon={option.icon} />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto">
          <button
            type="button"
            disabled={!selectedLifeStage}
            className="h-14 w-full rounded-xl bg-[#32cfc6] px-6 text-lg font-semibold leading-[1.3] text-[#f9f9f9] disabled:bg-[#e5edf5] disabled:text-[#94a3b8]"
          >
            선택 완료
          </button>
        </div>
      </section>
    </main>
  );
}

function PendingLifeStageCommitter() {
  useEffect(() => {
    void consumePendingLifeStage(updateMyLifeStage, window.sessionStorage);
  }, []);

  return null;
}

export function Product00Flow({ splashDurationMs = 900 }: { splashDurationMs?: number } = {}) {
  const [screen, setScreen] = useState<"splash" | "onboarding" | "life-stage">("splash");
  const [isLeavingSplash, setIsLeavingSplash] = useState(false);

  useEffect(() => {
    if (splashDurationMs === 0) {
      setScreen("onboarding");
      return undefined;
    }

    const splashTimer = window.setTimeout(() => {
      setIsLeavingSplash(true);
    }, splashDurationMs);
    const revealTimer = window.setTimeout(() => {
      setScreen("onboarding");
      setIsLeavingSplash(false);
    }, splashDurationMs + 520);

    return () => {
      window.clearTimeout(splashTimer);
      window.clearTimeout(revealTimer);
    };
  }, [splashDurationMs]);

  const showOnboarding = screen === "onboarding" || isLeavingSplash;
  const showSplash = screen === "splash";

  return (
    <>
      <PendingLifeStageCommitter />
      {screen === "life-stage" ? <LifeStageSelectionScreen /> : null}
      {screen !== "life-stage" ? (
        <div className="relative min-h-dvh overflow-hidden bg-white">
          {showOnboarding ? (
            <div
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                isLeavingSplash || screen === "onboarding" ? "opacity-100" : "opacity-0"
              }`}
            >
              <OnboardingScreen onLoginClick={() => setScreen("life-stage")} />
            </div>
          ) : null}
          {showSplash ? (
            <div
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                isLeavingSplash ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <SplashScreen />
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
