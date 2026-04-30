export const PENDING_LIFE_STAGE_KEY = "pickit.pendingLifeStage";

export const LIFE_STAGE_OPTIONS = [
  { value: "high_school", label: "고등학생", icon: "bag" },
  { value: "university", label: "대학생", icon: "book" },
  { value: "job_seeker", label: "취준생", icon: "cap" },
  { value: "worker", label: "직장인", icon: "briefcase" },
] as const;

export type LifeStageValue = (typeof LIFE_STAGE_OPTIONS)[number]["value"];

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function isLifeStageValue(value: string | null): value is LifeStageValue {
  return LIFE_STAGE_OPTIONS.some((option) => option.value === value);
}

export function savePendingLifeStage(value: LifeStageValue, storage: StorageLike): void {
  storage.setItem(PENDING_LIFE_STAGE_KEY, value);
}

export function readPendingLifeStage(storage: StorageLike): LifeStageValue | null {
  const value = storage.getItem(PENDING_LIFE_STAGE_KEY);

  return isLifeStageValue(value) ? value : null;
}

export function clearPendingLifeStage(storage: StorageLike): void {
  storage.removeItem(PENDING_LIFE_STAGE_KEY);
}

export async function consumePendingLifeStage(
  updateLifeStage: (value: LifeStageValue) => Promise<{ ok: boolean }>,
  storage: StorageLike,
): Promise<"empty" | "saved" | "failed"> {
  const pendingLifeStage = readPendingLifeStage(storage);

  if (!pendingLifeStage) {
    return "empty";
  }

  const result = await updateLifeStage(pendingLifeStage);

  if (!result.ok) {
    return "failed";
  }

  clearPendingLifeStage(storage);
  return "saved";
}
