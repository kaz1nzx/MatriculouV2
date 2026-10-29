-- PAINEL DAS INSTITUIÇÕES — Matriculou
-- Execute no SQL Editor depois de correcao-dados-catalogo.sql. É idempotente.
--
-- Cria a gestão das instituições e redes de ensino (equipe, cursos, candidaturas,
-- mensagens, comunicados), o suporte e o registro de auditoria. Toda a autorização
-- é feita aqui, por RLS e gatilhos: o site apenas reflete o que o banco permite.
--
-- Para nomear o primeiro administrador da plataforma (aprova pedidos de acesso):
--   update public.usuarios set papel = 'plataforma' where email = 'voce@exemplo.com';

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. PERFIL DO ESTUDANTE E PAPEL NA PLATAFORMA
-- =========================================================
alter table public.usuarios
  add column if not exists papel text not null default 'estudante',
  add column if not exists cidade text,
  add column if not exists estado text,
  add column if not exists data_nascimento date,
  add column if not exists escolaridade text,
  add column if not exists areas_interesse text[] not null default '{}',
  add column if not exists bio text,
  add column if not exists notificacoes boolean not null default true,
  add column if not exists atualizado_em timestamptz not null default now();

do $$ begin
  alter table public.usuarios add constraint usuarios_papel_check check (papel in ('estudante', 'plataforma'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.usuarios add constraint usuarios_campos_check check (
    (telefone is null or char_length(telefone) <= 20)
    and (cidade is null or char_length(cidade) <= 80)
    and (estado is null or char_length(estado) = 2)
    and (bio is null or char_length(bio) <= 500)
    and (escolaridade is null or char_length(escolaridade) <= 60)
    and cardinality(areas_interesse) <= 12
  );
exception when duplicate_object then null; end $$;

create or replace function public.is_plataforma()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.usuarios where id = auth.uid() and papel = 'plataforma');
$$;

-- O papel só muda por um administrador da plataforma (ou pelo SQL Editor).
create or replace function public.proteger_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_plataforma() then
    if tg_op = 'INSERT' then
      new.papel := 'estudante';
    elsif new.papel is distinct from old.papel then
      raise exception 'Alteração de papel não permitida' using errcode = '42501';
    end if;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists proteger_usuario on public.usuarios;
create trigger proteger_usuario
before insert or update on public.usuarios
for each row execute function public.proteger_usuario();

-- =========================================================
-- 2. EQUIPES DE GESTÃO (UMA PESSOA PODE GERIR UMA REDE INTEIRA)
-- =========================================================
create table if not exists public.gestores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instituicao_id text not null references public.instituicoes(id) on delete cascade,
  papel text not null default 'editor' check (papel in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  unique (user_id, instituicao_id)
);
create index if not exists gestores_instituicao_idx on public.gestores (instituicao_id);

create or replace function public.is_gestor(inst text, somente_admin boolean default false)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_plataforma() or exists (
    select 1 from public.gestores g
    where g.user_id = auth.uid()
      and g.instituicao_id = inst
      and (not somente_admin or g.papel = 'admin')
  );
$$;

alter table public.gestores enable row level security;

drop policy if exists "Gestores veem a própria equipe" on public.gestores;
create policy "Gestores veem a própria equipe" on public.gestores
for select to authenticated
using (user_id = auth.uid() or public.is_gestor(instituicao_id));

drop policy if exists "Plataforma gerencia equipes" on public.gestores;
create policy "Plataforma gerencia equipes" on public.gestores
for all to authenticated
using (public.is_plataforma())
with check (public.is_plataforma());

grant select, insert, update, delete on public.gestores to authenticated;

-- =========================================================
-- 3. INSTITUIÇÕES: DADOS EDITÁVEIS PELA PRÓPRIA EQUIPE
-- =========================================================
alter table public.instituicoes
  add column if not exists descricao text,
  add column if not exists site text,
  add column if not exists email_contato text,
  add column if not exists telefone text,
  add column if not exists endereco text,
  add column if not exists inscricoes_abertas boolean not null default false,
  add column if not exists inscricoes_ate date,
  add column if not exists rede_ensino text,
  add column if not exists atualizado_em timestamptz;

do $$ begin
  alter table public.instituicoes add constraint instituicoes_campos_check check (
    (descricao is null or char_length(descricao) <= 1500)
    and (site is null or site ~* '^https://')
    and (email_contato is null or char_length(email_contato) <= 160)
    and (telefone is null or char_length(telefone) <= 20)
    and (endereco is null or char_length(endereco) <= 200)
    and (mensalidade_media is null or mensalidade_media >= 0)
  );
exception when duplicate_object then null; end $$;

-- Identidade e conceito MEC são oficiais: a instituição não pode alterá-los.
create or replace function public.proteger_instituicao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_plataforma()
     and (new.id, new.nome, new.rede, new.tipo, new.cidade, new.estado, new.nota_mec, new.rede_ensino)
       is distinct from (old.id, old.nome, old.rede, old.tipo, old.cidade, old.estado, old.nota_mec, old.rede_ensino) then
    raise exception 'Nome, localização, rede, tipo e conceito MEC são alterados apenas pela plataforma'
      using errcode = '42501';
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists proteger_instituicao on public.instituicoes;
create trigger proteger_instituicao
before update on public.instituicoes
for each row execute function public.proteger_instituicao();

drop policy if exists "Gestores atualizam a instituição" on public.instituicoes;
create policy "Gestores atualizam a instituição" on public.instituicoes
for update to authenticated
using (public.is_gestor(id))
with check (public.is_gestor(id));

drop policy if exists "Plataforma cadastra instituições" on public.instituicoes;
create policy "Plataforma cadastra instituições" on public.instituicoes
for insert to authenticated
with check (public.is_plataforma());

drop policy if exists "Plataforma remove instituições" on public.instituicoes;
create policy "Plataforma remove instituições" on public.instituicoes
for delete to authenticated
using (public.is_plataforma());

grant insert, update, delete on public.instituicoes to authenticated;

-- =========================================================
-- 4. CURSOS (OFERTAS) GERIDOS PELA INSTITUIÇÃO
-- =========================================================
alter table public.ofertas
  add column if not exists mensalidade numeric,
  add column if not exists vagas integer,
  add column if not exists duracao text,
  add column if not exists descricao text,
  add column if not exists ativo boolean not null default true,
  add column if not exists criado_em timestamptz not null default now(),
  add column if not exists atualizado_em timestamptz;

alter table public.ofertas alter column id set default gen_random_uuid()::text;

do $$ begin
  alter table public.ofertas add constraint ofertas_campos_check check (
    char_length(curso_nome) between 2 and 120
    and (mensalidade is null or mensalidade >= 0)
    and (vagas is null or vagas between 0 and 100000)
    and (duracao is null or char_length(duracao) <= 40)
    and (descricao is null or char_length(descricao) <= 1000)
  );
exception when duplicate_object then null; end $$;

create index if not exists ofertas_instituicao_idx on public.ofertas (instituicao_id);

-- Cursos desativados saem do catálogo público, mas continuam visíveis para a equipe.
drop policy if exists "Ofertas públicas para leitura" on public.ofertas;
create policy "Ofertas públicas para leitura" on public.ofertas
for select to public
using (ativo or public.is_gestor(instituicao_id));

drop policy if exists "Gestores gerenciam cursos" on public.ofertas;
create policy "Gestores gerenciam cursos" on public.ofertas
for all to authenticated
using (public.is_gestor(instituicao_id))
with check (public.is_gestor(instituicao_id));

grant insert, update, delete on public.ofertas to authenticated;

create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists tocar_ofertas on public.ofertas;
create trigger tocar_ofertas
before update on public.ofertas
for each row execute function public.tocar_atualizado_em();

-- =========================================================
-- 5. CANDIDATURAS: O ESTUDANTE COMPARTILHA SEUS DADOS COM UMA INSTITUIÇÃO
-- =========================================================
create table if not exists public.candidaturas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instituicao_id text not null references public.instituicoes(id) on delete cascade,
  oferta_id text references public.ofertas(id) on delete set null,
  curso_nome text check (curso_nome is null or char_length(curso_nome) <= 120),
  nome text not null check (char_length(nome) between 2 and 120),
  email text not null check (char_length(email) between 5 and 160),
  telefone text check (telefone is null or char_length(telefone) <= 20),
  mensagem text check (mensagem is null or char_length(mensagem) <= 1000),
  status text not null default 'enviada'
    check (status in ('enviada', 'em_analise', 'aprovada', 'lista_espera', 'recusada', 'matriculada', 'cancelada')),
  consentimento_em timestamptz not null default now(),
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists candidaturas_instituicao_idx on public.candidaturas (instituicao_id, status);
create index if not exists candidaturas_usuario_idx on public.candidaturas (user_id);
create unique index if not exists candidaturas_ativa_unica
  on public.candidaturas (user_id, instituicao_id, coalesce(oferta_id, ''))
  where status not in ('cancelada', 'recusada');

alter table public.candidaturas enable row level security;

drop policy if exists "Candidaturas visíveis às partes" on public.candidaturas;
create policy "Candidaturas visíveis às partes" on public.candidaturas
for select to authenticated
using (user_id = auth.uid() or public.is_gestor(instituicao_id));

drop policy if exists "Estudantes enviam candidaturas" on public.candidaturas;
create policy "Estudantes enviam candidaturas" on public.candidaturas
for insert to authenticated
with check (user_id = auth.uid() and status = 'enviada');

drop policy if exists "Partes atualizam o status" on public.candidaturas;
create policy "Partes atualizam o status" on public.candidaturas
for update to authenticated
using (user_id = auth.uid() or public.is_gestor(instituicao_id))
with check (user_id = auth.uid() or public.is_gestor(instituicao_id));

grant select, insert, update on public.candidaturas to authenticated;

-- Os dados enviados pelo estudante são imutáveis; só o status muda.
-- O estudante pode apenas cancelar; a instituição conduz as demais etapas.
create or replace function public.proteger_candidatura()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if (new.user_id, new.instituicao_id, new.curso_nome, new.nome, new.email, new.telefone,
      new.mensagem, new.consentimento_em, new.created_at)
     is distinct from
     (old.user_id, old.instituicao_id, old.curso_nome, old.nome, old.email, old.telefone,
      old.mensagem, old.consentimento_em, old.created_at)
     or (new.oferta_id is distinct from old.oferta_id and new.oferta_id is not null) then
    raise exception 'Somente o status da candidatura pode ser alterado' using errcode = '42501';
  end if;
  if new.status is distinct from old.status and not public.is_gestor(old.instituicao_id) and new.status <> 'cancelada' then
    raise exception 'Você pode apenas cancelar a sua candidatura' using errcode = '42501';
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists proteger_candidatura on public.candidaturas;
create trigger proteger_candidatura
before update on public.candidaturas
for each row execute function public.proteger_candidatura();

create or replace function public.pode_ver_candidatura(c uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.candidaturas
    where id = c and (user_id = auth.uid() or public.is_gestor(instituicao_id))
  );
$$;

-- =========================================================
-- 6. MENSAGENS ENTRE ESTUDANTE E INSTITUIÇÃO
-- =========================================================
create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  candidatura_id uuid not null references public.candidaturas(id) on delete cascade,
  autor_id uuid references auth.users(id) on delete set null,
  autor_tipo text not null check (autor_tipo in ('estudante', 'instituicao')),
  texto text not null check (char_length(texto) between 1 and 2000),
  lida_em timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists mensagens_candidatura_idx on public.mensagens (candidatura_id, created_at);

alter table public.mensagens enable row level security;

drop policy if exists "Mensagens visíveis às partes" on public.mensagens;
create policy "Mensagens visíveis às partes" on public.mensagens
for select to authenticated
using (public.pode_ver_candidatura(candidatura_id));

drop policy if exists "Partes enviam mensagens" on public.mensagens;
create policy "Partes enviam mensagens" on public.mensagens
for insert to authenticated
with check (
  autor_id = auth.uid() and lida_em is null and (
    (autor_tipo = 'estudante' and exists (
      select 1 from public.candidaturas c where c.id = candidatura_id and c.user_id = auth.uid()))
    or (autor_tipo = 'instituicao' and exists (
      select 1 from public.candidaturas c where c.id = candidatura_id and public.is_gestor(c.instituicao_id)))
  )
);

grant select, insert on public.mensagens to authenticated;

create or replace function public.marcar_mensagens_lidas(candidatura uuid, como text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.pode_ver_candidatura(candidatura) then
    raise exception 'Sem acesso a esta candidatura' using errcode = '42501';
  end if;
  update public.mensagens
  set lida_em = now()
  where candidatura_id = candidatura
    and lida_em is null
    and autor_tipo <> como;
end;
$$;

revoke all on function public.marcar_mensagens_lidas(uuid, text) from public, anon;
grant execute on function public.marcar_mensagens_lidas(uuid, text) to authenticated;

-- Mensagens novas chegam em tempo real para as duas partes (o Realtime respeita a RLS).
do $$ begin
  alter publication supabase_realtime add table public.mensagens;
exception when duplicate_object or undefined_object then null; end $$;

-- =========================================================
-- 7. COMUNICADOS PUBLICADOS PELA INSTITUIÇÃO
-- =========================================================
create table if not exists public.comunicados (
  id uuid primary key default gen_random_uuid(),
  instituicao_id text not null references public.instituicoes(id) on delete cascade,
  titulo text not null check (char_length(titulo) between 3 and 120),
  texto text not null check (char_length(texto) between 1 and 2000),
  publicado boolean not null default true,
  autor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  atualizado_em timestamptz
);
create index if not exists comunicados_instituicao_idx on public.comunicados (instituicao_id, created_at desc);

alter table public.comunicados enable row level security;

drop policy if exists "Comunicados publicados são públicos" on public.comunicados;
create policy "Comunicados publicados são públicos" on public.comunicados
for select to public
using (publicado or public.is_gestor(instituicao_id));

drop policy if exists "Gestores publicam comunicados" on public.comunicados;
create policy "Gestores publicam comunicados" on public.comunicados
for all to authenticated
using (public.is_gestor(instituicao_id))
with check (public.is_gestor(instituicao_id));

grant select on public.comunicados to anon, authenticated;
grant insert, update, delete on public.comunicados to authenticated;

drop trigger if exists tocar_comunicados on public.comunicados;
create trigger tocar_comunicados
before update on public.comunicados
for each row execute function public.tocar_atualizado_em();

-- =========================================================
-- 8. PEDIDOS DE ACESSO AO PAINEL
-- =========================================================
create table if not exists public.solicitacoes_gestor (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instituicao_id text references public.instituicoes(id) on delete set null,
  nome_instituicao text not null check (char_length(nome_instituicao) between 2 and 160),
  cargo text not null check (char_length(cargo) between 2 and 80),
  telefone text check (telefone is null or char_length(telefone) <= 20),
  mensagem text check (mensagem is null or char_length(mensagem) <= 1000),
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'recusada')),
  created_at timestamptz not null default now(),
  analisada_em timestamptz,
  analisada_por uuid references auth.users(id) on delete set null
);

