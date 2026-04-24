import type { FollowupOutcome } from "./schema";

const FOLLOWUP_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

export function calculateSavedAmount(params: {
  outcome: FollowupOutcome;
  price: number;
}): number {
  return params.outcome === "skipped" ? params.price : 0;
}

export function calculateFollowupDueAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + FOLLOWUP_DELAY_MS);
}
