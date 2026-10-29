-- CORREÇÃO DO MATRICULOU: favoritos + buckets de arquivos
-- Execute este arquivo no Supabase Dashboard > SQL Editor.
-- Ele é seguro para executar mais de uma vez.

create extension if not exists "uuid-ossp";

-- =========================================================
-- FAVORITOS
-- =========================================================
create table if not exists public.favoritos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instituicao_id text not null references public.instituicoes(id) on delete cascade,
  instituicao_nome text,
  created_at timestamptz not null default now(),
  unique (user_id, instituicao_id)
);

alter table public.favoritos enable row level security;

drop policy if exists "Favoritos próprios" on public.favoritos;
create policy "Favoritos próprios"
on public.favoritos
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Permissões necessárias para o cliente Supabase consultar a tabela.
grant select, insert, update, delete on public.favoritos to authenticated;

-- =========================================================
-- STORAGE: AVATARES
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/png','image/jpeg','image/webp']::text[]
)
on conflict (id) do update
set public = true,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/png','image/jpeg','image/webp']::text[];

-- =========================================================
-- STORAGE: PRÉ-MATRÍCULAS
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pre-matriculas',
  'pre-matriculas',
  false,
  10485760,
  array['application/pdf','image/png','image/jpeg','image/webp']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/webp']::text[];

-- =========================================================
-- POLÍTICAS DOS AVATARES
-- =========================================================
drop policy if exists "Avatar upload próprio" on storage.objects;
create policy "Avatar upload próprio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Avatar update próprio" on storage.objects;
create policy "Avatar update próprio"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Avatar delete próprio" on storage.objects;
create policy "Avatar delete próprio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Avatar leitura pública" on storage.objects;
create policy "Avatar leitura pública"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

-- =========================================================
-- POLÍTICAS DOS DOCUMENTOS
-- =========================================================
drop policy if exists "Documento upload próprio" on storage.objects;
create policy "Documento upload próprio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'pre-matriculas'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Documento leitura própria" on storage.objects;
create policy "Documento leitura própria"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'pre-matriculas'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Documento delete próprio" on storage.objects;
create policy "Documento delete próprio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'pre-matriculas'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Atualiza o cache de schema do PostgREST após a migração.
notify pgrst, 'reload schema';
