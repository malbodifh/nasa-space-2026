-- Tablas de los avisos push. Ejecutar una vez en el editor SQL de Supabase.
-- Solo el servidor (service role) las lee y escribe: RLS activo y sin políticas públicas.
create table if not exists push_subscriptions (
  endpoint   text primary key,
  p256dh     text not null,
  auth       text not null,
  lat        double precision not null,
  lon        double precision not null,
  lang       text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists push_sent (
  endpoint text not null,
  alert_id text not null,
  sent_at  timestamptz not null default now(),
  primary key (endpoint, alert_id)
);
create index if not exists push_sent_sent_at on push_sent (sent_at);

alter table push_subscriptions enable row level security;
alter table push_sent enable row level security;

-- Defensa extra: ni anon ni authenticated tienen permisos sobre estas tablas.
revoke all on push_subscriptions from anon, authenticated;
revoke all on push_sent from anon, authenticated;
