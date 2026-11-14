# 21 — Banco de preguntas

> Fuente de verdad: [`data/questions.json`](../data/questions.json).
> Contrato de datos: [`08-contenido-y-datos.md`](08-contenido-y-datos.md).

---

## 1. Estado del banco

| Categoría | ID | Preguntas | Recurso |
|---|---|---|---|
| Atmósfera | `atm-0x` | 4 | O₂ |
| Soporte vital | `eclss-0x` | 4 | Agua / O₂ |
| Energía | `ener-0x` | 4 | Energía |
| Salud | `salud-0x` | 4 | Moral |
| Fuego | `fuego-0x` | 4 | O₂ |
| Comunicaciones | `comms-0x` | 4 | Moral |
| **Total** | | **24** | |

## 2. Cómo se ve una entrada

```json
{
  "id": "eclss-01",
  "category": "soporte-vital",
  "difficulty": "facil",
  "prompt": "¿Qué porcentaje del agua se recicla en la ISS?",
  "options": ["Cerca del 30 %", "Cerca del 50 %", "Cerca del 93 %", "El 100 %"],
  "answer": 2,
  "explanation": "El sistema de soporte vital recupera alrededor del 93 % del agua...",
  "consequence": "Sin reciclado, cada tripulante necesitaría toneladas de agua...",
  "resource": "agua",
  "source": {
    "title": "NASA — Life Support Systems",
    "url": "https://www.nasa.gov/international-space-station/"
  },
  "tags": ["eclss", "agua"]
}
```

## 3. Muestra del banco

| Pregunta | Respuesta | Fuente |
|---|---|---|
| ¿Qué mezcla se respira en la ISS? | 21 % O₂ / 79 % N₂ | ISS / ECLSS |
| ¿Qué porcentaje del agua se recicla? | ~93 % | ECLSS |
| ¿Cuánto dura la noche lunar? | ~14 días terrestres | NASA Moon |
| ¿Qué le pasa al hueso en microgravedad? | Pierde densidad | HRP |
| ¿Cómo es una llama en microgravedad? | Esférica y azulada | NTRS |
| ¿Cuánto tarda una señal a Marte? | 3–22 min | NASA Mars |
| ¿Qué experimento estudió incendios a bordo? | Saffire | NASA |
| ¿Qué es el SANS? | Cambios de visión por presión | HRP |

## 4. Cómo agregar una pregunta

1. Elegí el hecho y la fuente NASA.
2. Copiá el bloque JSON y completá los campos.
3. `id` nuevo, sin repetir.
4. Corré `make check`: valida contrato, longitudes y URL.
5. Probala con una persona de 10–14 años.
6. Commit en tu rama: `data: agregar pregunta de radiación`.

## 5. Reglas de calidad

- El distractor no puede ser absurdo.
- La correcta no puede ser la opción más larga.
- Nada de cifras sin fuente.
- Sin doble negación.
- Si la pregunta necesita un dibujo para entenderse, no entra al MVP.

## 6. Ideas para la segunda tanda (P1)

- Radiación: GCR vs SPE, escudos de polietileno.
- Comida: por qué no hay migas, rehidratación.
- Traje: capas, visor, guantes.
- Reentrada: escudo ablativo, paracaídas.
- Aislamiento: estudios análogos (HERA), comunicación con familia.
