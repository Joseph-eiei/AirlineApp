-- Schema definition for flight search and booking mock data

create table if not exists public.cities (
  id text primary key,
  name text not null,
  code text not null,
  country text not null
);

create table if not exists public.planes (
  id text primary key,
  name text not null,
  manufacturer text not null
);

create table if not exists public.flight_info (
  id text primary key,
  flight_number text not null,
  from_city_id text not null references public.cities (id) on delete cascade,
  to_city_id text not null references public.cities (id) on delete cascade,
  departure_time timestamptz not null,
  arrival_time timestamptz not null,
  price numeric(8,2) not null,
  travel_date date not null,
  plane_id text references public.planes (id) on delete set null
);

create index if not exists flight_info_search_idx on public.flight_info (from_city_id, to_city_id, travel_date);

create table if not exists public.flight_booked (
  booking_id text primary key,
  user_id text not null,
  flight_id text not null references public.flight_info (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

-- Disable row level security for simplicity when using anonymous keys
alter table public.cities disable row level security;
alter table public.planes disable row level security;
alter table public.flight_info disable row level security;
alter table public.flight_booked disable row level security;
