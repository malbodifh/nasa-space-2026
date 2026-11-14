# 04 — Datos y fuentes NASA

> **Regla:** cada pregunta del juego tiene que poder rastrearse a una fuente NASA.
> Sin fuente, la pregunta se descarta. **No usamos APIs en vivo** para el demo.

---

## 1. Fuentes que usamos

| Fuente | Qué aporta | Acceso | Estado 14/11 |
|---|---|---|---|
| **NASA Human Research Program (HRP)** | Salud, hueso, visión, sueño, radiación | Web público | ✅ |
| **Life Support Baseline Values and Assumptions Document** (NASA/TP-2015-218570) | Números de ECLSS: agua, O₂, CO₂ | PDF en NTRS | ✅ |
| **NASA NTRS** (`ntrs.nasa.gov/api/citations/search`) | Papers de soporte técnico | API pública | ✅ 200 |
| **NASA Image and Video Library** (`images-api.nasa.gov`) | Fotos para el juego y el pitch | API pública | ✅ 200 |
| **NASA Artemis / Gateway** | Contexto de misión y nombres | Web público | ✅ |
| **NASA Glenn / ISS ECLSS** | Reciclado de agua, atmósfera | Web público | ✅ |
| **NASA Astronaut Training** (NBL, HERA, NEEMO, T-38) | Cómo se prepara la tripulación | Web público | ✅ |

## 2. Lo que NO usamos (y por qué)

- **APIs en vivo de telemetría**: no existen públicas y el demo no puede depender de red.
- **Datos médicos de astronautas**: privados. Usamos **rangos publicados** por HRP.
- **Modelos físicos propios**: no somos simuladores; las cifras se citan tal cual.

## 3. Tipos de dato por categoría

| Categoría | Dato típico | Fuente |
|---|---|---|
| Atmósfera | 21 % O₂ / 79 % N₂, ~101 kPa | ISS ECLSS / NASA |
| Agua | ~93 % de recuperación en ISS | ECLSS / BVAD |
| Energía | Noche lunar ≈ 14 días terrestres | NASA Moon facts |
| Radiación | Dosis en Sv; GCR y SPE | HRP / NTRS |
| Hueso | ~1–1,5 % de densidad ósea por mes | HRP |
| Sueño | 8 h programadas; alteración circadiana | HRP |
| Comida | Alimentos estables, sin migas | NASA food systems |
| Fuego | Llama esférica, baja velocidad | NTRS (combustión en µg) |
| Comms | Retardo Marte: 3–22 min por sentido | NASA/JPL |
| Reentrada | Escudo térmico ablativo | NASA |

## 4. Formato del contenido

Cada pregunta vive en `data/questions.json` con este contrato:

```json
{
  "id": "eclss-01",
  "category": "soporte-vital",
  "difficulty": "facil",
  "prompt": "¿Qué porcentaje del agua se recicla en la ISS?",
  "options": ["~50 %", "~70 %", "~93 %", "100 %"],
  "answer": 2,
  "explanation": "El ECLSS recupera cerca del 93 % del agua...",
  "consequence": "Sin reciclado, la tripulación dependería de reabastecimiento constante.",
  "resource": "agua",
  "source": {
    "title": "NASA — ISS Environmental Control and Life Support",
    "url": "https://www.nasa.gov/..."
  },
  "tags": ["eclss", "agua"]
}
```

Reglas del contrato:

- **4 opciones**, una sola correcta.
- `answer` es índice 0–3.
- `explanation` ≤ 240 caracteres, lenguaje de 10–14 años.
- `source.url` obligatoria y visitada por una persona.
- `resource` ∈ `o2 | energia | agua | moral`.

## 5. Validación

Ver [`15-validacion-datos.md`](15-validacion-datos.md): checklist de 6 pasos por pregunta
y un script que valida el JSON contra el contrato.

## 6. Créditos

El juego muestra “Datos y referencias: NASA” en el informe final, con links a HRP y NTRS.
NASA no respalda este proyecto.
