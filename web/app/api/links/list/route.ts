import { z } from "zod";

import { fail, linksStore, ok, parse } from "@/lib/links/api";
import { authenticate, credentialsSchema } from "@/lib/links/auth";
import { alertsByCell, riskFrom } from "@/lib/links/risk";
import type { LinksResponse, LovedOne } from "@/lib/links/types";

const schema = z.object({ device: credentialsSchema });

/** Seres queridos que sigue (con su estado de riesgo) y quiénes lo siguen. */
export async function POST(request: Request) {
  const store = linksStore();
  if (store instanceof Response) return store;
  const body = await parse(request, schema);
  if (!body) return fail(400, "Datos inválidos");
  const device = await authenticate(store, body.device);
  // Un dispositivo que nunca invitó ni aceptó todavía no tiene vínculos.
  if (!device) return ok({ following: [], followers: [] } satisfies LinksResponse);

  const links = await store.linksOf(device.id);
  const followingLinks = links.filter((link) => link.follower === device.id);
  const devices = new Map((await store.devices(followingLinks.map((link) => link.followed))).map((item) => [item.id, item]));
  const alertsAt = alertsByCell();

  const following = await Promise.all(
    followingLinks.map(async (link): Promise<LovedOne> => {
      const other = devices.get(link.followed);
      if (other?.lat == null || other.lon == null) return { id: link.followed, alias: link.alias, located: false, point: null, risk: null };
      const point = { lat: other.lat, lon: other.lon };
      const risk = await alertsAt(point).then(riskFrom).catch(() => null);
      return { id: link.followed, alias: link.alias, located: true, point: risk && risk.count > 0 ? point : null, risk };
    }),
  );
  const followers = links.filter((link) => link.followed === device.id).map((link) => ({ id: link.follower, name: link.followerName }));
  return ok({ following, followers } satisfies LinksResponse);
}
