import type { Dictionary } from "@/i18n/dictionaries";

export const ROLE_ADMIN = "ADMIN";
export const ROLE_MANAGER = "MANAGER";
export const ROLE_FINANCE = "FINANCE";
export const ROLE_CONSULTANT = "CONSULTANT";
export const ROLE_EMPLOYEE = "EMPLOYEE";
export const ROLE_EXTERNAL_MANAGER = "EXTERNAL_MANAGER";

export type RoleCode =
  | "CONSULTANT"
  | "EMPLOYEE"
  | "MANAGER"
  | "FINANCE"
  | "EXTERNAL_MANAGER"
  | "ADMIN";

export type RoleOption = {
  code: RoleCode;
  name: string;
  description: string;
};

export const ROLE_CODES: RoleCode[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_FINANCE,
  ROLE_EXTERNAL_MANAGER,
  ROLE_ADMIN,
] as RoleCode[];

export const PROJECT_MANAGER_ROLE_CODES: RoleCode[] = [
  ROLE_ADMIN,
  ROLE_MANAGER,
] as RoleCode[];

export const MANAGER_CLIENT_ROLE_CODES: RoleCode[] = [
  ROLE_MANAGER,
  ROLE_EXTERNAL_MANAGER,
  ROLE_FINANCE,
] as RoleCode[];

export const APPROVER_ROLE_CODES: RoleCode[] = [
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_FINANCE,
] as RoleCode[];

export const PROJECT_ASSIGNABLE_ROLE_CODES: RoleCode[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_FINANCE,
] as RoleCode[];

const DELEGATED_MANAGEABLE_ROLES: string[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_FINANCE,
  ROLE_EXTERNAL_MANAGER,
];

const DELEGATED_GRANTABLE_ROLES: string[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_FINANCE,
  ROLE_EXTERNAL_MANAGER,
];

export const PERMISSION_TIMESHEETS_SUBMIT = "TIMESHEETS_SUBMIT";
export const PERMISSION_TIMESHEETS_APPROVE = "TIMESHEETS_APPROVE";
export const PERMISSION_CATALOG_MANAGE = "CATALOG_MANAGE";
export const PERMISSION_USERS_MANAGE = "USERS_MANAGE";
export const PERMISSION_REPORTS_VIEW = "REPORTS_VIEW";
export const PERMISSION_PAYROLL_MANAGE = "PAYROLL_MANAGE";

export type PermissionCode =
  | "TIMESHEETS_SUBMIT"
  | "TIMESHEETS_APPROVE"
  | "CATALOG_MANAGE"
  | "USERS_MANAGE"
  | "REPORTS_VIEW"
  | "PAYROLL_MANAGE";

export const PERMISSION_CODES: PermissionCode[] = [
  PERMISSION_TIMESHEETS_SUBMIT,
  PERMISSION_TIMESHEETS_APPROVE,
  PERMISSION_CATALOG_MANAGE,
  PERMISSION_USERS_MANAGE,
  PERMISSION_REPORTS_VIEW,
  PERMISSION_PAYROLL_MANAGE,
] as PermissionCode[];

const DEFAULT_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  ADMIN: [
    "TIMESHEETS_APPROVE",
    "CATALOG_MANAGE",
    "USERS_MANAGE",
    "REPORTS_VIEW",
    "PAYROLL_MANAGE",
  ],
  MANAGER: [
    "TIMESHEETS_SUBMIT",
    "TIMESHEETS_APPROVE",
    "CATALOG_MANAGE",
    "USERS_MANAGE",
  ],
  FINANCE: [
    "TIMESHEETS_SUBMIT",
    "TIMESHEETS_APPROVE",
    "REPORTS_VIEW",
    "PAYROLL_MANAGE",
  ],
  CONSULTANT: ["TIMESHEETS_SUBMIT"],
  EMPLOYEE: ["TIMESHEETS_SUBMIT"],
  EXTERNAL_MANAGER: ["TIMESHEETS_APPROVE"],
};

const FIXED_PERMISSION_ROLES: string[] = [ROLE_ADMIN, ROLE_EXTERNAL_MANAGER];

export type Viewer = {
  role: { code: string };
  permissions?: string[];
};

export function hasPermission(user: Viewer, code: PermissionCode): boolean {
  return (user.permissions ?? []).includes(code);
}

export function isPermissionCode(value: string): value is PermissionCode {
  return (PERMISSION_CODES as string[]).includes(value);
}

