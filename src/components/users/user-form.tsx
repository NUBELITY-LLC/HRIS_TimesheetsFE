"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { PasswordField } from "@/components/ui/password-field";
import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { createUserAction, updateUserAction } from "@/lib/users/actions";
import {
  INITIAL_USER_FORM_STATE,
  type UserFormState,
  type UserFormValues,
} from "@/lib/users/form-state";
import { canHaveProject, requiresProject, type RoleOption } from "@/lib/users/roles";
import type { ProjectView } from "@/lib/catalog/types";
import { useDictionary } from "@/i18n/provider";

const INPUT_BASE =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:bg-surface-muted";

function inputClass(hasError: boolean) {
  const border = hasError
    ? "border-danger-600 focus:border-danger-600 focus:ring-danger-200"
    : "border-line";
  return `${INPUT_BASE} ${border}`;
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type UserFormProps = {
  mode: "create" | "edit";
  roles: RoleOption[];
  projects?: ProjectView[];
  defaultValues?: UserFormValues;
  userId?: number;
  canChangeRole?: boolean;
  canChangeStatus?: boolean;
};

type RoleFieldsProps = {
  ids: { roleCode: string; jobTitle: string };
  values: UserFormValues;
  fieldErrors: UserFormState["fieldErrors"];
  roles: RoleOption[];
  projects: ProjectView[];
  canChangeRole: boolean;
  isPending: boolean;
  isCreate: boolean;
};

function RoleFields({
  ids,
  values,
  fieldErrors,
  roles,
  projects,
  canChangeRole,
  isPending,
  isCreate,
}: RoleFieldsProps) {
  const t = useDictionary();
  const [roleCode, setRoleCode] = useState(values.roleCode);
  const projectIds = {
    projectId: useId(),
    projectPayRate: useId(),
    projectStartDate: useId(),
    projectEndDate: useId(),
  };

  const showProjects = isCreate && canHaveProject(roleCode);
  const projectRequired = requiresProject(roleCode);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={ids.roleCode}
          label={t.users.form.role}
          error={fieldErrors.roleCode}
          hint={canChangeRole ? undefined : t.users.form.roleLockedHint}
        >
          <select
            id={ids.roleCode}
            name="roleCode"
            value={roleCode}
            onChange={(event) => setRoleCode(event.target.value)}
            disabled={isPending || !canChangeRole}
            aria-invalid={Boolean(fieldErrors.roleCode)}
            className={inputClass(Boolean(fieldErrors.roleCode))}
          >
            <option value="">{t.users.form.rolePlaceholder}</option>
            {roles.map((role) => (
              <option key={role.code} value={role.code}>
                {role.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id={ids.jobTitle}
          label={t.users.form.jobTitle}
          error={fieldErrors.jobTitle}
          hint={t.users.form.jobTitleHint}
        >
          <input
            id={ids.jobTitle}
            name="jobTitle"
            type="text"
            autoComplete="off"
            maxLength={100}
            defaultValue={values.jobTitle}
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.jobTitle)}
            placeholder={t.users.form.jobTitlePlaceholder}
            className={inputClass(Boolean(fieldErrors.jobTitle))}
          />
        </Field>
      </div>

      {showProjects ? (
        <fieldset className="space-y-5 rounded-lg border border-line p-4">
          <legend className="px-1 text-sm font-semibold text-ink">
            {t.users.form.projectSection}
          </legend>

          <Field
            id={projectIds.projectId}
            label={t.users.form.project}
            error={fieldErrors.projectId}
          >
            <select
              id={projectIds.projectId}
              name="projectId"
              defaultValue={values.projectId}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.projectId)}
              className={inputClass(Boolean(fieldErrors.projectId))}
            >
              <option value="">
                {projectRequired
                  ? t.users.form.projectPlaceholder
                  : t.users.form.projectNone}
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                  {project.client ? ` · ${project.client.name}` : ""}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              id={projectIds.projectPayRate}
              label={t.users.form.payRate}
              error={fieldErrors.projectPayRate}
            >
              <input
                id={projectIds.projectPayRate}
                name="projectPayRate"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                maxLength={13}
                defaultValue={values.projectPayRate}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.projectPayRate)}
                className={inputClass(Boolean(fieldErrors.projectPayRate))}
              />
            </Field>

            <Field
              id={projectIds.projectStartDate}
              label={t.users.form.projectStart}
              error={fieldErrors.projectStartDate}
            >
              <input
                id={projectIds.projectStartDate}
                name="projectStartDate"
                type="date"
                defaultValue={values.projectStartDate}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.projectStartDate)}
                className={inputClass(Boolean(fieldErrors.projectStartDate))}
              />
            </Field>

            <Field
              id={projectIds.projectEndDate}
              label={t.users.form.projectEnd}
              error={fieldErrors.projectEndDate}
            >
              <input
                id={projectIds.projectEndDate}
                name="projectEndDate"
                type="date"
                defaultValue={values.projectEndDate}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.projectEndDate)}
                className={inputClass(Boolean(fieldErrors.projectEndDate))}
              />
            </Field>
          </div>
        </fieldset>
      ) : null}
    </>
  );
}

