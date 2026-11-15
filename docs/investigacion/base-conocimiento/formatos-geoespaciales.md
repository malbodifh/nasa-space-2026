# Formatos y coordenadas

> **Para qué:** saber qué hay dentro de un archivo, si se puede abrir en QGIS, si sirve para
> medir o solo para mirar, y en qué sistema de coordenadas está.

## 1. Formatos de datos

| Formato | Qué es | Ventajas | Límites | Uso en el proyecto |
|---|---|---|---|---|
| **HDF5** (`.h5`) | Contenedor jerárquico de grupos, datasets y atributos. | Guarda ciencia compleja, metadatos y compresión; es el formato de NISAR. | No es un mapa listo; requiere librerías y conocer la jerarquía. | Producto NISAR original (no descargado por la app). |
| **NetCDF** (`.nc`) | Formato científico basado en HDF5 (netCDF-4) con convención CF. | Muy usado en clima; `xarray` lo lee bien. | No es un ráster SIG tradicional. | GFWED (no integrado). |
| **GeoTIFF** (`.tif`) | Imagen raster con georreferencia. | Lo abre cualquier SIG. | Archivos grandes; no siempre óptimo para nube. | LHASA (no integrado). |
| **COG** | GeoTIFF con teselas y overviews para lectura en rango. | Eficiente en la nube; no hay que bajar todo. | Requiere HTTP range y un servidor que lo soporte. | No usado hoy. |
| **GeoJSON** | JSON con geometrías y propiedades. | Legible, estándar, fácil en web. | Pesado para millones de puntos. | Alertas, sismos, capas OSM, bordes. |
| **JSON** | Texto estructurado. | Universal. | Sin esquema obligatorio. | `data/nisar.json`, metadatos de API. |
| **PNG** | Imagen raster sin pérdida. | Fiel a los píxeles; transparencia. | 8 bits por canal; no es un producto calibrado. | Vista previa NISAR. |
| **WebP** | Imagen comprimida (con o sin pérdida). | Más liviana que PNG para la web. | Pérdida si es *lossy*; no es dato científico. | Recortes y mapas de cambio en `public/nisar/`. |
| **KML** | XML geográfico de Google Earth. | Simple para geometrías y cámaras. | No es un ráster; puede tener estilos complejos. | Esquinas del recorte de la vista previa. |
| **WMTS** | Servicio de teselas predefinidas. | Caché y rendimiento. | Resolución/zoom fijos; no consulta arbitraria. | GIBS (fuegos, IMERG). |
| **MVT** | Tesela vectorial (Mapbox Vector Tile). | Compacta; propiedades por feature. | No es un ráster; requiere decodificar. | Anomalías térmicas de GIBS. |

### HDF5 en NISAR

- Todos los productos estándar de NISAR son HDF5.
- Siguen la convención **CF** de netCDF; por eso un lector HDF5 viejo puede no reconocer la
  proyección.
- GDAL **3.13+**, QGIS **4.2+** y ArcGIS Pro **3.4+** leen el formato NISAR. Con GDAL más viejo,
  copiar el archivo a `.nc` puede ayudar a que reconozca el sistema de coordenadas.
- La jerarquía típica de GCOV empieza en `/science/LSAR/GCOV/...`; nada está en la raíz `/`.
- Un dataset tiene datos, `dataspace`, `datatype` y atributos (unidades, rango, fechas).

### Lo que no hay que confundir

| Cosa | Qué es | Qué no es |
|---|---|---|
| **Producto científico** | HDF5 calibrado (GCOV, GUNW…). | No es el PNG de vista previa. |
| **Dato derivado** | GeoTIFF/GeoJSON calculado por nosotros. | No es un producto oficial NISAR. |
| **Capa de visualización** | WebP/PNG coloreado para la UI. | No sirve para medir dB. |
| **Metadatos** | JSON/XML que describe el dato. | No contiene los valores del raster. |
| **Previsualización** | Imagen de “quick look”. | No está calibrada ni tiene la resolución completa. |

## 2. Sistemas de coordenadas