alter table public.solicitacoes_gestor enable row level security;

drop policy if exists "Solicitante e plataforma veem pedidos" on public.solicitacoes_gestor;
create policy "Solicitante e plataforma veem pedidos" on public.solicitacoes_gestor
for select to authenticated
using (user_id = auth.uid() or public.is_plataforma());

drop policy if exists "Usuários pedem acesso" on public.solicitacoes_gestor;
create policy "Usuários pedem acesso" on public.solicitacoes_gestor
for insert to authenticated
with check (user_id = auth.uid() and status = 'pendente' and analisada_em is null);

drop policy if exists "Plataforma analisa pedidos" on public.solicitacoes_gestor;
create policy "Plataforma analisa pedidos" on public.solicitacoes_gestor
for update to authenticated
using (public.is_plataforma())
with check (public.is_plataforma());

grant select, insert, update on public.solicitacoes_gestor to authenticated;

create or replace function public.analisar_solicitacao_gestor(solicitacao uuid, aprovar boolean, inst text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pedido public.solicitacoes_gestor;
begin
  if not public.is_plataforma() then
    raise exception 'Apenas a plataforma analisa pedidos' using errcode = '42501';
  end if;
  select * into pedido from public.solicitacoes_gestor where id = solicitacao for update;
  if pedido.id is null then
    raise exception 'Pedido não encontrado';
  end if;
  if aprovar then
    if coalesce(inst, pedido.instituicao_id) is null then
      raise exception 'Escolha a instituição que será vinculada';
    end if;
    insert into public.gestores (user_id, instituicao_id, papel)
    values (pedido.user_id, coalesce(inst, pedido.instituicao_id), 'admin')
    on conflict (user_id, instituicao_id) do update set papel = 'admin';
  end if;
  update public.solicitacoes_gestor
  set status = case when aprovar then 'aprovada' else 'recusada' end,
      instituicao_id = coalesce(inst, instituicao_id),
      analisada_em = now(),
      analisada_por = auth.uid()
  where id = solicitacao;
end;
$$;

revoke all on function public.analisar_solicitacao_gestor(uuid, boolean, text) from public, anon;
grant execute on function public.analisar_solicitacao_gestor(uuid, boolean, text) to authenticated;

-- =========================================================
-- 9. FUNÇÕES DA EQUIPE (SOMENTE ADMINISTRADORES DA INSTITUIÇÃO)
-- =========================================================
create or replace function public.equipe_instituicao(inst text)
returns table (user_id uuid, nome text, email text, papel text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_gestor(inst) then
    raise exception 'Sem acesso a esta instituição' using errcode = '42501';
  end if;
  return query
    select g.user_id, u.nome_completo, u.email, g.papel, g.created_at
    from public.gestores g
    join public.usuarios u on u.id = g.user_id
    where g.instituicao_id = inst
    order by g.papel, u.nome_completo;
end;
$$;

create or replace function public.adicionar_gestor(inst text, email_usuario text, novo_papel text default 'editor')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  alvo uuid;
begin
  if not public.is_gestor(inst, true) then
    raise exception 'Apenas administradores da instituição gerenciam a equipe' using errcode = '42501';
  end if;
  if novo_papel not in ('admin', 'editor') then
    raise exception 'Papel inválido';
  end if;
  select id into alvo from public.usuarios where lower(email) = lower(trim(email_usuario));
  if alvo is null then
    raise exception 'Nenhuma conta encontrada com este e-mail. A pessoa precisa se cadastrar no Matriculou primeiro.';
  end if;
  insert into public.gestores (user_id, instituicao_id, papel)
  values (alvo, inst, novo_papel)
  on conflict (user_id, instituicao_id) do update set papel = excluded.papel;
end;
$$;

create or replace function public.remover_gestor(inst text, alvo uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_gestor(inst, true) then
    raise exception 'Apenas administradores da instituição gerenciam a equipe' using errcode = '42501';
  end if;
  if (select papel from public.gestores where instituicao_id = inst and user_id = alvo) = 'admin'
     and (select count(*) from public.gestores where instituicao_id = inst and papel = 'admin') = 1 then
    raise exception 'A instituição precisa ter pelo menos um administrador';
  end if;
  delete from public.gestores where instituicao_id = inst and user_id = alvo;
end;
$$;

-- Indicadores agregados: a instituição vê quantas pessoas favoritaram, nunca quem.
create or replace function public.metricas_instituicao(inst text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_gestor(inst) then
    raise exception 'Sem acesso a esta instituição' using errcode = '42501';
  end if;
  return json_build_object(
    'favoritos', (select count(*) from public.favoritos where instituicao_id = inst),
    'cursos_ativos', (select count(*) from public.ofertas where instituicao_id = inst and ativo),
    'mensagens_nao_lidas', (
      select count(*) from public.mensagens m
      join public.candidaturas c on c.id = m.candidatura_id
      where c.instituicao_id = inst and m.autor_tipo = 'estudante' and m.lida_em is null
    ),
    'candidaturas', coalesce((
      select json_object_agg(status, total)
      from (select status, count(*) total from public.candidaturas where instituicao_id = inst group by status) s
    ), '{}'::json)
  );
end;
$$;

revoke all on function public.equipe_instituicao(text) from public, anon;
revoke all on function public.adicionar_gestor(text, text, text) from public, anon;
revoke all on function public.remover_gestor(text, uuid) from public, anon;
revoke all on function public.metricas_instituicao(text) from public, anon;
grant execute on function public.equipe_instituicao(text) to authenticated;
grant execute on function public.adicionar_gestor(text, text, text) to authenticated;
grant execute on function public.remover_gestor(text, uuid) to authenticated;
grant execute on function public.metricas_instituicao(text) to authenticated;

-- =========================================================
-- 10. SUPORTE
-- =========================================================
create table if not exists public.tickets_suporte (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome text not null check (char_length(nome) between 2 and 120),
  email text not null check (char_length(email) between 5 and 160),
  categoria text not null check (categoria in ('duvida', 'conta', 'dados', 'instituicao', 'sugestao', 'problema')),
  assunto text not null check (char_length(assunto) between 3 and 120),
  mensagem text not null check (char_length(mensagem) between 10 and 2000),
  status text not null default 'aberto' check (status in ('aberto', 'em_andamento', 'resolvido')),
  resposta text check (resposta is null or char_length(resposta) <= 2000),
  created_at timestamptz not null default now(),
  atualizado_em timestamptz
);

alter table public.tickets_suporte enable row level security;

drop policy if exists "Qualquer pessoa abre chamados" on public.tickets_suporte;
create policy "Qualquer pessoa abre chamados" on public.tickets_suporte
for insert to anon, authenticated
with check (status = 'aberto' and resposta is null and (user_id is null or user_id = auth.uid()));

drop policy if exists "Autor e plataforma veem chamados" on public.tickets_suporte;
create policy "Autor e plataforma veem chamados" on public.tickets_suporte
for select to authenticated
using (user_id = auth.uid() or public.is_plataforma());

drop policy if exists "Plataforma responde chamados" on public.tickets_suporte;
create policy "Plataforma responde chamados" on public.tickets_suporte
for update to authenticated
using (public.is_plataforma())
with check (public.is_plataforma());

grant insert on public.tickets_suporte to anon, authenticated;
grant select, update on public.tickets_suporte to authenticated;

drop trigger if exists tocar_tickets on public.tickets_suporte;
create trigger tocar_tickets
before update on public.tickets_suporte
for each row execute function public.tocar_atualizado_em();

-- =========================================================
-- 11. AUDITORIA DAS AÇÕES DA EQUIPE
-- =========================================================
create table if not exists public.auditoria (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  instituicao_id text,
  tabela text not null,
  acao text not null,
  registro text,
  detalhes jsonb,
  created_at timestamptz not null default now()
);
create index if not exists auditoria_instituicao_idx on public.auditoria (instituicao_id, created_at desc);

alter table public.auditoria enable row level security;

drop policy if exists "Gestores consultam a auditoria" on public.auditoria;
create policy "Gestores consultam a auditoria" on public.auditoria
for select to authenticated
using (public.is_gestor(instituicao_id));

grant select on public.auditoria to authenticated;

-- Em atualizações, guarda só os campos que mudaram; inclusões e exclusões ficam sem detalhes,
-- para que dados pessoais de candidaturas não sejam copiados para o registro.
create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  atual jsonb := to_jsonb(coalesce(new, old));
begin
  -- Sem usuário (SQL Editor) ou durante a exclusão da própria conta, não há autor a registrar.
  if auth.uid() is null or not exists (select 1 from auth.users where id = auth.uid()) then
    return coalesce(new, old);
  end if;
  insert into public.auditoria (user_id, instituicao_id, tabela, acao, registro, detalhes)
  values (
    auth.uid(),
    case when tg_table_name = 'instituicoes' then atual ->> 'id' else atual ->> 'instituicao_id' end,
    tg_table_name,
    lower(tg_op),
    atual ->> 'id',
    case when tg_op = 'UPDATE' then (
      select jsonb_object_agg(key, value)
      from jsonb_each(to_jsonb(new))
      where to_jsonb(old) -> key is distinct from value and key <> 'atualizado_em'
    ) end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists auditar_instituicoes on public.instituicoes;
create trigger auditar_instituicoes after update on public.instituicoes
for each row execute function public.registrar_auditoria();

drop trigger if exists auditar_ofertas on public.ofertas;
create trigger auditar_ofertas after insert or update or delete on public.ofertas
for each row execute function public.registrar_auditoria();

drop trigger if exists auditar_candidaturas on public.candidaturas;
create trigger auditar_candidaturas after update on public.candidaturas
for each row execute function public.registrar_auditoria();

drop trigger if exists auditar_comunicados on public.comunicados;
create trigger auditar_comunicados after insert or update or delete on public.comunicados
for each row execute function public.registrar_auditoria();

drop trigger if exists auditar_gestores on public.gestores;
create trigger auditar_gestores after insert or update or delete on public.gestores
for each row execute function public.registrar_auditoria();

-- =========================================================
-- 12. FOTOS DAS INSTITUIÇÕES (PASTA = ID DA INSTITUIÇÃO)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('instituicoes', 'instituicoes', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']::text[])
on conflict (id) do update
set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']::text[];

drop policy if exists "Fotos de instituições: leitura pública" on storage.objects;
create policy "Fotos de instituições: leitura pública" on storage.objects
for select to public using (bucket_id = 'instituicoes');

drop policy if exists "Fotos de instituições: envio da equipe" on storage.objects;
create policy "Fotos de instituições: envio da equipe" on storage.objects
for insert to authenticated
with check (bucket_id = 'instituicoes' and public.is_gestor((storage.foldername(name))[1]));

drop policy if exists "Fotos de instituições: remoção da equipe" on storage.objects;
create policy "Fotos de instituições: remoção da equipe" on storage.objects
for delete to authenticated
using (bucket_id = 'instituicoes' and public.is_gestor((storage.foldername(name))[1]));

notify pgrst, 'reload schema';
