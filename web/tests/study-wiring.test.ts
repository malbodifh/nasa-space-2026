import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/** Lectura estática: el entorno de Vitest es `node`, sin DOM, así que verificamos el cableado. */
function source(relative: string): string {
  return readFileSync(new URL(relative, import.meta.url), "utf8");
}

const home = source("../components/HomeView.tsx");
const study = source("../components/SurfaceStudy.tsx");

describe("SurfaceStudy validation wiring", () => {
  it("valida punto y fecha con los helpers puros", () => {
    expect(study).toContain('from "@/lib/study-input"');
    expect(study).toMatch(/parseStudyPoint\(params\)/);
    expect(study).toMatch(/parseStudyDate\(params\.get\("fecha"\)\)/);
    expect(study).not.toContain('params.has("lat")');
    expect(study).not.toMatch(/Number\(params\.get\("lat"\)\)/);
  });

  it("muestra el error de entrada antes de cualquier consulta", () => {
    const alertIndex = study.indexOf("invalidField ?");
    expect(alertIndex).toBeGreaterThan(0);
    expect(study.indexOf("catalogFailed ?")).toBeGreaterThan(alertIndex);
    expect(study).toContain("Falta el lugar del evento");
    expect(study).toContain("La fecha no es válida.");
  });
});

describe("SurfaceStudy error vs empty", () => {
  it("solo una respuesta válida y vacía afirma falta de imágenes", () => {
    expect(study).toContain("const catalogFailed =");
    expect(study).toContain("const catalogEmpty =");
    expect(study).toMatch(/catalogEmpty = !zone && Boolean\(remote && !remote\.data && !remoteError && !remote\.meta\?\.fallback\)/);
    expect(study).toContain("El catálogo respondió y no devolvió imágenes de radar para este lugar.");
  });

  it("el fallo de consulta se explica y ofrece reintento con mutate", () => {
    expect(study).toContain("No pudimos consultar el catálogo; esto no significa que no haya imágenes.");
    expect(study).toContain("onClick={() => void retryCatalog()}");
    expect(study).toMatch(/mutate: retryCatalog/);
    expect(study).not.toMatch(/remote && !remote\.data \? \(\n\s*<div/);
  });

  it("trata meta.fallback como consulta parcial", () => {
    expect(study).toContain("const catalogPartial =");
    expect(study).toContain("Consulta parcial:");
    expect(study).toContain("remote?.meta?.fallback");
  });
});

describe("SurfaceStudy pair scoping", () => {
  it("vuelve al par por defecto al cambiar de zona o punto", () => {
    expect(study).toMatch(/if \(chosenFor !== sourceKey\) \{\s*setChosenFor\(sourceKey\);\s*setChosen\(null\);/);
    expect(study).not.toMatch(/useEffect\(\(\) => \{\s*setChosen\(null\)/);
    expect(study).toContain("scopedStudyPair(chosen, sourceKey");
  });
});

describe("timeouts de red", () => {
  it.each([
    ["HomeView", home],
    ["SurfaceStudy", study],
  ])("%s usa AbortSignal.timeout de 15 s", (_name, text) => {
    expect(text).toContain("AbortSignal.timeout(15_000)");
    expect(text).toMatch(/signal: AbortSignal\.timeout/);
  });
});

describe("Home fallback y assess", () => {
  it("no muestra verde «Sin alertas» cuando meta.fallback es true", () => {
    expect(home).toContain("events?.meta.fallback === true");
    expect(home).toMatch(/incomplete && noAlerts \? "neutro" : status\.tone/);
    expect(home).toContain("Información incompleta");
    expect(home).toContain("Esto no significa que no haya peligro.");
  });

  it("consume el error de assess con un estado terminal propio", () => {
    expect(home).toMatch(/data: assess, error: assessError/);
    expect(home).toMatch(/const fireText = fire/);
    expect(home).toContain('t("sin datos", "no data")');
    expect(home).toContain("{fireText}");
  });

  it("mantiene el demo local aunque falle la red", () => {
    expect(home).toContain("buildDemoAlerts");
    expect(home).toContain("Puede probar una simulación sin conexión.");
  });
});
