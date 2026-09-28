"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { PasswordField } from "@/components/ui/password-field";
import { RolesHelp } from "@/components/users/roles-help";
import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import {
  ContractTypeSelect,
  CurrencySelect,
  RatePeriodSelect,
} from "@/components/rates/rate-selects";
import { createUserAction, updateUserAction } from "@/lib/users/actions";
import {
  INITIAL_USER_FORM_STATE,
  type UserFormState,
  type UserFormValues,
} from "@/lib/users/form-state";
import {
  canHaveProject,
  defaultPermissionsFor,
  grantablePermissionCodes,
  hasFixedPermissions,
  PERMISSION_CODES,
  requiresProject,
  roleName,
  type RoleOption,
  type Viewer,
} from "@/lib/users/roles";
import {
  ASSIGNMENT_CODE_MAX,
  type ProjectView,
} from "@/lib/catalog/types";
import { useDictionary } from "@/i18n/provider";
import { submitKeepingValues } from "@/lib/forms/submit";
import { useFeedbackSlot } from "@/components/ui/feedback-scope";
import { useConfirmedSubmit } from "@/components/ui/use-confirm";

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
  labelAside,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  labelAside?: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-ink-soft">
          {label}
        </label>
        {labelAside}
      </div>
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
  actor: Viewer;
  roles: RoleOption[];
  projects?: ProjectView[];
  defaultValues?: UserFormValues;
  userId?: number;
  canChangeRole?: boolean;
  canChangePermissions?: boolean;
  canChangeStatus?: boolean;
};

type PermissionFieldsProps = {
  actor: Viewer;
  roleCode: string;
  initialRoleCode: string;
  initialPermissions: string[];
  error?: string;
  canChange: boolean;
  isPending: boolean;
};

