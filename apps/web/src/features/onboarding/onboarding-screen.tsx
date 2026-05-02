"use client";

/* eslint-disable @next/next/no-img-element */

import { type UIEvent, useCallback, useEffect, useRef, useState } from "react";
import { SocialLoginButtons } from "@/features/auth/social-login-buttons";
import { updateMyLifeStage } from "@/features/profile/profile-actions";
import { createClient } from "@/lib/supabase/client";
import {
  LIFE_STAGE_OPTIONS,
  consumePendingLifeStage,
  savePendingLifeStage,
  type LifeStageValue,
} from "./onboarding-trigger";

type OAuthProvider = "google" | "kakao";

type OnboardingScreenProps = {
  activeSlide?: 0 | 1;
  onLoginClick?: (provider: OAuthProvider) => void;
};

type LifeStageSelectionScreenProps = {
  initialLifeStage?: LifeStageValue | null;
  provider?: OAuthProvider;
  redirectTo?: string;
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

function SlideDots({
  activeSlide,
  onSelect,
}: {
  activeSlide: 0 | 1;
  onSelect?: (slide: 0 | 1) => void;
}) {
  return (
    <div className="flex justify-center gap-2" aria-label={`${activeSlide + 1}/2`}>
      {([0, 1] as const).map((index) => (
        <button
          key={index}
          type="button"
          aria-label={`${index + 1}번째 슬라이드로 이동`}
          aria-current={activeSlide === index}
          onClick={() => onSelect?.(index)}
          className={`h-2 w-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32cfc6] ${
            activeSlide === index ? "bg-[#32cfc6]" : "bg-[#dfe5ed]"
          }`}
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
          <SlideDots activeSlide={currentSlide} onSelect={(slide) => scrollToSlide(slide)} />
        </div>

        <div className="mt-5">
          <SocialLoginButtons
            redirectTo="/"
            onLoginClick={onLoginClick}
            showKakao={process.env.NEXT_PUBLIC_AUTH_KAKAO_ENABLED === "true"}
          />
        </div>
      </section>
    </main>
  );
}

function StageIcon({ icon }: { icon: string }) {
  const common = "relative h-11 w-11 overflow-hidden";

  if (icon === "book") {
    return (
      <span className={common} aria-hidden="true">
        <img
          alt=""
          className="absolute left-[5.37px] top-[7.06px] h-[13.469px] w-[34.593px]"
          src="/onboarding/stage-book-rect-top.svg"
        />
        <img
          alt=""
          className="absolute left-[31.02px] top-[22.75px] h-[13.469px] w-[3.863px]"
          src="/onboarding/stage-book-rect-spine.svg"
        />
        <span className="absolute left-[4.04px] top-[23.49px] flex h-[13.469px] w-[34.593px] items-center justify-center">
          <span className="-scale-y-100 flex-none rotate-180">
            <span className="relative block h-[13.469px] w-[34.593px]">
              <img
                alt=""
                className="absolute inset-0 h-full w-full max-w-none"
                src="/onboarding/stage-book-rect-bottom.svg"
              />
            </span>
          </span>
        </span>
        <img
          alt=""
          className="absolute left-[12.98px] top-[10.22px] h-[2.832px] w-[24.59px]"
          src="/onboarding/stage-book-line-top.svg"
        />
        <img
          alt=""
          className="absolute left-[16.7px] top-[14.55px] h-[2.832px] w-[20.799px]"
          src="/onboarding/stage-book-line-mid.svg"
        />
        <img
          alt=""
          className="absolute left-[4.11px] top-[5.58px] h-[16.429px] w-[35.89px]"
          src="/onboarding/stage-book-stroke-top.svg"
        />
        <span className="absolute left-[6.43px] top-[26.65px] flex h-[2.832px] w-[24.59px] items-center justify-center">
          <span className="-scale-y-100 flex-none rotate-180">
            <span className="relative block h-[2.832px] w-[24.59px]">
              <img
                alt=""
                className="absolute inset-0 h-full w-full max-w-none"
                src="/onboarding/stage-book-line-bottom.svg"
              />
            </span>
          </span>
        </span>
        <span className="absolute left-[6.5px] top-[30.98px] flex h-[2.832px] w-[20.799px] items-center justify-center">
          <span className="-scale-y-100 flex-none rotate-180">
            <span className="relative block h-[2.832px] w-[20.799px]">
              <img
                alt=""
                className="absolute inset-0 h-full w-full max-w-none"
                src="/onboarding/stage-book-line-low.svg"
              />
            </span>
          </span>
        </span>
        <span className="absolute left-[4px] top-[22.01px] flex h-[16.429px] w-[35.89px] items-center justify-center">
          <span className="-scale-y-100 flex-none rotate-180">
            <span className="relative block h-[16.429px] w-[35.89px]">
              <img
                alt=""
                className="absolute inset-0 h-full w-full max-w-none"
                src="/onboarding/stage-book-stroke-bottom.svg"
              />
            </span>
          </span>
        </span>
      </span>
    );
  }

  if (icon === "cap") {
    return (
      <span className={common} aria-hidden="true">
        <img
          alt=""
          className="absolute left-[7px] top-[12px] h-[25px] w-[27px]"
          src="/onboarding/stage-hat-panel.svg"
        />
        <img
          alt=""
          className="absolute left-[1.96px] top-[5.48px] h-[17.944px] w-[37.603px]"
          src="/onboarding/stage-hat-top.svg"
        />
        <span className="absolute left-[1.53px] top-[13.43px] h-[10.584px] w-[38.777px]">
          <span className="absolute inset-y-0 left-[1.15%] right-0">
            <img
              alt=""
              className="h-full w-full max-w-none"
              src="/onboarding/stage-hat-brim.svg"
            />
          </span>
        </span>
        <span className="absolute left-[35.41px] top-[29.62px] h-[8.754px] w-[7.882px]">
          <span className="absolute inset-y-0 left-[4.24%] right-[4.29%]">
            <img
              alt=""
              className="h-full w-full max-w-none"
              src="/onboarding/stage-hat-tassel.svg"
            />
          </span>
        </span>
        <img
          alt=""
          className="absolute left-[20.24px] top-[11.12px] h-[18.298px] w-[20.427px]"
          src="/onboarding/stage-hat-cord.svg"
        />
        <img
          alt=""
          className="absolute left-[37.29px] top-[27.95px] h-[4.094px] w-[3.977px]"
          src="/onboarding/stage-hat-dot.svg"
        />
        <img
          alt=""
          className="absolute left-[17.33px] top-[10.64px] h-[4.094px] w-[7.18px]"
          src="/onboarding/stage-hat-dot-wide.svg"
        />
      </span>
    );
  }

  if (icon === "briefcase") {
    return (
      <span className={common} aria-hidden="true">
        <img
          alt=""
          className="absolute left-[14.19px] top-[3.64px] h-[11.488px] w-[15.386px]"
          src="/onboarding/stage-briefcase-handle.svg"
        />
        <img
          alt=""
          className="absolute left-[3.74px] top-[11.06px] h-[29.057px] w-[36.47px]"
          src="/onboarding/stage-briefcase-body.svg"
        />
        <img
          alt=""
          className="absolute left-[9.63px] top-[21.96px] h-[4.434px] w-[24.694px]"
          src="/onboarding/stage-briefcase-line.svg"
        />
        <img
          alt=""
          className="absolute left-[18.55px] top-[21.76px] h-[7.659px] w-[6.458px]"
          src="/onboarding/stage-briefcase-lock.svg"
        />
      </span>
    );
  }

  return (
    <span className={common} aria-hidden="true">
      <img
        alt=""
        className="absolute left-[15.05px] top-[3.91px] h-[11.13px] w-[13.948px]"
        src="/onboarding/stage-backpack-handle.svg"
      />
      <img
        alt=""
        className="absolute left-[3.85px] top-[10.24px] h-[29.935px] w-[36.355px]"
        src="/onboarding/stage-backpack-body.svg"
      />
      <img
        alt=""
        className="absolute left-[14.01px] top-[25.01px] h-[4.222px] w-[16.389px]"
        src="/onboarding/stage-backpack-pocket.svg"
      />
    </span>
  );
}

export function LifeStageSelectionScreen({
  initialLifeStage = null,
  provider = "google",
  redirectTo = "/",
}: LifeStageSelectionScreenProps) {
  const [selectedLifeStage, setSelectedLifeStage] = useState<LifeStageValue | null>(
    initialLifeStage,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (!selectedLifeStage || isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    savePendingLifeStage(selectedLifeStage, window.sessionStorage);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setErrorMessage("로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  }

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

        {errorMessage ?
          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
            {errorMessage}
          </p>
        : null}

        <div className="mt-auto">
          <button
            type="button"
            disabled={!selectedLifeStage || isSubmitting}
            onClick={() => void handleConfirm()}
            className="h-14 w-full rounded-xl bg-[#32cfc6] px-6 text-lg font-semibold leading-[1.3] text-[#f9f9f9] disabled:bg-[#e5edf5] disabled:text-[#94a3b8]"
          >
            {isSubmitting ? "로그인 중…" : "선택 완료"}
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
  const [selectedProvider, setSelectedProvider] = useState<OAuthProvider>("google");

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
      {screen === "life-stage" ? (
        <LifeStageSelectionScreen provider={selectedProvider} />
      ) : null}
      {screen !== "life-stage" ? (
        <div className="relative min-h-dvh overflow-hidden bg-white">
          {showOnboarding ? (
            <div
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                isLeavingSplash || screen === "onboarding" ? "opacity-100" : "opacity-0"
              }`}
            >
              <OnboardingScreen
                onLoginClick={(provider) => {
                  setSelectedProvider(provider);
                  setScreen("life-stage");
                }}
              />
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
