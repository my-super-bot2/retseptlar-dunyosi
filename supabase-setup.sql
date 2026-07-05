-- ============================================
-- RETSEPTLAR DUNYOSI — Supabase SQL sozlamalari
-- Buni Supabase SQL Editor'da bir marta ishga tushiring
-- ============================================

-- 1) recipes jadvaliga reyting ustunlari qo'shish (agar yo'q bo'lsa)
alter table public.recipes add column if not exists rating_sum integer default 0;
alter table public.recipes add column if not exists rating_count integer default 0;

-- 2) ratings jadvali (har bir foydalanuvchi har bir retseptga 1 marta baho beradi)
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  stars integer not null check (stars between 1 and 5),
  created_at timestamp with time zone default now(),
  unique(recipe_id, user_id)
);

alter table public.ratings enable row level security;

create policy "Hamma ratinglarni ko'ra oladi" on public.ratings
  for select using (true);

create policy "Login qilgan user o'z ratingini qo'sha oladi" on public.ratings
  for insert with check (auth.uid() = user_id);

-- 3) reviews jadvali (fikrlar)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone default now()
);

alter table public.reviews enable row level security;

create policy "Hamma fikrlarni ko'ra oladi" on public.reviews
  for select using (true);

create policy "Login qilgan user fikr qoldira oladi" on public.reviews
  for insert with check (auth.uid() = user_id);

-- 4) Storage bucket'lar (agar hali yaratilmagan bo'lsa, Dashboard > Storage'da qo'lda yarating):
--    - recipe-images (public)
--    - avatars (public)
