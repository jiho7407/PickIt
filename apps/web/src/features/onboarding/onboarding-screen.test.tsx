import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LifeStageSelectionScreen,
  OnboardingScreen,
  Product00Flow,
  SplashScreen,
} from "@/features/onboarding/onboarding-screen";
import {
  PENDING_LIFE_STAGE_KEY,
  consumePendingLifeStage,
} from "@/features/onboarding/onboarding-trigger";
import { SocialLoginButtons } from "@/features/auth/social-login-buttons";

const authMocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: authMocks.signInWithOAuth,
    },
  })),
}));

Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});

describe("SplashScreen", () => {
  it("renders the Figma splash screen copy", () => {
    render(<SplashScreen />);

    expect(screen.getByRole("heading", { name: "PICKIT" })).toBeInTheDocument();
    expect(screen.getByText("모두의 소비 고민이 모여", { exact: false })).toBeInTheDocument();
  });
});

describe("OnboardingScreen", () => {
  it("renders both Figma login CTAs even when provider setup is not available", () => {
    render(<OnboardingScreen activeSlide={0} />);

    expect(screen.getByRole("button", { name: "구글 로그인" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "카카오 로그인" })).toBeInTheDocument();
  });

  it("renders only the provided onboarding slide screens", () => {
    const { rerender } = render(<OnboardingScreen activeSlide={0} />);

    expect(
      screen.getByRole("heading", { name: "살까 말까.. 어떤 것을 구매할지 고민된다면?" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("투표 화면 미리보기")).toBeInTheDocument();
    expect(screen.queryByText("오늘의 소비 고민")).not.toBeInTheDocument();
    expect(screen.queryByText("9:41")).not.toBeInTheDocument();

    rerender(<OnboardingScreen activeSlide={1} />);

    expect(screen.getByRole("heading", { name: "나는 어떻게 소비할까?" })).toBeInTheDocument();
    expect(screen.getByAltText("소비 리포트 화면 미리보기")).toBeInTheDocument();
  });
});

describe("LifeStageSelectionScreen", () => {
  it("lets the user choose exactly one life stage before completing selection", async () => {
    const user = userEvent.setup();
    render(<LifeStageSelectionScreen />);

    const completeButton = screen.getByRole("button", { name: "선택 완료" });
    expect(completeButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "대학생" }));
    expect(screen.getByRole("button", { name: "대학생" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "직장인" }));
    expect(screen.getByRole("button", { name: "대학생" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "직장인" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(completeButton).toBeEnabled();
  });

  it("can render the provided selected tag state", () => {
    render(<LifeStageSelectionScreen initialLifeStage="university" />);

    expect(screen.getByRole("button", { name: "대학생" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "선택 완료" })).toBeEnabled();
  });
});

describe("SocialLoginButtons", () => {
  beforeEach(() => {
    authMocks.signInWithOAuth.mockReset();
    authMocks.signInWithOAuth.mockResolvedValue({ error: null });
    sessionStorage.clear();
  });

  it("stores the pending life stage before starting Google OAuth", async () => {
    const user = userEvent.setup();

    render(
      <SocialLoginButtons
        pendingLifeStage="university"
        redirectTo="/"
        showKakao={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "구글 로그인" }));

    expect(sessionStorage.getItem(PENDING_LIFE_STAGE_KEY)).toBe("university");
    expect(authMocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback?redirectTo=%2F",
      },
    });
  });

  it("can use a product flow login handler instead of starting OAuth", async () => {
    const user = userEvent.setup();
    const onLoginClick = vi.fn();

    render(<SocialLoginButtons showKakao={false} onLoginClick={onLoginClick} />);

    await user.click(screen.getByRole("button", { name: "구글 로그인" }));

    expect(onLoginClick).toHaveBeenCalledWith("google");
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
  });
});

describe("Product00Flow", () => {
  beforeEach(() => {
    authMocks.signInWithOAuth.mockReset();
  });

  it("moves from Google login to the tag selection screen", async () => {
    const user = userEvent.setup();
    render(<Product00Flow splashDurationMs={0} />);

    await user.click(await screen.findByRole("button", { name: "구글 로그인" }));

    expect(
      screen.getByRole("heading", { name: "나에게 맞는 태그를 선택해주세요" }),
    ).toBeInTheDocument();
    expect(authMocks.signInWithOAuth).not.toHaveBeenCalled();
  });
});

describe("consumePendingLifeStage", () => {
  it("saves and clears a pending life stage after OAuth returns", async () => {
    const updateLifeStage = vi.fn(async () => ({ ok: true }));
    sessionStorage.setItem(PENDING_LIFE_STAGE_KEY, "worker");

    await expect(consumePendingLifeStage(updateLifeStage, sessionStorage)).resolves.toBe(
      "saved",
    );

    expect(updateLifeStage).toHaveBeenCalledWith("worker");
    await waitFor(() => {
      expect(sessionStorage.getItem(PENDING_LIFE_STAGE_KEY)).toBeNull();
    });
  });
});
