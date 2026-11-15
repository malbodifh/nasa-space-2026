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
  title: "Memoria de Fuego · NASA Space Apps 2026",
  description:
    "Alertas de desastres cerca de usted y cómo cambió la superficie de la Tierra, vista con el radar NASA-ISRO NISAR. No es una alerta oficial.",
  applicationName: "Memoria de Fuego",
  openGraph: {
    title: "Memoria de Fuego · NASA Space Apps 2026",
    description:
      "Desastres naturales en Costa Rica y cambios de superficie con radar NASA-ISRO NISAR. No es una alerta oficial.",
    type: "website",
    locale: "es_CR",
  },
  twitter: {
    card: "summary",
    title: "Memoria de Fuego · NASA Space Apps 2026",
    description:
      "Desastres naturales en Costa Rica y cambios de superficie con radar NASA-ISRO NISAR.",
  },
};

export const viewport: Viewport = {
  themeColor: "#171A23",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full">
        <LocaleProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-elevada focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-tinta focus:shadow-lg"
          >
            Saltar al contenido / Skip to content
          </a>
          <SiteHeader />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
