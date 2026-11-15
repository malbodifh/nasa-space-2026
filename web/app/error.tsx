"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Queda en la consola del usuario para que pueda reportarlo sin datos sensibles.
    console.error("Error de la aplicación:", error.message);
  }, [error]);

  return (
    <main id="contenido" className="mx-auto w-full max-w-[720px] px-4 py-24 sm:px-6">
      <p className="etiqueta">Algo falló / Something went wrong</p>
      <h1 className="mt-3 text-[32px] leading-tight font-bold tracking-[-0.02em]">
        No pudimos mostrar esta página
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-tinta-suave">
        We couldn&apos;t render this page. Puede reintentar; si el problema sigue, abra Inicio.
        El mapa y los datos pueden seguir disponibles en el resto del sitio.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="boton boton-principal">
          Reintentar / Retry
        </button>
        <Link href="/" className="boton boton-cristal">
          Ir a Inicio / Go home
        </Link>
      </div>
      <p className="mt-8 text-[13px] text-tinta-suave">
        Esto no es una alerta oficial. En una emergencia en Costa Rica llame al 9-1-1 y siga a la CNE.
      </p>
    </main>
  );
}
