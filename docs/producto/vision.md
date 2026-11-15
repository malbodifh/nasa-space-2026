# Visión del producto

> **Estado:** vigente · describe la app que está en `web/`.

## En una frase

**Memoria de Fuego** le dice a una persona en Costa Rica si hay un desastre natural cerca de
ella ahora mismo y, por cada evento, le muestra cómo cambió la superficie de la Tierra con radar
satelital.

## Qué ve la persona

1. **Portada (`/`)**: su estado de riesgo según su ubicación, el mapa arriba y las alertas
   recientes debajo, de la más nueva a la más vieja. «En curso» marca lo que ocurre en este
   momento. Cada alerta dice la fuente, la hora, si está revisada y enlaza al reporte oficial.
2. **Estudio (`/superficie`)**: imágenes de radar **NISAR** de antes y después del evento,
   comparadas con un deslizador, con un mapa de cambios y la foto normal (MODIS) al lado.

## Para quién y por qué

- Para cualquier persona, sin conocimientos técnicos: poco texto, un estado claro y un siguiente
  paso.
- Para el reto **Dancing with the SARs**: el radar NISAR no depende de nubes ni de luz, así que
  muestra cambios de la superficie donde una foto normal no ve.
- Las alertas son la puerta de entrada; el radar es lo que ninguna otra app de alertas ofrece.

## Cómo explicarlo (el «patito de goma»)

> Hay muchos sitios que avisan de un sismo o una tormenta. Nosotros juntamos esos avisos en un
> solo lugar, decimos cuáles le afectan a usted y, para cada uno, le enseñamos con radar de la
> NASA qué cambió en el terreno.

## Qué sigue sin ser

Ver [`limites.md`](limites.md). Reglas de las alertas en [`alertas.md`](alertas.md); método del
radar en [`nisar.md`](nisar.md).
