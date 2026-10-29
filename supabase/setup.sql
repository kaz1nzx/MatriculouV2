create extension if not exists "uuid-ossp";

create table if not exists public.instituicoes (
  id text primary key,
  nome text not null,
  rede text not null,
  cidade text not null,
  estado text not null,
  nota_mec numeric default 0,
  mensalidade_media numeric default 0,
  possui_bolsas boolean default false,
  avaliacao_media numeric default 0,
  total_avaliacoes integer default 0,
  foto_capa text,
  status_vaga text,
  tipo text
);

create table if not exists public.ofertas (
  id text primary key,
  instituicao_id text not null references public.instituicoes(id) on delete cascade,
  curso_nome text not null,
  nivel text,
  modalidade text,
  turno text,
  periodo text
);

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  nome_completo text,
  telefone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.favoritos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instituicao_id text not null references public.instituicoes(id) on delete cascade,
  instituicao_nome text,
  created_at timestamptz not null default now(),
  unique(user_id, instituicao_id)
);

create table if not exists public.documentos_usuario (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  path text,
  conteudo text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.instituicoes enable row level security;
alter table public.ofertas enable row level security;
alter table public.usuarios enable row level security;
alter table public.favoritos enable row level security;
alter table public.documentos_usuario enable row level security;

drop policy if exists "Instituições públicas para leitura" on public.instituicoes;
create policy "Instituições públicas para leitura" on public.instituicoes for select to public using (true);

drop policy if exists "Ofertas públicas para leitura" on public.ofertas;
create policy "Ofertas públicas para leitura" on public.ofertas for select to public using (true);

drop policy if exists "Usuários veem o próprio perfil" on public.usuarios;
create policy "Usuários veem o próprio perfil" on public.usuarios for select to authenticated using (auth.uid() = id);

drop policy if exists "Usuários criam o próprio perfil" on public.usuarios;
create policy "Usuários criam o próprio perfil" on public.usuarios for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Usuários atualizam o próprio perfil" on public.usuarios;
create policy "Usuários atualizam o próprio perfil" on public.usuarios for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Favoritos próprios" on public.favoritos;
create policy "Favoritos próprios" on public.favoritos for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Documentos próprios" on public.documentos_usuario;
create policy "Documentos próprios" on public.documentos_usuario for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select on public.instituicoes to anon, authenticated;
grant select on public.ofertas to anon, authenticated;
grant select, insert, update, delete on public.usuarios to authenticated;
grant select, insert, update, delete on public.favoritos to authenticated;
grant select, insert, update, delete on public.documentos_usuario to authenticated;

-- Criação/atualização automática do perfil após cadastro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios(id,email,nome_completo,telefone,avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome_completo',
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    nome_completo = coalesce(public.usuarios.nome_completo, excluded.nome_completo),
    telefone = coalesce(public.usuarios.telefone, excluded.telefone),
    avatar_url = coalesce(public.usuarios.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars','avatars',true,2097152,array['image/png','image/jpeg','image/webp']::text[])
on conflict (id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/png','image/jpeg','image/webp']::text[];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pre-matriculas','pre-matriculas',false,10485760,array['application/pdf','image/png','image/jpeg','image/webp']::text[])
on conflict (id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['application/pdf','image/png','image/jpeg','image/webp']::text[];

drop policy if exists "Avatar upload próprio" on storage.objects;
create policy "Avatar upload próprio" on storage.objects for insert to authenticated with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "Avatar update próprio" on storage.objects;
create policy "Avatar update próprio" on storage.objects for update to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "Avatar delete próprio" on storage.objects;
create policy "Avatar delete próprio" on storage.objects for delete to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "Avatar leitura pública" on storage.objects;
create policy "Avatar leitura pública" on storage.objects for select to public using (bucket_id='avatars');

drop policy if exists "Documento upload próprio" on storage.objects;
create policy "Documento upload próprio" on storage.objects for insert to authenticated with check (bucket_id='pre-matriculas' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "Documento leitura própria" on storage.objects;
create policy "Documento leitura própria" on storage.objects for select to authenticated using (bucket_id='pre-matriculas' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "Documento delete próprio" on storage.objects;
create policy "Documento delete próprio" on storage.objects for delete to authenticated using (bucket_id='pre-matriculas' and (storage.foldername(name))[1]=auth.uid()::text);

notify pgrst, 'reload schema';

-- Depois deste arquivo, execute supabase/seed_47_instituicoes.sql para carregar as 47 instituições.
