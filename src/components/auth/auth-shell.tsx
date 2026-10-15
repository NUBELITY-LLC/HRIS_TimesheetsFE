import Image from "next/image";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/nubelity-logo.png"
            alt="Nubelity"
            width={800}
            height={452}
            priority
            className="h-auto w-40"
          />
          <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
            Timesheets
          </p>
        </div>

        <div className="mt-10">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
          ) : null}
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
