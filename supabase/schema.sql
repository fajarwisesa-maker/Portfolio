-- Run this once in the Supabase SQL editor.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  message text not null check (char_length(btrim(message)) between 1 and 500),
  avatar_url text,
  hidden boolean not null default false, -- flip to true in the dashboard to hide a comment
  created_at timestamptz not null default now()
);
create table if not exists public.comment_reactions (
  comment_id uuid not null references public.comments(id) on delete cascade,
  emoji text not null check (emoji in ('👍','❤️','🔥','😂','☕')),
  count integer not null default 0,
  primary key (comment_id, emoji)
);
create table if not exists public.coffee (
  id integer primary key check (id = 1),
  count bigint not null default 0
);
insert into public.coffee (id, count) values (1, 0) on conflict do nothing;

alter table public.comments enable row level security;
alter table public.comment_reactions enable row level security;
alter table public.coffee enable row level security;

create policy "read visible comments" on public.comments for select using (hidden = false);
create policy "anyone can comment" on public.comments for insert with check (hidden = false);
create policy "read reactions" on public.comment_reactions for select using (true);
create policy "read coffee" on public.coffee for select using (true);
-- no update/delete policies: visitors can only add.

-- p_delta 1 adds a reaction, -1 takes it back. Anything else is treated as +1 or -1; counts never go below 0.
drop function if exists public.react(uuid, text);
create or replace function public.react(p_comment_id uuid, p_emoji text, p_delta integer default 1)
returns integer language sql security definer set search_path = public as $$
  insert into comment_reactions (comment_id, emoji, count)
  values (p_comment_id, p_emoji, case when p_delta < 0 then 0 else 1 end)
  on conflict (comment_id, emoji) do update
    set count = greatest(comment_reactions.count + case when p_delta < 0 then -1 else 1 end, 0)
  returning count;
$$;
create or replace function public.brew_coffee()
returns bigint language sql security definer set search_path = public as $$
  update coffee set count = count + 1 where id = 1 returning count;
$$;
grant execute on function public.react(uuid, text, integer) to anon;
grant execute on function public.brew_coffee() to anon;

alter publication supabase_realtime add table public.comments, public.comment_reactions, public.coffee;

-- Avatars: public bucket, anyone can upload small WebP images (the site resizes before upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 262144, array['image/webp'])
on conflict (id) do nothing;
create policy "upload avatars" on storage.objects for insert to anon with check (bucket_id = 'avatars');
create policy "read avatars" on storage.objects for select using (bucket_id = 'avatars');
