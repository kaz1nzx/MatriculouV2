# Matriculou + Supabase

## Ordem dos scripts

Execute no SQL Editor do Supabase, nesta ordem (todos podem ser executados de novo sem efeito colateral):

1. `supabase/setup.sql` — tabelas base, RLS e buckets `avatars` e `pre-matriculas`.
2. `supabase/seed_47_instituicoes.sql` — instituições e ofertas iniciais.
3. `supabase/lgpd-conformidade.sql` — documentos privados, exclusão de conta e solicitações LGPD.
4. `supabase/instituicoes-fotos-e-ampliacao.sql` — fotos com licença livre e novas instituições.
5. `supabase/correcao-dados-catalogo.sql` — correções de conceito MEC e nomes de curso.
6. `supabase/painel-instituicoes.sql` — painel das instituições: equipes, candidaturas, mensagens em tempo real, comunicados, suporte, auditoria, campos novos do perfil e bucket `instituicoes`.
7. `supabase/ampliacao-cursos.sql` — amplia os cursos oferecidos por cada instituição.

Sem os passos 6 e 7, o site continua funcionando, mas o painel, as candidaturas e o suporte mostram um aviso pedindo a execução do script.

## Primeiro administrador da plataforma

O administrador da plataforma aprova os pedidos de acesso das instituições, responde aos chamados de suporte e cadastra instituições. Depois de criar a conta pelo site:

```sql
update public.usuarios set papel = 'plataforma' where email = 'voce@exemplo.com';
```

## Como uma instituição ganha acesso

1. Alguém da instituição cria uma conta e abre `/admin`.
2. Envia o pedido de acesso (instituição, cargo e mensagem).
3. Um administrador da plataforma aprova em **Painel › Pedidos de acesso**; a pessoa vira administradora daquela instituição.
4. Ela adiciona a própria equipe em **Equipe**, como administrador ou editor. Redes de ensino recebem acesso a cada unidade e alternam entre elas no topo do menu do painel.

## Segurança

Toda autorização está no banco, por RLS e gatilhos; o site só reflete o que o banco permite:

- cada pessoa lê e altera apenas os próprios dados;
- a instituição vê só as candidaturas enviadas a ela e não consegue alterar os dados enviados pelo estudante, apenas o status;
- nome, localização, rede, tipo e conceito MEC só mudam pela plataforma;
- ninguém altera o próprio papel;
- favoritos aparecem para a instituição apenas como contagem;
- as alterações das equipes ficam registradas em `auditoria`.

## Login

A sessão fica salva no navegador (`matriculou-sessao`) até a pessoa sair. Os links de confirmação de e-mail e de redefinição de senha voltam para `/login` e `/redefinir-senha`; cadastre essas URLs em **Authentication › URL Configuration** do Supabase.
