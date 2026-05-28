-- ============================================================
-- GestãoOp — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================================

-- ─── EXTENSÕES ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TABELA: usuarios ────────────────────────────────────────
create table if not exists public.usuarios (
  id          text        primary key default 'u' || extract(epoch from now())::bigint::text,
  auth_id     uuid        references auth.users(id) on delete cascade,
  name        text        not null,
  email       text        not null unique,
  role        text        not null default 'colaborador' check (role in ('admin','colaborador')),
  cargo       text,
  setor       text,
  avatar      text,
  ativo       boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ─── TABELA: tarefas ─────────────────────────────────────────
create table if not exists public.tarefas (
  id               text        primary key default 't' || extract(epoch from now())::bigint::text,
  nome             text        not null,
  descricao        text,
  categoria        text        not null default 'Limpeza',
  horario          text        not null default '08:00',
  frequencia       text        not null default 'diaria'
                               check (frequencia in ('diaria','semanal','mensal','personalizada')),
  tempo_estimado   integer     not null default 15,
  peso             integer     not null default 5,
  foto_obrigatoria boolean     not null default true,
  responsavel_id   text        references public.usuarios(id) on delete set null,
  ativo            boolean     not null default true,
  created_at       timestamptz not null default now()
);

-- ─── TABELA: execucoes ───────────────────────────────────────
create table if not exists public.execucoes (
  id          text        primary key default 'e' || extract(epoch from now())::bigint::text,
  task_id     text        not null references public.tarefas(id) on delete cascade,
  user_id     text        not null references public.usuarios(id) on delete cascade,
  date        date        not null,
  timestamp   timestamptz not null default now(),
  status      text        not null check (status in ('concluida','nao_concluida')),
  observacao  text,
  photo_url   text,
  created_at  timestamptz not null default now(),
  -- Impede registro retroativo: date deve ser a data de hoje
  constraint no_retroativo check (date = current_date)
);

-- ─── TABELA: bonus_rules ─────────────────────────────────────
create table if not exists public.bonus_rules (
  id     serial  primary key,
  min    integer not null,
  max    integer not null,
  valor  numeric(10,2) not null default 0
);

-- Dados padrão de bônus
insert into public.bonus_rules (min, max, valor) values
  (90, 100, 300),
  (80,  89, 150),
  (70,  79,  50),
   (0,  69,   0)
on conflict do nothing;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.usuarios   enable row level security;
alter table public.tarefas    enable row level security;
alter table public.execucoes  enable row level security;
alter table public.bonus_rules enable row level security;

-- Admin: acesso total
create policy "admin_all_usuarios"    on public.usuarios    for all using (
  exists (select 1 from public.usuarios u where u.auth_id = auth.uid() and u.role = 'admin')
);
create policy "admin_all_tarefas"     on public.tarefas     for all using (
  exists (select 1 from public.usuarios u where u.auth_id = auth.uid() and u.role = 'admin')
);
create policy "admin_all_execucoes"   on public.execucoes   for all using (
  exists (select 1 from public.usuarios u where u.auth_id = auth.uid() and u.role = 'admin')
);
create policy "admin_all_bonus"       on public.bonus_rules for all using (
  exists (select 1 from public.usuarios u where u.auth_id = auth.uid() and u.role = 'admin')
);

-- Colaborador: lê próprias tarefas e execuções, insere apenas hoje
create policy "colab_select_tarefas"  on public.tarefas  for select using (
  responsavel_id in (
    select id from public.usuarios where auth_id = auth.uid()
  )
);
create policy "colab_select_execucoes" on public.execucoes for select using (
  user_id in (
    select id from public.usuarios where auth_id = auth.uid()
  )
);
create policy "colab_insert_execucoes" on public.execucoes for insert with check (
  user_id in (select id from public.usuarios where auth_id = auth.uid())
  and date = current_date
);
create policy "colab_select_bonus"    on public.bonus_rules for select using (true);
create policy "colab_select_usuarios" on public.usuarios for select using (
  auth_id = auth.uid()
);

-- ─── STORAGE: evidências fotográficas ────────────────────────
-- Crie um bucket chamado "evidencias" em Storage > New bucket
-- Marque como PRIVATE
-- Depois cole as políticas abaixo:

/*
-- Colaborador faz upload das próprias fotos
create policy "upload_evidencias" on storage.objects
  for insert with check (
    bucket_id = 'evidencias'
    and auth.uid() is not null
  );

-- Admin pode ver todas
create policy "admin_view_evidencias" on storage.objects
  for select using (
    bucket_id = 'evidencias'
    and exists (
      select 1 from public.usuarios u where u.auth_id = auth.uid() and u.role = 'admin'
    )
  );

-- Colaborador vê apenas as próprias
create policy "colab_view_evidencias" on storage.objects
  for select using (
    bucket_id = 'evidencias'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
*/
