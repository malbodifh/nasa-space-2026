# 0002 · Stack y monolito

- **Fecha:** 2026-11-14 · **Estado:** aprobada
- **Decisión:** Next.js (App Router) + React + TypeScript estricto + Tailwind 4 + MapLibre GL con
  Carto Positron. Un monolito con Route Handlers como BFF, **sin base de datos ni login**. Deploy
  en Vercel con Root Directory `web/` y pnpm.
- **Alternativas descartadas:** vanilla JS, React + Vite, backend aparte, Postgres, Mapbox o
  Google Maps.
- **Consecuencias:** las claves viven solo en el servidor; no hay avisos con la página cerrada
  (haría falta servidor y base de datos). No se actualizan dependencias durante el hackathon.
