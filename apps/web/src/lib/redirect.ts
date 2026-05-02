export function getSafeRedirectPath(redirectTo: string | null | undefined, fallback = "/") {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return fallback;
  }

  return redirectTo;
}

export function getLoginHref(redirectTo: string) {
  return `/login?redirectTo=${encodeURIComponent(getSafeRedirectPath(redirectTo))}`;
}
