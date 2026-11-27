"use client";

import { ExportLinks } from "@/components/timesheets/export-links";
import { useShowActivities } from "@/lib/reports/show-activities";

export function HoursReportExportLinks({
  basePath,
  query,
}: {
  basePath: string;
  query: string;
}) {
  const showActivities = useShowActivities();
  const params = new URLSearchParams(query);

  if (showActivities) params.set("activities", "1");

  return <ExportLinks basePath={basePath} query={params.toString()} />;
}
