-- Vínculos con seres queridos. Ejecutar una vez en el editor SQL de Supabase, después de push.sql.
-- No hay cuentas: cada teléfono tiene un id y una clave secreta (aquí solo su hash SHA-256).
-- Solo el servidor (service role) lee y escribe: RLS activo y sin políticas públicas.
create table if not exists devices (
  id         uuid primary key,
  key_hash   text not null,
  -- Zona aproximada (~1 km) de la última vez que abrió la app con GPS. Nunca la exacta.
  lat        double precision,
  lon        double precision,
  lang       text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Invitación de un solo uso. El link lleva el código; aquí solo se guarda su hash.
create table if not exists link_invites (
  code_hash    text primary key,
  inviter      uuid not null references devices (id) on delete cascade,
  inviter_name text not null,
  alias        text not null,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);
create index if not exists link_invites_inviter on link_invites (inviter);

-- «follower» recibe avisos cuando «followed» está en riesgo. «followed» lo aceptó.
create table if not exists links (
  follower      uuid not null references devices (id) on delete cascade,
  followed      uuid not null references devices (id) on delete cascade,
  alias         text not null,
  follower_name text not null,
  created_at    timestamptz not null default now(),
  primary key (follower, followed),
  check (follower <> followed)
);
create index if not exists links_followed on links (followed);

alter table push_subscriptions add column if not exists device_id uuid references devices (id) on delete set null;

alter table devices enable row level security;
alter table link_invites enable row level security;
alter table links enable row level security;

revoke all on devices from anon, authenticated;
revoke all on link_invites from anon, authenticated;
revoke all on links from anon, authenticated;
