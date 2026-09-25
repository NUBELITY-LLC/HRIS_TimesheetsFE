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
