# Fundamentos de SAR (radar de apertura sintética)

> **Para quién:** estudiantes con programación básica. No hace falta física de ondas.
> **Idea central:** un radar no “ve” colores; mide **cuánta energía vuelve** y **con qué fase**.
> Esa energía depende de la forma, la humedad, la vegetación y el ángulo desde el que se mira.

## 1. De la teledetección al radar

| Concepto | Definición sencilla | Explicación técnica | Ejemplo en el proyecto | Error frecuente |
|---|---|---|---|---|
| **Teledetección** | Medir algo a distancia, sin tocarlo. | Un sensor registra radiación electromagnética y la convierte en datos. | NISAR mide la superficie de Costa Rica desde 747 km. | Creer que “satélite” significa necesariamente imagen óptica. |
| **Sensor pasivo** | Recibe luz o calor que ya existe. | Depende del Sol o de la emisión propia de la Tierra. | MODIS/Worldview aporta la foto óptica de contexto. | Usar una foto óptica nublada y concluir que “no pasó nada”. |
| **Sensor activo** | Emite su propia señal y escucha el eco. | Controla la energía, el tiempo y la polarización. | NISAR es activo: funciona de día, de noche y con nubes. | Creer que el radar “atraviesa todo”: la lluvia intensa y el suelo muy húmedo también lo afectan. |
| **Microondas** | Ondas de radio cortas, de centímetros. | Frecuencias de ~1 a ~10 GHz; penetran nubes y parte del dosel. | Banda L de NISAR: 24 cm. | Confundir microondas con “rayos X” o con visión infrarroja. |

## 2. Cómo se forma una imagen

1. El satélite emite un **pulso** de microondas.
2. El pulso viaja a la Tierra, rebota y vuelve.
3. El tiempo de ida y vuelta da la **distancia** (`R = c·t/2`).
4. El movimiento del satélite permite sintetizar una antena muy larga: la **apertura sintética**.
5. Se obtiene una imagen compleja: **amplitud** y **fase** por píxel.

| Concepto | Definición sencilla | Explicación técnica | Ejemplo en el proyecto | Error frecuente |
|---|---|---|---|---|
| **Emisión y recepción** | El radar “grita” y escucha su eco. | Un transmisor envía pulsos; un receptor registra la señal devuelta. | Cada pasada de NISAR adquiere HH y HV. | Pensar que el satélite recibe una foto continua; en realidad muestrea pulsos. |
| **Apertura sintética** | Una antena pequeña se comporta como una enorme. | Se combinan ecos coherentemente a lo largo de la trayectoria; la resolución en azimuth mejora con el tiempo de observación. | NISAR logra ~7 m en azimuth con un reflector de 12 m. | Creer que la resolución es solo el tamaño del reflector. |
| **Amplitud** (`A`) | “Fuerza” del eco. | Módulo del número complejo: `A = módulo(z)`. | La vista previa usa los canales HH y HV en 8 bits con realce. | Comparar amplitudes de imágenes con realces distintos. |
| **Intensidad** (`I`) | Energía del eco. | `I = A²`; es una potencia. | Es la base física de la retrodispersión. | Decir “intensidad” cuando se quiere decir “amplitud”; no escalan igual. |
| **Fase** (`φ`) | “En qué punto del ciclo” llega la onda. | Ángulo del número complejo `z = A·e^(iφ)`, en radianes. | La interferometría compara fases entre dos pasadas. | Ignorar que la fase está envuelta cada 2π. |

## 3. Retrodispersión y normalización

**Retrodispersión** es la fracción de energía que vuelve hacia el radar. Depende de:

- la **rugosidad** de la superficie respecto a la longitud de onda;
- la **constante dieléctrica** (el agua la sube mucho);
- la **geometría** (ángulo de incidencia, orientación);
- la **estructura** de la vegetación o los edificios.