export function defaultPermissionsFor(roleCode: string): PermissionCode[] {
  return roleCode in DEFAULT_PERMISSIONS
    ? [...DEFAULT_PERMISSIONS[roleCode as RoleCode]]
    : [];
}

export function hasFixedPermissions(roleCode: string): boolean {
  return FIXED_PERMISSION_ROLES.includes(roleCode);
}

export function grantablePermissionCodes(
  actor: Viewer,
  targetRoleCode: string,
  current: string[] = [],
): PermissionCode[] {
  if (hasFixedPermissions(targetRoleCode)) {
    return defaultPermissionsFor(targetRoleCode);
  }
  if (actor.role.code === ROLE_ADMIN) return PERMISSION_CODES;

  const defaults = defaultPermissionsFor(targetRoleCode);
  return PERMISSION_CODES.filter(
    (code) =>
      hasPermission(actor, code) ||
      defaults.includes(code) ||
      current.includes(code),
  );
}

export function canDeleteUsers(actor: Viewer): boolean {
  return actor.role.code === ROLE_ADMIN;
}

export function canManageUsers(actor: Viewer): boolean {
  return hasPermission(actor, PERMISSION_USERS_MANAGE);
}

export function canSubmitTimesheets(actor: Viewer): boolean {
  return hasPermission(actor, PERMISSION_TIMESHEETS_SUBMIT);
}

export function canReviewTimesheets(actor: Viewer): boolean {
  return hasPermission(actor, PERMISSION_TIMESHEETS_APPROVE);
}

export function canApproveOnBehalf(actor: Viewer): boolean {
  return (
    canReviewTimesheets(actor) &&
    PROJECT_MANAGER_ROLE_CODES.some((code) => code === actor.role.code)
  );
}

export function canViewTeamDashboard(actor: Viewer): boolean {
  return canReviewTimesheets(actor);
}

export function canViewHoursReports(actor: Viewer): boolean {
  return hasPermission(actor, PERMISSION_REPORTS_VIEW);
}

export function canSeeCosts(actor: Viewer): boolean {
  return actor.role.code !== ROLE_EXTERNAL_MANAGER;
}

export function canManagePayroll(actor: Viewer): boolean {
  return hasPermission(actor, PERMISSION_PAYROLL_MANAGE);
}

export function canManageCatalog(actor: Viewer): boolean {
  return hasPermission(actor, PERMISSION_CATALOG_MANAGE);
}

export function canBeManagerClient(targetRoleCode: string): boolean {
  return MANAGER_CLIENT_ROLE_CODES.some((code) => code === targetRoleCode);
}

export function canHaveProject(targetRoleCode: string): boolean {
  return PROJECT_ASSIGNABLE_ROLE_CODES.some((code) => code === targetRoleCode);
}

export function requiresProject(targetRoleCode: string): boolean {
  return targetRoleCode === ROLE_CONSULTANT;
}

export function canSeeRole(
  actorRoleCode: string,
  targetRoleCode: string,
): boolean {
  return actorRoleCode === ROLE_ADMIN || targetRoleCode !== ROLE_ADMIN;
}

export function canManageRole(
  actorRoleCode: string,
  targetRoleCode: string,
): boolean {
  if (actorRoleCode === ROLE_ADMIN) return true;
  return DELEGATED_MANAGEABLE_ROLES.includes(targetRoleCode);
}

export function grantableRoleCodes(actorRoleCode: string): RoleCode[] {
  if (actorRoleCode === ROLE_ADMIN) return ROLE_CODES;
  return ROLE_CODES.filter((code) => DELEGATED_GRANTABLE_ROLES.includes(code));
}

export function canGrantRole(
  actorRoleCode: string,
  targetRoleCode: string,
): boolean {
  return grantableRoleCodes(actorRoleCode).some(
    (code) => code === targetRoleCode,
  );
}

export function roleName(code: string, t: Dictionary): string {
  return code in t.roles ? t.roles[code as RoleCode].name : code;
}

export function roleOption(code: RoleCode, t: Dictionary): RoleOption {
  return {
    code,
    name: t.roles[code].name,
    description: t.roles[code].description,
  };
}

export function manageableRoles(
  actorRoleCode: string,
  t: Dictionary,
): RoleOption[] {
  return grantableRoleCodes(actorRoleCode).map((code) => roleOption(code, t));
}

export function visibleRoleCatalog(
  actorRoleCode: string,
  t: Dictionary,
): RoleOption[] {
  return ROLE_CODES.filter((code) => canSeeRole(actorRoleCode, code)).map(
    (code) => roleOption(code, t),
  );
}
