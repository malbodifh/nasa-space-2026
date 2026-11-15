"use client";

import { useLocale } from "@/components/LocaleProvider";
import { displayDetail, displayWhen, eventTitle, intlLocale } from "@/lib/display-i18n";
import { fromAlert } from "@/lib/events";
import { safetyAdvice, selectAdviceAlert } from "@/lib/safety-advice";
import type { DisasterAlert } from "@/lib/types";

export default function SafetyAdvice({
  alerts, exampleLocation, incomplete,
}: { alerts: DisasterAlert[]; exampleLocation: boolean; incomplete: boolean }) {
  const { locale, t } = useLocale();
  const alert = selectAdviceAlert(alerts);
  const advice = safetyAdvice(alert);
  return (
    <section className="tarjeta" aria-labelledby="orientacion">
      <h2 id="orientacion" className="text-[22px] font-bold">
        {t("Qué puede hacer", "What you can do")}
      </h2>
      <p className="mt-2 text-[15px] font-semibold text-tinta">
        {advice.mode === "priority"
          ? t("Atención prioritaria al reporte", "Priority attention to report")
          : advice.mode === "prepare"
            ? t("Preparación: no hay reporte vigente seleccionable", "Preparation: no current report selected")
            : advice.mode === "unknown"
              ? t("Atención no clasificable: falta distancia", "Attention level unavailable: distance missing")
            : t("Seguimiento del reporte", "Monitor the report")}
      </p>
      <p className="mt-2 text-[12px] text-tinta-suave">{t("Nivel de atención calculado con reglas de la app según tipo de amenaza, vigencia, distancia y clasificación del reporte. No determina si su ubicación es segura ni reemplaza una alerta oficial.", "Attention level calculated using app rules based on hazard type, recency, distance and report classification. It does not determine whether your location is safe or replace an official alert.")}</p>
      {alerts.length > 1 ? <p className="mt-2 text-[13px] text-tinta-suave">{t(`Hay ${alerts.length} reportes: esta guía muestra solo uno. Revise también la lista de eventos.`, `There are ${alerts.length} reports: this guidance shows only one. Also check the event list.`)}</p> : null}
      {exampleLocation ? <p className="mt-2 text-[13px] text-tinta-suave">{t("Se usa una ubicación de ejemplo, no su posición real.", "This uses an example location, not your actual position.")}</p> : null}
      {alert ? (
        <div className="mt-3 text-[13px] text-tinta-suave">
          <p className="font-semibold text-tinta">{eventTitle(fromAlert(alert), locale)}</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-semibold text-tinta">{t("Datos y límites del reporte", "Report data and limits")}</summary>
            <div className="mt-2 space-y-1">
              <p>{alert.source === "Demostración" ? t("Simulación: no es un evento real.", "Simulation: not a real event.") : `${t("Fuente", "Source")}: ${alert.source}`} · {displayWhen(alert.date, locale)}</p>
              <p>{t("Clasificación en la app", "App classification")}: {t(
                { red: "rojo", orange: "naranja", green: "verde", info: "informativo" }[alert.level],
                { red: "red", orange: "orange", green: "green", info: "informational" }[alert.level],
              )}. {t("No equivale a una alerta de la CNE.", "Not equivalent to a CNE alert.")}</p>
              <p>{t("Calidad", "Quality")}: {alert.quality ? t(
                { revisado: "revisado", preliminar: "preliminar", pronóstico: "pronóstico", "detección satelital": "detección satelital" }[alert.quality],
                { revisado: "reviewed", preliminar: "preliminary", pronóstico: "forecast", "detección satelital": "satellite detection" }[alert.quality],
              ) : t("no informada", "not provided")}</p>
              {alert.detail ? <p>{displayDetail(alert.detail, locale)}</p> : null}
              <p>{advice.distanceKnown
                ? t(`Aprox. ${Math.round(alert.distanceKm).toLocaleString(intlLocale(locale))} km al punto reportado, no al borde del peligro.`, `About ${Math.round(alert.distanceKm).toLocaleString(intlLocale(locale))} km to the reported point, not the hazard boundary.`)
                : t("Distancia no verificable.", "Distance cannot be verified.")}</p>
              {alert.category === "earthquakes" || alert.category === "EQ" ? (
                <p>{Number.isFinite(alert.magnitudeValue)
                  ? t(`Magnitud M${alert.magnitudeValue}: no es la intensidad que usted sintió.`, `Magnitude M${alert.magnitudeValue}: not the shaking intensity at your location.`)
                  : t("No hay magnitud verificada en este reporte.", "No verified magnitude is available in this report.")}</p>
              ) : null}
              <p>{alert.category === "tsunami"
                ? alert.source === "Demostración"
                  ? t("Escenario simulado: la franja del mapa es parte del guion, no un modelo de inundación ni una zona oficial.", "Simulated scenario: the map band is part of the script, not an inundation model or an official zone.")
                  : t("El alcance territorial no está determinado: consulte el reporte y las autoridades oficiales. La distancia al epicentro no determina qué costas están amenazadas.", "The territorial scope is unknown: check the report and official authorities. Distance to the epicenter does not determine which coasts are threatened.")
                : !advice.current
                ? t("Reporte vencido o fecha no verificable: consulte información actual.", "Report expired or date unverifiable: check current information.")
                : !advice.distanceKnown
                  ? t("Sin distancia verificable no se puede aplicar el criterio de cercanía; consulte el reporte original.", "Without a verifiable distance the proximity rule cannot be applied; check the original report.")
                : advice.relevant
                  ? t("Coincide con los criterios de cercanía de la app; no confirma daños en su ubicación.", "Matches the app's proximity rules; this does not confirm damage at your location.")
                  : t("No coincide con los criterios de cercanía de la app; eso no descarta peligro.", "Does not match the app's proximity rules; this does not rule out danger.")}</p>
            </div>
          </details>
        </div>
      ) : <p className="mt-3 text-[13px] text-tinta-suave">{t("Sin un reporte seleccionado no podemos evaluar su exposición. La ausencia de alertas no garantiza seguridad.", "Without a selected report we cannot assess your exposure. No alerts does not guarantee safety.")}</p>}
      {incomplete ? <p className="mt-2 text-[13px] text-tinta-suave">{t("La información está incompleta: puede haber eventos que no se muestran.", "Information is incomplete: some events may not be shown.")}</p> : null}
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-[14px] leading-relaxed">
        {advice.guide.steps.map(([es, en]) => <li key={es}>{t(es, en)}</li>)}
      </ol>
      <p className="mt-4 text-[13px] text-tinta-suave">{t("Actúe con calma y sin demorar su protección. Verifique el reporte antes de compartirlo. Esta guía no reemplaza instrucciones de las autoridades ni resume todas las amenazas.", "Act calmly without delaying protective action. Verify a report before sharing it. This guide does not replace authorities' instructions or cover every hazard.")}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px] font-semibold">
        <a href={advice.guide[locale]} target="_blank" rel="noreferrer" className="underline underline-offset-4">{advice.guide.source}</a>
        <a href="https://www.cne.go.cr/" target="_blank" rel="noreferrer" className="underline underline-offset-4">{t("CNE Costa Rica", "Costa Rica CNE")}</a>
        {alert?.category === "tsunami" ? <a href="https://unacostasegura.una.ac.cr/webServices/" target="_blank" rel="noreferrer" className="underline underline-offset-4">{t("Reportes SINAMOT", "SINAMOT reports")}</a> : null}
        {alert?.url && alert.source !== "Demostración" ? <a href={alert.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">{t("Reporte original", "Original report")}</a> : null}
        <a href="tel:911" className="underline underline-offset-4">{t("Emergencia inmediata: 9-1-1", "Immediate emergency: 9-1-1")}</a>
      </div>
      <p className="mt-3 text-[12px] text-tinta-suave">{t("Orientación general adaptada de fuentes oficiales, no generada por IA en tiempo real; no es una alerta emitida por la CNE.", "General guidance adapted from official sources, not generated by AI in real time; not an alert issued by CNE.")}</p>
    </section>
  );
}
