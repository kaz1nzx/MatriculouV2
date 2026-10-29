-- CORREÇÃO DE DADOS DO CATÁLOGO — Matriculou
-- Execute no SQL Editor depois de instituicoes-fotos-e-ampliacao.sql. É idempotente.
--
-- O conceito do MEC (CI/IGC) é atribuído apenas a instituições de ensino superior
-- credenciadas no sistema federal. Os registros abaixo exibiam uma nota que não existe:
-- nota_mec = 0 aparece no site como "Não informado" (ou "Não se aplica" para escolas).

-- Escolas de educação básica: o MEC não atribui conceito a colégios.
update public.instituicoes set nota_mec = 0 where tipo = 'escola';

-- Redes de escolas técnicas (não são uma única instituição de ensino superior).
update public.instituicoes set nota_mec = 0 where id in ('sp-04', 'pr-05');

-- A USP pertence ao sistema estadual de ensino de SP e não tem IGC no e-MEC
-- (Unicamp e Unesp, na mesma situação, já estavam como "não informado").
update public.instituicoes set nota_mec = 0 where id = 'sp-01';

-- Centro universitário que estava classificado como "faculdade".
update public.instituicoes set tipo = 'centro universitário' where id = 'sp-21';

-- O mesmo curso escrito de duas formas aparecia duplicado na lista de cursos.
update public.ofertas set curso_nome = 'Engenharia de Computação' where curso_nome = 'Engenharia da Computação';

-- "Engenharia" não é um curso: UFRJ e UFPR estavam com o nome genérico.
-- As duas oferecem Engenharia Civil, que é o curso desta oferta.
update public.ofertas set curso_nome = 'Engenharia Civil' where curso_nome = 'Engenharia' and instituicao_id in ('pr-01', 'rj-01');

-- Os scripts seed_47_instituicoes.sql e instituicoes-fotos-e-ampliacao.sql já trazem
-- estes valores corrigidos, então executá-los de novo não desfaz esta correção.

-- PUC Minas: o conceito divulgado pelo MEC é 4, não 5.
-- Fonte: https://em.com.br/educacao/2024/04/6832588-puc-minas-mantem-conceito-4-em-indicador-de-qualidade-divulgado-pelo-mec.html
update public.instituicoes set nota_mec = 4 where id = 'mg-02';
