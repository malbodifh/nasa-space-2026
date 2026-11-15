import { timingSafeEqual } from "node:crypto";

import { runPushCycle } from "@/lib/push/send";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "No autorizado" }, { status: 401 });
  const result = await runPushCycle();
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
