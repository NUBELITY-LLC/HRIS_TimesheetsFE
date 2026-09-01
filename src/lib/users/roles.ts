import type { Dictionary } from "@/i18n/dictionaries";

export const ROLE_ADMIN = "ADMIN";
export const ROLE_PM = "PM";
export const ROLE_CONSULTANT = "CONSULTANT";
export const ROLE_EMPLOYEE = "EMPLOYEE";

export type RoleCode = "CONSULTANT" | "EMPLOYEE" | "PM" | "ADMIN";

export type RoleOption = {
  code: RoleCode;
  name: string;
  description: string;
};

export const ROLE_CODES: RoleCode[] = [
  ROLE_CONSULTANT,
  ROLE_EMPLOYEE,
  ROLE_PM,
  ROLE_ADMIN,
] as RoleCode[];

const PM_MANAGEABLE_ROLES: string[] = [ROLE_CONSULTANT, ROLE_EMPLOYEE];

export function canManageUsers(actorRoleCode: string): boolean {
  return actorRoleCode === ROLE_ADMIN || actorRoleCode === ROLE_PM;
}

export function canManageRole(
  actorRoleCode: string,
  targetRoleCode: string,
): boolean {
  if (actorRoleCode === ROLE_ADMIN) return true;
  if (actorRoleCode === ROLE_PM) return PM_MANAGEABLE_ROLES.includes(targetRoleCode);
  return false;
}

export function manageableRoleCodes(actorRoleCode: string): RoleCode[] {
  if (actorRoleCode === ROLE_ADMIN) return ROLE_CODES;
  if (actorRoleCode === ROLE_PM) {
    return ROLE_CODES.filter((code) => PM_MANAGEABLE_ROLES.includes(code));
  }
  return [];
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
  return manageableRoleCodes(actorRoleCode).map((code) => roleOption(code, t));
}

export function roleCatalog(t: Dictionary): RoleOption[] {
  return ROLE_CODES.map((code) => roleOption(code, t));
}
