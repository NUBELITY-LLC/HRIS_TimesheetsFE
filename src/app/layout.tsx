import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { LocaleProvider } from "@/i18n/provider";
import { getDictionary, getLocale } from "@/i18n/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();

  return {
    title: {
      default: t.metadata.title,
      template: `%s · ${t.metadata.title}`,
    },
    description: t.metadata.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
