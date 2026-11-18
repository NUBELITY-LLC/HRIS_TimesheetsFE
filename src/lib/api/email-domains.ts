import type { Dictionary } from "@/i18n/dictionaries";

function detailValue(details: unknown, key: string): unknown {
  if (typeof details !== "object" || details === null || !(key in details)) {
    return undefined;
  }

  return (details as Record<string, unknown>)[key];
}

function detailList(details: unknown, key: string): unknown[] {
  const value = detailValue(details, key);
  return Array.isArray(value) ? value : [];
}

function personLabel(item: unknown, nameKey: string): string {
  const record = (item ?? {}) as Record<string, unknown>;
  return `${String(record[nameKey] ?? "")} (${String(record.email ?? "")})`;
}

export function emailDomainErrorCopy(
  details: unknown,
  t: Dictionary,
): string | null {
  const code = detailValue(details, "code");

  if (code === "EMAIL_DOMAIN_NOT_ALLOWED") {
    return t.catalog.errors.emailDomainNotAllowed(
      detailList(details, "allowedDomains").map(String),
    );
  }

  if (code === "CLIENT_EMAIL_OUTSIDE_DOMAINS") {
    return t.catalog.errors.clientsOutsideDomains(
      detailList(details, "clients").map((item) =>
        personLabel(item, "clientName"),
      ),
    );
  }

  if (code === "CONSULTANT_EMAIL_OUTSIDE_DOMAINS") {
    return t.catalog.errors.consultantsOutsideDomains(
      detailList(details, "users").map((item) => personLabel(item, "fullName")),
    );
  }

  return null;
}
