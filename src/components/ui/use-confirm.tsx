"use client";

import { useCallback, useRef, useState } from "react";

import { ConfirmDialog, type ConfirmTone } from "@/components/ui/confirm-dialog";

export type ConfirmOptions = {
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

export function useConfirm() {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolver.current?.(false);
      resolver.current = resolve;
      setRequest(options);
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setRequest(null);
  }, []);

  const dialog = (
    <ConfirmDialog
      open={request !== null}
      title={request?.title ?? ""}
      body={request?.body}
      confirmLabel={request?.confirmLabel ?? ""}
      cancelLabel={request?.cancelLabel}
      tone={request?.tone}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, dialog };
}

export function useConfirmedSubmit() {
  const { confirm, dialog } = useConfirm();
  const confirmed = useRef(false);

  const guard = useCallback(
    (options: ConfirmOptions | null) =>
      (event: React.FormEvent<HTMLFormElement>) => {
        if (options === null) return;

        if (confirmed.current) {
          confirmed.current = false;
          return;
        }

        const form = event.currentTarget;
        event.preventDefault();

        void confirm(options).then((accepted) => {
          if (!accepted) return;
          confirmed.current = true;
          form.requestSubmit();
        });
      },
    [confirm],
  );

  return { guard, dialog };
}
