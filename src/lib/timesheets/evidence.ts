import type { Dictionary } from "@/i18n/dictionaries";
import { EVIDENCE_ACCEPT, EVIDENCE_MAX_BYTES } from "@/lib/approvals/form-state";

const EVIDENCE_TYPES = EVIDENCE_ACCEPT.split(",");

export function evidenceIssue(file: File, t: Dictionary): string | null {
  if (!EVIDENCE_TYPES.includes(file.type)) {
    return t.timesheets.evidence.wrongType(file.name);
  }

  if (file.size > EVIDENCE_MAX_BYTES) {
    return t.timesheets.evidence.tooLarge(file.name);
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.max(1, Math.round(kb))} KB` : `${(kb / 1024).toFixed(1)} MB`;
}
