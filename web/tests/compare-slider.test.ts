import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  status: { left: "error", right: "ready" },
  locale: "es",
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ t: (es: string, en: string) => fixture.locale === "es" ? es : en }),
}));

// Sin DOM instalado: renderizamos los estados de carga/error y comprobamos sus ancestros reales.
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: (initial: unknown) => [
    typeof initial === "number" ? initial : {
      left: { status: fixture.status.left, attempt: 0 },
      right: { status: fixture.status.right, attempt: 0 },
    },
    vi.fn(),
  ],
}));

import CompareSlider from "@/components/CompareSlider";

function render() {
  return renderToStaticMarkup(createElement(CompareSlider, {
    left: { src: "/photo.jpg", label: "Photo" },
    right: { src: "/radar.png", label: "Radar" },
    aspect: 1.1,
  }));
}

describe("CompareSlider recovery controls", () => {
  it.each(["es", "en"])("renders retries outside clipping and the range hit area: %s", (locale) => {
    fixture.locale = locale;
    fixture.status = { left: "error", right: "error" };
    const html = render();
    const ancestors: string[] = [];
    let buttons = 0;
    let ranges = 0;
    for (const [tag] of html.matchAll(/<\/?(?:div|button|input)\b[^>]*>/g)) {
      if (tag.startsWith("</div")) ancestors.pop();
      else if (tag.startsWith("<div")) ancestors.push(tag);
      else if (tag.startsWith("<button")) {
        buttons += 1;
        expect(ancestors.some((ancestor) => /overflow-hidden|clip-path/.test(ancestor))).toBe(false);
        expect(ancestors.at(-1)).toContain('role="status"');
      } else if (tag.startsWith("<input")) {
        ranges += 1;
        expect(tag).toContain('type="range"');
        expect(ancestors.some((ancestor) => ancestor.includes("has-[:focus-visible]:ring-4"))).toBe(true);
      }
    }
    expect(buttons).toBe(2);
    expect(ranges).toBe(1);
    expect(html).toContain(locale === "es" ? "Reintentar imagen" : "Retry image");
  });

  it("retains radar while an optical image is loading or unavailable", () => {
    fixture.locale = "en";
    for (const status of ["loading", "error"]) {
      fixture.status = { left: status, right: "ready" };
      const html = render();
      expect(html).toMatch(/src="\/radar\.png"[^>]*class="[^"]*object-fill "/);
      expect(html).not.toContain("Loading image: Radar");
      expect(html).not.toContain("load the image: Radar");
      expect(html).toContain(status === "loading" ? "Loading image: Photo" : "load the image: Photo");
    }
  });
});
