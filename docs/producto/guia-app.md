# Guía de la app

> **Estado:** vigente · navegación, idiomas y ayuda del prototipo. La explicación pública vive
> en `/acerca`. No reemplaza las [reglas de alertas](alertas.md), el [método radar](nisar.md)
> ni el [inventario de fuentes](../tecnico/fuentes.md).

## Navegación

El layout raíz incluye **un único** `SiteHeader` en todas las páginas. No agregar encabezados
locales a las vistas.

- `/`: **Inicio / Home**, ubicación, mapa y reportes.
- `/superficie`: **Superficie / Surface**, estudio del punto seleccionado. Abrirlo desde un
  evento conserva los parámetros de lugar y fecha; sin punto puede solicitar elegir un evento.
- `/acerca`: **Acerca de la app / About the app**, uso, método, fuentes, límites y autoevaluación.

El menú hamburguesa está arriba a la derecha, también en móvil. Es un disclosure de navegación
**no modal**, no un `role="menu"` de aplicación: mantiene enlaces y Tab nativos.

- Enter o Espacio abre el botón y enfoca el primer enlace.
- Flechas arriba/abajo, Home y End recorren enlaces y botones de idioma.
- Escape cierra y devuelve el foco al botón.
- Pulsar fuera o salir con Tab cierra sin robar el foco.
- Seguir un enlace cierra; cambiar de ruta reinicia el menú.
- `aria-expanded`, `aria-controls`, `aria-current` y `aria-pressed` describen el estado.

## Idiomas: contrato para componentes

`LocaleProvider` envuelve la app desde `web/app/layout.tsx`. En componentes cliente:

```tsx
import { useLocale } from "@/components/LocaleProvider";

const { locale, t, setLocale } = useLocale();
// locale: "es" | "en"
t("Fuente", "Source");
setLocale("en");
```

Para funciones puras sin contexto React:

```ts
import { translated, type Locale } from "@/lib/i18n";

function label(locale: Locale) {
  return translated(locale, "Fuente", "Source");
}
```

`t(es, en?)` y `translated(locale, es, en?)` usan el texto español si falta traducción inglesa.
Los textos son explícitos, redactados en el código: **no hay traducción automática del DOM ni
servicios externos**. Títulos, topónimos y reportes originales no se reescriben.

El primer HTML y la hidratación usan **español**. `useSyncExternalStore` aplica después la
preferencia de `localStorage` (`memoria-de-fuego:locale`), sin hacer divergir servidor y cliente.
Un `lang=es` o `lang=en` válido en la URL tiene prioridad al inicializar después de hidratar:
para materiales de entrega se puede enlazar directamente a **`/?lang=en`** y
**`/acerca?lang=en`**. No se usa `useSearchParams` en el layout ni se fuerza renderizado dinámico.
El helper puro `localeFromSearch(search)` devuelve `"es"`, `"en"` o `null`.

El menú actualiza `lang` con `history.replaceState`, manteniendo ruta, otros parámetros, hash y
estado del router. La query no bloquea el toggle: un enlace `?lang=en` puede cambiarse a ES.
La selección inicial por URL también se persiste; al navegar a rutas sin query se mantiene el
idioma elegido. Atrás/Adelante aplica el idioma si la entrada histórica incluye `lang` válido.
El idioma se mantiene al navegar y se sincroniza entre pestañas. El atributo `html.lang` refleja
el idioma activo. Si el navegador bloquea almacenamiento, el cambio funciona en memoria durante
la sesión pero puede no sobrevivir a una recarga.

## Identidad

Se conserva `BrandMark`: fondo oscuro redondeado, círculos concéntricos azules y claros. El
encabezado, la ayuda y `web/app/icon.svg` usan esa misma identidad propia. No se incorporó un logo
ajeno ni se supone que haya un nuevo archivo de marca aportado por el usuario.

## Lectura responsable

1. Inicio usa un ejemplo cerca de Liberia. Para el lugar real, pulsar «Usar mi ubicación» y
   autorizar el GPS; si falla se conserva el ejemplo. No hay selector de ciudades.
2. Revisar fecha, distancia, fuente y calidad de cada reporte; abrir su enlace original.
3. Distinguir evento listado, evento que afecta al lugar y evento en curso.
4. Abrir superficie desde un evento y comprobar fechas y cobertura antes de interpretar.
5. Consultar CNE, IMN y servicios de emergencia. **Sin reportes no significa sin peligro.**

La ayuda explica que el mapa no es un perímetro oficial y que el radar compara vistas previas
de 8 bits, no gamma0 calibrado. El cambio de brillo no prueba daño ni causalidad. Las imágenes
provisionales, falta de cobertura y fuentes sin respuesta no deben ocultarse.

## Autoevaluación interna

La sección pública separa **evidencia del repositorio** de **faltantes por validar**. Presenta la
[simulación del auditor](../qa/challenge-review.md) en escala **propia 0–4**, con las notas
Impact 3, Creativity 3, Validity 2, Relevance 4 y Presentation 2. Es una foto del commit
`9256c87` (15/11/2026), anterior a la ayuda y el idioma seleccionable: **no se ha reevaluado la
versión actual**. No se suman ni ponderan; no es calificación oficial ni predicción del jurado.
Los nombres orientan una revisión interna; la evidencia del auditor sobre las páginas oficiales
fue indexada, no lectura directa, y no certifica la rúbrica vigente.

| Área interna | Evidencia | Faltante |
|---|---|---|
| Vínculo con el reto de trabajo | Dancing with the SARs en [estado](../estado.md) | Registro formal de elección; referencia oficial verificable |
| Uso espacial | CMR, vistas previas NISAR, cuatro zonas precalculadas | Validación con datos calibrados y observaciones independientes |
| Utilidad y comunicación | Reportes, mapa, superficie, menú e idioma | Pruebas con usuarios y auditoría completa de accesibilidad |
| Transparencia y reproducibilidad | Código, reglas, límites y pruebas versionadas | Verificar despliegue final, cobertura y evidencias de entrega |

No afirmar que las pruebas existentes certifican exactitud científica. La ayuda distingue los
píxeles comparables del área total, la corrección mediana del navegador frente a la media del
precálculo y la mezcla de versiones provisionales/validadas. «Validado» no certifica daño.
Si llega evidencia directa de criterios oficiales, distinguirla de esta revisión interna.
Se declara la asistencia de IA en código y textos de la interfaz; no sustituye revisión humana.

## Verificación de integración

- Comprobar que `/`, `/superficie` y `/acerca` muestran un solo encabezado.
- Probar teclado, Escape, foco, click fuera y móvil en el navegador.
- Cambiar ES/EN, navegar y recargar; comprobar persistencia y ausencia de avisos de hidratación.
- Probar almacenamiento bloqueado y sincronización entre pestañas.
- Ejecutar los tests nuevos de idioma y menú; la integración completa corre en el coordinador.