export function UserForm({
  mode,
  roles,
  projects = [],
  defaultValues,
  userId,
  canChangeRole = true,
  canChangeStatus = true,
}: UserFormProps) {
  const t = useDictionary();
  const isCreate = mode === "create";
  const initialState: UserFormState = defaultValues
    ? { ...INITIAL_USER_FORM_STATE, values: defaultValues }
    : INITIAL_USER_FORM_STATE;

  const [state, formAction, isPending] = useActionState(
    isCreate ? createUserAction : updateUserAction,
    initialState,
  );

  const ids = {
    fullName: useId(),
    userName: useId(),
    email: useId(),
    roleCode: useId(),
    jobTitle: useId(),
    isActive: useId(),
  };

  const { fieldErrors, values } = state;
  const formKey = isCreate
    ? (state.savedUser?.userName ?? "new")
    : (state.savedUser?.userName ?? "edit");

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {userId ? <input type="hidden" name="id" value={userId} /> : null}

      {state.status === "success" && state.savedUser ? (
        <div
          role="status"
          aria-live="polite"
          className="flex gap-3 rounded-lg border border-success-200 bg-success-50 p-3.5 text-sm text-success-800"
        >
          <CheckIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">
              {isCreate
                ? t.users.form.createdTitle(state.savedUser.fullName)
                : t.users.form.updatedTitle(state.savedUser.fullName)}
            </p>
            <p className="text-success-700">
              {state.savedUser.userName} · {state.savedUser.email} ·{" "}
              {state.savedUser.roleName}
              {isCreate ? `. ${t.users.form.createdHint}` : "."}
            </p>
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

      <div key={formKey} className="space-y-5">
        <Field
          id={ids.fullName}
          label={t.users.form.fullName}
          error={fieldErrors.fullName}
        >
          <input
            id={ids.fullName}
            name="fullName"
            type="text"
            autoComplete="off"
            maxLength={150}
            defaultValue={values.fullName}
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.fullName)}
            placeholder={t.users.form.fullNamePlaceholder}
            className={inputClass(Boolean(fieldErrors.fullName))}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={ids.userName}
            label={t.users.form.userName}
            error={fieldErrors.userName}
            hint={t.users.form.userNameHint}
          >
            <input
              id={ids.userName}
              name="userName"
              type="text"
              autoComplete="off"
              minLength={3}
              maxLength={50}
              defaultValue={values.userName}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.userName)}
              placeholder={t.users.form.userNamePlaceholder}
              className={inputClass(Boolean(fieldErrors.userName))}
            />
          </Field>

          <Field
            id={ids.email}
            label={t.users.form.email}
            error={fieldErrors.email}
          >
            <input
              id={ids.email}
              name="email"
              type="email"
              autoComplete="off"
              maxLength={254}
              defaultValue={values.email}
              disabled={isPending}
              aria-invalid={Boolean(fieldErrors.email)}
              placeholder={t.users.form.emailPlaceholder}
              className={inputClass(Boolean(fieldErrors.email))}
            />
          </Field>
        </div>

        <PasswordField
          name="password"
          label={
            isCreate
              ? t.users.form.temporaryPassword
              : t.users.form.resetPassword
          }
          error={fieldErrors.password}
          hint={
            isCreate
              ? t.users.form.temporaryPasswordHint
              : t.users.form.resetPasswordHint
          }
          disabled={isPending}
          showGenerator
          showChecklist
        />

        <RoleFields
          ids={{ roleCode: ids.roleCode, jobTitle: ids.jobTitle }}
          values={values}
          fieldErrors={fieldErrors}
          roles={roles}
          projects={projects}
          canChangeRole={canChangeRole}
          isPending={isPending}
          isCreate={isCreate}
        />

        <label
          htmlFor={ids.isActive}
          className={`flex items-start gap-3 rounded-lg border border-line bg-surface-muted p-3.5 ${
            canChangeStatus ? "" : "opacity-60"
          }`}
        >
          <input
            id={ids.isActive}
            name="isActive"
            type="checkbox"
            defaultChecked={values.isActive}
            disabled={isPending || !canChangeStatus}
            className="mt-0.5 size-4 rounded border-line text-brand-600 focus:ring-brand-100"
          />
          <span className="text-sm">
            <span className="block font-medium text-ink">
              {t.users.form.activeTitle}
            </span>
            {canChangeStatus ? null : (
              <span className="block text-ink-muted">
                {t.users.form.activeLockedHint}
              </span>
            )}
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <Link
          href="/users"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
        >
          {t.common.backToUsers}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-600/60"
        >
          {isPending ? (
            <>
              <SpinnerIcon className="size-4 animate-spin" />
              {isCreate ? t.users.form.creating : t.users.form.saving}
            </>
          ) : isCreate ? (
            t.users.form.create
          ) : (
            t.users.form.save
          )}
        </button>
      </div>
    </form>
  );
}
