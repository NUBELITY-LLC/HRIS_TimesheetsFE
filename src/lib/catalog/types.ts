export type CompanyView = {
  id: number;
  legalName: string;
  tradeName: string;
  rfc: string | null;
  isActive: boolean;
};

export type ClientView = {
  id: number;
  clientName: string;
  contactEmail: string | null;
  isActive: boolean;
  company: CompanyView | null;
};

export type PersonView = {
  id: number;
  fullName: string;
  email: string;
  roleCode: string | null;
  isActive: boolean;
};

export type ProjectView = {
  id: number;
  projectName: string;
  code: string | null;
  startDate: string | null;
  endDate: string | null;
  client: { id: number; name: string; isActive: boolean } | null;
  manager: PersonView | null;
};

export const RFC_LENGTHS = [12, 13] as const;
