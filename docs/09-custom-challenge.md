# 09 — ¿Existe un “Custom Challenge”? (y cómo usarlo sin perder elegibilidad)

> **Respuesta corta:** sí, históricamente existe “Create Your Own Challenge”, pero **no es elegible para Global Judging** ni para Global Awards. En 2026 la lista oficial tiene **14 challenges** y no aparece como opción.
> **Recomendación:** si quieren competir globalmente, **no lo usen como challenge principal**. Usen un challenge oficial y métanle la idea custom adentro.

---

## 1. Qué dice NASA

### Lo que confirma la guía de elegibilidad 2026
Para avanzar a **Global Judging**, el proyecto debe:
- **Responder a uno de los challenges oficiales de NASA Space Apps.**
- Tener todos los miembros registrados en el mismo evento.
- Completar la submission.
- Incluir un demo (video ≤30 s o deck ≤7 slides).
- Estar en inglés.
- Usar al menos **un dato o recurso de NASA** para ser elegible a un Global Award.

**Fuente:** [Judging & Awards Guide 2026](https://www.spaceappschallenge.org/resources/judging-awards-guide/)

### Lo que dicen las páginas históricas de “Create Your Own Challenge”
- “Participants are invited to create their own challenge to tackle, but these are **not eligible for Global Judging**.”
- “While some Local Events may offer awards for ‘Create Your Own Challenge’ projects, this challenge is **not eligible for Global Judging** and projects do not qualify for Global Awards.”

**Fuentes históricas:**
- <https://www.spaceappschallenge.org/nasa-space-apps-2024/challenges/create-your-own-challenge/>
- <https://2022.spaceappschallenge.org/challenges/2022-challenges/create-your-own-challenge>

### Lo que pasa en 2026
- La página oficial de challenges muestra **“Currently returning 14 challenges”**.
- No aparece “Create Your Own Challenge” en la lista 2026.
- Puede que algún evento local lo permita como categoría propia, pero **no cuenta para Global Judging**.

---

## 2. Decisión: ¿lo usamos o no?

```text
¿Quieren competir por Global Awards / Global Judging?
│
├── SÍ → NO usar Custom Challenge.
│         Elegir uno de los 14 oficiales.
│         (Recomendado: Planet X and SPHEREx)
│
└── NO → ¿El evento local tiene premio para Custom?
          │
          ├── SÍ → Se puede hacer, pero avisar al Local Lead.
          │         No prometer Global Judging.
          │
          └── NO → Hacer igual un challenge oficial.
                    Es menos riesgo y más premio.
```

**Nuestra recomendación:** no arriesgar. El costo de hacer custom es alto (perdés la posibilidad de competir globalmente) y el beneficio es bajo (podés hacer algo distinto dentro de un challenge oficial).

---

## 3. Estrategia híbrida: “custom por dentro, oficial por fuera”

Si les gusta una idea propia, **encájenla en un challenge oficial**:

| Idea custom | Challenge oficial | Cómo se disfraza |
|---|---|---|
| Ficha única de objeto | Planet X and SPHEREx | “Ficha de objeto + timeline” dentro del blink |
| Triage de alertas | MODIS/VIIRS Hot Spots | “Alertas de fuego priorizadas” |
| Copiloto de archivos | Earth System Trend Detective | “Buscador de variables en lenguaje natural” |
| Timeline multi-misión | Planet X and SPHEREx | “Varias misiones, misma coordenada” |
| Sonificación | Earth Information Jukebox | “Sonificación de datos EIC” |
| Planificador lunar | Lunar Landing Site Navigator | “Comparador de sitios y fechas” |

**Regla:** el challenge oficial define el **problema**; la idea custom define el **ángulo diferencial**. Así el jurado ve relevancia y creatividad al mismo tiempo.

---

## 3.1 Requisito de datos (obligatorio desde 2026-11-14)

**Una idea custom solo es válida si se puede ejecutar con datos NASA accesibles hoy.**
Antes de proponerla, completar:

```text
Idea:
Dato NASA:
API/endpoint:
Campos que uso:
Acceso (auth/cuota):
Caché:
Fallback:
Demo de 30 s:
Qué puedo afirmar:
Qué NO puedo afirmar:
```

Si no se puede completar, **no es una idea para este hackathon**.

### Datos que sí tenemos (resumen)
| Dato | API | Sirve para |
|---|---|---|
| Imágenes SPHEREx | SIA2 + Cutout | Series temporales, blink, diferencia |
| 102 bandas | HiPS cube | Slider espectral, contexto |
| Metadata SPHEREx | IRSA TAP | Cruces, orden temporal |
| FITS completos | AWS S3 | Descarga masiva/fallback |
| Catálogo de exoplanetas | Exoplanet Archive TAP | Contexto/cruces, **no** atmósferas |
| Objetos del sistema solar | MOST | Asteroides/cometas |
| Imágenes/videos NASA | NASA Images, APOD | Landing/pitch, **no** ciencia |

### Datos que NO tenemos
- Rubin/LSST, NISAR/SAR, JWST, Chandra, SDO, LRO/MRO, LIGO.
- Espectros de exoplanetas.
- Superficies de Marte/Luna.
- Datos de clima espacial.

Si la idea depende de uno de estos, **no se puede hacer con lo que tenemos**.

---

## 4. Si igual quieren hacer un Custom Challenge

### 4.1 Requisitos mínimos
- [ ] Hablar con el **Local Lead** y confirmar que el evento acepta custom.
- [ ] Confirmar si hay premio local para esa categoría.
- [ ] Aceptar por escrito que **no compite por Global Judging**.
- [ ] Igual usar datos NASA (para validez y crédito).
- [ ] Igual hacer demo de 30 s y submission completa.
- [ ] Igual documentar uso de IA.

### 4.2 Cómo elegir el problema
1. Elegir un **dolor operativo** (Parte B de [08-contenido-y-datos.md](08-contenido-y-datos.md)), no una pregunta científica grande.
2. Verificar que los datos estén disponibles **hoy**.
3. Poder explicarlo en una frase.
4. Poder mostrar algo funcionando en 48 h.
5. Tener un plan B si la API falla.

### 4.3 Las 3 mejores ideas custom (si van por ese camino)

#### Idea 1 — Ficha única de objeto (“NASA Object Card”)
- **Problema:** el mismo objeto está en 10 catálogos; cruzar datos es manual.
- **Solución:** ingresás un nombre o coordenada; la app resuelve el nombre, cruza IRSA + Exoplanet Archive y muestra una ficha con imágenes SPHEREx, metadata, timeline y flags.
- **Dato/API exacta:** IRSA TAP (`spherex.plane`, `spherex.artifact`), SPHEREx SIA2 + Cutout, NASA Exoplanet Archive TAP (`ps`). Resolución de nombre con SIMBAD/NED (solo para coordenadas).
- **Demo 30 s:** “Escribí ‘WISE 0855’ → ficha con imagen SPHEREx, banda, fecha, flags y timeline.”
- **Factibilidad:** 4/5.
- **Riesgo:** TAP intermitente; fallback a SIA2 + CSV.
- **Qué NO afirmar:** que es un “descubrimiento” o que el objeto es un exoplaneta.

#### Idea 2 — Triage de candidatos SPHEREx (no Rubin)
- **Problema:** hay demasiadas fuentes y épocas para revisar a mano; los objetos que cambian se pierden.
- **Solución:** dashboard que compara épocas de SPHEREx, marca candidatos a movimiento/variabilidad y los ordena por “interesante”, con explicación.
- **Dato/API exacta:** SIA2 + Cutout (series temporales) + MOST (objetos del sistema solar). **No** usamos alertas de Rubin/ZTF porque no están en nuestras APIs.
- **Demo 30 s:** “Para esta coordenada, el sistema muestra 5 candidatos que cambian y por qué.”
- **Factibilidad:** 3/5 (requiere detección/centroides).
- **Riesgo:** sin Rubin, el alcance es solo SPHEREx; decirlo claro.
- **Qué NO afirmar:** “triage de alertas de Rubin” ni “descubrimiento”.

#### Idea 3 — Timeline multi-misión (con lo que tenemos)
- **Problema:** ver la misma posición en distintas misiones requiere varias herramientas.
- **Solución:** una línea de tiempo unificada con imágenes SPHEREx y, si la colección está disponible, WISE/2MASS vía IRSA.
- **Dato/API exacta:** SPHEREx SIA2 + Cutout. WISE/2MASS vía SIA2 de IRSA **solo si la colección responde**; fallback: solo SPHEREx. Gaia/ZTF **no** están en nuestras APIs.
- **Demo 30 s:** “Una coordenada, varias misiones, una película.”
- **Factibilidad:** 4/5.
- **Riesgo:** alinear resoluciones/épocas; verificar colecciones antes de prometer.
- **Qué NO afirmar:** que integramos Gaia/ZTF si no lo hicimos.

---

## 5. Plantilla de propuesta custom (para el Local Lead)

```markdown
# Custom Challenge Proposal — Astral Codes

## Título
[Una frase]

## Problema
[Qué dolor operativo resuelve; a quién afecta]

## Solución
[Qué hace la herramienta; cómo se usa]

## Datos NASA
[Qué datos, de qué misión, cómo se acceden]

## Demo (30 s)
[Qué se ve]

## Impacto
[Quién se beneficia y cómo]

## Riesgos
[Qué puede fallar y plan B]

## Elegibilidad
Entendemos que un Custom Challenge no es elegible para Global Judging.
```

---

## 6. Checklist de decisión

- [ ] ¿El equipo quiere competir globalmente? → **No usar custom**.
- [ ] ¿El Local Lead acepta custom? → Si no, **no usar custom**.
- [ ] ¿Hay un premio local para custom? → Si no, **no vale la pena**.
- [ ] ¿La idea se puede encajar en un challenge oficial? → **Hacer eso**.
- [ ] ¿Tenemos datos y demo en 48 h? → Si no, **elegir otra idea**.
- [ ] ¿Está documentado que no es elegible para Global? → **Sí, por escrito**.

---

## 7. Recomendación final

**No hacer un Custom Challenge en 2026.**
Elegir **Planet X and SPHEREx** y construir ahí la idea diferencial (ficha de objeto, timeline multi-misión, trayectoria de centroides, 102 bandas). Se ve distinto, se siente distinto, pero cumple las reglas y compite por los premios globales.
