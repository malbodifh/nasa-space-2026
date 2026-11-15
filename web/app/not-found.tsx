import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-4 py-24 sm:px-6">
      <p className="etiqueta">404</p>
      <h1 className="mt-3 text-[32px] leading-tight font-bold tracking-[-0.02em]">
        Esta página no existe
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-tinta-suave">
        This page doesn&apos;t exist. Puede volver a Inicio, mirar las alertas o abrir el estudio
        de superficie desde un evento.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="boton boton-principal">
          Ir a Inicio / Go home
        </Link>
        <Link href="/acerca" className="boton boton-cristal">
          Acerca de la app / About
        </Link>
      </div>
    </main>
  );
}
