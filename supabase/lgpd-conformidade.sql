-- CONFORMIDADE LGPD E SEGURANÇA — Matriculou
-- Execute uma vez no SQL Editor do projeto, depois de setup.sql. É idempotente.

-- 1. Documentos privados: o bucket público expunha documentos de identidade
--    a qualquer pessoa com o link. O site agora usa links temporários assinados.
update storage.buckets set public = false where id = 'pre-matriculas';

-- Favoritos não devem ser legíveis por visitantes anônimos.
revoke all on public.favoritos from anon;

-- 2. Registro do aceite dos termos (data e versão) no perfil.
alter table public.usuarios add column if not exists termos_versao text;
alter table public.usuarios add column if not exists termos_aceitos_em timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios(id,email,nome_completo,telefone,avatar_url,termos_versao,termos_aceitos_em)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nome_completo',
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'termos_versao',
    nullif(new.raw_user_meta_data->>'termos_aceitos_em','')::timestamptz
  )
  on conflict (id) do update set
    email = excluded.email,
    nome_completo = coalesce(public.usuarios.nome_completo, excluded.nome_completo),
    telefone = coalesce(public.usuarios.telefone, excluded.telefone),
    avatar_url = coalesce(public.usuarios.avatar_url, excluded.avatar_url),
    termos_versao = coalesce(excluded.termos_versao, public.usuarios.termos_versao),
    termos_aceitos_em = coalesce(excluded.termos_aceitos_em, public.usuarios.termos_aceitos_em);
  return new;
end;
$$;

-- 3. Exclusão da própria conta (LGPD, art. 18, VI). Apaga auth.users e, em cascata,
--    usuarios, favoritos e documentos_usuario. Os arquivos são removidos pelo site antes.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- 4. Solicitações de titulares (formulário /lgpd). Visitantes só podem inserir;
--    a leitura é feita pela equipe no painel do Supabase.
create table if not exists public.solicitacoes_lgpd (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null check (char_length(nome) between 2 and 120),
  email text not null check (char_length(email) between 5 and 160),
  tipo text not null check (tipo in ('confirmacao','acesso','correcao','anonimizacao','portabilidade','eliminacao','compartilhamento','revogacao','oposicao','outro')),
  detalhes text check (detalhes is null or char_length(detalhes) <= 2000),
  status text not null default 'recebida' check (status in ('recebida','em_andamento','concluida','recusada')),
  created_at timestamptz not null default now(),
  respondida_em timestamptz
);

alter table public.solicitacoes_lgpd enable row level security;

drop policy if exists "Titulares registram solicitações" on public.solicitacoes_lgpd;
create policy "Titulares registram solicitações" on public.solicitacoes_lgpd
for insert to anon, authenticated
with check (status = 'recebida' and respondida_em is null and (user_id is null or user_id = auth.uid()));

grant insert on public.solicitacoes_lgpd to anon, authenticated;

-- 5. Sem avaliações falsas: o site não tem sistema de avaliações, então notas e
--    contagens existentes não vieram de usuários reais.
update public.instituicoes set avaliacao_media = 0, total_avaliacoes = 0;

-- 6. Imagens de terceiros: fotos copiadas de portais de notícia e miniaturas do
--    Google não têm licença de uso. O site mostra um monograma no lugar.
--    Cadastre apenas imagens próprias, cedidas pela instituição ou com licença livre
--    (com o crédito exigido pela licença).
update public.instituicoes set foto_capa = null where foto_capa is not null and foto_capa not like '/%';

notify pgrst, 'reload schema';
