// Generado desde docs/00-equipo-y-reglas.md con pandoc. No editar a mano.

#import "theme.typ": *

= 00 --- Equipo y reglas de trabajo
#quote(block: true)[
#strong[Estado:] propuesta para discutir y votar el 2026-11-14.
#strong[Objetivo:] que cinco personas con habilidades distintas puedan
construir un demo sólido en 48 horas sin pisarse.
]

#line(length: 100%, stroke: 0.6pt + lineColor)

== 1. Equipo
#figure(
  align(center)[#table(
    columns: 4,
    stroke: 0.4pt + lineColor,
    inset: 3.0pt,
    fill: (x, y) => if y == 0 { navy } else if calc.odd(y) { white } else { paper },
    align: (auto,auto,auto,auto,),
    table.header([Persona], [Rol propuesto], [Backup], [Habilidades a
      confirmar],),
    table.hline(),
    [#strong[Andy]], [Lead / producto /
    integración], [David], [Frontend, pitch, organización],
    [#strong[David]], [Backend / datos / APIs], [Andy], [Python, APIs,
    procesamiento],
    [#strong[Samuel]], [Frontend / visualización], [Leo], [React/JS,
    canvas, charts],
    [#strong[Jorge]], [Ciencia / QA / validación], [David], [Astronomía,
    datos, testing],
    [#strong[Leo]], [Diseño / UX / storytelling /
    video], [Samuel], [Figma, edición, pitch],
  )]
  , kind: table
  )

#quote(block: true)[
Los roles son #strong[ownership], no propiedad. Todos pueden tocar todo,
pero cada área tiene un dueño que decide y rinde cuentas.
]

=== Regla de los dos
Ninguna persona es indispensable. Cada área tiene un backup que sabe
cómo levantarla y dónde está la documentación.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 2. Valores del equipo
+ #strong[Demo primero.] Si no se puede mostrar, no cuenta.
+ #strong[Ciencia honesta.] No exageramos resultados. Un candidato no es
  un descubrimiento.
+ #strong[Velocidad con orden.] Preferimos un PR chico hoy que una obra
  maestra el domingo.
+ #strong[Respeto.] Sin gritos, sin culpas, sin “eso no es mi parte”.
+ #strong[Documentar es trabajar.] Lo que no está escrito, se pierde.
+ #strong[Descansar es parte del plan.] El cansancio produce bugs y
  malos pitches.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 3. Reglas de comunicación
- #strong[Canal único de decisiones:] el grupo de WhatsApp/Discord del
  equipo. Las decisiones importantes se copian a `documentacion.md`.
- #strong[No se decide por DM.] Si se habló por privado, se resume en el
  canal.
- #strong[Un tema por mensaje.] Evitar hilos de 40 mensajes.
- #strong[Etiquetas:] `[BLOQUEO]`, `[DECISIÓN]`, `[DUDA]`, `[AVISO]`.
- #strong[Standup de 10 min] a las 9:00 y 21:00:
  - ¿Qué hice?
  - ¿Qué sigue?
  - ¿Qué me bloquea?
- #strong[Modo concentración:] avisar cuando se cierran notificaciones
  (bloques de 90 min).

#line(length: 100%, stroke: 0.6pt + lineColor)

== 4. Reglas de Git y código
- `main` #strong[siempre funciona]. Si se rompe, se arregla antes de
  seguir.
- Ramas:
  - `feat/nombre-corto`
  - `fix/nombre-corto`
  - `docs/nombre-corto`
- Commits chicos y en imperativo: `add endpoint de salud`,
  `fix timeout de API`.
- #strong[PR obligatorio] para cambios en `main`, aunque sea de una
  línea. Revisión de 1 persona.
- No se commitean:
  - `.env`, claves, tokens.
  - `data/cache/`, `*.fits`, videos pesados.
  - `node_modules/`, `.venv/`.
- Los scripts de datos deben ser #strong[reproducibles]: un comando, un
  README, una salida.
- Si se usa una librería nueva, se anota en el README del módulo y se
  avisa al equipo.

=== Definition of Done (para el hackathon)
Una tarea está lista cuando:

+ Funciona en la demo (no solo en la laptop del dueño).
+ Está documentada en una línea.
+ No rompe `main`.
+ Si usa datos, hay un script o caché identificable.
+ Si usa IA, está declarado.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 5. Reglas de tiempo
- #strong[Timebox de 2 h] para cualquier spike técnico. Si no funciona,
  se descarta y se busca un plan B.
- #strong[Regla de los 30 min:] si estás trabado 30 min, pedí ayuda. No
  se pierde el día por orgullo.
