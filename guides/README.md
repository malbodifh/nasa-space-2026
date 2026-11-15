# guides/

> **La verdad del proyecto está en [`docs/estado.md`](../docs/estado.md) y `docs/*.md`.**
> Esta carpeta solo produce PDFs para leer o mostrar. No es documentación.

## Estructura

```text
guides/
├── src/        # fuentes Typst: no se leen, se compilan
│   ├── 06-retos.typ
│   ├── 07-documentacion.typ      # maestro del libro
│   └── docs/                     # capítulos .typ + theme.typ
├── dist/       # PDFs versionados + PNGs (ignorados por git)
│   └── docs/   # un PDF por documento (local, ignorado)
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
make guides   # 06-retos + 07-documentacion
make docs     # libro completo + un PDF por documento
```

Salida en `guides/dist/`:

```text
06-retos.pdf              Los 14 retos: comparación, fichas y votación
07-documentacion.pdf      Libro completo de documentación
docs/*.pdf                Un PDF por documento (local, no versionado)
```

## Documentación Typst

- `src/07-documentacion.typ` es el **maestro**: portada, índice, partes e includes.
- `src/docs/theme.typ` es el tema (tipografía, tablas, código, portada).
- `src/docs/*.typ` son los capítulos generados desde los `.md` con pandoc.
- **No edites los `.typ` generados a mano.** Editá el `.md`, después:

```bash
make docs-convert PANDOC=/ruta/a/pandoc   # requiere pandoc >= 3
make docs
```

- `guides/build/` es scratch (wrappers y previews); está ignorado por git.

## Editar una guía

| Archivo | Qué contiene |
|---|---|
| `src/theme.typ` | Colores, tipografía, tarjetas, barras, tablas de las guías |
| `src/06-retos.typ` | Los 14 retos: comparación, matriz, fichas y cómo votar |
| `src/07-documentacion.typ` | Maestro del libro de documentación (generado) |
| `src/docs/theme.typ` | Tema del libro: portada, headings, tablas, código |
| `src/docs/*.typ` | Capítulos generados desde los `.md` |

## Agregar una guía nueva

1. Crear `guides/src/08-<tema>.typ` con `#import "theme.typ": *` y `#title_block(...)`.
2. Agregar las dos líneas en `make guides` (PDF y PNG).
3. Sumar la fila a la tabla de arriba y al índice de `docs/estado.md`.
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
