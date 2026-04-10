-- Create bookings table for users to book charging sessions

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  station_id uuid not null references public.charging_stations(id) on delete cascade,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text not null check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) default 'pending',
  total_price decimal(10, 2) not null,
  payment_status text not null check (payment_status in ('pending', 'paid', 'refunded')) default 'pending',
  special_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure end_time is after start_time
  constraint valid_booking_time check (end_time > start_time)
);

-- Enable RLS
alter table public.bookings enable row level security;

-- RLS Policies for bookings
-- Users can view their own bookings
create policy "bookings_select_user"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Listers can view bookings for their stations
create policy "bookings_select_lister"
  on public.bookings for select
  using (
    exists (
      select 1 from public.charging_stations cs
      where cs.id = station_id and cs.lister_id = auth.uid()
    )
  );

-- Users can create bookings
create policy "bookings_insert_user"
  on public.bookings for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and user_type = 'user'
    )
  );

-- Users can update their own bookings (for cancellation, etc.)
create policy "bookings_update_user"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Listers can update booking status for their stations
create policy "bookings_update_lister"
  on public.bookings for update
  using (
    exists (
      select 1 from public.charging_stations cs
      where cs.id = station_id and cs.lister_id = auth.uid()
    )
  );

-- Create indexes for efficient queries
create index if not exists idx_bookings_user_id 
  on public.bookings (user_id);

create index if not exists idx_bookings_station_id 
  on public.bookings (station_id);

create index if not exists idx_bookings_start_time 
  on public.bookings (start_time);

create index if not exists idx_bookings_status 
  on public.bookings (status);
