export const TASK_STEP_MINUTES = 15;
export const TASK_MIN_MINUTES = 15;
export const TASK_MAX_MINUTES = 8 * 60;
export const DAY_MAX_MINUTES = 24 * 60;

export const TASK_MINUTE_OPTIONS: number[] = Array.from(
  { length: TASK_MAX_MINUTES / TASK_STEP_MINUTES },
  (_, index) => (index + 1) * TASK_STEP_MINUTES,
);

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${hours}:${String(rest).padStart(2, "0")}`;
}

export function parseTaskMinutes(value: string): number | null {
  if (!value) return null;

  const minutes = Number(value);
  return isTaskMinutes(minutes) ? minutes : null;
}

export function isTaskMinutes(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= TASK_MIN_MINUTES &&
    minutes <= TASK_MAX_MINUTES &&
    minutes % TASK_STEP_MINUTES === 0
  );
}
