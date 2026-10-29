-- AMPLIAÇÃO DOS CURSOS POR INSTITUIÇÃO — Matriculou
-- Execute no SQL Editor depois de painel-instituicoes.sql. É idempotente.
--
-- Acrescenta cursos de graduação, técnicos e de educação básica oferecidos pelas
-- instituições do catálogo, a partir dos cursos que elas divulgam. Universidades com
-- vários campi aparecem com os cursos da instituição como um todo. Cada instituição
-- pode corrigir, desativar ou detalhar (vagas, turno, mensalidade) pelo painel.
-- Nada é sobrescrito: cursos que já existem para a instituição são mantidos.

with base(curso) as (
  select unnest(array[
    'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História',
    'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física',
    'Ciência da Computação', 'Engenharia Civil', 'Filosofia', 'Ciências Sociais'
  ])
),
saude(curso) as (
  select unnest(array['Medicina', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Psicologia'])
),
federais_completas(inst) as (
  select unnest(array[
    'mg-01', 'rj-01', 'rs-01', 'pr-01', 'sc-01', 'ba-01', 'pe-01', 'df-01', 'go-01', 'pa-01', 'rn-01',
    'pb-01', 'es-01', 'am-01', 'se-01', 'mg-07', 'mg-08', 'rs-03', 'rj-07'
  ])
),
listas(inst, curso, nivel, modalidade) as (
  -- Universidades federais com oferta ampla em todas as áreas.
  select f.inst, c.curso, 'graduacao', 'presencial'
  from federais_completas f
  cross join (
    select curso from base
    union all select curso from saude
    union all select unnest(array['Direito', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Arquitetura e Urbanismo', 'Jornalismo'])
  ) c

  union all
  select inst, unnest(cursos), 'graduacao', 'presencial'
  from (values
    ('ce-01', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Arquitetura e Urbanismo', 'Jornalismo', 'Filosofia', 'Ciências Sociais']),
    ('al-01', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Arquitetura e Urbanismo', 'Jornalismo', 'Filosofia', 'Ciências Sociais']),
    ('ma-01', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Engenharia Elétrica', 'Jornalismo', 'Filosofia', 'Ciências Sociais']),
    ('pi-01', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Engenharia Elétrica', 'Arquitetura e Urbanismo', 'Jornalismo', 'Filosofia', 'Ciências Sociais']),
    ('mt-01', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Nutrição', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Engenharia Elétrica', 'Arquitetura e Urbanismo', 'Jornalismo', 'Filosofia', 'Ciências Sociais', 'Agronomia', 'Medicina Veterinária', 'Zootecnia']),
    ('rs-05', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Arquitetura e Urbanismo', 'Jornalismo', 'Filosofia', 'Ciências Sociais', 'Agronomia', 'Medicina Veterinária', 'Zootecnia']),
    ('ms-01', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Engenharia Elétrica', 'Arquitetura e Urbanismo', 'Jornalismo', 'Filosofia', 'Ciências Sociais', 'Medicina Veterinária', 'Zootecnia']),
    ('rj-06', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Nutrição', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Ciência da Computação', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Arquitetura e Urbanismo', 'Jornalismo', 'Filosofia', 'Ciências Sociais', 'Relações Internacionais', 'Serviço Social']),

    -- Universidades estaduais e federais especializadas.
    ('sp-01', array['Medicina', 'Direito', 'Psicologia', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Engenharia de Produção', 'Engenharia Ambiental', 'Engenharia de Computação', 'Administração', 'Ciências Econômicas', 'Ciências Contábeis', 'Relações Internacionais', 'Jornalismo', 'Publicidade e Propaganda', 'Letras', 'História', 'Geografia', 'Filosofia', 'Ciências Sociais', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Farmácia', 'Odontologia', 'Enfermagem', 'Nutrição', 'Fisioterapia', 'Fonoaudiologia', 'Terapia Ocupacional', 'Educação Física', 'Pedagogia', 'Medicina Veterinária', 'Zootecnia', 'Agronomia', 'Ciência da Computação', 'Sistemas de Informação', 'Estatística', 'Design', 'Cinema e Audiovisual', 'Turismo']),
    ('sp-06', array['Medicina', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Fonoaudiologia', 'Educação Física', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Engenharia de Computação', 'Engenharia de Produção', 'Ciência da Computação', 'Arquitetura e Urbanismo', 'Ciências Econômicas', 'Administração', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Estatística', 'Letras', 'História', 'Geografia', 'Filosofia', 'Ciências Sociais', 'Pedagogia']),
    ('sp-07', array['Medicina', 'Direito', 'Medicina Veterinária', 'Odontologia', 'Farmácia', 'Enfermagem', 'Nutrição', 'Fisioterapia', 'Psicologia', 'Arquitetura e Urbanismo', 'Jornalismo', 'Design', 'Relações Internacionais', 'Ciências Econômicas', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Engenharia Ambiental', 'Agronomia', 'Zootecnia', 'Ciência da Computação', 'Ciências Biológicas', 'Física', 'Química', 'Matemática', 'Geografia', 'História', 'Letras', 'Pedagogia', 'Educação Física', 'Filosofia', 'Ciências Sociais']),
    ('sp-08', array['Medicina', 'Enfermagem', 'Biomedicina', 'Fonoaudiologia', 'Farmácia', 'Fisioterapia', 'Nutrição', 'Psicologia', 'Terapia Ocupacional', 'Educação Física', 'Ciências Biológicas', 'Química', 'Administração', 'Ciências Econômicas', 'Ciências Contábeis', 'Relações Internacionais', 'Ciência da Computação', 'História', 'Letras', 'Pedagogia', 'Filosofia', 'Ciências Sociais']),
    ('sp-09', array['Ciência da Computação', 'Engenharia Aeroespacial', 'Física', 'Química', 'Matemática', 'Ciências Biológicas', 'Filosofia', 'Ciências Econômicas', 'Relações Internacionais']),
    ('sp-10', array['Medicina', 'Enfermagem', 'Fisioterapia', 'Terapia Ocupacional', 'Psicologia', 'Educação Física', 'Engenharia Civil', 'Engenharia Mecânica', 'Engenharia Elétrica', 'Engenharia Química', 'Engenharia de Produção', 'Engenharia de Computação', 'Ciência da Computação', 'Arquitetura e Urbanismo', 'Estatística', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Letras', 'Pedagogia', 'Filosofia', 'Ciências Sociais', 'Agronomia']),
    ('sp-22', array['Engenharia de Produção', 'Engenharia Florestal', 'Ciência da Computação', 'Administração', 'Ciências Econômicas', 'Ciências Biológicas', 'Física', 'Química', 'Matemática', 'Geografia', 'Pedagogia', 'Turismo']),
    ('sp-11', array['Engenharia Aeronáutica', 'Engenharia Aeroespacial', 'Engenharia Eletrônica', 'Engenharia de Computação']),
    ('rj-10', array['Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Engenharia Eletrônica', 'Engenharia de Computação']),
    ('pr-06', array['Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Eletrônica', 'Engenharia de Computação', 'Engenharia de Produção', 'Engenharia Química', 'Engenharia Ambiental', 'Engenharia de Controle e Automação', 'Análise e Desenvolvimento de Sistemas', 'Sistemas de Informação', 'Arquitetura e Urbanismo', 'Design', 'Administração', 'Química', 'Matemática', 'Física']),
    ('mg-03', array['Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Computação', 'Engenharia de Produção', 'Engenharia Civil', 'Engenharia Química', 'Administração', 'Letras']),
    ('rj-09', array['Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Civil', 'Engenharia de Controle e Automação', 'Administração', 'Ciência da Computação']),
    ('mg-06', array['Medicina', 'Direito', 'Enfermagem', 'Nutrição', 'Medicina Veterinária', 'Agronomia', 'Zootecnia', 'Engenharia Florestal', 'Engenharia Ambiental', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Arquitetura e Urbanismo', 'Jornalismo', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Ciência da Computação', 'Ciências Biológicas', 'Educação Física', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química']),
    ('mg-10', array['Medicina', 'Direito', 'Agronomia', 'Medicina Veterinária', 'Zootecnia', 'Engenharia Florestal', 'Engenharia Ambiental', 'Engenharia Civil', 'Engenharia Mecânica', 'Ciência da Computação', 'Sistemas de Informação', 'Administração', 'Ciências Biológicas', 'Educação Física', 'Nutrição', 'Química', 'Física', 'Matemática', 'Letras', 'Pedagogia', 'Filosofia']),
    ('mg-09', array['Medicina', 'Direito', 'Farmácia', 'Nutrição', 'Jornalismo', 'Engenharia Civil', 'Engenharia Mecânica', 'Engenharia de Produção', 'Ciência da Computação', 'Sistemas de Informação', 'Arquitetura e Urbanismo', 'Ciências Biológicas', 'Química', 'Física', 'Matemática', 'História', 'Letras', 'Pedagogia', 'Ciências Econômicas', 'Administração', 'Educação Física', 'Filosofia']),
    ('rj-08', array['Medicina Veterinária', 'Agronomia', 'Zootecnia', 'Engenharia Florestal', 'Engenharia Química', 'Direito', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Psicologia', 'Arquitetura e Urbanismo', 'Ciência da Computação', 'Sistemas de Informação', 'Jornalismo', 'História', 'Geografia', 'Letras', 'Pedagogia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Filosofia']),
    ('pe-02', array['Medicina Veterinária', 'Agronomia', 'Zootecnia', 'Engenharia Florestal', 'Ciências Biológicas', 'Administração', 'Ciências Econômicas', 'Sistemas de Informação', 'Ciência da Computação', 'Matemática', 'Física', 'Química', 'História', 'Letras', 'Pedagogia', 'Ciências Sociais']),
    ('pb-02', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Medicina Veterinária', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Ciência da Computação', 'Arquitetura e Urbanismo', 'Administração', 'Ciências Econômicas', 'Matemática', 'Física', 'Letras', 'História', 'Geografia', 'Pedagogia', 'Filosofia', 'Ciências Sociais']),
    ('to-01', array['Medicina', 'Direito', 'Jornalismo', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Ambiental', 'Enfermagem', 'Nutrição', 'Medicina Veterinária', 'Zootecnia', 'Agronomia', 'Ciência da Computação', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Filosofia']),
    ('rr-01', array['Medicina', 'Direito', 'Administração', 'Ciência da Computação', 'Engenharia Civil', 'Agronomia', 'Pedagogia', 'Letras', 'História', 'Matemática']),
    ('ro-01', array['Medicina', 'Direito', 'Administração', 'Ciências Contábeis', 'Enfermagem', 'Psicologia', 'Engenharia Civil', 'Engenharia Elétrica', 'Ciência da Computação', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Ciências Biológicas', 'Educação Física']),
    ('am-02', array['Medicina', 'Direito', 'Enfermagem', 'Odontologia', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia de Computação', 'Sistemas de Informação', 'Administração', 'Pedagogia', 'Letras', 'Matemática']),
    ('ba-06', array['Medicina', 'Direito', 'Enfermagem', 'Nutrição', 'Fisioterapia', 'Farmácia', 'Psicologia', 'Administração', 'Ciências Contábeis', 'Jornalismo', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Ciências Biológicas', 'Química', 'Educação Física', 'Sistemas de Informação']),
    ('ba-07', array['Medicina', 'Direito', 'Enfermagem', 'Odontologia', 'Farmácia', 'Psicologia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Engenharia Civil', 'Engenharia de Computação', 'Agronomia', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Filosofia']),
    ('ce-02', array['Medicina', 'Enfermagem', 'Nutrição', 'Medicina Veterinária', 'Psicologia', 'Administração', 'Ciências Contábeis', 'Ciência da Computação', 'Serviço Social', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Filosofia', 'Ciências Sociais']),
    ('ma-02', array['Medicina', 'Medicina Veterinária', 'Agronomia', 'Zootecnia', 'Enfermagem', 'Engenharia Civil', 'Engenharia Mecânica', 'Engenharia de Computação', 'Arquitetura e Urbanismo', 'Administração', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Ciências Sociais']),
    ('ms-02', array['Medicina', 'Direito', 'Enfermagem', 'Ciência da Computação', 'Agronomia', 'Zootecnia', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física']),
    ('pa-02', array['Medicina', 'Enfermagem', 'Fisioterapia', 'Terapia Ocupacional', 'Educação Física', 'Engenharia Ambiental', 'Engenharia de Produção', 'Design', 'Pedagogia', 'Letras', 'Matemática', 'Ciências Biológicas']),
    ('pi-02', array['Medicina', 'Direito', 'Enfermagem', 'Odontologia', 'Fisioterapia', 'Psicologia', 'Administração', 'Ciências Contábeis', 'Ciência da Computação', 'Engenharia Civil', 'Agronomia', 'Jornalismo', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física']),
    ('to-02', array['Direito', 'Administração', 'Ciências Contábeis', 'Sistemas de Informação', 'Agronomia', 'Pedagogia', 'Letras']),
    ('pr-07', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Nutrição', 'Fisioterapia', 'Medicina Veterinária', 'Agronomia', 'Zootecnia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Ciência da Computação', 'Jornalismo', 'Design', 'Serviço Social', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Filosofia', 'Ciências Sociais']),
    ('pr-08', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Odontologia', 'Medicina Veterinária', 'Agronomia', 'Zootecnia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Engenharia de Produção', 'Ciência da Computação', 'Design', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Educação Física', 'Filosofia', 'Ciências Sociais']),
    ('sc-02', array['Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Ciência da Computação', 'Administração', 'Ciências Econômicas', 'Agronomia', 'Medicina Veterinária', 'Engenharia Florestal', 'Fisioterapia', 'Enfermagem', 'Educação Física', 'Pedagogia', 'Design', 'Moda', 'Arquitetura e Urbanismo', 'Geografia', 'História']),
    ('sp-23', array['Engenharia Ambiental', 'Engenharia de Controle e Automação']),

    -- Instituições privadas.
    ('sp-02', array['Direito', 'Psicologia', 'Administração', 'Ciências Econômicas', 'Ciências Contábeis', 'Relações Internacionais', 'Jornalismo', 'Publicidade e Propaganda', 'Letras', 'História', 'Filosofia', 'Ciências Sociais', 'Pedagogia', 'Serviço Social', 'Fonoaudiologia', 'Ciência da Computação']),
    ('sp-24', array['Medicina', 'Enfermagem']),
    ('sp-03', array['Direito', 'Administração', 'Ciências Econômicas', 'Ciências Contábeis', 'Arquitetura e Urbanismo', 'Design', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Ciência da Computação', 'Sistemas de Informação', 'Psicologia', 'Jornalismo', 'Publicidade e Propaganda', 'Relações Internacionais', 'Letras', 'Pedagogia', 'Matemática', 'Ciências Biológicas', 'Farmácia', 'Nutrição', 'Educação Física']),
    ('sp-12', array['Administração', 'Direito', 'Ciências Econômicas']),
    ('sp-13', array['Administração', 'Ciências Econômicas', 'Direito', 'Engenharia de Computação', 'Engenharia Mecânica', 'Ciência da Computação']),
    ('sp-16', array['Administração', 'Direito', 'Ciências Econômicas', 'Relações Internacionais', 'Arquitetura e Urbanismo', 'Design', 'Publicidade e Propaganda', 'Jornalismo', 'Cinema e Audiovisual', 'Moda']),
    ('sp-18', array['Medicina', 'Direito', 'Administração', 'Arquitetura e Urbanismo', 'Design', 'Moda', 'Cinema e Audiovisual', 'Gastronomia', 'Jornalismo', 'Publicidade e Propaganda', 'Turismo', 'Psicologia', 'Enfermagem', 'Nutrição', 'Fisioterapia', 'Engenharia Civil']),
    ('sp-19', array['Análise e Desenvolvimento de Sistemas', 'Sistemas de Informação', 'Engenharia de Software', 'Ciência da Computação']),
    ('sp-20', array['Direito', 'Psicologia', 'Enfermagem', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Biomedicina', 'Administração', 'Ciências Contábeis', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Pedagogia', 'Educação Física', 'Relações Internacionais']),
    ('sp-21', array['Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Engenharia de Computação', 'Engenharia de Software', 'Ciência da Computação', 'Arquitetura e Urbanismo']),
    ('rj-02', array['Direito', 'Psicologia', 'Administração', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Design', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Engenharia de Computação', 'Ciência da Computação', 'Sistemas de Informação', 'Jornalismo', 'Publicidade e Propaganda', 'Cinema e Audiovisual', 'Relações Internacionais', 'Letras', 'História', 'Geografia', 'Filosofia', 'Ciências Sociais', 'Pedagogia', 'Matemática', 'Física', 'Química', 'Ciências Biológicas', 'Serviço Social']),
    ('rj-03', array['Direito', 'Medicina', 'Psicologia', 'Enfermagem', 'Odontologia', 'Fisioterapia', 'Nutrição', 'Farmácia', 'Biomedicina', 'Educação Física', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Arquitetura e Urbanismo', 'Ciências Contábeis', 'Ciência da Computação', 'Sistemas de Informação', 'Jornalismo', 'Publicidade e Propaganda', 'Gastronomia']),
    ('mg-02', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Fisioterapia', 'Nutrição', 'Medicina Veterinária', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Engenharia de Computação', 'Engenharia de Software', 'Ciência da Computação', 'Sistemas de Informação', 'Jornalismo', 'Publicidade e Propaganda', 'Relações Internacionais', 'Pedagogia', 'Letras', 'História', 'Geografia', 'Ciências Biológicas', 'Educação Física', 'Filosofia', 'Serviço Social']),
    ('pr-02', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Medicina Veterinária', 'Agronomia', 'Biomedicina', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Engenharia de Computação', 'Engenharia de Software', 'Ciência da Computação', 'Sistemas de Informação', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Gastronomia', 'Relações Internacionais', 'Pedagogia', 'Letras', 'História', 'Educação Física', 'Ciências Biológicas', 'Filosofia']),
    ('pr-03', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Medicina Veterinária', 'Biomedicina', 'Administração', 'Ciências Contábeis', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Ciência da Computação', 'Sistemas de Informação', 'Análise e Desenvolvimento de Sistemas', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Gastronomia', 'Relações Internacionais', 'Pedagogia', 'Educação Física']),
    ('rs-02', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Biomedicina', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Engenharia de Computação', 'Engenharia de Software', 'Ciência da Computação', 'Sistemas de Informação', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Cinema e Audiovisual', 'Gastronomia', 'Relações Internacionais', 'Pedagogia', 'Letras', 'História', 'Educação Física', 'Filosofia', 'Ciências Biológicas', 'Física', 'Química', 'Matemática', 'Serviço Social']),
    ('rs-04', array['Direito', 'Psicologia', 'Enfermagem', 'Nutrição', 'Fisioterapia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Ciência da Computação', 'Sistemas de Informação', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Moda', 'Cinema e Audiovisual', 'Gastronomia', 'Relações Internacionais', 'Pedagogia', 'Letras', 'História', 'Educação Física']),
    ('sc-03', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Ciência da Computação', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Gastronomia', 'Relações Internacionais', 'Educação Física', 'Pedagogia']),
    ('ce-03', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Ciência da Computação', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Educação Física', 'Relações Internacionais']),
    ('df-03', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Engenharia Civil', 'Ciência da Computação', 'Jornalismo', 'Publicidade e Propaganda', 'Educação Física', 'Relações Internacionais', 'Pedagogia', 'Letras']),
    ('go-02', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Farmácia', 'Nutrição', 'Fisioterapia', 'Medicina Veterinária', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Ciência da Computação', 'Jornalismo', 'Publicidade e Propaganda', 'Relações Internacionais', 'Pedagogia', 'Letras', 'História', 'Educação Física', 'Serviço Social']),
    ('pe-03', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Fisioterapia', 'Nutrição', 'Farmácia', 'Fonoaudiologia', 'Administração', 'Ciências Contábeis', 'Ciências Econômicas', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Química', 'Ciência da Computação', 'Jornalismo', 'Publicidade e Propaganda', 'Pedagogia', 'Letras', 'História', 'Filosofia', 'Serviço Social']),
    ('ba-02', array['Medicina', 'Direito', 'Psicologia', 'Enfermagem', 'Odontologia', 'Fisioterapia', 'Nutrição', 'Farmácia', 'Administração', 'Ciências Contábeis', 'Arquitetura e Urbanismo', 'Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia de Produção', 'Engenharia Química', 'Ciência da Computação', 'Jornalismo', 'Publicidade e Propaganda', 'Design', 'Gastronomia', 'Relações Internacionais', 'Educação Física']),
    ('ba-03', array['Engenharia Mecânica', 'Engenharia Elétrica', 'Engenharia de Computação', 'Engenharia Química', 'Engenharia de Produção', 'Engenharia Civil'])
  ) as graduacao(inst, cursos)

  -- Ofertas EAD de graduação.
  union all
  select inst, unnest(cursos), 'graduacao', 'ead'
  from (values
    ('rj-03', array['Administração', 'Ciências Contábeis', 'Pedagogia', 'Análise e Desenvolvimento de Sistemas', 'Gestão de Recursos Humanos', 'Marketing', 'Logística']),
    ('pr-03', array['Administração', 'Pedagogia', 'Análise e Desenvolvimento de Sistemas', 'Gestão de Recursos Humanos'])
  ) as ead(inst, cursos)

  -- Tecnólogos (Fatec).
  union all
  select inst, unnest(cursos), 'graduacao', 'presencial'
  from (values
    ('sp-15', array['Análise e Desenvolvimento de Sistemas', 'Logística', 'Gestão Empresarial']),
    ('sp-25', array['Análise e Desenvolvimento de Sistemas', 'Logística']),
    ('sp-28', array['Análise e Desenvolvimento de Sistemas', 'Gestão Empresarial']),
    ('sp-14', array['Análise e Desenvolvimento de Sistemas'])
  ) as tecnologos(inst, cursos)

  -- Cursos técnicos de nível médio.
  union all
  select inst, unnest(cursos), 'tecnico', 'presencial'
  from (values
    ('sp-15', array['Técnico em Administração', 'Técnico em Enfermagem', 'Técnico em Desenvolvimento de Sistemas', 'Técnico em Logística', 'Técnico em Eletrônica', 'Técnico em Mecatrônica', 'Técnico em Nutrição e Dietética']),
    ('sp-04', array['Técnico em Mecatrônica', 'Técnico em Eletrotécnica', 'Técnico em Mecânica', 'Técnico em Automação Industrial', 'Técnico em Desenvolvimento de Sistemas', 'Técnico em Eletrônica', 'Técnico em Logística']),
    ('pr-05', array['Técnico em Eletrotécnica', 'Técnico em Mecânica', 'Técnico em Automação Industrial', 'Técnico em Desenvolvimento de Sistemas']),
    ('ba-03', array['Técnico em Mecatrônica', 'Técnico em Automação Industrial']),
    ('mg-03', array['Técnico em Eletrotécnica', 'Técnico em Mecânica', 'Técnico em Edificações', 'Técnico em Informática']),
    ('rj-09', array['Técnico em Eletrotécnica', 'Técnico em Mecânica', 'Técnico em Edificações', 'Técnico em Informática']),
    ('sp-14', array['Técnico em Informática', 'Técnico em Mecânica', 'Técnico em Eletrotécnica', 'Técnico em Edificações']),
    ('rn-02', array['Técnico em Informática', 'Técnico em Edificações', 'Técnico em Eletrotécnica']),
    ('ce-04', array['Técnico em Informática', 'Técnico em Edificações', 'Técnico em Eletrotécnica']),
    ('es-02', array['Técnico em Informática', 'Técnico em Edificações', 'Técnico em Eletrotécnica']),
    ('mt-02', array['Técnico em Informática', 'Técnico em Edificações', 'Técnico em Eletrotécnica']),
    ('se-02', array['Técnico em Informática', 'Técnico em Edificações', 'Técnico em Eletrotécnica'])
  ) as tecnicos(inst, cursos)

  -- Escolas de educação básica.
  union all
  select inst, curso, nivel, 'presencial'
  from unnest(array['ba-04', 'ba-05', 'mg-04', 'mg-05', 'pr-04', 'rj-05', 'sp-05', 'sp-17']) as escolas(inst)
  cross join (values ('Ensino Fundamental', 'fundamental'), ('Ensino Médio', 'medio')) as etapas(curso, nivel)
),
unicas as (
  select distinct inst, curso, nivel, modalidade from listas
)
insert into public.ofertas (id, instituicao_id, curso_nome, nivel, modalidade)
select 'oc-' || u.inst || '-' || substr(md5(u.curso || u.modalidade), 1, 10), u.inst, u.curso, u.nivel, u.modalidade
from unicas u
where exists (select 1 from public.instituicoes i where i.id = u.inst)
  and not exists (
    select 1 from public.ofertas o
    where o.instituicao_id = u.inst
      and lower(o.curso_nome) = lower(u.curso)
      and coalesce(o.modalidade, 'presencial') = u.modalidade
  )
on conflict (id) do nothing;

-- Nomes equivalentes passam a usar a mesma grafia do catálogo de cursos.
update public.ofertas set curso_nome = 'Física' where curso_nome = 'Licenciatura em Física';
update public.ofertas set curso_nome = 'Design' where curso_nome = 'Design Gráfico';

notify pgrst, 'reload schema';
