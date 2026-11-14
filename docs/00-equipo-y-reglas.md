# 00 — Equipo y reglas de trabajo

> **Estado:** propuesta para discutir y votar el 2026-11-14.
> **Objetivo:** que cinco personas con habilidades distintas puedan construir un demo sólido en 48 horas sin pisarse.

---

## 1. Equipo

| Persona | Rol propuesto | Backup | Habilidades a confirmar |
|---|---|---|---|
| **Andy** | Lead / producto / integración | David | Frontend, pitch, organización |
| **David** | Backend / datos / APIs | Andy | Python, APIs, procesamiento |
| **Samuel** | Frontend / visualización | Leo | React/JS, canvas, charts |
| **Jorge** | Ciencia / QA / validación | David | Astronomía, datos, testing |
| **Leo** | Diseño / UX / storytelling / video | Samuel | Figma, edición, pitch |

> Los roles son **ownership**, no propiedad. Todos pueden tocar todo, pero cada área tiene un dueño que decide y rinde cuentas.

### Regla de los dos
Ninguna persona es indispensable. Cada área tiene un backup que sabe cómo levantarla y dónde está la documentación.

---

## 2. Valores del equipo

1. **Demo primero.** Si no se puede mostrar, no cuenta.
2. **Ciencia honesta.** No exageramos resultados. Un candidato no es un descubrimiento.
3. **Velocidad con orden.** Preferimos un PR chico hoy que una obra maestra el domingo.
4. **Respeto.** Sin gritos, sin culpas, sin “eso no es mi parte”.
5. **Documentar es trabajar.** Lo que no está escrito, se pierde.
6. **Descansar es parte del plan.** El cansancio produce bugs y malos pitches.

---

## 3. Reglas de comunicación

- **Canal único de decisiones:** el grupo de WhatsApp/Discord del equipo. Las decisiones importantes se copian a `documentacion.md`.
- **No se decide por DM.** Si se habló por privado, se resume en el canal.
- **Un tema por mensaje.** Evitar hilos de 40 mensajes.
- **Etiquetas:** `[BLOQUEO]`, `[DECISIÓN]`, `[DUDA]`, `[AVISO]`.
- **Standup de 10 min** a las 9:00 y 21:00:
  - ¿Qué hice?
  - ¿Qué sigue?
  - ¿Qué me bloquea?
- **Modo concentración:** avisar cuando se cierran notificaciones (bloques de 90 min).

---

## 4. Reglas de Git y código

- `main` **siempre funciona**. Si se rompe, se arregla antes de seguir.
- Ramas:
  - `feat/nombre-corto`
  - `fix/nombre-corto`
  - `docs/nombre-corto`
- Commits chicos y en imperativo: `add endpoint de salud`, `fix timeout de API`.
- **PR obligatorio** para cambios en `main`, aunque sea de una línea. Revisión de 1 persona.
- No se commitean:
  - `.env`, claves, tokens.
  - `data/cache/`, `*.fits`, videos pesados.
  - `node_modules/`, `.venv/`.
- Los scripts de datos deben ser **reproducibles**: un comando, un README, una salida.
- Si se usa una librería nueva, se anota en el README del módulo y se avisa al equipo.

### Definition of Done (para el hackathon)
Una tarea está lista cuando:
1. Funciona en la demo (no solo en la laptop del dueño).
2. Está documentada en una línea.
3. No rompe `main`.
4. Si usa datos, hay un script o caché identificable.
5. Si usa IA, está declarado.

---

## 5. Reglas de tiempo

- **Timebox de 2 h** para cualquier spike técnico. Si no funciona, se descarta y se busca un plan B.
- **Regla de los 30 min:** si estás trabado 30 min, pedí ayuda. No se pierde el día por orgullo.
- **Corte de alcance a T-12 h** (domingo mediodía): no se agregan features nuevas. Solo:
  - pulir,
  - arreglar bugs,
  - ensayar el pitch,
  - completar la submission.
