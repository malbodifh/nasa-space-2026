# Radar NISAR: cómo se compara la superficie

> **Estado:** vigente · describe `web/lib/sar*.ts`, `web/lib/nisar-remote.ts`,
> `web/scripts/build-nisar.mjs` y las rutas `/api/nisar/*`.

## Datos

- Producto **NISAR L2 GCOV** (banda L) del ASF DAAC. Se usa la **vista previa pública** en PNG
  (`*_LATLON.png` más un KML con las esquinas); no hace falta cuenta Earthdata.
- Canales: HH en rojo y azul, HV en verde. NISAR repite la órbita cada 12 días.
- El catálogo se consulta con CMR (`/api/nisar/search`); la imagen llega por `/api/nisar/browse`,
  que solo acepta nombres de granule válidos.

## Cómo se detecta el cambio

1. Se toman dos fechas del mismo punto: una **base** y una posterior.
2. Se suaviza HH con un filtro de 5×5 y se calcula la diferencia entre fechas.
3. Se corrige por el desfase mediano entre las dos imágenes.
4. Se ignoran los píxeles oscuros en ambas fechas (agua: mar y lagos).
5. Se marca como cambio lo que supera un umbral de 38 (de 255).

Se hace en el navegador (`lib/sar-change.ts`) para puntos cualquiera, y se **precalcula** para
cuatro zonas: Palo Verde, Caño Negro, Rincón de la Vieja y Tortuguero (`data/nisar.json` y
`public/nisar/`). Para las zonas de la pista 170 la base es el **20 de julio de 2026**: la imagen
provisional del 26 de junio trae una franja de brillo que inventaba cambios.

## Regenerar las zonas

```bash
node scripts/build-nisar.mjs           # desde web/; --refresh vuelve a consultar y descargar
```

Descarga unos 70 MB a `.cache/` (ignorado por git).

## Límites

- Es la **vista previa de 8 bits**, no el gamma0 calibrado del HDF5; los porcentajes de cambio
  son aproximados.
- Varias pasadas son **provisionales** (calibración en revisión); la app lo indica.
- Detectar un cambio no dice su causa. Una coincidencia espacial con un camino o un área
  protegida no es causalidad.