function PermissionFields({
  actor,
  roleCode,
  initialRoleCode,
  initialPermissions,
  error,
  canChange,
  isPending,
}: PermissionFieldsProps) {
  const t = useDictionary();
  const [selection, setSelection] = useState({
    roleCode: initialRoleCode,
    permissions: initialPermissions,
  });

  if (selection.roleCode !== roleCode) {
    setSelection({
      roleCode,
      permissions:
        roleCode === initialRoleCode
          ? initialPermissions
          : defaultPermissionsFor(roleCode),
    });
  }

  if (!roleCode) return null;

  const fixed = hasFixedPermissions(roleCode);
  const editable = canChange && !fixed;
  const current = roleCode === initialRoleCode ? initialPermissions : [];
  const grantable = grantablePermissionCodes(actor, roleCode, current);
  const permissions = fixed
    ? defaultPermissionsFor(roleCode)
    : selection.permissions;

  function toggle(code: string, checked: boolean) {
    setSelection((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, code]
        : prev.permissions.filter((item) => item !== code),
    }));
  }

  const hint = fixed
    ? t.users.form.permissionsFixedHint
    : canChange
      ? t.users.form.permissionsHint
      : t.users.form.permissionsLockedHint;

  return (
    <fieldset className="space-y-3 rounded-lg border border-line p-4">
      <legend className="px-1 text-sm font-semibold text-ink">
        {t.users.form.permissionsSection}
      </legend>
      <p className="text-xs text-ink-muted">{hint}</p>

      {editable ? (
        <>
          <input type="hidden" name="permissionsEditable" value="1" />
          {permissions.map((code) => (
            <input key={code} type="hidden" name="permissions" value={code} />
          ))}
        </>
      ) : null}

      <ul className="grid gap-2 sm:grid-cols-2">
        {PERMISSION_CODES.map((code) => {
          const checked = permissions.includes(code);
          const disabled =
            isPending || !editable || !grantable.includes(code);

          return (
            <li key={code}>
              <label
                className={`flex h-full items-start gap-3 rounded-lg border border-line p-3 ${
                  disabled ? "bg-surface-muted opacity-70" : "bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) => toggle(code, event.target.checked)}
                  className="mt-0.5 size-4 rounded border-line text-brand-600 focus:ring-brand-100"
                />
                <span className="text-sm">
                  <span className="block font-medium text-ink">
                    {t.permissions[code].name}
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {t.permissions[code].description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {error ? <p className="text-xs text-danger-600">{error}</p> : null}
    </fieldset>
  );
}

type RoleFieldsProps = {
  ids: { roleCode: string; jobTitle: string };
  actor: Viewer;
  values: UserFormValues;
  fieldErrors: UserFormState["fieldErrors"];
  roles: RoleOption[];
  projects: ProjectView[];
  canChangeRole: boolean;
  canChangePermissions: boolean;
  isPending: boolean;
  isCreate: boolean;
};

function RoleFields({
  ids,
  actor,
  values,
  fieldErrors,
  roles,
  projects,
  canChangeRole,
  canChangePermissions,
  isPending,
  isCreate,
}: RoleFieldsProps) {
  const t = useDictionary();
  const [roleCode, setRoleCode] = useState(values.roleCode);
  const [projectId, setProjectId] = useState(values.projectId);
  const selectedProject =
    projects.find((project) => String(project.id) === projectId) ?? null;
  const keepTypedDates = projectId === values.projectId;
  const projectIds = {
    projectId: useId(),
    projectPayRate: useId(),
    projectCurrency: useId(),
    projectRatePeriod: useId(),
    projectContractType: useId(),
    projectStartDate: useId(),
    projectEndDate: useId(),
    projectAssignmentCode: useId(),
  };

  const showProjects = isCreate && canHaveProject(roleCode);
  const projectRequired = requiresProject(roleCode);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={ids.roleCode}
          label={t.users.form.role}
          labelAside={<RolesHelp roles={roles} />}
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
            {roleCode && !roles.some((role) => role.code === roleCode) ? (
              <option value={roleCode}>{roleName(roleCode, t)}</option>
            ) : null}
          </select>
          {canChangeRole ? null : (
            <input type="hidden" name="roleCode" value={roleCode} />
          )}
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

      <PermissionFields
        actor={actor}
        roleCode={roleCode}
        initialRoleCode={values.roleCode}
        initialPermissions={values.permissions}
        error={fieldErrors.permissions}
        canChange={canChangePermissions}
        isPending={isPending}
      />

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
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
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
                placeholder="0"
                defaultValue={values.projectPayRate}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.projectPayRate)}
                className={inputClass(Boolean(fieldErrors.projectPayRate))}
              />
            </Field>

            <Field id={projectIds.projectCurrency} label={t.rates.currency}>
              <CurrencySelect
                id={projectIds.projectCurrency}
                name="projectCurrency"
                defaultValue={values.projectCurrency}
                disabled={isPending}
                className={inputClass(false)}
              />
            </Field>

            <Field id={projectIds.projectRatePeriod} label={t.rates.period}>
              <RatePeriodSelect
                id={projectIds.projectRatePeriod}
                name="projectRatePeriod"
                defaultValue={values.projectRatePeriod}
                disabled={isPending}
                className={inputClass(false)}
              />
            </Field>

            <Field
              id={projectIds.projectContractType}
              label={t.payTerms.contractType}
            >
              <ContractTypeSelect
                id={projectIds.projectContractType}
                name="projectContractType"
                defaultValue={values.projectContractType}
                disabled={isPending}
                className={inputClass(false)}
              />
            </Field>

            <Field
              id={projectIds.projectStartDate}
              label={t.users.form.projectStart}
              error={fieldErrors.projectStartDate}
            >
              <input
                key={`start-${projectId}`}
                id={projectIds.projectStartDate}
                name="projectStartDate"
                type="date"
                defaultValue={
                  keepTypedDates && values.projectStartDate
                    ? values.projectStartDate
                    : (selectedProject?.startDate ?? "")
                }
                min={selectedProject?.startDate ?? undefined}
                max={selectedProject?.endDate ?? undefined}
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
                key={`end-${projectId}`}
                id={projectIds.projectEndDate}
                name="projectEndDate"
                type="date"
                defaultValue={
                  keepTypedDates && values.projectEndDate
                    ? values.projectEndDate
                    : (selectedProject?.endDate ?? "")
                }
                min={selectedProject?.startDate ?? undefined}
                max={selectedProject?.endDate ?? undefined}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.projectEndDate)}
                className={inputClass(Boolean(fieldErrors.projectEndDate))}
              />
            </Field>

            <Field
              id={projectIds.projectAssignmentCode}
              label={t.users.form.assignmentCode}
              error={fieldErrors.projectAssignmentCode}
              hint={t.users.form.assignmentCodeHint}
            >
              <input
                id={projectIds.projectAssignmentCode}
                name="projectAssignmentCode"
                type="text"
                autoComplete="off"
                maxLength={ASSIGNMENT_CODE_MAX}
                placeholder={t.users.form.assignmentCodePlaceholder}
                defaultValue={values.projectAssignmentCode}
                disabled={isPending}
                aria-invalid={Boolean(fieldErrors.projectAssignmentCode)}
                className={inputClass(
                  Boolean(fieldErrors.projectAssignmentCode),
                )}
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
  actor,
  roles,
  projects = [],
  defaultValues,
  userId,
  canChangeRole = true,
  canChangePermissions = true,
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
  const feedback = useFeedbackSlot();
  const { guard: confirmGuard, dialog: confirmDialog } = useConfirmedSubmit();

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
    <form onSubmit={submitKeepingValues(
        feedback.track(formAction),
        confirmGuard({
          title: isCreate
            ? t.confirmations.createUser.title
            : t.confirmations.saveUser.title,
          confirmLabel: isCreate
            ? t.confirmations.createUser.confirm
            : t.confirmations.saveUser.confirm,
        }),
      )} className="space-y-5" noValidate>
      {confirmDialog}
      {userId ? <input type="hidden" name="id" value={userId} /> : null}

      {feedback.visible && state.status === "success" && state.savedUser ? (
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
          actor={actor}
          values={values}
          fieldErrors={fieldErrors}
          roles={roles}
          projects={projects}
          canChangeRole={canChangeRole}
          canChangePermissions={canChangePermissions}
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
