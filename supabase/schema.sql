-- Schema definition for flight search and booking mock data

create table if not exists public.users (
  id text primary key,
  username text not null,
  password_hash text not null
);

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
  user_id text not null references public.users (id) on delete cascade,
  flight_id text not null references public.flight_info (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

-- Disable row level security for simplicity when using anonymous keys
alter table public.cities disable row level security;
alter table public.planes disable row level security;
alter table public.flight_info disable row level security;
alter table public.flight_booked disable row level security;

-- =====================================
-- MOCKUP DATA INSERTION FOR AIRLINE APP
-- =====================================

-- === USERS ===
insert into public.users (id, username, password_hash)
values
  ('u1', 'user', '$2a$12$OtTUFKwSkDqM7l/2WBbNBOMXPLU5J0BIVs7D8.46A89UuNWTRc6cW'); -- pw: user123

-- === CITIES ===
insert into public.cities (id, name, code, country)
values
  ('c1', 'Bangkok', 'BKK', 'Thailand'),
  ('c2', 'Tokyo', 'TYO', 'Japan'),
  ('c3', 'Seoul', 'ICN', 'South Korea'),
  ('c4', 'Singapore', 'SIN', 'Singapore'),
  ('c5', 'Sydney', 'SYD', 'Australia');

-- === PLANES ===
insert into public.planes (id, name, manufacturer)
values
  ('p1', 'Boeing 787 Dreamliner', 'Boeing'),
  ('p2', 'Airbus A350', 'Airbus'),
  ('p3', 'Boeing 737 MAX', 'Boeing');

-- === FLIGHT INFO (Mock Data Covering Dec 2025) ===
-- We'll use only a few sample days to illustrate; in real use, you can generate all days via script.
-- Each city-pair has at least 3 flights per day.

-- Example flights between BKK and TYO for December 1, 2025
insert into public.flight_info (id, flight_number, from_city_id, to_city_id, departure_time, arrival_time, price, travel_date, plane_id)
values
  ('f1', 'TG101', 'c1', 'c2', '2025-12-01 08:00+07', '2025-12-01 16:00+09', 420.00, '2025-12-01', 'p1'),
  ('f2', 'JL202', 'c1', 'c2', '2025-12-01 12:00+07', '2025-12-01 20:00+09', 460.00, '2025-12-01', 'p2'),
  ('f3', 'NH303', 'c1', 'c2', '2025-12-01 18:00+07', '2025-12-02 02:00+09', 390.00, '2025-12-01', 'p3'),
  ('f4', 'TG104', 'c2', 'c1', '2025-12-01 09:00+09', '2025-12-01 13:00+07', 410.00, '2025-12-01', 'p1'),
  ('f5', 'JL205', 'c2', 'c1', '2025-12-01 15:00+09', '2025-12-01 19:00+07', 450.00, '2025-12-01', 'p2'),
  ('f6', 'NH306', 'c2', 'c1', '2025-12-01 22:00+09', '2025-12-02 02:00+07', 400.00, '2025-12-01', 'p3');

-- Flights between BKK and SIN
insert into public.flight_info (id, flight_number, from_city_id, to_city_id, departure_time, arrival_time, price, travel_date, plane_id)
values
  ('f7', 'SQ501', 'c1', 'c4', '2025-12-01 07:00+07', '2025-12-01 10:00+08', 180.00, '2025-12-01', 'p3'),
  ('f8', 'SQ502', 'c1', 'c4', '2025-12-01 13:00+07', '2025-12-01 16:00+08', 190.00, '2025-12-01', 'p1'),
  ('f9', 'TG503', 'c1', 'c4', '2025-12-01 19:00+07', '2025-12-01 22:00+08', 210.00, '2025-12-01', 'p2'),
  ('f10', 'SQ504', 'c4', 'c1', '2025-12-01 09:00+08', '2025-12-01 12:00+07', 175.00, '2025-12-01', 'p3'),
  ('f11', 'SQ505', 'c4', 'c1', '2025-12-01 15:00+08', '2025-12-01 18:00+07', 195.00, '2025-12-01', 'p1'),
  ('f12', 'TG506', 'c4', 'c1', '2025-12-01 21:00+08', '2025-12-02 00:00+07', 200.00, '2025-12-01', 'p2');

-- Flights between TYO and SYD
insert into public.flight_info (id, flight_number, from_city_id, to_city_id, departure_time, arrival_time, price, travel_date, plane_id)
values
  ('f13', 'QF701', 'c2', 'c5', '2025-12-01 09:00+09', '2025-12-01 19:00+11', 550.00, '2025-12-01', 'p1'),
  ('f14', 'JL702', 'c2', 'c5', '2025-12-01 14:00+09', '2025-12-01 23:00+11', 600.00, '2025-12-01', 'p2'),
  ('f15', 'NH703', 'c2', 'c5', '2025-12-01 20:00+09', '2025-12-02 05:00+11', 580.00, '2025-12-01', 'p3'),
  ('f16', 'QF704', 'c5', 'c2', '2025-12-01 08:00+11', '2025-12-01 17:00+09', 540.00, '2025-12-01', 'p1'),
  ('f17', 'JL705', 'c5', 'c2', '2025-12-01 12:00+11', '2025-12-01 21:00+09', 590.00, '2025-12-01', 'p2'),
  ('f18', 'NH706', 'c5', 'c2', '2025-12-01 18:00+11', '2025-12-02 03:00+09', 560.00, '2025-12-01', 'p3');

-- === FLIGHT_BOOKED (Example Bookings) ===
insert into public.flight_booked (booking_id, user_id, flight_id, created_at)
values
  ('b1', 'u1', 'f1', now()),
  ('b2', 'u1', 'f7', now());


-- =====================================
-- END OF MOCK DATA
-- =====================================

