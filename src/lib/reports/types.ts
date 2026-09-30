import type { PayLine } from "@/lib/payroll/pay-terms";
import type { TimesheetStatus } from "@/lib/timesheets/types";

export type ReportPerson = {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  jobTitle: string | null;
  isActive: boolean;
  roleCode: string;
  roleName: string;
};

export type ReportEntry = {
  timesheetId: number;
  submissionCode: string | null;
  status: TimesheetStatus;
  weekStart: string;
  weekEnd: string;
  minutes: number;
  hours: number;
  project: { id: number; name: string; code: string | null } | null;
  client: { id: number; name: string } | null;
  company: { id: number; name: string } | null;
  assignmentCode: string | null;
  payRate: number;
  hourlyRate: number;
  currency: string;
  amount: number;
  lines: PayLine[];
};

export type ReportDay = {
  date: string;
  minutes: number;
  hours: number;
  amount: number;
  entries: ReportEntry[];
};

export type ReportTotal = { currency: string; amount: number };

export type HoursReport = {
  person: ReportPerson;
  from: string;
  to: string;
  rangeDays: number;
  workedDays: number;
  totalMinutes: number;
  totalHours: number;
  totals: ReportTotal[];
  days: ReportDay[];
};

export type ScopeCompany = { id: number; name: string };

export type ScopeProject = {
  id: number;
  name: string;
  code: string | null;
  isClosed: boolean;
  clientName: string;
  companyId: number;
};

export type ReportScopes = {
  companies: ScopeCompany[];
  projects: ScopeProject[];
};

export type CompanyReportPerson = {
  id: number;
  fullName: string;
  jobTitle: string | null;
  minutes: number;
  hours: number;
  workedDays: number;
  hourlyRates: number[];
  totals: ReportTotal[];
};

export type CompanyReportProject = {
  id: number;
  name: string;
  code: string | null;
  isClosed: boolean;
  clientName: string;
  minutes: number;
  hours: number;
  totals: ReportTotal[];
  people: CompanyReportPerson[];
};

export type CompanyReportDay = {
  date: string;
  minutes: number;
  hours: number;
  totals: ReportTotal[];
};

export type CompanyReport = {
  company: { id: number; name: string };
  from: string;
  to: string;
  rangeDays: number;
  totalMinutes: number;
  totalHours: number;
  peopleCount: number;
  projectCount: number;
  totals: ReportTotal[];
  days: CompanyReportDay[];
  projects: CompanyReportProject[];
  people: CompanyReportPerson[];
  options: CompanyFilterOptions;
};

export type CompanyFilterOptions = {
  projects: { id: number; name: string; code: string | null }[];
  people: { id: number; fullName: string }[];
};

export type CompanyFilters = {
  projectId: string | null;
  userId: string | null;
};
