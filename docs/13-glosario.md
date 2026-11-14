# 13 — Glosario

> Términos que van a aparecer todo el tiempo. Si alguien dice “cutout” y no sabés qué es, volvé acá.

---

## Astronomía

| Término | Qué significa |
|---|---|
| **RA** | Right Ascension (ascensión recta). Coordenada celeste, como la longitud. Se mide en horas (0–24 h) o grados (0–360°). |
| **Dec** | Declination (declinación). Coordenada celeste, como la latitud. Se mide en grados (−90° a +90°). |
| **Época / epoch** | Fecha de una observación. “Ver el objeto en distintas épocas” = comparar imágenes de distintas fechas. |
| **Proper motion** | Movimiento propio de una estrella en el cielo, en arcsec/año. Barnard's Star: ~10.3″/año. |
| **Arcsec** | Segundo de arco. 1° = 3600″. La Luna mide ~1800″. |
| **PSF** | Point Spread Function: cómo se ve un punto ideal después del telescopio/óptica. |
| **ePSF** | Effective PSF: modelo de PSF efectiva de SPHEREx. Viene en los cutouts y pesa ~4 MB. |
| **SNR** | Signal-to-Noise Ratio: relación señal/ruido. Más SNR = mejor detección. |
| **Variable** | Estrella que cambia de brillo con el tiempo. |
| **Transiente** | Objeto que aparece/desaparece o cambia rápido (supernova, GRB, etc.). |
| **Enana marrón** | Objeto con masa entre planeta gigante y estrella; no fusiona hidrógeno. |
| **AGN** | Active Galactic Nucleus: núcleo activo de galaxia, alimentado por un agujero negro supermasivo. |
| **Deep field** | Campo observado más profundo (más tiempo de exposición) que el survey amplio. |

---

## Datos y formatos

| Término | Qué significa |
|---|---|
| **FITS** | Formato estándar de astronomía. Contiene headers (metadata) y datos (imágenes/tablas). |
| **MEF** | Multi-Extension FITS: un FITS con varias extensiones (IMAGE, FLAGS, etc.). |
| **HDU** | Header Data Unit: cada bloque de un FITS. |
| **Header** | Metadata del FITS: WCS, unidades, exposición, etc. |
| **WCS** | World Coordinate System: cómo se pasa de píxel a coordenadas celestes. |
| **Cutout** | Recorte de una imagen FITS alrededor de una posición. |
| **HiPS** | Hierarchical Progressive Survey: pirámide de imágenes para visualización web. |
| **HEALPix** | Forma de dividir la esfera en píxeles (usada por HiPS). |
| **Tile** | Cada imagen/parche de una HiPS. |
| **MJy/sr** | MegaJansky por estereorradián: unidad de brillo superficial. |
| **Jy** | Jansky: unidad de flujo. 1 Jy = 10⁻²⁶ W/m²/Hz. |
| **µm** | Micrómetro: unidad de longitud de onda. |
| **Stretch** | Cómo se mapean los valores de la imagen a niveles de gris/color para que se vea bien. |
| **Percentil** | Valor que deja un porcentaje de datos por debajo. Se usa para el stretch (ej. 5%–99.5%). |

---

## Protocolos y APIs

| Término | Qué significa |
|---|---|
| **SIA2** | Simple Image Access v2: protocolo IVOA para buscar imágenes por posición/banda/tiempo. |
| **TAP** | Table Access Protocol: protocolo para consultar tablas con ADQL. |
| **ADQL** | Astronomical Data Query Language: SQL para astronomía. |
| **ObsCore** | Modelo de datos estándar para observaciones. |
| **IVOA** | International Virtual Observatory Alliance: estándares de datos astronómicos. |
| **IRSA** | NASA/IPAC Infrared Science Archive: archivo de datos infrarrojos. |
| **MAST** | Mikulski Archive for Space Telescopes. |
| **SIMBAD** | Base de datos de objetos astronómicos. |
| **NED** | NASA/IPAC Extragalactic Database. |
| **VizieR** | Catálogo de catálogos astronómicos. |
| **AWS S3** | Almacenamiento en la nube de Amazon; SPHEREx tiene un bucket público. |

---

## Procesamiento

| Término | Qué significa |
|---|---|
| **Reproject** | Reproyectar una imagen a otra grilla/WCS. |
| **Align / register** | Alinear imágenes para compararlas píxel a píxel. |
| **Blink comparator** | Herramienta que alterna imágenes rápido para detectar cambios. |
| **Difference imaging** | Restar una imagen de otra para resaltar cambios. |
| **Stacking** | Combinar varias imágenes para mejorar SNR. |
| **Centroid** | Centro de un objeto en la imagen (sub-píxel). |
| **Aperture photometry** | Medir flujo sumando píxeles dentro de una apertura. |
| **Background** | Fondo del cielo; hay que restarlo para medir bien. |
| **Flag** | Bit que indica un problema/condición en un píxel (rayo cósmico, satélite, etc.). |
| **Contamination** | Luz no deseada de otra fuente o del instrumento. |
| **Zodiacal light** | Luz del polvo del sistema solar; contamina el infrarrojo. |

---

## SPHEREx

| Término | Qué significa |
|---|---|
| **SPHEREx** | Misión NASA de espectrofotometría infrarroja all-sky. |
| **LVF** | Linear Variable Filter: filtro que varía la longitud de onda a través del campo. |
| **D1–D6** | Los 6 detectores de SPHEREx. |
| **Canal** | Cada una de las 17 bandas por detector. |
| **DR1** | Data Release 1. |
| **QR3** | Quick Release 3. |
| **Wide Survey** | Cobertura uniforme de todo el cielo. |
| **Deep Survey** | Campos más profundos. |
| **Spectral image** | Imagen donde la longitud de onda varía espacialmente. |

---

## Equipo

| Término | Qué significa |
|---|---|
| **P0 / P1 / P2** | Prioridad: imprescindible / importante / opcional. |
| **MVP** | Minimum Viable Product: lo mínimo que se puede mostrar. |
| **Scope freeze** | Momento en que se dejan de agregar features. |
| **Standup** | Reunión corta diaria (10 min). |
| **PR** | Pull Request. |
| **RACI** | Responsible, Accountable, Consulted, Informed. |
| **SI** | Super Intelligence (término oficial 2026 para IA). |
