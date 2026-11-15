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
3. En el navegador se corrige por la **mediana** de las diferencias entre las dos imágenes.
   El pipeline precalculado compensa por la **media de HH del cuadro completo**; no son el
   mismo procedimiento ni se deben comparar sus cifras como una serie homogénea.
4. Se ignoran los píxeles oscuros en ambas fechas. Es una exclusión por brillo, **no una máscara
   validada de agua**.
5. Se marca como cambio lo que supera un umbral de 38 (de 255).

Se hace en el navegador (`lib/sar-change.ts`) para puntos cualquiera, y se **precalcula** para
cuatro zonas: Palo Verde, Caño Negro, Rincón de la Vieja y Tortuguero (`data/nisar.json` y
`public/nisar/`). Para las zonas de la pista 170 la base es el **20 de julio de 2026**: la imagen
provisional del 26 de junio trae una franja de brillo que inventaba cambios.
Las pasadas anteriores a la base no se ofrecen en el estudio ni en las detecciones
informativas. Sus imágenes y el manifiesto original se conservan para trazabilidad.

## Regenerar las zonas

```bash
node scripts/build-nisar.mjs           # desde web/; --refresh vuelve a consultar y descargar
```

Descarga unos 70 MB a `.cache/` (ignorado por git).

## Límites

- Es la **vista previa de 8 bits**, no el gamma0 calibrado del HDF5. El porcentaje usa como
  denominador los píxeles válidos en ambas fechas y no oscuros en ambas; **no es porcentaje del
  área del humedal, de inundación ni de daño**. No se convierte ese porcentaje a km² afectados.
- El estudio también desglosa los píxeles más claros y más oscuros entre los comparables;
  la proporción comparable usa todos los píxeles del recorte como denominador. Ninguno identifica
  una causa ni demuestra un cambio físico o de topografía.
- Las esquinas del recorte provienen del **KML de la vista previa**; la georreferenciación es
  aproximada y puede diferir del producto científico.
- Varias pasadas son **provisionales** (calibración en revisión); la app lo indica.
- Las bases son provisionales y algunas pasadas posteriores pertenecen a la colección
  validada. Mezclar versiones de procesamiento puede producir diferencias aparentes: una
  comparación así no demuestra un cambio físico.
- Detectar un cambio no dice su causa. Una coincidencia espacial con un camino o un área
  protegida no es causalidad.
