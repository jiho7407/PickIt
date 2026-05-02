import { OnboardingScreen } from "@/features/onboarding/onboarding-screen";
import { getSafeRedirectPath } from "@/lib/redirect";

type LoginPageProps = {
  searchParams?: Promise<{
    redirectTo?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = (await searchParams) ?? {};
  const redirectToParam = Array.isArray(resolved.redirectTo) ? resolved.redirectTo[0] : resolved.redirectTo;
  const redirectTo = getSafeRedirectPath(redirectToParam);

  return <OnboardingScreen activeSlide={0} redirectTo={redirectTo} />;
}
