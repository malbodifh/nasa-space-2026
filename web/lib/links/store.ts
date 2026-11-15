import "server-only";

import { supabaseEnv, supabaseRest } from "@/lib/supabase-rest";

/**
 * Dispositivos, invitaciones y vínculos con seres queridos. Con Supabase configurado se guardan
 * ahí; sin él, en memoria (solo sirve en desarrollo local).
 */
export type Device = { id: string; keyHash: string; lat: number | null; lon: number | null; lang: "es" | "en" };
export type Invite = { codeHash: string; inviter: string; inviterName: string; alias: string; expiresAt: string };
/** `follower` recibe avisos cuando `followed` está en riesgo. */
export type Link = { follower: string; followed: string; alias: string; followerName: string };

export type LinksStore = {
  persistent: boolean;
  getDevice(id: string): Promise<Device | null>;
  saveDevice(device: Device): Promise<void>;
  devices(ids: string[]): Promise<Device[]>;
  createInvite(invite: Invite): Promise<void>;
  getInvite(codeHash: string): Promise<Invite | null>;
  /** Borra la invitación y dice si existía: así solo se puede usar una vez. */
  takeInvite(codeHash: string): Promise<Invite | null>;
  addLink(link: Link): Promise<void>;
  removeLink(follower: string, followed: string): Promise<void>;
  /** Vínculos donde el dispositivo sigue a alguien o alguien lo sigue. */
  linksOf(id: string): Promise<Link[]>;
  allLinks(): Promise<Link[]>;
};

export function memoryLinksStore(): LinksStore {
  const devices = new Map<string, Device>();
  const invites = new Map<string, Invite>();
  const links = new Map<string, Link>();
  return {
    persistent: false,
    async getDevice(id) {
      return devices.get(id) ?? null;
    },
    async saveDevice(device) {
      devices.set(device.id, device);
    },
    async devices(ids) {
      return ids.map((id) => devices.get(id)).filter((device): device is Device => Boolean(device));
    },
    async createInvite(invite) {
      invites.set(invite.codeHash, invite);
    },
    async getInvite(codeHash) {
      return invites.get(codeHash) ?? null;
    },
    async takeInvite(codeHash) {
      const invite = invites.get(codeHash) ?? null;
      invites.delete(codeHash);
      return invite;
    },
    async addLink(link) {
      links.set(`${link.follower}|${link.followed}`, link);
    },
    async removeLink(follower, followed) {
      links.delete(`${follower}|${followed}`);
    },
    async linksOf(id) {
      return [...links.values()].filter((link) => link.follower === id || link.followed === id);
    },
    async allLinks() {
      return [...links.values()];
    },
  };
}

type DeviceRow = { id: string; key_hash: string; lat: number | null; lon: number | null; lang: "es" | "en" };
type InviteRow = { code_hash: string; inviter: string; inviter_name: string; alias: string; expires_at: string };
type LinkRow = { follower: string; followed: string; alias: string; follower_name: string };

const toDevice = (row: DeviceRow): Device => ({ id: row.id, keyHash: row.key_hash, lat: row.lat, lon: row.lon, lang: row.lang });
const toInvite = (row: InviteRow): Invite => ({
  codeHash: row.code_hash,
  inviter: row.inviter,
  inviterName: row.inviter_name,
  alias: row.alias,
  expiresAt: row.expires_at,
});
const toLink = (row: LinkRow): Link => ({ follower: row.follower, followed: row.followed, alias: row.alias, followerName: row.follower_name });

export function supabaseLinksStore(baseUrl: string, key: string): LinksStore {
  const call = supabaseRest(baseUrl, key);
  const eq = (value: string) => `eq.${encodeURIComponent(value)}`;
  const json = async <T>(response: Response) => (await response.json()) as T;

  return {
    persistent: true,
    async getDevice(id) {
      const rows = await json<DeviceRow[]>(await call(`/devices?select=id,key_hash,lat,lon,lang&id=${eq(id)}`));
      return rows[0] ? toDevice(rows[0]) : null;
    },
    async saveDevice(device) {
      await call("/devices?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          id: device.id,
          key_hash: device.keyHash,
          lat: device.lat,
          lon: device.lon,
          lang: device.lang,
          updated_at: new Date().toISOString(),
        }),
      });
    },
    async devices(ids) {
      if (ids.length === 0) return [];
      const list = ids.map(encodeURIComponent).join(",");
      return (await json<DeviceRow[]>(await call(`/devices?select=id,key_hash,lat,lon,lang&id=in.(${list})`))).map(toDevice);
    },
    async createInvite(invite) {
      await call("/link_invites", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          code_hash: invite.codeHash,
          inviter: invite.inviter,
          inviter_name: invite.inviterName,
          alias: invite.alias,
          expires_at: invite.expiresAt,
        }),
      });
      // Limpieza de invitaciones vencidas.
      await call(`/link_invites?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, { method: "DELETE" }).catch(() => {});
    },
    async getInvite(codeHash) {
      const rows = await json<InviteRow[]>(await call(`/link_invites?select=*&code_hash=${eq(codeHash)}`));
      return rows[0] ? toInvite(rows[0]) : null;
    },
    async takeInvite(codeHash) {
      const response = await call(`/link_invites?code_hash=${eq(codeHash)}`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      });
      const rows = await json<InviteRow[]>(response);
      return rows[0] ? toInvite(rows[0]) : null;
    },
    async addLink(link) {
      await call("/links?on_conflict=follower,followed", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ follower: link.follower, followed: link.followed, alias: link.alias, follower_name: link.followerName }),
      });
    },
    async removeLink(follower, followed) {
      await call(`/links?follower=${eq(follower)}&followed=${eq(followed)}`, { method: "DELETE" });
    },
    async linksOf(id) {
      const rows = await json<LinkRow[]>(await call(`/links?select=follower,followed,alias,follower_name&or=(follower.${eq(id)},followed.${eq(id)})`));
      return rows.map(toLink);
    },
    async allLinks() {
      return (await json<LinkRow[]>(await call("/links?select=follower,followed,alias,follower_name&limit=10000"))).map(toLink);
    },
  };
}

let instance: LinksStore | null = null;

export function getLinksStore(): LinksStore {
  if (!instance) {
    const env = supabaseEnv();
    instance = env ? supabaseLinksStore(env.url, env.key) : memoryLinksStore();
  }
  return instance;
}