- **Bloques de trabajo:** 90 min de foco + 10 min de pausa.
- **Turnos de descanso:** mínimo 5 h de sueño por persona en las 48 h. Nadie codea 40 h seguidas.
- **Comida y agua:** no son opcionales. Un equipo deshidratado no piensa.

---

## 6. Reglas de datos y ciencia

1. **Citar la fuente** de cada dato (IRSA, NASA, etc.) en la UI y en la submission.
2. **No inventar datos.** Si falta un dato, se muestra un placeholder honesto.
3. **Mostrar incertidumbre** cuando haya una medición (centroide, flujo, movimiento).
4. **Etiquetar candidatos**: “posible objeto en movimiento”, no “objeto descubierto”.
5. **No mezclar unidades** sin decirlo: MJy/sr, µJy, µm, arcsec.
6. **No recortar imágenes para exagerar** un resultado. Si se usa un stretch, decirlo.
7. **Guardar la versión del dataset** (DR1, QR3, fecha de descarga).
8. **No usar datos propietarios** sin permiso. Los datos abiertos de NASA son públicos.
9. **Contrato de datos obligatorio:** toda feature declara dataset, API/endpoint, campos, caché y fallback. Sin contrato, no entra al backlog.
10. **No prometer datos que no tenemos:** si la misión/API no está en el inventario de datos del reto elegido, no se usa ni se menciona como si la tuviéramos.

---

## 7. Reglas de IA (SI / Super Intelligence)

NASA Space Apps 2026 permite usar IA/SI, pero exige declararlo. Reglas del equipo:

- **Se permite** para: código, tests, documentación, traducción, ideas, imágenes de apoyo.
- **No se permite** para: inventar resultados científicos, generar datos falsos, suplantar el trabajo del equipo.
- **Declarar** en la submission:
  - herramienta usada,
  - para qué,
  - qué partes del código/texto/imagen son generadas.
- **Marcar** imágenes/videos generados con IA (watermark visible).
- **No usar logos ni branding de NASA** en contenido generado.
- **Revisar** todo lo generado por IA: alucinaciones, licencias, errores.

---

## 8. Reglas de presentación y entrega

- **Demo:** video de ≤30 s **o** deck de ≤7 slides (incluyendo título).
- **Idioma:** la submission y los slides en inglés. El video puede ser en español **con subtítulos en inglés**.
- **Links públicos:** sin login, sin permisos, sin registro.
- **NASA data:** al menos un dataset/recurso NASA usado de forma central.
- **Referencias:** listar código, imágenes, textos y datos externos.
- **Sin música con copyright.** Usar música libre o sin música.
- **Sin imágenes de menores** en el demo.
- **Ensayar 10 veces.** Grabar, mirar, corregir.

---

## 9. Reglas de convivencia y conflictos

- **Crítica al código, no a la persona.**
- **Decisiones por consenso, desempate por el lead del área.**
- Si hay conflicto:
  1. 5 min a solas.
  2. Si no se resuelve, lo habla el equipo completo.
  3. Si no se resuelve, decide Andy (lead) y se registra.
- **Crédito visible:** todos los nombres en el README y en la submission.
- **Nadie se queda atrás:** si alguien está bloqueado o perdido, se le da una tarea concreta y acotada.

---

## 10. Checklist de reglas para votar con el equipo

- [ ] ¿Qué challenge elegimos? (comparar en `docs/02-challenges-2026.md`)
- [ ] ¿Aprobamos los roles propuestos?
- [ ] ¿Aprobamos los horarios de standup?
- [ ] ¿Aprobamos el corte de alcance a T-12 h?
- [ ] ¿Aprobamos la regla de datos pesados fuera del repo?
- [ ] ¿Aprobamos la política de IA/SI?
- [ ] ¿Aprobamos el formato de pitch (video 30 s + deck de respaldo)?
- [ ] ¿Quién es el dueño de la submission final?

> Cuando estén votadas, copiar las decisiones a `documentacion.md` → Decision Log.
