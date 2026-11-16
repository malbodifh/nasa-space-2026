import type { Metadata } from "next";
import { Suspense } from "react";

import AcceptInvite from "@/components/AcceptInvite";

export const metadata: Metadata = {
  title: "Invitation · Gamma Alert",
  // Cada link es privado y de un solo uso: no debe aparecer en buscadores ni filtrarse al salir.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** Página del link de invitación (`/vincular?c=<código>`). */
export default function InvitePage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-80 w-full max-w-[560px] px-4 sm:px-6" />}>
      <AcceptInvite />
    </Suspense>
  );
}
