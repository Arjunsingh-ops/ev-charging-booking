-- Create reviews table for users to review charging stations

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  station_id uuid not null references public.charging_stations(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one review per user per station
  unique(user_id, station_id)
);

-- Enable RLS
alter table public.reviews enable row level security;

-- RLS Policies for reviews
-- Anyone can view reviews
create policy "reviews_select_all"
  on public.reviews for select
  to authenticated
  using (true);

-- Users can create reviews for stations they've booked
create policy "reviews_insert_user"
  on public.reviews for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.bookings b
      where b.user_id = auth.uid() 
        and b.station_id = reviews.station_id 
        and b.status = 'completed'
    )
  );

-- Users can update their own reviews
create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_reviews_station_id 
  on public.reviews (station_id);

create index if not exists idx_reviews_rating 
  on public.reviews (rating);