- #strong[Corte de alcance a T-12 h] (domingo mediodía): no se agregan
  features nuevas. Solo:
  - pulir,
  - arreglar bugs,
  - ensayar el pitch,
  - completar la submission.
- #strong[Bloques de trabajo:] 90 min de foco + 10 min de pausa.
- #strong[Turnos de descanso:] mínimo 5 h de sueño por persona en las 48
  h. Nadie codea 40 h seguidas.
- #strong[Comida y agua:] no son opcionales. Un equipo deshidratado no
  piensa.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 6. Reglas de datos y ciencia
+ #strong[Citar la fuente] de cada dato (IRSA, NASA, etc.) en la UI y en
  la submission.
+ #strong[No inventar datos.] Si falta un dato, se muestra un
  placeholder honesto.
+ #strong[Mostrar incertidumbre] cuando haya una medición (centroide,
  flujo, movimiento).
+ #strong[Etiquetar candidatos]: “posible objeto en movimiento”, no
  “objeto descubierto”.
+ #strong[No mezclar unidades] sin decirlo: MJy/sr, µJy, µm, arcsec.
+ #strong[No recortar imágenes para exagerar] un resultado. Si se usa un
  stretch, decirlo.
+ #strong[Guardar la versión del dataset] (DR1, QR3, fecha de descarga).
+ #strong[No usar datos propietarios] sin permiso. Los datos abiertos de
  NASA son públicos.
+ #strong[Contrato de datos obligatorio:] toda feature declara dataset,
  API/endpoint, campos, caché y fallback. Sin contrato, no entra al
  backlog.
+ #strong[No prometer datos que no tenemos:] si la misión/API no está en
  el inventario de datos del reto elegido, no se usa ni se menciona como
  si la tuviéramos.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 7. Reglas de IA (SI / Super Intelligence)
NASA Space Apps 2026 permite usar IA/SI, pero exige declararlo. Reglas
del equipo:

- #strong[Se permite] para: código, tests, documentación, traducción,
  ideas, imágenes de apoyo.
- #strong[No se permite] para: inventar resultados científicos, generar
  datos falsos, suplantar el trabajo del equipo.
- #strong[Declarar] en la submission:
  - herramienta usada,
  - para qué,
  - qué partes del código/texto/imagen son generadas.
- #strong[Marcar] imágenes/videos generados con IA (watermark visible).
- #strong[No usar logos ni branding de NASA] en contenido generado.
- #strong[Revisar] todo lo generado por IA: alucinaciones, licencias,
  errores.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 8. Reglas de presentación y entrega
- #strong[Demo:] video de ≤30 s #strong[o] deck de ≤7 slides (incluyendo
  título).
- #strong[Idioma:] la submission y los slides en inglés. El video puede
  ser en español #strong[con subtítulos en inglés].
- #strong[Links públicos:] sin login, sin permisos, sin registro.
- #strong[NASA data:] al menos un dataset/recurso NASA usado de forma
  central.
- #strong[Referencias:] listar código, imágenes, textos y datos
  externos.
- #strong[Sin música con copyright.] Usar música libre o sin música.
- #strong[Sin imágenes de menores] en el demo.
- #strong[Ensayar 10 veces.] Grabar, mirar, corregir.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 9. Reglas de convivencia y conflictos
- #strong[Crítica al código, no a la persona.]
- #strong[Decisiones por consenso, desempate por el lead del área.]
- Si hay conflicto:
  + 5 min a solas.
  + Si no se resuelve, lo habla el equipo completo.
  + Si no se resuelve, decide Andy (lead) y se registra.
- #strong[Crédito visible:] todos los nombres en el README y en la
  submission.
- #strong[Nadie se queda atrás:] si alguien está bloqueado o perdido, se
  le da una tarea concreta y acotada.

#line(length: 100%, stroke: 0.6pt + lineColor)

== 10. Checklist de reglas para votar con el equipo
- ☐ ¿Qué challenge elegimos? (comparar en `docs/02-challenges-2026.md`)
- ☐ ¿Aprobamos los roles propuestos?
- ☐ ¿Aprobamos los horarios de standup?
- ☐ ¿Aprobamos el corte de alcance a T-12 h?
- ☐ ¿Aprobamos la regla de datos pesados fuera del repo?
- ☐ ¿Aprobamos la política de IA/SI?
- ☐ ¿Aprobamos el formato de pitch (video 30 s + deck de respaldo)?
- ☐ ¿Quién es el dueño de la submission final?

#quote(block: true)[
Cuando estén votadas, copiar las decisiones a `documentacion.md` →
Decision Log.
]