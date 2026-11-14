# guides/

> **La verdad del proyecto está en [`documentacion.md`](../documentacion.md) y `docs/*.md`.**
> Esta carpeta solo produce PDFs para leer o mostrar. No es documentación.

## Estructura

```text
guides/
├── src/        # fuentes Typst: no se leen, se compilan
├── dist/       # PDFs versionados + PNGs (ignorados por git)
└── README.md
```

| Carpeta | Qué es | Se lee | Se edita |
|---|---|---|---|
| `src/` | Código de maquetación Typst | ❌ | ✅ si hay que cambiar el PDF |
| `dist/` | PDF y PNG generados | ✅ (PDF) | ❌ nunca a mano |

## Regla

1. Si un PDF y un `.md` dicen cosas distintas, **gana el `.md`**.
2. No se busca información en `src/*.typ`: ahí solo hay layout.
3. `dist/` se regenera con `make guides`; no se parchea.
4. Una guía no reemplaza un documento: lo resume para mostrar.

## Compilar

```bash
make guides
```

Salida en `guides/dist/`:

```text
01-rubrica.pdf     Rúbrica y prioridades
03-plan-48h.pdf    Cronograma y roles
05-ideas.pdf       Las 14 ideas en una página (para votar)
06-retos.pdf       Los 14 retos: comparación, fichas y votación
```

## Editar una guía

| Archivo | Qué contiene |
|---|---|
| `src/theme.typ` | Colores, tipografía, tarjetas, barras, tablas |
| `src/01-rubrica.typ` | Pesos, autoevaluación, acciones, pitch |
| `src/03-plan-48h.typ` | Timeline, roles, demo flow, checkpoints |
| `src/05-ideas.typ` | 14 retos → 14 ideas con su twist, top 5 y estado de datos |
| `src/06-retos.typ` | Los 14 retos: comparación, matriz, fichas y cómo votar |

## Agregar una guía nueva

1. Crear `guides/src/07-<tema>.typ` con `#import "theme.typ": *` y `#title_block(...)`.
2. Agregar las dos líneas en `make guides` (PDF y PNG).
3. Sumar la fila a la tabla de arriba y al índice de `documentacion.md`.
4. `make guides` y revisar el PDF antes de commitear.

### Recetas del tema

```typ
#section("Título", color: cyan)      // el color va SIEMPRE con nombre
#card("Título", [cuerpo], color: orange)
#grid(columns: (1fr, 1fr), gutter: 6pt, row-gutter: 5pt, ...)
#text(size: 7.2pt, fill: muted)[nota al pie]
```

Trampa conocida: el color de línea se llama `lineColor`, porque `line` tapa la
función built-in de Typst. Si ves `expected function, found color`, es eso.

## Reglas de diseño

- Una guía = una idea visual.
- Texto grande, una idea por tarjeta.
- Colores del tema; no inventar paleta.
- Compilar antes de commitear (`make guides`).
- Los PDFs se versionan; los PNG no.
