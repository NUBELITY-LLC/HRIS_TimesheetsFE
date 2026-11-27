"use client";

import {
  setShowActivities,
  useShowActivities,
} from "@/lib/reports/show-activities";

export function ActivityBreakdownSwitch({ label }: { label: string }) {
  const showAll = useShowActivities();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={showAll}
      onClick={() => setShowActivities(!showAll)}
      className="group flex items-center gap-2.5 rounded-full text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          showAll ? "bg-brand-600" : "bg-line group-hover:bg-ink-muted/40"
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
            showAll ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function DayBreakdownRows({ children }: { children: React.ReactNode }) {
  return useShowActivities() ? <>{children}</> : null;
}
