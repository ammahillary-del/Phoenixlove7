-- ============================================================
-- PhoenixLove — schéma de base de données Supabase
-- À exécuter dans : Supabase → SQL Editor → New query → Run
-- ============================================================

-- Extension nécessaire pour générer des identifiants uniques
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILES : une ligne par utilisateur, liée au compte d'authentification
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text default '',
  birthdate date,
  gender text check (gender in ('homme', 'femme')),
  interested_in text check (interested_in in ('hommes', 'femmes', 'les_deux')) default 'les_deux',
  tags text[] default '{}',
  photo_url text,
  verified boolean default false,
  is_vip boolean default false,
  is_premium boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Tout le monde connecté peut voir tous les profils (nécessaire pour Découvrir)
create policy "profiles visibles par tous les connectés"
  on profiles for select
  using (auth.role() = 'authenticated');

-- Chacun ne peut modifier que son propre profil
create policy "modifier uniquement son propre profil"
  on profiles for update
  using (auth.uid() = id);

create policy "créer son propre profil"
  on profiles for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------
-- LIKES : qui a aimé qui
-- ------------------------------------------------------------
create table likes (
  id uuid primary key default uuid_generate_v4(),
  from_user uuid references profiles(id) on delete cascade,
  to_user uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (from_user, to_user)
);

alter table likes enable row level security;

create policy "voir mes propres likes envoyés ou reçus"
  on likes for select
  using (auth.uid() = from_user or auth.uid() = to_user);

create policy "créer un like en son propre nom"
  on likes for insert
  with check (auth.uid() = from_user);

-- ------------------------------------------------------------
-- MATCHES : créés automatiquement quand un like devient mutuel
-- ------------------------------------------------------------
create table matches (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

alter table matches enable row level security;

create policy "voir mes propres matches"
  on matches for select
  using (auth.uid() = user_a or auth.uid() = user_b);

-- Fonction : crée un match automatiquement si le like est réciproque
create or replace function check_mutual_like()
returns trigger as $$
begin
  if exists (
    select 1 from likes
    where from_user = new.to_user and to_user = new.from_user
  ) then
    insert into matches (user_a, user_b)
    values (least(new.from_user, new.to_user), greatest(new.from_user, new.to_user))
    on conflict do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_check_mutual_like
  after insert on likes
  for each row execute function check_mutual_like();

-- ------------------------------------------------------------
-- MESSAGES : liés à un match
-- ------------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  type text check (type in ('text', 'image', 'video', 'audio', 'call')) default 'text',
  content text,
  call_kind text,
  call_status text,
  call_duration int,
  edited boolean default false,
  deleted boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "voir les messages de mes propres matches"
  on messages for select
  using (
    exists (
      select 1 from matches
      where matches.id = messages.match_id
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  );

create policy "envoyer un message dans mes propres matches"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from matches
      where matches.id = messages.match_id
      and (matches.user_a = auth.uid() or matches.user_b = auth.uid())
    )
  );

create policy "modifier ou supprimer mes propres messages"
  on messages for update
  using (auth.uid() = sender_id);

-- ------------------------------------------------------------
-- REPORTS & BLOCKS : sécurité et modération
-- ------------------------------------------------------------
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references profiles(id) on delete cascade,
  reported_id uuid references profiles(id) on delete cascade,
  reason text,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table reports enable row level security;
create policy "créer un signalement" on reports for insert with check (auth.uid() = reporter_id);
create policy "voir mes propres signalements" on reports for select using (auth.uid() = reporter_id);

create table blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, blocked_id)
);
alter table blocks enable row level security;
create policy "gérer mes propres blocages" on blocks for all using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- PAYMENT_REQUESTS : demandes VIP+ en attente de validation manuelle
-- ------------------------------------------------------------
create table payment_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  reference text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);
alter table payment_requests enable row level security;
create policy "créer sa propre demande de paiement" on payment_requests for insert with check (auth.uid() = user_id);
create policy "voir sa propre demande de paiement" on payment_requests for select using (auth.uid() = user_id);
-- Note : la validation (passage à 'approved') se fait via la clé "service role"
-- depuis la fonction serveur admin, jamais depuis le navigateur du client.

-- ------------------------------------------------------------
-- TEMPS RÉEL : active la diffusion instantanée des nouveaux messages
-- ------------------------------------------------------------
alter publication supabase_realtime add table messages;
