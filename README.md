# Matriculou

Plataforma para estudantes pesquisarem, compararem e se candidatarem a instituições de ensino, e para instituições e redes de ensino gerenciarem sua presença no catálogo.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Sem as variáveis do Supabase em `.env.local`, o catálogo usa instituições fictícias de demonstração e o login fica indisponível. A configuração do banco está em [README-SUPABASE.md](README-SUPABASE.md).

## Scripts

| Comando                | O que faz                                    |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                  |
| `npm run build`        | Build de produção                            |
| `npm run typecheck`    | Verificação de tipos                         |
| `npm run format`       | Formata todo o projeto com o Prettier        |
| `npm run format:check` | Confere a formatação sem alterar arquivos    |
| `npm run test:e2e`     | Testes de ponta a ponta (Playwright, Chrome) |

O VS Code formata ao salvar com a extensão Prettier (recomendada em `.vscode/extensions.json`).

## Estrutura

```
app/                  rotas (cada página carrega só o próprio código)
app/styles/           sistema visual noite/coral: tokens, componentes, páginas e painel
components/app/       provider global (sessão, catálogo, favoritos, comparador), navegação e busca
components/ui/        botões, campos, diálogos acessíveis, selos e estados
components/institutions, courses, compare, account, auth, admin, pages
components/cinema/    seções animadas da página inicial
lib/                  dados e regras: catálogo, cursos, comparação inteligente, formatação
supabase/             scripts SQL
tests/                testes Playwright
```

## Funcionalidades

- **Catálogo de instituições** com filtros por rede, tipo, estado, curso, modalidade, mensalidade, bolsas e inscrições abertas. Os filtros ficam na URL, então a busca pode ser compartilhada.
- **Cursos**: cerca de 80 cursos com descrição própria, carga horária mínima oficial, registro profissional, disciplinas, carreiras e a lista de instituições que oferecem cada um.
- **Comparação inteligente** de instituições e de cursos: aponta o melhor valor de cada critério, gera pontos fortes e de atenção e recomenda a opção mais equilibrada conforme as prioridades escolhidas.
- **Busca global** (Ctrl+K) por instituições, cursos e páginas.
- **Perfil** com visão geral, candidaturas e mensagens, favoritas, documentos, edição de dados, segurança, preferências e privacidade (LGPD).
- **Painel das instituições** (`/admin`): indicadores, candidaturas com status e conversa, alunos e contatos com exportação CSV, cursos, dados públicos, comunicados, equipe e registro de atividade. Administradores da plataforma aprovam acessos, respondem chamados e cadastram instituições.
- **Central de ajuda** com perguntas frequentes, chamados de suporte e a assistente Mia.

## Dados

Mensalidades, bolsas e conceitos são referências. As instituições podem atualizar seus dados pelo painel; os conceitos MEC só mudam pela plataforma. Confirme sempre no [e-MEC](https://emec.mec.gov.br).
