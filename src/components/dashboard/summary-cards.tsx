import { AlertIcon, CheckIcon, ClockIcon } from "@/components/icons";

export type SummaryCard = {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: "hours" | "pending" | "approved";
  tone: "brand" | "warn" | "success";
};

const ICONS = {
  hours: ClockIcon,
  pending: AlertIcon,
  approved: CheckIcon,
};

const TONES = {
  brand: "bg-brand-50 text-brand-600",
  warn: "bg-warn-50 text-warn-700",
  success: "bg-success-50 text-success-700",
};

export function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ key, label, value, hint, icon, tone }) => {
        const Icon = ICONS[icon];

        return (
          <article
            key={key}
            className="rounded-xl border border-line bg-surface p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink-soft">{label}</p>
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-lg ${TONES[tone]}`}
              >
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {value}
            </p>
            <p className="mt-1 text-xs text-ink-muted">{hint}</p>
          </article>
        );
      })}
    </div>
  );
}
