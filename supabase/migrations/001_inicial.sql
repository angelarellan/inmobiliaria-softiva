-- =============================================================================
-- AURA Bienes Raíces · Web modelo de Softiva Studio
-- 001_inicial.sql: tablas, seguridad (RLS) y bucket de fotos.
--
-- Cómo usarlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- Se puede volver a correr sin romper nada (es idempotente).
-- Después de esto, correr supabase/seed.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Función común: mantiene updated_at al día
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Propiedades
-- -----------------------------------------------------------------------------
create table if not exists public.properties (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title             text not null check (char_length(title) between 3 and 160),
  operation         text not null check (operation in ('Venta', 'Alquiler')),
  type              text not null check (type in ('Casa', 'Departamento', 'Penthouse', 'Oficina', 'Terreno')),
  currency          text not null default 'USD' check (currency in ('USD', 'ARS')),
  price             bigint not null check (price >= 0),
  price_suffix      text check (price_suffix is null or char_length(price_suffix) <= 20),
  neighborhood      text not null check (char_length(neighborhood) between 2 and 80),
  city              text not null default 'Buenos Aires' check (char_length(city) <= 80),
  address           text not null default '' check (char_length(address) <= 160),
  area              numeric(10, 2) not null default 0 check (area >= 0),
  bedrooms          smallint not null default 0 check (bedrooms between 0 and 50),
  bathrooms         smallint not null default 0 check (bathrooms between 0 and 50),
  parking           smallint not null default 0 check (parking between 0 and 50),
  images            text[] not null default '{}' check (cardinality(images) <= 8),
  short_description text not null default '' check (char_length(short_description) <= 300),
  description       text not null default '' check (char_length(description) <= 5000),
  amenities         text[] not null default '{}' check (cardinality(amenities) <= 30),
  featured          boolean not null default false,
  status            text not null default 'publicada'
                    check (status in ('publicada', 'pausada', 'vendida', 'alquilada')),
  position          integer not null default 0,
  is_seed           boolean not null default false,
  -- Quién la cargó: 'seed' (originales), 'demo' (usuario de prueba) u 'owner' (Softiva).
  -- El reseteo nocturno borra solo las de 'demo'.
  created_by        text not null default 'owner' check (created_by in ('seed', 'demo', 'owner')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists properties_status_position_idx
  on public.properties (status, position, created_at desc);

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Consultas (formulario de contacto)
-- -----------------------------------------------------------------------------
create table if not exists public.contacts (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 2 and 120),
  email          text not null check (char_length(email) between 3 and 200),
  phone          text not null default '' check (char_length(phone) <= 40),
  message        text not null check (char_length(message) between 1 and 3000),
  property_id    uuid references public.properties (id) on delete set null,
  property_title text check (property_title is null or char_length(property_title) <= 160),
  status         text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado')),
  created_at     timestamptz not null default now()
);

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);

-- -----------------------------------------------------------------------------
-- Tasaciones
-- -----------------------------------------------------------------------------
create table if not exists public.appraisals (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 120),
  email         text not null check (char_length(email) between 3 and 200),
  phone         text not null check (char_length(phone) between 6 and 40),
  property_type text not null check (char_length(property_type) <= 40),
  address       text not null check (char_length(address) between 3 and 200),
  area          text not null default '' check (char_length(area) <= 40),
  comments      text not null default '' check (char_length(comments) <= 3000),
  status        text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado')),
  created_at    timestamptz not null default now()
);

create index if not exists appraisals_created_at_idx on public.appraisals (created_at desc);

-- -----------------------------------------------------------------------------
-- Visitas (asistente de la web)
-- -----------------------------------------------------------------------------
create table if not exists public.visits (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid references public.properties (id) on delete set null,
  -- Copia del título y el slug, para no perder el dato si la propiedad se borra
  property_title text not null check (char_length(property_title) <= 160),
  property_slug  text check (property_slug is null or char_length(property_slug) <= 200),
  visit_date     date not null,
  time_slot      text not null check (char_length(time_slot) <= 60),
  name           text not null check (char_length(name) between 2 and 120),
  phone          text not null check (char_length(phone) between 6 and 40),
  operation      text check (operation is null or char_length(operation) <= 20),
  zone           text check (zone is null or char_length(zone) <= 80),
  budget         text check (budget is null or char_length(budget) <= 80),
  status         text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado')),
  created_at     timestamptz not null default now()
);

create index if not exists visits_created_at_idx on public.visits (created_at desc);

-- -----------------------------------------------------------------------------
-- Intentos de ingreso al panel (para limitar intentos fallidos)
-- -----------------------------------------------------------------------------
create table if not exists public.login_attempts (
  id         bigint generated always as identity primary key,
  ip         text not null check (char_length(ip) <= 100),
  username   text not null default '' check (char_length(username) <= 120),
  success    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_ip_created_idx
  on public.login_attempts (ip, created_at desc);

-- -----------------------------------------------------------------------------
-- Seguridad: RLS en todas las tablas
-- · Público (publishable key): solo puede LEER propiedades publicadas.
-- · Todo lo demás pasa por el servidor con la secret key (que saltea RLS).
-- -----------------------------------------------------------------------------
alter table public.properties     enable row level security;
alter table public.contacts       enable row level security;
alter table public.appraisals     enable row level security;
alter table public.visits         enable row level security;
alter table public.login_attempts enable row level security;

drop policy if exists "Lectura publica de propiedades publicadas" on public.properties;
create policy "Lectura publica de propiedades publicadas"
  on public.properties
  for select
  to anon, authenticated
  using (status = 'publicada');

-- Permisos explícitos (refuerzan las políticas de RLS)
revoke all on public.properties, public.contacts, public.appraisals, public.visits, public.login_attempts
  from anon, authenticated;
grant select on public.properties to anon, authenticated;

grant usage on schema public to service_role;
grant all on public.properties, public.contacts, public.appraisals, public.visits, public.login_attempts
  to service_role;
grant usage, select on all sequences in schema public to service_role;

-- -----------------------------------------------------------------------------
-- Storage: bucket público "propiedades" para las fotos
-- · Lectura pública por URL (para mostrar las fotos en la web).
-- · Sin políticas de escritura: las fotos se suben con URLs firmadas que
--   genera el servidor, y se borran desde el servidor con la secret key.
-- · Solo imágenes JPG, PNG o WebP de hasta 5 MB.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('propiedades', 'propiedades', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
