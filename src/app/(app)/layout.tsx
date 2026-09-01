import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  if (user.mustChangePassword) redirect("/change-password");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Sidebar user={user} />
      <main className="flex-1 bg-canvas px-5 py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
