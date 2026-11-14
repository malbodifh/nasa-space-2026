# guides/

Guías visuales del equipo, hechas con **Typst**.

## Compilar

```bash
make guides
```

Salida en `guides/dist/`:
```text
01-rubrica.pdf / .png       Rúbrica y prioridades
03-plan-48h.pdf / .png      Cronograma y roles
05-ideas.pdf / .png         Las 14 ideas en una página (para votar)
```

## Editar

| Archivo | Qué contiene |
|---|---|
| `theme.typ` | Colores, tipografía, tarjetas, barras, tablas |
| `01-rubrica.typ` | Pesos, autoevaluación, acciones, pitch |
| `03-plan-48h.typ` | Timeline, roles, demo flow, checkpoints |
| `05-ideas.typ` | 14 retos → 14 ideas con su twist, top 5 y estado de datos |

## Agregar una guía nueva

1. Crear `guides/06-<tema>.typ` con `#import "theme.typ": *` y `#title_block(...)`.
2. Agregar las dos líneas en `make guides` (PDF y PNG) y en `.PHONY` no hace falta.
3. Sumar la fila a la tabla de arriba y al índice de `documentacion.md`.
4. `make guides` y revisar el PNG antes de commitear.

### Recetas del tema

```typ
#section("Título", color: cyan)      // el color va SIEMPRE con nombre
#card("Título", [cuerpo], color: orange)
#grid(columns: (1fr, 1fr), gutter: 6pt, row-gutter: 5pt, ...)
#text(size: 7.2pt, fill: muted)[nota al pie]
```

Trampa conocida: el color de línea se llama `lineColor`, porque `line` tapa la
función built-in de Typst. Si ves `expected function, found color`, es eso.

## Reglas

- Una guía = una idea visual.
- Texto grande, una idea por tarjeta.
- Colores del tema; no inventar paleta.
- Compilar antes de commitear (`make guides`).
- No commitear `guides/dist/` si pesa demasiado; se regenera.
