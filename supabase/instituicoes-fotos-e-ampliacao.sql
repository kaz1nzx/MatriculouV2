-- MAIS INSTITUIÇÕES E FOTOS REAIS — Matriculou
-- Execute no SQL Editor depois de lgpd-conformidade.sql. É idempotente.
--
-- Fotos: Wikimedia Commons, apenas licenças livres (CC BY, CC BY-SA, CC0 ou domínio
-- público), salvas no próprio site em /images/instituicoes. O crédito (autor, licença
-- e fonte) é obrigatório e aparece nos detalhes de cada instituição.
-- Dados novos: conceito MEC, mensalidade e bolsas ficam "não informados" até serem
-- conferidos em fonte oficial (e-MEC e site da instituição). Nada foi estimado.

alter table public.instituicoes add column if not exists foto_autor text;
alter table public.instituicoes add column if not exists foto_licenca text;
alter table public.instituicoes add column if not exists foto_fonte text;
alter table public.ofertas alter column turno drop not null;
alter table public.ofertas alter column periodo drop not null;
alter table public.instituicoes alter column status_vaga drop not null;

-- Universidades privadas que estavam classificadas como "faculdade".
update public.instituicoes set tipo = 'universidade' where id in ('ba-02','mg-02','pr-02','pr-03','rj-02','rj-03','sp-02');