| CRS | Tipo | Unidad | Uso | Cuidado |
|---|---|---|---|---|
| **EPSG:4326** | Geográfico (WGS84) | grados | GeoJSON, Worldview, GIBS EPSG:4326. | Orden lon/lat en GIS; algunas API usan lat/lon. |
| **EPSG:3857** | Proyectado (Web Mercator) | metros | MapLibre, teselas web, Carto. | Distorsiona áreas en latitudes altas. |
| **UTM** | Proyectado (WGS84) | metros | NISAR GCOV/GUNW; análisis local. | Cada zona tiene su meridiano central; no mezclar zonas. |
| **WGS84** | Datum | — | Base de EPSG:4326. | “WGS84” no es lo mismo que “EPSG:4326” en todos los contextos. |

### Reglas prácticas

1. **GeoJSON** va en EPSG:4326, con longitud primero (`[lon, lat]`).
2. **MapLibre** espera teselas en EPSG:3857 para el mapa base; las fuentes GeoJSON se reproyectan
   en el cliente.
3. **Worldview Snapshots** pide `BBOX` en orden **sur, oeste, norte, este** (latitud primero).
4. **GIBS MVT** de anomalías térmicas está en **EPSG:4326**; no se puede usar como fuente
   vectorial directa de MapLibre. El proyecto lo decodifica a GeoJSON en el servidor.
5. **GCOV** está en UTM; no asumir grados. GUNW/GOFF pueden usar UTM o estereográfica polar.
6. **No comparar** un raster en UTM con otro en EPSG:3857 sin reproyectar.

## 3. Qué formato elegir

| Necesidad | Formato | Por qué |
|---|---|---|
| Descargar ciencia NISAR | HDF5 | Es el original; conserva calibración y metadatos. |
| Abrir en QGIS/ArcGIS | GeoTIFF o HDF5 con GDAL moderno | SIG lo lee directo. |
| Visualizar en la web | PNG/WebP | Liviano y compatible. |
| Enviar vectores al mapa | GeoJSON | Simple y legible. |
| Servir teselas | WMTS/MVT | Caché y rendimiento. |
| Guardar metadatos | JSON | Flexible y fácil de versionar. |
| Intercambio GIS | GeoJSON/KML | Estándares y herramientas. |

## 4. Lo que usa el proyecto

| Archivo | Formato | Contenido | ¿Es dato científico? |
|---|---|---|---|
| `web/data/nisar.json` | JSON | Manifiesto de zonas, fechas, estados, porcentajes. | No; es un derivado. |
| `web/public/nisar/*.webp` | WebP | Recortes de la vista previa. | No; es visual. |
| `web/public/nisar/change-*.webp` | WebP | Máscara de cambio. | No; es un derivado heurístico. |
| `web/data/overpass-costa-rica.json` | JSON | Snapshot de OSM. | No; es cartografía. |
| `web/data/volcanoes.json` | GeoJSON | Volcanes holocenos. | No; es un catálogo. |
| `web/data/borders.json` | GeoJSON | Fronteras 110m. | No; es cartografía. |

## 5. Errores frecuentes

- **“El PNG tiene los valores de gamma0.”** No: es una imagen de 8 bits con realce.
- **“El GeoTIFF es el producto original.”** Puede ser un derivado; mirar metadatos.
- **“HDF5 y NetCDF son lo mismo.”** Comparten base, pero no son intercambiables sin conversión.
- **“MVT se puede pintar en MapLibre siempre.”** Solo si el esquema de teselas es compatible;
  EPSG:4326 no lo es por defecto.
- **“Las coordenadas están en metros.”** Depende del CRS; EPSG:4326 está en grados.
- **“El área del rectángulo es el área del humedal.”** No; es solo el rectángulo.

## Referencias

- ASF · HDF5: <https://nisar-docs.asf.alaska.edu/data-format>
- ASF · Projections: <https://nisar-docs.asf.alaska.edu/projections>
- GIBS: <https://nasa-gibs.github.io/gibs-api-docs/>
- GeoJSON RFC 7946: <https://datatracker.ietf.org/doc/html/rfc7946>
- EPSG:4326: <https://epsg.io/4326>
- EPSG:3857: <https://epsg.io/3857>
