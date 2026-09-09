"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { saveClientAction } from "@/lib/catalog/actions";
import {
  EMPTY_CLIENT_FORM_VALUES,
  INITIAL_CLIENT_FORM_STATE,
  type ClientFormField,
  type ClientFormValues,
} from "@/lib/catalog/form-state";
import type { CompanyView, PersonView } from "@/lib/catalog/types";
import { roleName } from "@/lib/users/roles";

const INPUT_BASE =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

const READONLY_INPUT =
  "w-full rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink-soft";

function inputClass(hasError: boolean): string {
  return `${INPUT_BASE} ${
    hasError
      ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
      : "border-line"
  }`;
}

function ClientFields({
  companies,
  managers,
  values,
  fieldErrors,
}: {
  companies: CompanyView[];
  managers: PersonView[];
  values: ClientFormValues;
  fieldErrors: Partial<Record<ClientFormField, string>>;
}) {
  const t = useDictionary();
  const [userId, setUserId] = useState(values.userId);
  const [clientName, setClientName] = useState(values.clientName);
  const [contactEmail, setContactEmail] = useState(values.contactEmail);

  const ids = {
    companyId: useId(),
    userId: useId(),
    clientName: useId(),
    contactEmail: useId(),
    isActive: useId(),
  };

  const linkedToUser = Boolean(userId);

  function selectUser(nextUserId: string) {
    setUserId(nextUserId);

    const person = managers.find((item) => String(item.id) === nextUserId);
    if (person) {
      setClientName(person.fullName);
      setContactEmail(person.email);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor={ids.companyId}
          className="block text-sm font-medium text-ink-soft"
        >
          {t.catalog.form.companyLabel}
        </label>
        <select
          id={ids.companyId}
          name="companyId"
          defaultValue={values.companyId}
          className={inputClass(Boolean(fieldErrors.companyId))}
        >
          <option value="">{t.catalog.form.companyPlaceholder}</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.tradeName}
            </option>
          ))}
        </select>
        {fieldErrors.companyId ? (
          <p className="text-xs text-danger-600">{fieldErrors.companyId}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={ids.userId}
          className="block text-sm font-medium text-ink-soft"
        >
          {t.catalog.form.managerUser}
        </label>
        <select
          id={ids.userId}
          name="userId"
          value={userId}
          onChange={(event) => selectUser(event.target.value)}
          className={inputClass(Boolean(fieldErrors.userId))}
        >
          <option value="">{t.catalog.form.managerUserPlaceholder}</option>
          {managers.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName} · {roleName(person.roleCode ?? "", t)} ·{" "}
              {person.email}
            </option>
          ))}
        </select>
        {fieldErrors.userId ? (
          <p className="text-xs text-danger-600">{fieldErrors.userId}</p>
        ) : managers.length === 0 ? (
          <p className="text-xs text-ink-muted">
            {t.catalog.form.managerUserEmpty}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={ids.clientName}
          className="block text-sm font-medium text-ink-soft"
        >
          {t.catalog.form.clientName}
        </label>
        <input
          id={ids.clientName}
          name="clientName"
          type="text"
          maxLength={150}
          readOnly={linkedToUser}
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          placeholder={t.catalog.form.clientNamePlaceholder}
          className={
            linkedToUser
              ? READONLY_INPUT
              : inputClass(Boolean(fieldErrors.clientName))
          }
        />
        {fieldErrors.clientName ? (
          <p className="text-xs text-danger-600">{fieldErrors.clientName}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={ids.contactEmail}
          className="block text-sm font-medium text-ink-soft"
        >
          {t.catalog.form.contactEmail}
        </label>
        <input
          id={ids.contactEmail}
          name="contactEmail"
          type="email"
          maxLength={150}
          readOnly={linkedToUser}
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          placeholder={t.catalog.form.contactEmailPlaceholder}
          className={
            linkedToUser
              ? READONLY_INPUT
              : inputClass(Boolean(fieldErrors.contactEmail))
          }
        />
        {fieldErrors.contactEmail ? (
          <p className="text-xs text-danger-600">{fieldErrors.contactEmail}</p>
        ) : !linkedToUser ? (
          <p className="text-xs text-ink-muted">
            {t.catalog.form.contactEmailHint}
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-line p-3.5">
        <input
          id={ids.isActive}
          name="isActive"
          type="checkbox"
          defaultChecked={values.isActive}
          className="mt-0.5 size-4 rounded border-line text-brand-600"
        />
        <label htmlFor={ids.isActive} className="text-sm font-medium text-ink">
          {t.catalog.form.activeTitle}
        </label>
      </div>
    </div>
  );
}

export function ClientForm({
  mode,
  companies,
  managers,
  clientId,
  defaultValues = EMPTY_CLIENT_FORM_VALUES,
}: {
  mode: "create" | "edit";
  companies: CompanyView[];
  managers: PersonView[];
  clientId?: number;
  defaultValues?: ClientFormValues;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(saveClientAction, {
    ...INITIAL_CLIENT_FORM_STATE,
    values: defaultValues,
  });

  const { fieldErrors, values } = state;
  const isCreate = mode === "create";
  const formKey = isCreate ? (state.savedName ?? "new") : "edit";
  const fieldValues =
    isCreate && state.status === "success" ? EMPTY_CLIENT_FORM_VALUES : values;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {clientId ? <input type="hidden" name="id" value={clientId} /> : null}

      {state.status === "success" && state.savedName ? (
        <div
          role="status"
          aria-live="polite"
          className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-3.5 text-sm text-success-800"
        >
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">
              {isCreate
                ? t.catalog.clients.createdTitle(state.savedName)
                : t.catalog.clients.updatedTitle(state.savedName)}
            </p>
            <Link
              href="/managers"
              className="font-medium text-success-700 underline underline-offset-2"
            >
              {t.catalog.clients.back}
            </Link>
          </div>
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      <ClientFields
        key={formKey}
        companies={companies}
        managers={managers}
        values={fieldValues}
        fieldErrors={fieldErrors}
      />

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? <SpinnerIcon className="size-4 animate-spin" /> : null}
        {isPending
          ? isCreate
            ? t.catalog.form.creating
            : t.catalog.form.saving
          : isCreate
            ? t.catalog.form.create
            : t.catalog.form.save}
      </button>
    </form>
  );
}
