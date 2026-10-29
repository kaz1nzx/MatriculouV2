# Correção do Supabase — Matriculou

Os erros:

- `O bucket de fotos não existe`
- `Could not find the table 'public.favoritos' in the schema cache`

acontecem quando o banco/projeto do Supabase ainda não recebeu a estrutura usada pelo site.

## Faça apenas isto

1. Abra o projeto correto no Supabase.
2. Entre em **SQL Editor**.
3. Abra o arquivo `supabase/setup.sql` deste projeto.
4. Cole o conteúdo no SQL Editor e clique em **Run**.
5. Aguarde a execução terminar sem erro.
6. Recarregue o site.

Também existe o arquivo `supabase/fix-favoritos-storage.sql`, que contém somente a correção da tabela `favoritos` e dos buckets `avatars` e `pre-matriculas` caso você já tenha executado o setup antigo.

## Importante

O ZIP não consegue criar tabelas/buckets no seu projeto Supabase sozinho, porque isso exigiria acesso administrativo ao seu banco. O SQL precisa ser executado uma vez no projeto correto.

O `setup.sql` foi deixado **idempotente**: você pode executá-lo novamente sem precisar apagar suas instituições ou usuários.

Depois de executar, confirme em:

- **Table Editor:** existe `public.favoritos`
- **Storage:** existem `avatars` e `pre-matriculas`

Não apague a tabela `instituicoes` nem `ofertas` para corrigir esse erro.
