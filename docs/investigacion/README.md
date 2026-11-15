# Investigación

Estudios y notas **fechados** que fundamentaron las decisiones. No se reescriben: si algo cambia,
se agrega un documento nuevo o una decisión en [`../decisiones/`](../decisiones/).

| Documento | Qué contiene |
|---|---|
| [`retos-2026.md`](retos-2026.md) | Los 14 retos oficiales, matriz de comparación y método de votación |
| [`desastres.md`](desastres.md) | Inventario de datos para alerta temprana de desastres |
| [`apis-verificadas.md`](apis-verificadas.md) | APIs probadas contra el endpoint real, cuotas y fallbacks |
| [`spike-datos.md`](spike-datos.md) | Rebanada vertical de prueba (incendios, Valparaíso) |
| [`benchmark-apps.md`](benchmark-apps.md) | Qué hacen otras apps de alerta y qué hueco queda |
| [`base-conocimiento/`](base-conocimiento/README.md) | Referencia viva de NISAR, SAR, productos, API y límites |

Lo que la app usa hoy está en [`../tecnico/fuentes.md`](../tecnico/fuentes.md).

`base-conocimiento/` es la excepción al ciclo de vida de esta carpeta: no es un estudio fechado,
sino una referencia que se actualiza cuando cambia el código o la documentación oficial.

## Notas crudas

Capturas, resultados de pruebas de APIs, extractos de papers y comparaciones **que no son
documentación final** van acá con este nombre, y no pesan más de unos pocos MB:

```text
YYYY-MM-DD_tema_autor.md
YYYY-MM-DD_tema_autor.png
```

Datos pesados no se versionan (`data/cache/` está ignorado).
