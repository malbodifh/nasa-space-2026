import { describe, expect, it } from "vitest";

import { eventTitle } from "@/lib/display-i18n";
import { ovsicoriPlace, usgsPlace } from "@/lib/seismic-parse";

const title = (place: string) => eventTitle({ id: "ovsicori-1", kind: "alerta", title: `M 3.0 · ${place}` }, "en");

describe("lugares de sismos en inglés", () => {
  it("traduce las frases que escribe la app y conserva los nombres propios", () => {
    expect(title(ovsicoriPlace("Off Coast of Costa Rica", "Playa Cabuya", "Santa Cruz"))).toBe("M 3.0 · Offshore, near Playa Cabuya, Santa Cruz");
    expect(title(ovsicoriPlace("Panama-Costa Rica Border Region", "Mellizas", "Coto Brus"))).toBe("M 3.0 · Panama border, near Mellizas, Coto Brus");
    expect(title(ovsicoriPlace("South of Panama", null, null))).toBe("M 3.0 · South of Panama");
    expect(title(usgsPlace("18 km WNW of Río Grande, Panama"))).toBe("M 3.0 · 18 km WNW of Río Grande, Panamá");
    expect(title(ovsicoriPlace("Costa Rica", "Jacó", "Garabito"))).toBe("M 3.0 · Jacó, Garabito");
  });

  it("en español no cambia nada", () => {
    const place = ovsicoriPlace("Off Coast of Costa Rica", "Playa Cabuya", "Santa Cruz");
    expect(eventTitle({ id: "x", kind: "alerta", title: `M 3.0 · ${place}` }, "es")).toBe(`M 3.0 · ${place}`);
  });
});
