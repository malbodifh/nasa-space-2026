# data/

| Archivo | Qué es | ¿Se commitea? |
|---|---|---|
| `questions.json` | Banco de 32 preguntas con fuente NASA | ✅ Sí |
| `cache/` | Datos pesados de la idea SPHEREx (archivada) | ❌ No |

## Reglas

- `questions.json` es la **fuente única de contenido** del juego.
- El contrato está en `docs/08-contenido-y-datos.md`; la validación corre en `make check`.
- Nada de FITS, videos ni cachés en el repo.