| Concepto | Definición sencilla | Explicación técnica | Ejemplo en el proyecto | Error frecuente |
|---|---|---|---|---|
| **Retrodispersión** | Cuánto eco vuelve. | Potencia recibida por unidad de área iluminada, después de calibrar. | Es lo que cambia entre dos fechas en GCOV. | Pensar que “más brillo” siempre es “más peligro”. |
| **Beta-cero** (`β0`) | Brillo por área inclinada. | Normaliza por el área en el plano de rango inclinado. | No es el valor que usa la app. | Comparar β0 con σ0 sin convertir. |
| **Sigma-cero** (`σ0`) | Brillo por área en el suelo. | Normaliza por el área horizontal proyectada. | Se puede obtener desde γ0 con el factor RTC. | Usar σ0 y γ0 como sinónimos. |
| **Gamma-cero** (`γ0`) | Brillo corregido por el terreno. | Normaliza por el área perpendicular a la línea de vista; es lo que entrega GCOV con RTC. | El HDF5 GCOV es γ0, no la vista previa. | Creer que el PNG de vista previa es γ0 calibrado. |
| **Decibelios** (`dB`) | Escala logarítmica para comparar potencias. | `P_dB = 10·log10(P)`. | 3 dB ≈ duplicar la potencia; −3 dB ≈ reducirla a la mitad. | Usar `20·log10` para una potencia (eso es para amplitud). |

**Cuidado con β0/σ0/γ0:** la relación exacta depende de la convención del ángulo de incidencia y
del producto. Para pasar de γ0 a σ0 en NISAR, usar `rtcGammaToSigmaFactor`; no una fórmula
casera.

## 4. Ruido, textura y humedad

| Concepto | Definición sencilla | Explicación técnica | Ejemplo en el proyecto | Error frecuente |
|---|---|---|---|---|
| **Speckle** | Grano (“sal y pimienta”) de la imagen radar. | Interferencia coherente de muchos dispersores dentro de un píxel; es un ruido multiplicativo. | El proyecto suaviza HH con una media móvil 5×5 antes de comparar. | Interpretar cada píxel claro u oscuro como un objeto real. |
| **Rugosidad** | Qué tan “áspera” es la superficie para esa onda. | Relativa a λ: lisa → reflexión especular (poca energía vuelve); rugosa → dispersión difusa. | El agua quieta se ve oscura; el suelo arado, más brillante. | Decir “oscuro = agua” sin considerar viento, aceite o sombra. |
| **Constante dieléctrica** | Cuánto responde el material al campo eléctrico. | El agua tiene una constante mucho mayor que el suelo seco; en una superficie rugosa eso aumenta el eco, pero el agua quieta puede reflejar fuera del radar y verse oscura. | Suelo mojado puede volverse más brillante en HH. | Atribuir todo cambio de brillo a la vegetación. |

## 5. Polarización

La polarización indica la orientación del campo eléctrico. El radar puede transmitir en **H**
(horizontal) o **V** (vertical) y recibir en H o V. La combinación se escribe primero
transmisión y después recepción.

| Concepto | Definición sencilla | Explicación técnica | Ejemplo en el proyecto | Error frecuente |
|---|---|---|---|---|
| **Polarización** | “Orientación” de la onda. | Propiedad del campo electromagnético; revela estructura y orientación de los dispersores. | NISAR GCOV puede traer HH y HV. | Creer que todas las imágenes radar son HH. |
| **HH** | Transmite H, recibe H. | Co-polarización; sensible a superficies y al doble rebote. | En la vista previa, HH va en rojo y azul. | Usar HH sola para concluir “hay vegetación”. |
| **HV** | Transmite H, recibe V. | Cross-polarización; sensible a dispersión volumétrica. | En la vista previa, HV va en verde. | Decir “HV alto = bosque” sin contexto. |
| **VH** | Transmite V, recibe H. | Cross-polarización recíproca; en monostático suele ser similar a HV. | No se usa en la vista previa del proyecto. | Tratar HV y VH como canales independientes sin comprobar el modo. |
| **VV** | Transmite V, recibe V. | Co-polarización; común en Sentinel-1 y en modos NISAR. | NISAR puede adquirir VV en otros modos. | Asumir que un producto NISAR siempre trae HH. |

## 6. Bandas

| Banda | Longitud de onda típica | Qué aporta | Limitación |
|---|---|---|---|
| **L** | ~24 cm (NISAR) | Penetra dosel, buena para biomasa, humedad y deformación. | Resolución menor que X; ionósfera puede afectar la fase. |
| **S** | ~9,4 cm (NISAR) | Más sensible a vegetación ligera y humedad superficial. | Menos penetración que L; cobertura NISAR limitada a India y sitios de calibración. |
| **C** | ~5,6 cm (Sentinel-1) | Buen equilibrio resolución/cobertura; series temporales largas. | Menos penetración en bosque denso que L. |
| **X** | ~3 cm (TerraSAR-X, COSMO-SkyMed) | Alta resolución; detalle de superficie. | Poca penetración; más afectado por lluvia y vegetación. |

