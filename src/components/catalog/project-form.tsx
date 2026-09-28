"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { useDictionary } from "@/i18n/provider";
import { saveProjectAction } from "@/lib/catalog/actions";
import {
  EMPTY_PROJECT_FORM_VALUES,
  INITIAL_PROJECT_FORM_STATE,
  type ProjectFormValues,
} from "@/lib/catalog/form-state";
import type {
  ClientView,
  CompanyView,
  PersonView,
} from "@/lib/catalog/types";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";

const INPUT_BASE =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none";

function inputClass(hasError: boolean): string {
  return `${INPUT_BASE} ${
    hasError
      ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
      : "border-line"
  }`;
}

export function ProjectForm({
  mode,
  companies,
  clients,
  managers,
  projectId,
  lockEndDate = false,
  defaultValues = EMPTY_PROJECT_FORM_VALUES,
}: {
  mode: "create" | "edit";
  companies: CompanyView[];
  clients: ClientView[];
  managers: PersonView[];
  projectId?: number;
  lockEndDate?: boolean;
  defaultValues?: ProjectFormValues;
}) {
  const t = useDictionary();
  const [state, formAction, isPending] = useActionState(saveProjectAction, {
    ...INITIAL_PROJECT_FORM_STATE,
    values: defaultValues,
  });
  const feedback = useFeedbackSlot();
  const isCreate = mode === "create";

  const ids = {
    companyId: useId(),
    clientId: useId(),
    projectName: useId(),
    code: useId(),
    managerId: useId(),
    startDate: useId(),
    endDate: useId(),
  };
  const { fieldErrors, values } = state;
  const [companyId, setCompanyId] = useState(values.companyId);
  const [clientId, setClientId] = useState(values.clientId);

  const clientOptions = clients.filter(
    (client) =>
      !companyId ||
      String(client.company?.id ?? "") === companyId ||
      String(client.id) === clientId,
  );

  function selectCompany(nextCompanyId: string) {
    setCompanyId(nextCompanyId);

    const keepsClient = clients.some(
      (client) =>
        String(client.id) === clientId &&
        (!nextCompanyId || String(client.company?.id ?? "") === nextCompanyId),
    );
    if (!keepsClient) setClientId("");
  }

  return (
    <form onSubmit={submitKeepingValues(feedback.track(formAction))} className="space-y-5" noValidate>
      {projectId ? <input type="hidden" name="id" value={projectId} /> : null}

      {feedback.visible && state.status === "success" && state.savedName ? (
        <div
          role="status"
          aria-live="polite"
          className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-3.5 text-sm text-success-800"
        >
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">
              {t.catalog.projects.updatedTitle(state.savedName)}
            </p>
            <Link
              href="/projects"
              className="font-medium text-success-700 underline underline-offset-2"
            >
              {t.catalog.projects.back}
            </Link>
          </div>
        </div>
      ) : null}

      {feedback.visible && state.status === "error" && state.message ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex gap-3 rounded-lg border border-danger-200 bg-danger-50 p-3.5 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
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
              value={companyId}
              onChange={(event) => selectCompany(event.target.value)}
              className={inputClass(false)}
            >
              <option value="">{t.catalog.filters.allCompanies}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.tradeName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={ids.clientId}
              className="block text-sm font-medium text-ink-soft"
            >
              {t.catalog.form.clientLabel}
            </label>
            <select
              id={ids.clientId}
              name="clientId"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className={inputClass(Boolean(fieldErrors.clientId))}
            >
              <option value="">{t.catalog.form.clientPlaceholder}</option>
              {clientOptions.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.clientName}
                </option>
              ))}
            </select>
            {fieldErrors.clientId ? (
              <p className="text-xs text-danger-600">{fieldErrors.clientId}</p>
            ) : clientOptions.length === 0 ? (
              <p className="text-xs text-ink-muted">
                {t.catalog.form.clientCompanyEmpty}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={ids.projectName}
            className="block text-sm font-medium text-ink-soft"
          >
            {t.catalog.form.projectName}
          </label>
          <input
            id={ids.projectName}
            name="projectName"
            type="text"
            maxLength={150}
            required
            defaultValue={values.projectName}
            placeholder={t.catalog.form.projectNamePlaceholder}
            className={inputClass(Boolean(fieldErrors.projectName))}
          />
          {fieldErrors.projectName ? (
            <p className="text-xs text-danger-600">{fieldErrors.projectName}</p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor={ids.code}
              className="block text-sm font-medium text-ink-soft"
            >
              {t.catalog.form.code}
            </label>
            <input
              id={ids.code}
              name="code"
              type="text"
              maxLength={40}
              defaultValue={values.code}
              placeholder={t.catalog.form.codePlaceholder}
              className={inputClass(Boolean(fieldErrors.code))}
            />
            {fieldErrors.code ? (
              <p className="text-xs text-danger-600">{fieldErrors.code}</p>
            ) : (
              <p className="text-xs text-ink-muted">{t.catalog.form.codeHint}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={ids.managerId}
              className="block text-sm font-medium text-ink-soft"
            >
              {t.catalog.form.manager}
            </label>
            <select
              id={ids.managerId}
              name="managerId"
              defaultValue={values.managerId}
              className={inputClass(Boolean(fieldErrors.managerId))}
            >
              <option value="">{t.catalog.form.managerPlaceholder}</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.fullName}
                </option>
              ))}
            </select>
            {fieldErrors.managerId ? (
              <p className="text-xs text-danger-600">{fieldErrors.managerId}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={ids.startDate}
              className="block text-sm font-medium text-ink-soft"
            >
              {t.catalog.form.startDate}
            </label>
            <input
              id={ids.startDate}
              name="startDate"
              type="date"
              defaultValue={values.startDate}
              className={inputClass(Boolean(fieldErrors.startDate))}
            />
            {fieldErrors.startDate ? (
              <p className="text-xs text-danger-600">{fieldErrors.startDate}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={ids.endDate}
              className="block text-sm font-medium text-ink-soft"
            >
              {t.catalog.form.endDate}
            </label>
            <input
              id={ids.endDate}
              name={lockEndDate ? undefined : "endDate"}
              type="date"
              defaultValue={values.endDate}
              disabled={lockEndDate}
              className={inputClass(Boolean(fieldErrors.endDate))}
            />
            {lockEndDate ? (
              <input type="hidden" name="lockedEndDate" value={values.endDate} />
            ) : null}
            {fieldErrors.endDate ? (
              <p className="text-xs text-danger-600">{fieldErrors.endDate}</p>
            ) : (
              <p className="text-xs text-ink-muted">
                {lockEndDate
                  ? t.catalog.form.endDateLocked
                  : t.catalog.form.endDateHint}
              </p>
            )}
          </div>
        </div>
      </div>

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