insert into public.instituicoes (id, nome, rede, cidade, estado, nota_mec, mensalidade_media, possui_bolsas, avaliacao_media, total_avaliacoes, foto_capa, status_vaga, tipo) values
  ('sp-06', 'Universidade Estadual de Campinas (Unicamp)', 'publica', 'Campinas', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-07', 'Universidade Estadual Paulista (Unesp)', 'publica', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-08', 'Universidade Federal de São Paulo (Unifesp)', 'publica', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-09', 'Universidade Federal do ABC (UFABC)', 'publica', 'Santo André', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-10', 'Universidade Federal de São Carlos (UFSCar)', 'publica', 'São Carlos', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-11', 'Instituto Tecnológico de Aeronáutica (ITA)', 'publica', 'São José dos Campos', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('sp-12', 'Fundação Getulio Vargas (FGV)', 'privada', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('sp-13', 'Insper', 'privada', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('sp-14', 'Instituto Federal de São Paulo (IFSP)', 'publica', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('sp-15', 'Centro Paula Souza (Etec e Fatec)', 'publica', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('sp-16', 'Fundação Armando Alvares Penteado (FAAP)', 'privada', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('sp-17', 'Colégio Bandeirantes', 'privada', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'escola'),
  ('sp-18', 'Universidade Anhembi Morumbi', 'privada', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-19', 'Faculdade de Informática e Administração Paulista (FIAP)', 'privada', 'São Paulo', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('rj-06', 'Universidade do Estado do Rio de Janeiro (UERJ)', 'publica', 'Rio de Janeiro', 'RJ', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rj-07', 'Universidade Federal Fluminense (UFF)', 'publica', 'Niterói', 'RJ', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rj-08', 'Universidade Federal Rural do Rio de Janeiro (UFRRJ)', 'publica', 'Seropédica', 'RJ', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rj-09', 'Centro Federal de Educação Tecnológica Celso Suckow da Fonseca (CEFET/RJ)', 'publica', 'Rio de Janeiro', 'RJ', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('rj-10', 'Instituto Militar de Engenharia (IME)', 'publica', 'Rio de Janeiro', 'RJ', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('mg-06', 'Universidade Federal de Viçosa (UFV)', 'publica', 'Viçosa', 'MG', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('mg-07', 'Universidade Federal de Juiz de Fora (UFJF)', 'publica', 'Juiz de Fora', 'MG', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('mg-08', 'Universidade Federal de Uberlândia (UFU)', 'publica', 'Uberlândia', 'MG', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('mg-09', 'Universidade Federal de Ouro Preto (UFOP)', 'publica', 'Ouro Preto', 'MG', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('mg-10', 'Universidade Federal de Lavras (UFLA)', 'publica', 'Lavras', 'MG', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rs-02', 'Pontifícia Universidade Católica do Rio Grande do Sul (PUCRS)', 'privada', 'Porto Alegre', 'RS', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rs-03', 'Universidade Federal de Santa Maria (UFSM)', 'publica', 'Santa Maria', 'RS', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rs-04', 'Universidade do Vale do Rio dos Sinos (Unisinos)', 'privada', 'São Leopoldo', 'RS', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rs-05', 'Universidade Federal de Pelotas (UFPel)', 'publica', 'Pelotas', 'RS', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pr-06', 'Universidade Tecnológica Federal do Paraná (UTFPR)', 'publica', 'Curitiba', 'PR', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pr-07', 'Universidade Estadual de Londrina (UEL)', 'publica', 'Londrina', 'PR', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pr-08', 'Universidade Estadual de Maringá (UEM)', 'publica', 'Maringá', 'PR', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sc-02', 'Universidade do Estado de Santa Catarina (UDESC)', 'publica', 'Florianópolis', 'SC', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sc-03', 'Universidade do Vale do Itajaí (Univali)', 'privada', 'Itajaí', 'SC', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('ba-06', 'Universidade do Estado da Bahia (UNEB)', 'publica', 'Salvador', 'BA', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('ba-07', 'Universidade Estadual de Feira de Santana (UEFS)', 'publica', 'Feira de Santana', 'BA', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pe-02', 'Universidade Federal Rural de Pernambuco (UFRPE)', 'publica', 'Recife', 'PE', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pe-03', 'Universidade Católica de Pernambuco (Unicap)', 'privada', 'Recife', 'PE', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('ce-02', 'Universidade Estadual do Ceará (UECE)', 'publica', 'Fortaleza', 'CE', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('ce-03', 'Universidade de Fortaleza (Unifor)', 'privada', 'Fortaleza', 'CE', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('ce-04', 'Instituto Federal do Ceará (IFCE)', 'publica', 'Fortaleza', 'CE', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('go-02', 'Pontifícia Universidade Católica de Goiás (PUC Goiás)', 'privada', 'Goiânia', 'GO', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('df-02', 'Instituto Federal de Brasília (IFB)', 'publica', 'Brasília', 'DF', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('df-03', 'Universidade Católica de Brasília (UCB)', 'privada', 'Brasília', 'DF', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pa-02', 'Universidade do Estado do Pará (UEPA)', 'publica', 'Belém', 'PA', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('am-02', 'Universidade do Estado do Amazonas (UEA)', 'publica', 'Manaus', 'AM', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pb-02', 'Universidade Federal de Campina Grande (UFCG)', 'publica', 'Campina Grande', 'PB', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('rn-02', 'Instituto Federal do Rio Grande do Norte (IFRN)', 'publica', 'Natal', 'RN', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('es-02', 'Instituto Federal do Espírito Santo (Ifes)', 'publica', 'Vitória', 'ES', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('ma-02', 'Universidade Estadual do Maranhão (UEMA)', 'publica', 'São Luís', 'MA', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('pi-02', 'Universidade Estadual do Piauí (UESPI)', 'publica', 'Teresina', 'PI', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('ms-02', 'Universidade Estadual de Mato Grosso do Sul (UEMS)', 'publica', 'Dourados', 'MS', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('mt-02', 'Instituto Federal de Mato Grosso (IFMT)', 'publica', 'Cuiabá', 'MT', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('to-02', 'Universidade Estadual do Tocantins (Unitins)', 'publica', 'Palmas', 'TO', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('se-02', 'Instituto Federal de Sergipe (IFS)', 'publica', 'Aracaju', 'SE', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('ro-02', 'Instituto Federal de Rondônia (IFRO)', 'publica', 'Porto Velho', 'RO', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('sp-20', 'Universidade de Sorocaba (Uniso)', 'privada', 'Sorocaba', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-21', 'Centro Universitário Facens', 'privada', 'Sorocaba', 'SP', 0, 0, false, 0, 0, null, null, 'centro universitário'),
  ('sp-22', 'Universidade Federal de São Carlos — Campus Sorocaba (UFSCar Sorocaba)', 'publica', 'Sorocaba', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-23', 'Unesp — Instituto de Ciência e Tecnologia de Sorocaba', 'publica', 'Sorocaba', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-24', 'PUC-SP — Campus Sorocaba (Faculdade de Ciências Médicas e da Saúde)', 'privada', 'Sorocaba', 'SP', 0, 0, false, 0, 0, null, null, 'universidade'),
  ('sp-25', 'Faculdade de Tecnologia de Sorocaba (Fatec Sorocaba)', 'publica', 'Sorocaba', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('sp-26', 'Instituto Federal de São Paulo — Campus Sorocaba (IFSP Sorocaba)', 'publica', 'Sorocaba', 'SP', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('sp-27', 'Instituto Federal de São Paulo — Campus Itapetininga (IFSP Itapetininga)', 'publica', 'Itapetininga', 'SP', 0, 0, false, 0, 0, null, null, 'tecnico'),
  ('sp-28', 'Faculdade de Tecnologia de Itapetininga (Fatec Itapetininga)', 'publica', 'Itapetininga', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade'),
  ('sp-29', 'Faculdades FKB (Fundação Karnig Bazarian)', 'privada', 'Itapetininga', 'SP', 0, 0, false, 0, 0, null, null, 'faculdade')
on conflict (id) do update set nome = excluded.nome, rede = excluded.rede, cidade = excluded.cidade, estado = excluded.estado, tipo = excluded.tipo;

insert into public.ofertas (id, instituicao_id, curso_nome, nivel, modalidade, turno, periodo) values
  ('of-sp-06-1', 'sp-06', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-sp-06-2', 'sp-06', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-06-3', 'sp-06', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-sp-06-4', 'sp-06', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-sp-07-1', 'sp-07', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-sp-07-2', 'sp-07', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-sp-07-3', 'sp-07', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-sp-07-4', 'sp-07', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-08-1', 'sp-08', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-sp-08-2', 'sp-08', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-sp-08-3', 'sp-08', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-09-1', 'sp-09', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-10-1', 'sp-10', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-10-2', 'sp-10', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-sp-10-3', 'sp-10', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-sp-10-4', 'sp-10', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-sp-10-5', 'sp-10', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-11-1', 'sp-11', 'Engenharia Aeroespacial', 'graduacao', 'presencial', null, null),
  ('of-sp-11-2', 'sp-11', 'Engenharia de Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-12-1', 'sp-12', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-12-2', 'sp-12', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-sp-13-1', 'sp-13', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-13-2', 'sp-13', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-sp-13-3', 'sp-13', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-14-1', 'sp-14', 'Análise e Desenvolvimento de Sistemas', 'graduacao', 'presencial', null, null),
  ('of-sp-14-2', 'sp-14', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-sp-15-1', 'sp-15', 'Técnico em Desenvolvimento de Sistemas', 'tecnico', 'presencial', null, null),
  ('of-sp-15-2', 'sp-15', 'Análise e Desenvolvimento de Sistemas', 'graduacao', 'presencial', null, null),
  ('of-sp-16-1', 'sp-16', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-16-2', 'sp-16', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-sp-16-3', 'sp-16', 'Design', 'graduacao', 'presencial', null, null),
  ('of-sp-17-1', 'sp-17', 'Ensino Fundamental', 'fundamental', 'presencial', null, null),
  ('of-sp-17-2', 'sp-17', 'Ensino Médio', 'medio', 'presencial', null, null),
  ('of-sp-18-1', 'sp-18', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-18-2', 'sp-18', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-sp-18-3', 'sp-18', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-sp-18-4', 'sp-18', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-sp-19-1', 'sp-19', 'Análise e Desenvolvimento de Sistemas', 'graduacao', 'presencial', null, null),
  ('of-sp-19-2', 'sp-19', 'Sistemas de Informação', 'graduacao', 'presencial', null, null),
  ('of-rj-06-1', 'rj-06', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rj-06-2', 'rj-06', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-rj-06-3', 'rj-06', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-rj-06-4', 'rj-06', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-rj-06-5', 'rj-06', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-rj-07-1', 'rj-07', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rj-07-2', 'rj-07', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-rj-07-3', 'rj-07', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-rj-07-4', 'rj-07', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-rj-07-5', 'rj-07', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-rj-07-6', 'rj-07', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-rj-08-1', 'rj-08', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-rj-08-2', 'rj-08', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-rj-08-3', 'rj-08', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rj-09-1', 'rj-09', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-rj-09-2', 'rj-09', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-rj-09-3', 'rj-09', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-rj-10-1', 'rj-10', 'Engenharia de Computação', 'graduacao', 'presencial', null, null),
  ('of-mg-06-1', 'mg-06', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-mg-06-2', 'mg-06', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-mg-06-3', 'mg-06', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-mg-06-4', 'mg-06', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-mg-06-5', 'mg-06', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-mg-06-6', 'mg-06', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-mg-07-1', 'mg-07', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-mg-07-2', 'mg-07', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-mg-07-3', 'mg-07', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-mg-07-4', 'mg-07', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-mg-07-5', 'mg-07', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-mg-07-6', 'mg-07', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-mg-08-1', 'mg-08', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-mg-08-2', 'mg-08', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-mg-08-3', 'mg-08', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-mg-08-4', 'mg-08', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-mg-08-5', 'mg-08', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-mg-09-1', 'mg-09', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-mg-09-2', 'mg-09', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-mg-09-3', 'mg-09', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-mg-09-4', 'mg-09', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-mg-10-1', 'mg-10', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-mg-10-2', 'mg-10', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-mg-10-3', 'mg-10', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-mg-10-4', 'mg-10', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-rs-02-1', 'rs-02', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-rs-02-2', 'rs-02', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rs-02-3', 'rs-02', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-rs-02-4', 'rs-02', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-rs-02-5', 'rs-02', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-rs-03-1', 'rs-03', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-rs-03-2', 'rs-03', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-rs-03-3', 'rs-03', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rs-03-4', 'rs-03', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-rs-03-5', 'rs-03', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-rs-04-1', 'rs-04', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rs-04-2', 'rs-04', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-rs-04-3', 'rs-04', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-rs-04-4', 'rs-04', 'Design', 'graduacao', 'presencial', null, null),
  ('of-rs-05-1', 'rs-05', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-rs-05-2', 'rs-05', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-rs-05-3', 'rs-05', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rs-05-4', 'rs-05', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-pr-06-1', 'pr-06', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-pr-06-2', 'pr-06', 'Engenharia de Computação', 'graduacao', 'presencial', null, null),
  ('of-pr-06-3', 'pr-06', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-pr-07-1', 'pr-07', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-pr-07-2', 'pr-07', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-pr-07-3', 'pr-07', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-pr-07-4', 'pr-07', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-pr-07-5', 'pr-07', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-pr-08-1', 'pr-08', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-pr-08-2', 'pr-08', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-pr-08-3', 'pr-08', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-pr-08-4', 'pr-08', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-pr-08-5', 'pr-08', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sc-02-1', 'sc-02', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sc-02-2', 'sc-02', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-sc-02-3', 'sc-02', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sc-02-4', 'sc-02', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-sc-02-5', 'sc-02', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-sc-03-1', 'sc-03', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-sc-03-2', 'sc-03', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-sc-03-3', 'sc-03', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-ba-06-1', 'ba-06', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-ba-06-2', 'ba-06', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-ba-06-3', 'ba-06', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-ba-07-1', 'ba-07', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-ba-07-2', 'ba-07', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-ba-07-3', 'ba-07', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-ba-07-4', 'ba-07', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-pe-02-1', 'pe-02', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-pe-02-2', 'pe-02', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-pe-02-3', 'pe-02', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-pe-03-1', 'pe-03', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-pe-03-2', 'pe-03', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-ce-02-1', 'ce-02', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-ce-02-2', 'ce-02', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-ce-02-3', 'ce-02', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-ce-02-4', 'ce-02', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-ce-03-1', 'ce-03', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-ce-03-2', 'ce-03', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-ce-03-3', 'ce-03', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-ce-03-4', 'ce-03', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-ce-04-1', 'ce-04', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-ce-04-2', 'ce-04', 'Técnico em Edificações', 'tecnico', 'presencial', null, null),
  ('of-go-02-1', 'go-02', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-go-02-2', 'go-02', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-go-02-3', 'go-02', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-df-02-1', 'df-02', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-df-03-1', 'df-03', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-df-03-2', 'df-03', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-df-03-3', 'df-03', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-pa-02-1', 'pa-02', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-pa-02-2', 'pa-02', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-am-02-1', 'am-02', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-am-02-2', 'am-02', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-pb-02-1', 'pb-02', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-pb-02-2', 'pb-02', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-pb-02-3', 'pb-02', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-pb-02-4', 'pb-02', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-rn-02-1', 'rn-02', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-es-02-1', 'es-02', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-ma-02-1', 'ma-02', 'Medicina Veterinária', 'graduacao', 'presencial', null, null),
  ('of-ma-02-2', 'ma-02', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-ma-02-3', 'ma-02', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-pi-02-1', 'pi-02', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-pi-02-2', 'pi-02', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-pi-02-3', 'pi-02', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-ms-02-1', 'ms-02', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-ms-02-2', 'ms-02', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-mt-02-1', 'mt-02', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-to-02-1', 'to-02', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-to-02-2', 'to-02', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-se-02-1', 'se-02', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-ro-02-1', 'ro-02', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-sp-20-1', 'sp-20', 'Ciências Biológicas', 'graduacao', 'presencial', null, null),
  ('of-sp-20-2', 'sp-20', 'Publicidade e Propaganda', 'graduacao', 'presencial', null, null),
  ('of-sp-20-3', 'sp-20', 'Logística', 'graduacao', 'presencial', null, null),
  ('of-sp-21-1', 'sp-21', 'Engenharia Civil', 'graduacao', 'presencial', null, null),
  ('of-sp-21-2', 'sp-21', 'Engenharia de Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-22-1', 'sp-22', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-22-2', 'sp-22', 'Ciência da Computação', 'graduacao', 'presencial', null, null),
  ('of-sp-22-3', 'sp-22', 'Ciências Econômicas', 'graduacao', 'presencial', null, null),
  ('of-sp-22-4', 'sp-22', 'Engenharia de Produção', 'graduacao', 'presencial', null, null),
  ('of-sp-22-5', 'sp-22', 'Engenharia Florestal', 'graduacao', 'presencial', null, null),
  ('of-sp-22-6', 'sp-22', 'Pedagogia', 'graduacao', 'presencial', null, null),
  ('of-sp-22-7', 'sp-22', 'Turismo', 'graduacao', 'presencial', null, null),
  ('of-sp-23-1', 'sp-23', 'Engenharia Ambiental', 'graduacao', 'presencial', null, null),
  ('of-sp-23-2', 'sp-23', 'Engenharia de Controle e Automação', 'graduacao', 'presencial', null, null),
  ('of-sp-24-1', 'sp-24', 'Medicina', 'graduacao', 'presencial', null, null),
  ('of-sp-24-2', 'sp-24', 'Enfermagem', 'graduacao', 'presencial', null, null),
  ('of-sp-25-1', 'sp-25', 'Análise e Desenvolvimento de Sistemas', 'graduacao', 'presencial', null, null),
  ('of-sp-25-2', 'sp-25', 'Automação Industrial', 'graduacao', 'presencial', null, null),
  ('of-sp-25-3', 'sp-25', 'Gestão Empresarial', 'graduacao', 'presencial', null, null),
  ('of-sp-25-4', 'sp-25', 'Logística', 'graduacao', 'presencial', null, null),
  ('of-sp-25-5', 'sp-25', 'Manutenção de Aeronaves', 'graduacao', 'presencial', null, null),
  ('of-sp-25-6', 'sp-25', 'Polímeros', 'graduacao', 'presencial', null, null),
  ('of-sp-27-1', 'sp-27', 'Técnico em Edificações', 'tecnico', 'presencial', null, null),
  ('of-sp-27-2', 'sp-27', 'Técnico em Eletromecânica', 'tecnico', 'presencial', null, null),
  ('of-sp-27-3', 'sp-27', 'Técnico em Informática', 'tecnico', 'presencial', null, null),
  ('of-sp-27-4', 'sp-27', 'Técnico em Mecânica', 'tecnico', 'presencial', null, null),
  ('of-sp-27-5', 'sp-27', 'Engenharia Mecânica', 'graduacao', 'presencial', null, null),
  ('of-sp-27-6', 'sp-27', 'Licenciatura em Física', 'graduacao', 'presencial', null, null),
  ('of-sp-28-1', 'sp-28', 'Análise e Desenvolvimento de Sistemas', 'graduacao', 'presencial', null, null),
  ('of-sp-29-1', 'sp-29', 'Direito', 'graduacao', 'presencial', null, null),
  ('of-sp-29-2', 'sp-29', 'Administração', 'graduacao', 'presencial', null, null),
  ('of-sp-29-3', 'sp-29', 'Educação Física', 'graduacao', 'presencial', null, null)
on conflict (id) do update set instituicao_id = excluded.instituicao_id, curso_nome = excluded.curso_nome, nivel = excluded.nivel, modalidade = excluded.modalidade;

-- Fotos licenciadas.
update public.instituicoes set foto_capa = '/images/instituicoes/al-01.jpg', foto_autor = 'Danilo Belo', foto_licenca = 'Public domain', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Ufal_geo.jpg' where id = 'al-01';
update public.instituicoes set foto_capa = '/images/instituicoes/am-01.jpg', foto_autor = 'Ajmcbarreto', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Museu_Amaz%C3%B4nico_da_UFAM_-_5.jpg' where id = 'am-01';
update public.instituicoes set foto_capa = '/images/instituicoes/ba-01.jpg', foto_autor = 'Samory Pereira Santos', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Faculdade_de_Odontologia_da_UFBA.jpg' where id = 'ba-01';
update public.instituicoes set foto_capa = '/images/instituicoes/ba-02.jpg', foto_autor = 'by Luan', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UNIFACS_-_IGUATEMI.jpg' where id = 'ba-02';
update public.instituicoes set foto_capa = '/images/instituicoes/ba-03.jpg', foto_autor = 'Ministério da Ciência, Tecnologia e Inovação from Brasília - DF, Brasil', foto_licenca = 'CC BY 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Vacina_RNA_MCTI-CIMATEC-HDT_(51820041860).jpg' where id = 'ba-03';
update public.instituicoes set foto_capa = '/images/instituicoes/ce-01.jpg', foto_autor = 'Matheus!', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:BCH_UFC.JPG' where id = 'ce-01';
update public.instituicoes set foto_capa = '/images/instituicoes/df-01.jpg', foto_autor = 'Universidade de Brasília from Brasília, Brasil', foto_licenca = 'CC BY 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Campus_Darcy_Ribeiro_(31398447555).jpg' where id = 'df-01';
update public.instituicoes set foto_capa = '/images/instituicoes/ma-01.jpg', foto_autor = 'João Justiceiro', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Sede_da_TV_UFMA_(2015).jpg' where id = 'ma-01';
update public.instituicoes set foto_capa = '/images/instituicoes/mt-01.jpg', foto_autor = 'Mateus Hidalgo', foto_licenca = 'CC BY-SA 2.5', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Entrada_da_biblioteca_da_UFMT.jpg' where id = 'mt-01';
update public.instituicoes set foto_capa = '/images/instituicoes/ms-01.jpg', foto_autor = 'Fronteira', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Biblioteca_Central_da_UFMS,_Campo_Grande,_dezembro_de_2022_(5).jpg' where id = 'ms-01';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-01.jpg', foto_autor = 'Galabel Morea', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Entranda_principal_da_FAFICH_UFMG_2023.jpg' where id = 'mg-01';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-02.jpg', foto_autor = 'Andrevruas', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Entradapucminas.jpg' where id = 'mg-02';
update public.instituicoes set foto_capa = '/images/instituicoes/pa-01.jpg', foto_autor = 'Roberto de vasconcel…', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:ESCOLA_DE_MUSICA_DA_UFPA_-_panoramio.jpg' where id = 'pa-01';
update public.instituicoes set foto_capa = '/images/instituicoes/pb-01.jpg', foto_autor = 'Camarax', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:CCEN_UFPB.JPG' where id = 'pb-01';
update public.instituicoes set foto_capa = '/images/instituicoes/pr-01.jpg', foto_autor = 'Boaventuravinicius', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UFPR_vista_frontal.jpg' where id = 'pr-01';
update public.instituicoes set foto_capa = '/images/instituicoes/pr-03.jpg', foto_autor = 'Rvpertvs', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Bibliotecaup.jpg' where id = 'pr-03';
update public.instituicoes set foto_capa = '/images/instituicoes/pe-01.jpg', foto_autor = 'Alburquerque', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UFPE_CAA.jpg' where id = 'pe-01';
update public.instituicoes set foto_capa = '/images/instituicoes/pi-01.jpg', foto_autor = 'Academia de letras de CM', foto_licenca = 'CC BY-SA 3.0 br', foto_fonte = 'https://commons.wikimedia.org/wiki/File:P%C3%B3rtico_da_UFPI_(University).JPG' where id = 'pi-01';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-01.jpg', foto_autor = 'monicaewagner', foto_licenca = 'CC BY-SA 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:CT_-_Escola_de_Qu%C3%ADmica_-_EQ_-_UFRJ.jpg' where id = 'rj-01';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-03.jpg', foto_autor = 'Wilfredor', foto_licenca = 'CC0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Universidade_Est%C3%A1cio,_Campus_Nova_Igua%C3%A7u,_Rio_de_Janeiro.jpg' where id = 'rj-03';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-04.jpg', foto_autor = 'EduardoAssis', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:IFRJFachada.jpg' where id = 'rj-04';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-05.jpg', foto_autor = 'Cyro A. Silva', foto_licenca = 'CC BY 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Col%C3%A9gio_Pedro_II_-_Rio_de_Janeiro.jpg' where id = 'rj-05';
update public.instituicoes set foto_capa = '/images/instituicoes/rn-01.jpg', foto_autor = 'Patrick - Patrick', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Anfiteatros-CCET-UFRN.jpg' where id = 'rn-01';
update public.instituicoes set foto_capa = '/images/instituicoes/rs-01.jpg', foto_autor = 'Ricardo André Frantz (User:Tetraktys)', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:AntigaEngenhariaUFRGS.jpg' where id = 'rs-01';
update public.instituicoes set foto_capa = '/images/instituicoes/ro-01.jpg', foto_autor = 'Filipux', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UNIR.jpg' where id = 'ro-01';
update public.instituicoes set foto_capa = '/images/instituicoes/rr-01.jpg', foto_autor = 'Eu', foto_licenca = 'Public domain', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Bloco_I_UFRR.jpg' where id = 'rr-01';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-01.jpg', foto_autor = 'Gabriel Fernandes from São Paulo, Brasil', foto_licenca = 'CC BY-SA 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Biblioteca_FAU-USP_1.jpg' where id = 'sp-01';
update public.instituicoes set foto_capa = '/images/instituicoes/se-01.jpg', foto_autor = 'Paul R. Burley', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Centro_de_Cultura_e_Arte_da_Universidade_Federal_de_Sergipe-511.jpg' where id = 'se-01';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-07.jpg', foto_autor = 'Dornicke', foto_licenca = 'CC0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Centro_de_Documenta%C3%A7%C3%A3o_e_Mem%C3%B3ria_da_UNESP_01.jpg' where id = 'sp-07';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-08.jpg', foto_autor = 'Paulagarcia14', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Campus_Baixada_Santista_da_Unifesp.jpg' where id = 'sp-08';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-10.jpg', foto_autor = 'Urbanetz', foto_licenca = 'CC BY-SA 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Foto_aerea_UFSCar.jpg' where id = 'sp-10';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-11.jpg', foto_autor = 'Autor não identificado', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Library-ITA.JPG' where id = 'sp-11';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-12.jpg', foto_autor = 'Natalia.smachado', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Biblioteca_Karl_A._Boedecker_-_FGV_SP.jpg' where id = 'sp-12';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-13.jpg', foto_autor = 'Lister Ogusuku Ribeiro', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Pr%C3%A9dio_Quat%C3%A1_67,_inaugurado_pelo_Insper_em_agosto_de_2024..png' where id = 'sp-13';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-15.jpg', foto_autor = 'Dornicke', foto_licenca = 'Public domain', foto_fonte = 'https://commons.wikimedia.org/wiki/File:CEETEPS_1.JPG' where id = 'sp-15';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-16.jpg', foto_autor = 'Beatriz Liet', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Museu_de_Arte_Brasileira_da_Funda%C3%A7%C3%A3o_Armando_%C3%81lvares_Penteado.jpg' where id = 'sp-16';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-18.jpg', foto_autor = 'Daniellima89', foto_licenca = 'Public domain', foto_fonte = 'https://commons.wikimedia.org/wiki/File:ANHEMBIMORUMBI.JPG' where id = 'sp-18';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-06.jpg', foto_autor = 'Edvaldo LL Souza', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Dinossauro_nos_Jardins_da_UERJ_-_Dinossaur_in_the_Gardens_of_UERJ.jpg' where id = 'rj-06';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-07.jpg', foto_autor = 'Lucasfffaria', foto_licenca = 'CC0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:1985-01-01_UFF_Santo_Antonio_de_Padua_RJ_Criacao_do_curso_de_Matematica_na_Unidade_de_Formacao_de_Professores_em_Santo_Antonio_de_Padua.jpg' where id = 'rj-07';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-08.jpg', foto_autor = 'Rcandre', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Arquitetura_UFRRJ.jpg' where id = 'rj-08';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-09.jpg', foto_autor = 'Kouringas123', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:CEFET_2.png' where id = 'rj-09';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-10.jpg', foto_autor = 'Boaventuravinicius', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Instituto_Militar_de_Engenharia.jpg' where id = 'rj-10';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-06.jpg', foto_autor = 'HVL', foto_licenca = 'CC BY 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Centro_de_Viv%C3%AAncia_da_UFV,_Vi%C3%A7osa_MG.JPG' where id = 'mg-06';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-07.jpg', foto_autor = 'MisterSanderson', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Entrada_2_da_Universidade_Federal_de_Juiz_de_Fora.jpg' where id = 'mg-07';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-08.jpg', foto_autor = 'Lkcalabria', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:CampiUFU.jpg' where id = 'mg-08';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-09.jpg', foto_autor = 'Py4nf', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Reitoria_ufop_01.jpg' where id = 'mg-09';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-10.jpg', foto_autor = 'Dennis 96', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Restaurante_Universit%C3%A1rio_-_Ufla.JPG' where id = 'mg-10';
update public.instituicoes set foto_capa = '/images/instituicoes/rs-03.jpg', foto_autor = 'Imagens SM', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Entrada_da_UFSM.jpg' where id = 'rs-03';
update public.instituicoes set foto_capa = '/images/instituicoes/rs-04.jpg', foto_autor = 'PeedroVieero', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Biblioteca_Unisinos_-_S%C3%A3o_Leopoldo.JPG' where id = 'rs-04';
update public.instituicoes set foto_capa = '/images/instituicoes/rs-05.jpg', foto_autor = 'Eugenio Hansen, OFS', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Direito_UFPEL.JPG' where id = 'rs-05';
update public.instituicoes set foto_capa = '/images/instituicoes/pr-06.jpg', foto_autor = 'UTFPR em Imagens', foto_licenca = 'CC BY 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Campus_Pato_Branco_UTFPR.jpg' where id = 'pr-06';
update public.instituicoes set foto_capa = '/images/instituicoes/pr-08.jpg', foto_autor = 'Sobreira 10', foto_licenca = 'CC0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:G34_UEM.webp' where id = 'pr-08';
update public.instituicoes set foto_capa = '/images/instituicoes/ba-06.jpg', foto_autor = 'André Koehne', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UnebVI.jpg' where id = 'ba-06';
update public.instituicoes set foto_capa = '/images/instituicoes/ba-07.jpg', foto_autor = 'Andrevruas', foto_licenca = 'CC BY 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Universidadeestadualdefeiradesantana.JPG' where id = 'ba-07';
update public.instituicoes set foto_capa = '/images/instituicoes/ce-02.jpg', foto_autor = 'Universidade Estadual do Ceará', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Reitoria_uece-fortaleza.jpg' where id = 'ce-02';
update public.instituicoes set foto_capa = '/images/instituicoes/ce-03.jpg', foto_autor = 'Joelkaula', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UNIFOR_06.jpg' where id = 'ce-03';
update public.instituicoes set foto_capa = '/images/instituicoes/go-02.jpg', foto_autor = 'Fronteira', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Pr%C3%A9dio_da_PUC_Goi%C3%A1s,_Goi%C3%A2nia,_dezembro_de_2022_(2).jpg' where id = 'go-02';
update public.instituicoes set foto_capa = '/images/instituicoes/df-02.jpg', foto_autor = 'Agência Brasília', foto_licenca = 'CC BY 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Ifbceilandia.jpg' where id = 'df-02';
update public.instituicoes set foto_capa = '/images/instituicoes/am-02.jpg', foto_autor = 'Teodomiro Sicsu Júnior', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Escola_Superior_de_Ci%C3%AAncias_da_Sa%C3%BAde_da_UEA.jpg' where id = 'am-02';
update public.instituicoes set foto_capa = '/images/instituicoes/pb-02.jpg', foto_autor = 'Bruno Coutinho Araújo', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Bloco_AB_da_UFCG.jpg' where id = 'pb-02';
update public.instituicoes set foto_capa = '/images/instituicoes/rn-02.jpg', foto_autor = 'Marcos Elias de Oliveira Júnior', foto_licenca = 'CC0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:IFRN_Pau_dos_Ferros.jpg' where id = 'rn-02';
update public.instituicoes set foto_capa = '/images/instituicoes/es-02.jpg', foto_autor = 'HVL', foto_licenca = 'CC BY 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Entrada_do_IFES_campus_Itapina,_Colatina_ES2.JPG' where id = 'es-02';
update public.instituicoes set foto_capa = '/images/instituicoes/ms-02.jpg', foto_autor = 'Diegodlh', foto_licenca = 'CC BY 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Campus_Nova_Andradina_da_Universidade_Estadual_de_Mato_Grosso_do_Sul.jpg' where id = 'ms-02';
update public.instituicoes set foto_capa = '/images/instituicoes/ba-05.jpg', foto_autor = 'Ajmcbarreto', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Liceu_Salesiano_de_Salvador_-_1.jpg' where id = 'ba-05';
update public.instituicoes set foto_capa = '/images/instituicoes/es-01.jpg', foto_autor = 'Google Inc.', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:N%C3%BAcleo_de_Linguas_da_UFES.png' where id = 'es-01';
update public.instituicoes set foto_capa = '/images/instituicoes/go-01.jpg', foto_autor = 'Fronteira', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Por_do_sol_no_campus_Samambaia,_Universidade_Federal_de_Goi%C3%A1s,_Goi%C3%A2nia,_agosto_de_2023_(1).jpg' where id = 'go-01';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-03.jpg', foto_autor = 'Paulo César Rodrigues', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:CEFET_-_MG_Campus_Leopoldina.jpg' where id = 'mg-03';
update public.instituicoes set foto_capa = '/images/instituicoes/mg-04.jpg', foto_autor = 'Andrevruas', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Csabh.jpg' where id = 'mg-04';
update public.instituicoes set foto_capa = '/images/instituicoes/rj-02.jpg', foto_autor = 'Ivokory', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Solar_Grandjean_de_Montigny_(G%C3%A1vea).jpg' where id = 'rj-02';
update public.instituicoes set foto_capa = '/images/instituicoes/sc-01.jpg', foto_autor = 'Boaventuravinicius', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Biblioteca_UFSC_.jpg' where id = 'sc-01';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-02.jpg', foto_autor = 'Dornicke', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:PUC-SP_Barueri_01.jpg' where id = 'sp-02';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-03.jpg', foto_autor = 'Fábio Coelho', foto_licenca = 'Public domain', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Mackenzie_-_biblioteca_central_George_Alexander.jpg' where id = 'sp-03';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-06.jpg', foto_autor = 'Waldir Rodrigues de Almeida', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Ciclo_B%C3%A1sico_UNICAMP_2015.jpg' where id = 'sp-06';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-09.jpg', foto_autor = 'Lucas Landin', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UFABC_SA.jpg' where id = 'sp-09';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-14.jpg', foto_autor = 'MARCO AURÉLIO ESPARZ…', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Instituto_Federal_de_Educa%C3%A7%C3%A3o,_Ci%C3%AAncia_e_Tecnologia_de_S%C3%A3o_Paulo._Campus_Sert%C3%A3ozinho._Rua_Am%C3%A9rico_Ambr%C3%B3sio,_269_-_Jardim_Cana%C3%A3_-_Telefone-16-3946-1170_-_panoramio.jpg' where id = 'sp-14';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-19.jpg', foto_autor = 'Germanoparra', foto_licenca = 'CC BY 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Fiap-vila-olimpia.jpg' where id = 'sp-19';
update public.instituicoes set foto_capa = '/images/instituicoes/rs-02.jpg', foto_autor = 'Felisberto', foto_licenca = 'CC BY 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Reitoria_PUCRS.JPG' where id = 'rs-02';
update public.instituicoes set foto_capa = '/images/instituicoes/pr-07.jpg', foto_autor = 'Amanda Truss', foto_licenca = 'CC BY-SA 2.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Capela_da_UEL_-_Londrina_Paran%C3%A1.jpg' where id = 'pr-07';
update public.instituicoes set foto_capa = '/images/instituicoes/sc-02.jpg', foto_autor = 'Kamarayzonsutra', foto_licenca = 'Public domain', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Faednova.jpg' where id = 'sc-02';
update public.instituicoes set foto_capa = '/images/instituicoes/sc-03.jpg', foto_autor = 'Rômulo Porthos', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Fachada_do_Museu_Oceanogr%C3%A1fico_Univali.jpg' where id = 'sc-03';
update public.instituicoes set foto_capa = '/images/instituicoes/pe-02.jpg', foto_autor = 'Historialepam', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Fachada_Memorial.jpg' where id = 'pe-02';
update public.instituicoes set foto_capa = '/images/instituicoes/df-03.jpg', foto_autor = 'LeaLTudo', foto_licenca = 'CC BY-SA 3.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Universidade_Cat%C3%B3lica_de_Bras%C3%ADlia_-_UCB_-_Bloco_M_-_panoramio.jpg' where id = 'df-03';
update public.instituicoes set foto_capa = '/images/instituicoes/pi-02.jpg', foto_autor = 'Antonio Filho Piauiense', foto_licenca = 'Public domain', foto_fonte = 'https://commons.wikimedia.org/wiki/File:UESPI-_Oeiras-_Piau%C3%AD.JPG' where id = 'pi-02';
update public.instituicoes set foto_capa = '/images/instituicoes/to-02.jpg', foto_autor = 'Vivianni Asevedo/Ascom Unitins', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:C%C3%A2mpus_Graciosa_-_Palmas_TO.jpg' where id = 'to-02';
update public.instituicoes set foto_capa = '/images/instituicoes/sp-22.jpg', foto_autor = 'Maria Aparecida de Lourdes Mariano', foto_licenca = 'CC BY-SA 4.0', foto_fonte = 'https://commons.wikimedia.org/wiki/File:Fachada_Biblioteca_UFSCar_Sorocaba.jpg' where id = 'sp-22';

notify pgrst, 'reload schema';
