-- Create charging stations table for listers to add their EV charging stations

create table if not exists public.charging_stations (
  id uuid primary key default gen_random_uuid(),
  lister_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  connector_type text not null check (connector_type in ('Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla')),
  power_output integer not null, -- in kW
  price_per_hour decimal(10, 2) not null,
  availability_start time not null default '00:00:00',
  availability_end time not null default '23:59:59',
  is_active boolean not null default true,
  amenities text[], -- array of amenities like ['WiFi', 'Restroom', 'Food']
  images text[], -- array of image URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.charging_stations enable row level security;

-- RLS Policies for charging stations
-- Anyone can view active charging stations
create policy "charging_stations_select_active"
  on public.charging_stations for select
  using (is_active = true);

-- Listers can view all their own stations
create policy "charging_stations_select_own"
  on public.charging_stations for select
  using (auth.uid() = lister_id);

-- Only listers can insert charging stations
create policy "charging_stations_insert_lister"
  on public.charging_stations for insert
  with check (
    auth.uid() = lister_id and 
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'lister'
    )
  );

-- Listers can update their own stations
create policy "charging_stations_update_own"
  on public.charging_stations for update
  using (auth.uid() = lister_id);

-- Listers can delete their own stations
create policy "charging_stations_delete_own"
  on public.charging_stations for delete
  using (auth.uid() = lister_id);

-- Create index for location-based queries
create index if not exists idx_charging_stations_location 
  on public.charging_stations (latitude, longitude);

-- Create index for city searches
create index if not exists idx_charging_stations_city 
  on public.charging_stations (city, state);