En el proyecto se usa **L-band** (NISAR GCOV). S, C y X aparecen como referencia para comparar
productos; no están integrados.

## 7. Geometría: incidencia, sombra y relieve

| Concepto | Definición sencilla | Explicación técnica | Ejemplo en el proyecto | Error frecuente |
|---|---|---|---|---|
| **Ángulo de incidencia** | Ángulo entre la vertical y el haz. | Cambia la energía que llega y vuelve; en general, a mayor ángulo, menos retrodispersión superficial. | Comparar pasadas de la misma órbita evita mezclar geometrías. | Comparar una pasada ascendente con una descendente y llamarlo “cambio”. |
| **Sombra radar** | Zona donde el haz no llega. | La ladera opuesta al radar no recibe iluminación; aparece negra. | Puede confundirse con agua en un mapa de cambio. | Interpretar una sombra como pérdida de vegetación. |
| **Layover** | El topo “se cae” hacia el radar. | En pendientes muy inclinadas, la cima se registra antes que la base y se superpone. | Relevante en volcanes y cordilleras. | Leer un desplazamiento geométrico como movimiento real. |
| **Foreshortening** | La pendiente se “acorta”. | La distancia en rango se comprime en laderas que miran al radar. | Rincón de la Vieja es un caso de relieve fuerte. | Comparar brillo de laderas opuestas sin corregir geometría. |

## 8. Mecanismos de dispersión

| Concepto | Definición sencilla | Explicación técnica | Ejemplo en el proyecto | Error frecuente |
|---|---|---|---|---|
| **Dispersión superficial** | Rebote en la “piel” del terreno. | Dominante en superficies rugosas o suelos desnudos; suele ser co-polarizada. | Suelo húmedo y arado en Palo Verde. | Ignorar que la humedad cambia el brillo sin cambiar la cobertura. |
| **Dispersión volumétrica** | Rebote dentro de ramas y hojas. | Múltiples rebotes en un volumen; aumenta la cross-polarización (HV). | Bosque de Tortuguero: HV alto y estable. | Decir que HV mide “cantidad de árboles” de forma directa. |
| **Doble rebote** | Rebote en el suelo y luego en algo vertical. | Agua + tallos, o suelo + edificios; suele aumentar HH. | Arrozales o juncos inundados: HH fuerte y magenta en la vista previa. | Confundir doble rebote con “inundación confirmada”. |

## 9. Lo que un radar **no** dice

- No identifica automáticamente la causa de un cambio de brillo.
- No ve bajo el agua: la banda L penetra vegetación, no columnas de agua profundas.
- No mide “daño” ni “pérdida económica”.
- No convierte un píxel oscuro en “agua confirmada”.
- No reemplaza una alerta oficial ni una inspección de campo.

## 10. Ejemplo integrado con el proyecto

La vista previa de NISAR que usa la app es un PNG de 8 bits con:

```text
R = HH   G = HV   B = HH
```

Por eso HH aparece como magenta/rojo-azul y HV como verde. El proyecto:

1. suaviza HH con una media 5×5;
2. compara dos fechas de la **misma órbita**;
3. resta un offset (mediana en el navegador, media del cuadro en el precálculo);
4. marca píxeles con diferencia ≥ 38/255;
5. excluye píxeles oscuros en ambas fechas (< 70) como filtro exploratorio.

Nada de eso es una clasificación física: es una **heurística visual** sobre una vista previa.
Para valores en γ0 hay que descargar el HDF5 GCOV y aplicar la calibración correspondiente.

## Referencias

- ASF · About NISAR (bandas, polarización, geometría): <https://nisar-docs.asf.alaska.edu/nisar-intro>
- ASF · GCOV (γ0, RTC, covarianza): <https://nisar-docs.asf.alaska.edu/gcov/>
- NASA Earthdata · SAR basics: <https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar>
- NASA · NISAR polarimetry: <https://science.nasa.gov/mission/nisar/polarimetry/>
