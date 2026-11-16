import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import LocaleProvider from "@/components/LocaleProvider";
import SiteHeader from "@/components/SiteHeader";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gamma Alert · NASA Space Apps 2026",
  description:
    "Disaster alerts near you and a visual comparison of the surface with NASA-ISRO NISAR radar. Not an official alert.",
  applicationName: "Gamma Alert",
  openGraph: {
    title: "Gamma Alert · NASA Space Apps 2026",
    description:
      "Natural disasters in Costa Rica and a visual comparison of the surface with NASA-ISRO NISAR radar. Not an official alert.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["es_CR"],
  },
  twitter: {
    card: "summary",
    title: "Gamma Alert · NASA Space Apps 2026",
    description:
      "Natural disasters in Costa Rica and a visual comparison of the surface with NASA-ISRO NISAR radar.",
  },
};

export const viewport: Viewport = {
  themeColor: "#171A23",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full">
        <LocaleProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-elevada focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-tinta focus:shadow-lg"
          >
            Skip to content / Saltar al contenido
          </a>
          <SiteHeader />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
