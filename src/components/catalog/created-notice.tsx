import Link from "next/link";

import { CheckIcon } from "@/components/icons";

export function CreatedNotice({
  message,
  action,
}: {
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <p
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-success-200 bg-success-50 p-3.5 text-sm text-success-800"
    >
      <CheckIcon className="size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      {action ? (
        <Link
          href={action.href}
          className="font-semibold underline underline-offset-2"
        >
          {action.label}
        </Link>
      ) : null}
    </p>
  );
}
