import type { Dictionary } from "@/i18n/dictionaries";

export const ROLE_ADMIN = "ADMIN";
export const ROLE_MANAGER = "MANAGER";
export const ROLE_FINANCE = "FINANCE";
export const ROLE_CONSULTANT = "CONSULTANT";
export const ROLE_EMPLOYEE = "EMPLOYEE";

export type RoleCode =
  | "CONSULTANT"
  | "EMPLOYEE"
  | "MANAGER"
  | "FINANCE"
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
  ROLE_ADMIN,
] as RoleCode[];

export const PROJECT_MANAGER_ROLE_CODES: RoleCode[] = [
  ROLE_ADMIN,
  ROLE_MANAGER,
] as RoleCode[];

export const MANAGER_CLIENT_ROLE_CODES: RoleCode[] = [
  ROLE_MANAGER,
  ROLE_FINANCE,
] as RoleCode[];

export const APPROVER_ROLE_CODES: RoleCode[] = [
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_FINANCE,
] as RoleCode[];

const MANAGER_MANAGEABLE_ROLES: string[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_FINANCE,
];

const MANAGER_GRANTABLE_ROLES: string[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_FINANCE,
];

const TIMESHEET_AUTHOR_ROLES: string[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
];

export const PROJECT_ASSIGNABLE_ROLE_CODES: RoleCode[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_FINANCE,
] as RoleCode[];

const PROJECT_ASSIGNABLE_ROLES: string[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_MANAGER,
  ROLE_FINANCE,
];

export function canManageUsers(actorRoleCode: string): boolean {
  return actorRoleCode === ROLE_ADMIN || actorRoleCode === ROLE_MANAGER;
}

export function canSubmitTimesheets(actorRoleCode: string): boolean {
  return TIMESHEET_AUTHOR_ROLES.includes(actorRoleCode);
}

export function canReviewTimesheets(actorRoleCode: string): boolean {
  return (
    actorRoleCode === ROLE_ADMIN ||
    actorRoleCode === ROLE_MANAGER ||
    actorRoleCode === ROLE_FINANCE
  );
}

export function canViewTeamDashboard(actorRoleCode: string): boolean {
  return (
    canReviewTimesheets(actorRoleCode) && !canSubmitTimesheets(actorRoleCode)
  );
}

export function canViewAllTimesheets(actorRoleCode: string): boolean {
  return actorRoleCode === ROLE_ADMIN;
}

export function canManageCatalog(actorRoleCode: string): boolean {
  return actorRoleCode === ROLE_ADMIN || actorRoleCode === ROLE_MANAGER;
}

export function canBeManagerClient(targetRoleCode: string): boolean {
  return MANAGER_CLIENT_ROLE_CODES.some((code) => code === targetRoleCode);
}

export function canHaveProject(targetRoleCode: string): boolean {
  return PROJECT_ASSIGNABLE_ROLES.includes(targetRoleCode);
}

export function requiresProject(targetRoleCode: string): boolean {
  return targetRoleCode === ROLE_CONSULTANT;
}

export function canManageRole(
  actorRoleCode: string,
  targetRoleCode: string,
): boolean {
  if (actorRoleCode === ROLE_ADMIN) return true;
  if (actorRoleCode === ROLE_MANAGER) {
    return MANAGER_MANAGEABLE_ROLES.includes(targetRoleCode);
  }
  return false;
}

export function grantableRoleCodes(actorRoleCode: string): RoleCode[] {
  if (actorRoleCode === ROLE_ADMIN) return ROLE_CODES;
  if (actorRoleCode === ROLE_MANAGER) {
    return ROLE_CODES.filter((code) => MANAGER_GRANTABLE_ROLES.includes(code));
  }
  return [];
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

export function roleCatalog(t: Dictionary): RoleOption[] {
  return ROLE_CODES.map((code) => roleOption(code, t));
}
