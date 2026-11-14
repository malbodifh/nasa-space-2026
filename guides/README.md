# guides/

Guías visuales del equipo, hechas con **Typst**.

## Compilar

```bash
make guides
```

Salida en `guides/dist/`:
```text
01-rubrica.pdf / .png       Rúbrica y prioridades
02-benchmark.pdf / .png     Competidores y nuestro hueco
03-plan-48h.pdf / .png      Cronograma y roles
04-pitch.pdf / .png         Storyboard del video de 30 s
```

## Editar

| Archivo | Qué contiene |
|---|---|
| `theme.typ` | Colores, tipografía, tarjetas, barras, tablas |
| `01-rubrica.typ` | Pesos, autoevaluación, acciones, pitch |
| `02-benchmark.typ` | Comparación con herramientas existentes |
| `03-plan-48h.typ` | Timeline, roles, demo flow, checkpoints |
| `04-pitch.typ` | Storyboard de 30 s y checklist de grabación |

## Reglas

- Una guía = una idea visual.
- Texto grande, una idea por tarjeta.
- Colores del tema; no inventar paleta.
- Compilar antes de commitear (`make guides`).
- No commitear `guides/dist/` si pesa demasiado; se regenera.
