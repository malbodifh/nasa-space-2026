# 15 — Validación de datos (PoC)

> **Fecha:** 2026-11-14
> **Objetivo:** probar de punta a punta el pipeline `SIA2 → cutout → FITS → PNG → alineación → diferencia` antes de comprometer el demo.
> **Resultado:** el pipeline funciona; el blink es viable; la diferencia cruda es ruidosa y necesita stacking/centroides.

---

## 1. Qué se probó

| Prueba | Resultado |
|---|---|
| SIA2 con WISE 0855 | ✅ 258 filas, 48 épocas únicas (detector D2) |
| SIA2 con Barnard's Star | ✅ 255 filas, 43 épocas únicas (detector D3) |
| Cutout de 0.1° | ✅ 58×59 px, ~4 MB, ~8 s |
| WCS del cutout | ✅ centro a ~1.7″ del pedido; escala ~5.8–6.15″/px |
| Reproject a grilla común | ✅ funciona con `reproject` |
| Alineación de 10–12 épocas | ✅ estrellas fijas entre frames |
| Diferencia vs mediana | ⚠️ funciona, pero dominada por ruido/PSF |
| GIF de blink | ✅ generado |
| HiPS cube 102 capas | ✅ 102 PNG por tile, ~72 KB cada uno |
| FITS cube | ⚠️ ~320 MB; no usar |

---

## 2. Archivos generados

### WISE 0855
```text
data/cache/wise-0855/
├── manifest.json
├── frame_000.png … frame_009.png
├── contact_sheet.png
├── aligned_000.png … aligned_009.png
├── aligned_sheet.png
├── stack.png
├── diff_000.png … diff_009.png
├── diff_sheet.png
├── blink.gif
├── diff.gif
└── fits/000.fits … 009.fits
```

### Barnard's Star
```text
data/cache/barnards-star/
├── manifest.json
├── frame_000.png … frame_011.png
├── contact_sheet.png
├── aligned_sheet.png
├── diff_sheet.png
├── blink.gif
├── diff.gif
└── fits/000.fits … 011.fits
```

---

## 3. Hallazgos

### 3.1 Lo que funciona
- **SIA2** devuelve filas útiles y permite agrupar por `obs_id`.
- **Cutout Service** devuelve un MEF Válido con `IMAGE`, `FLAGS`, `VARIANCE`, `ZODI`, `EPSF`, `WCS-WAVE`.
- **WCS**: el centro del cutout coincide con la coordenada pedida; se puede reproyectar.
- **Alineación**: las estrellas quedan fijas entre épocas; el campo es estable.
- **Blink**: el GIF alineado es visualmente limpio.
- **HiPS**: las 102 capas PNG son livianas y fáciles de usar.

### 3.2 Lo que no funciona (todavía)
- **Diferencia cruda**: dominada por diferencias de PSF, fondo y ruido; no muestra un dipolo claro para estrellas lentas.
- **Movimiento sub-píxel**: Barnard's Star se mueve ~10″/año = ~1.7 px/año a 6″/px. En 9 meses, ~1.3 px. No se “ve” a simple vista.
- **WISE 0855**: objeto débil; el cutout tiene pocos fotones; necesita stacking.
- **Identificación del target**: en el campo de Barnard's hay una estrella brillante a ~13″ del centro; puede ser de fondo. Hay que validar con Jorge cuál es el objeto y cómo medirlo.
- **ePSF**: cada cutout pesa ~4 MB aunque no lo usemos.

### 3.3 Implicaciones para el producto
1. **No vender “vas a ver la estrella cruzar la pantalla”.** Vender “vas a ver y medir cambios”.
2. **El blink es el hook visual**, pero la **diferencia + centroides + stacking** son la ciencia.
3. **Los asteroides/cometas son el mejor demo** de movimiento; las estrellas lentas son el demo de medición.
4. **Las variables (RW Aur, R Dra)** son el mejor demo de diferencia/curva de luz.
5. **El slider de 102 bandas** es el diferenciador espectral y no depende de la alineación.
6. **El modo “apilado”** (sumar épocas) debe existir para objetos débiles como WISE 0855.

---

## 4. Decisiones técnicas que se confirman

- Usar **SIA2 + cutouts**, no TAP (TAP está intermitente).
- Cachear los FITS y los PNG; no depender de IRSA en vivo.
- Elegir **un detector consistente** por target (D2/D3/D6 según cobertura).
- Reproyectar a una grilla **norte-arriba** de 64×64 o 128×128.
- Restar el **fondo por frame** antes de la diferencia.
- Calcular **sigma robusto (MAD)** y expresar la diferencia en sigmas.
- Ignorar `EPSF`.
- Guardar `manifest.json` con metadata y fechas.

---

## 5. Qué falta validar

| Pregunta | Quién | Cómo |
|---|---|---|
| ¿Cuál es el objeto correcto en el campo? | Jorge | Cruzar con Gaia/WISE/SIMBAD; comparar posición |
| ¿Se puede medir el centroide de Barnard's con precisión? | Jorge | Ajuste gaussiano/PSF en varias épocas |
| ¿WISE 0855 se detecta apilando? | David | Stack de 20–40 épocas |
| ¿RW Aur/R Dra muestran variabilidad clara? | Jorge | Diferencia vs referencia |
| ¿Hay un asteroide/cometa para el demo “wow”? | Jorge | MOST / efemérides |
| ¿El WCS se comporta bien en todos los detectores? | David | Probar D2, D4, D6 |

---

## 6. Próximos pasos

1. **Jorge:** validar target y método de centroide.
2. **David:** agregar stacking y detección de candidatos.
3. **Samuel:** conectar los PNGs a un blink player.
4. **Andy:** decidir si el demo principal es Barnard (medición) o un asteroide (movimiento).
5. **Leo:** usar el GIF de blink en el pitch.

---

## 7. Conclusión

**El proyecto es viable.** El pipeline existe, los datos son reales y el blink se ve bien. El riesgo no es técnico, es de **expectativa científica**: hay que contar la historia correcta (“medir cambios”, no “ver cruzar estrellas”). Con diferencia, stacking y centroides, el demo es sólido y honesto.
