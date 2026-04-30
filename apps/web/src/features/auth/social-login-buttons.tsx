"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  savePendingLifeStage,
  type LifeStageValue,
} from "@/features/onboarding/onboarding-trigger";

type SocialLoginButtonsProps = {
  pendingLifeStage?: LifeStageValue | null;
  redirectTo?: string;
  showKakao?: boolean;
  onLoginClick?: (provider: Provider) => void;
};

type Provider = "google" | "kakao";

function getCallbackUrl(redirectTo: string) {
  return `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export function SocialLoginButtons({
  pendingLifeStage,
  redirectTo = "/",
  showKakao = true,
  onLoginClick,
}: SocialLoginButtonsProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function startOAuth(provider: Provider) {
    setErrorMessage(null);

    if (pendingLifeStage) {
      savePendingLifeStage(pendingLifeStage, window.sessionStorage);
    }

    if (onLoginClick) {
      onLoginClick(provider);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getCallbackUrl(redirectTo),
      },
    });

    if (error) {
      setErrorMessage("로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <div className="space-y-3">
      {showKakao ? (
        <button
          type="button"
          onClick={() => void startOAuth("kakao")}
          className="flex h-12 w-full items-center gap-6 rounded-xl bg-[#fee500] px-5 text-base font-semibold leading-[1.3] text-[rgba(0,0,0,0.85)]"
        >
          <span aria-hidden="true" className="h-6 w-6 shrink-0 bg-[url('/onboarding/kakao.svg')] bg-contain bg-center bg-no-repeat" />
          <span className="flex-1 text-center">카카오 로그인</span>
          <span aria-hidden="true" className="h-6 w-6 shrink-0" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => void startOAuth("google")}
        className="flex h-12 w-full items-center gap-6 rounded-xl border border-[#dfe5ed] bg-white px-5 text-base font-semibold leading-[1.3] text-[rgba(0,0,0,0.85)]"
      >
        <span aria-hidden="true" className="h-6 w-6 shrink-0 bg-[url('/onboarding/google.png')] bg-contain bg-center bg-no-repeat" />
        <span className="flex-1 text-center">구글 로그인</span>
        <span aria-hidden="true" className="h-6 w-6 shrink-0" />
      </button>

      {errorMessage ? (
        <p className="text-center text-sm font-medium text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
