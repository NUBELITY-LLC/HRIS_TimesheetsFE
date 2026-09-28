"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useDictionary } from "@/i18n/provider";
import type { RoleOption } from "@/lib/users/roles";

const PANEL_WIDTH = 320;
const GAP = 8;
const EDGE = 16;
const CLOSE_DELAY_MS = 120;

type Placement = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

function placeNear(trigger: HTMLElement): Placement {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(PANEL_WIDTH, viewportWidth - EDGE * 2);
  const left = Math.min(Math.max(rect.left, EDGE), viewportWidth - width - EDGE);

  const spaceBelow = viewportHeight - rect.bottom - GAP - EDGE;
  const spaceAbove = rect.top - GAP - EDGE;

  return spaceBelow >= 240 || spaceBelow >= spaceAbove
    ? { left, width, maxHeight: spaceBelow, top: rect.bottom + GAP }
    : {
        left,
        width,
        maxHeight: spaceAbove,
        bottom: viewportHeight - rect.top + GAP,
      };
}

export function RolesHelp({ roles }: { roles: RoleOption[] }) {
  const t = useDictionary();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  useEffect(() => {
    if (!placement) return;

    const dismiss = () => setPlacement(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);

    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [placement]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  if (roles.length === 0) return null;

  function open() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (triggerRef.current) setPlacement(placeNear(triggerRef.current));
  }

  function keepOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPlacement(null), CLOSE_DELAY_MS);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t.users.create.rolesSection}
        aria-describedby={placement ? panelId : undefined}
        aria-expanded={placement !== null}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={scheduleClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") setPlacement(null);
        }}
        className="grid size-4 place-items-center rounded-full border border-ink-muted text-[10px] leading-none font-semibold text-ink-muted transition-colors hover:border-brand-600 hover:text-brand-600 focus-visible:border-brand-600 focus-visible:text-brand-600 focus-visible:outline-none"
      >
        ?
      </button>

      {placement
        ? createPortal(
            <div
              id={panelId}
              role="tooltip"
              onMouseEnter={keepOpen}
              onMouseLeave={scheduleClose}
              style={placement}
              className="fixed z-50 overflow-y-auto rounded-xl border border-line bg-surface p-4 shadow-lg"
            >
              <p className="text-xs font-semibold text-ink">
                {t.users.create.rolesSection}
              </p>
              <dl className="mt-2 space-y-2">
                {roles.map((role) => (
                  <div key={role.code} className="text-xs">
                    <dt className="font-medium text-ink">{role.name}</dt>
                    <dd className="text-ink-muted">{role.description}</dd>
                  </div>
                ))}
              </dl>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
