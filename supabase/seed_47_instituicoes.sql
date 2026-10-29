ALTER TABLE instituicoes
ADD COLUMN IF NOT EXISTS tipo VARCHAR(30);

DELETE FROM ofertas;
DELETE FROM instituicoes;

INSERT INTO instituicoes (
    id,
    nome,
    rede,
    cidade,
    estado,
    nota_mec,
    mensalidade_media,
    possui_bolsas,
    avaliacao_media,
    total_avaliacoes,
    foto_capa,
    status_vaga,
    tipo
) VALUES
('ac-01','Instituto Federal do Acre (IFAC)','publica','Rio Branco','AC',4,0.00,true,0,0,NULL,'verde','tecnico'),

('al-01','Universidade Federal de Alagoas (UFAL)','publica','Maceió','AL',4,0.00,true,0,0,NULL,'verde','universidade'),

('ap-01','Instituto Federal do Amapá (IFAP)','publica','Macapá','AP',4,0.00,true,0,0,NULL,'amarelo','tecnico'),

('am-01','Universidade Federal do Amazonas (UFAM)','publica','Manaus','AM',4,0.00,true,0,0,NULL,'verde','universidade'),

('ba-01','Universidade Federal da Bahia (UFBA)','publica','Salvador','BA',5,0.00,true,0,0,NULL,'verde','universidade'),

('ba-02','Universidade Salvador (UNIFACS)','privada','Salvador','BA',4,1468.00,true,0,0,NULL,'verde','faculdade'),

('ba-03','SENAI CIMATEC','privada','Salvador','BA',5,850.00,true,0,0,NULL,'verde','tecnico'),

('ba-04','Colégio Antônio Vieira','privada','Salvador','BA',0,1800.00,false,0,0,NULL,'verde','escola'),

('ba-05','Colégio Salesiano do Salvador','privada','Salvador','BA',0,1650.00,true,0,0,NULL,'verde','escola'),

('ce-01','Universidade Federal do Ceará (UFC)','publica','Fortaleza','CE',5,0.00,true,0,0,NULL,'verde','universidade'),

('df-01','Universidade de Brasília (UnB)','publica','Brasília','DF',5,0.00,true,0,0,NULL,'verde','universidade'),

('es-01','Universidade Federal do Espírito Santo (UFES)','publica','Vitória','ES',4,0.00,true,0,0,NULL,'verde','universidade'),

('go-01','Universidade Federal de Goiás (UFG)','publica','Goiânia','GO',4,0.00,true,0,0,NULL,'verde','universidade'),

('ma-01','Universidade Federal do Maranhão (UFMA)','publica','São Luís','MA',4,0.00,true,0,0,NULL,'verde','universidade'),

('mt-01','Universidade Federal de Mato Grosso (UFMT)','publica','Cuiabá','MT',4,0.00,true,0,0,NULL,'verde','universidade'),

('ms-01','Universidade Federal de Mato Grosso do Sul (UFMS)','publica','Campo Grande','MS',4,0.00,true,0,0,NULL,'amarelo','universidade'),

('mg-01','Universidade Federal de Minas Gerais (UFMG)','publica','Belo Horizonte','MG',5,0.00,true,0,0,NULL,'verde','universidade'),

('mg-02','Pontifícia Universidade Católica de Minas Gerais (PUC Minas)','privada','Belo Horizonte','MG',4,741.00,true,0,0,NULL,'verde','faculdade'),

('mg-03','Centro Federal de Educação Tecnológica de Minas Gerais (CEFET-MG)','publica','Belo Horizonte','MG',5,0.00,true,0,0,NULL,'verde','tecnico'),

('mg-04','Colégio Santo Antônio','privada','Belo Horizonte','MG',0,2100.00,false,0,0,NULL,'verde','escola'),

('mg-05','Colégio Bernoulli','privada','Belo Horizonte','MG',0,2300.00,true,0,0,NULL,'verde','escola'),

('pa-01','Universidade Federal do Pará (UFPA)','publica','Belém','PA',4,0.00,true,0,0,NULL,'verde','universidade'),

('pb-01','Universidade Federal da Paraíba (UFPB)','publica','João Pessoa','PB',4,0.00,true,0,0,NULL,'amarelo','universidade'),

('pr-01','Universidade Federal do Paraná (UFPR)','publica','Curitiba','PR',5,0.00,true,0,0,NULL,'verde','universidade'),

('pr-02','Pontifícia Universidade Católica do Paraná (PUCPR)','privada','Curitiba','PR',5,2955.85,true,0,0,NULL,'verde','faculdade'),

('pr-03','Universidade Positivo','privada','Curitiba','PR',4,1290.00,true,0,0,NULL,'verde','faculdade'),

('pr-04','Colégio Positivo','privada','Curitiba','PR',0,2200.00,true,0,0,NULL,'verde','escola'),

('pr-05','SENAI Paraná','privada','Curitiba','PR',0,650.00,true,0,0,NULL,'verde','tecnico'),

('pe-01','Universidade Federal de Pernambuco (UFPE)','publica','Recife','PE',5,0.00,true,0,0,NULL,'verde','universidade'),

('pi-01','Universidade Federal do Piauí (UFPI)','publica','Teresina','PI',4,0.00,true,0,0,NULL,'amarelo','universidade'),

('rj-01','Universidade Federal do Rio de Janeiro (UFRJ)','publica','Rio de Janeiro','RJ',5,0.00,true,0,0,NULL,'verde','universidade'),

('rj-02','Pontifícia Universidade Católica do Rio de Janeiro (PUC-Rio)','privada','Rio de Janeiro','RJ',5,6561.00,true,0,0,NULL,'verde','faculdade'),

('rj-03','Universidade Estácio de Sá (UNESA)','privada','Rio de Janeiro','RJ',4,899.00,true,0,0,NULL,'verde','faculdade'),

('rj-04','Instituto Federal do Rio de Janeiro (IFRJ)','publica','Rio de Janeiro','RJ',5,0.00,true,0,0,NULL,'verde','tecnico'),

('rj-05','Colégio Pedro II','publica','Rio de Janeiro','RJ',0,0.00,true,0,0,NULL,'verde','escola'),

('rn-01','Universidade Federal do Rio Grande do Norte (UFRN)','publica','Natal','RN',4,0.00,true,0,0,NULL,'amarelo','universidade'),

('rs-01','Universidade Federal do Rio Grande do Sul (UFRGS)','publica','Porto Alegre','RS',5,0.00,true,0,0,NULL,'verde','universidade'),

('ro-01','Universidade Federal de Rondônia (UNIR)','publica','Porto Velho','RO',4,0.00,true,0,0,NULL,'verde','universidade'),

('rr-01','Universidade Federal de Roraima (UFRR)','publica','Boa Vista','RR',4,0.00,true,0,0,NULL,'amarelo','universidade'),

('sc-01','Universidade Federal de Santa Catarina (UFSC)','publica','Florianópolis','SC',5,0.00,true,0,0,NULL,'verde','universidade'),

('sp-01','Universidade de São Paulo (USP)','publica','São Paulo','SP',0,0.00,true,0,0,NULL,'verde','universidade'),

('sp-02','Pontifícia Universidade Católica de São Paulo (PUC-SP)','privada','São Paulo','SP',5,3980.00,true,0,0,NULL,'verde','faculdade'),

('sp-03','Universidade Presbiteriana Mackenzie','privada','São Paulo','SP',5,3200.00,true,0,0,NULL,'verde','universidade'),

('sp-04','SENAI São Paulo','privada','São Paulo','SP',0,750.00,true,0,0,NULL,'verde','tecnico'),

('sp-05','SESI São Paulo','privada','São Paulo','SP',0,1600.00,true,0,0,NULL,'verde','escola'),

('se-01','Universidade Federal de Sergipe (UFS)','publica','Aracaju','SE',4,0.00,true,0,0,NULL,'amarelo','universidade'),

('to-01','Universidade Federal do Tocantins (UFT)','publica','Palmas','TO',4,0.00,true,0,0,NULL,'amarelo','universidade')

ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    rede = EXCLUDED.rede,
    cidade = EXCLUDED.cidade,
    estado = EXCLUDED.estado,
    nota_mec = EXCLUDED.nota_mec,
    mensalidade_media = EXCLUDED.mensalidade_media,
    possui_bolsas = EXCLUDED.possui_bolsas,
    avaliacao_media = EXCLUDED.avaliacao_media,
    total_avaliacoes = EXCLUDED.total_avaliacoes,
    foto_capa = EXCLUDED.foto_capa,
    status_vaga = EXCLUDED.status_vaga,
    tipo = EXCLUDED.tipo;

INSERT INTO ofertas (
    id,
    instituicao_id,
    curso_nome,
    nivel,
    modalidade,
    turno,
    periodo
) VALUES
('of-ac-01','ac-01','Técnico em Informática','tecnico','presencial','diurno','2026-2'),
('of-al-01','al-01','Administração','graduacao','presencial','diurno','2026-2'),
('of-ap-01','ap-01','Técnico em Redes de Computadores','tecnico','presencial','diurno','2026-2'),
('of-am-01','am-01','Medicina','graduacao','presencial','integral','2026-2'),

('of-ba-01','ba-01','Direito','graduacao','presencial','diurno','2026-2'),
('of-ba-02','ba-02','Medicina','graduacao','presencial','integral','2026-2'),
('of-ba-03','ba-03','Técnico em Mecatrônica','tecnico','presencial','diurno','2026-2'),
('of-ba-04','ba-04','Ensino Fundamental','fundamental','presencial','diurno','2026-2'),
('of-ba-05','ba-05','Ensino Médio','medio','presencial','diurno','2026-2'),

('of-ce-01','ce-01','Ciência da Computação','graduacao','presencial','diurno','2026-2'),
('of-df-01','df-01','Direito','graduacao','presencial','diurno','2026-2'),
('of-es-01','es-01','Engenharia Civil','graduacao','presencial','integral','2026-2'),
('of-go-01','go-01','Agronomia','graduacao','presencial','integral','2026-2'),
('of-ma-01','ma-01','Enfermagem','graduacao','presencial','integral','2026-2'),
('of-mt-01','mt-01','Medicina Veterinária','graduacao','presencial','integral','2026-2'),
('of-ms-01','ms-01','Medicina','graduacao','presencial','integral','2026-2'),

('of-mg-01','mg-01','Medicina','graduacao','presencial','integral','2026-2'),
('of-mg-02','mg-02','Administração','graduacao','presencial','noturno','2026-2'),
('of-mg-03','mg-03','Técnico em Eletrônica','tecnico','presencial','diurno','2026-2'),
('of-mg-04','mg-04','Ensino Fundamental','fundamental','presencial','diurno','2026-2'),
('of-mg-05','mg-05','Ensino Médio','medio','presencial','diurno','2026-2'),

('of-pa-01','pa-01','Medicina','graduacao','presencial','integral','2026-2'),
('of-pb-01','pb-01','Odontologia','graduacao','presencial','integral','2026-2'),

('of-pr-01','pr-01','Engenharia Civil','graduacao','presencial','integral','2026-2'),
('of-pr-02','pr-02','Direito','graduacao','presencial','diurno','2026-2'),
('of-pr-03','pr-03','Administração','graduacao','presencial','noturno','2026-2'),
('of-pr-04','pr-04','Ensino Fundamental','fundamental','presencial','diurno','2026-2'),
('of-pr-05','pr-05','Técnico em Automação Industrial','tecnico','presencial','diurno','2026-2'),

('of-pe-01','pe-01','Medicina','graduacao','presencial','integral','2026-2'),
('of-pi-01','pi-01','Administração','graduacao','presencial','noturno','2026-2'),

('of-rj-01','rj-01','Engenharia Civil','graduacao','presencial','integral','2026-2'),
('of-rj-02','rj-02','Ciência da Computação','graduacao','presencial','diurno','2026-2'),
('of-rj-03','rj-03','Administração','graduacao','ead','flexivel','2026-2'),
('of-rj-04','rj-04','Técnico em Informática','tecnico','presencial','diurno','2026-2'),
('of-rj-05','rj-05','Ensino Médio','medio','presencial','diurno','2026-2'),

('of-rn-01','rn-01','Engenharia de Computação','graduacao','presencial','diurno','2026-2'),
('of-rs-01','rs-01','Engenharia Mecânica','graduacao','presencial','integral','2026-2'),
('of-ro-01','ro-01','Administração','graduacao','presencial','noturno','2026-2'),
('of-rr-01','rr-01','Técnico em Informática','tecnico','presencial','diurno','2026-2'),
('of-sc-01','sc-01','Engenharia de Produção','graduacao','presencial','integral','2026-2'),

('of-sp-01','sp-01','Administração','graduacao','presencial','diurno','2026-2'),
('of-sp-02','sp-02','Ciências Econômicas','graduacao','presencial','matutino','2026-2'),
('of-sp-03','sp-03','Direito','graduacao','presencial','diurno','2026-2'),
('of-sp-04','sp-04','Técnico em Desenvolvimento de Sistemas','tecnico','presencial','diurno','2026-2'),
('of-sp-05','sp-05','Ensino Fundamental','fundamental','presencial','diurno','2026-2'),

('of-se-01','se-01','Enfermagem','graduacao','presencial','integral','2026-2'),
('of-to-01','to-01','Administração','graduacao','presencial','noturno','2026-2')

ON CONFLICT (id) DO UPDATE SET
    instituicao_id = EXCLUDED.instituicao_id,
    curso_nome = EXCLUDED.curso_nome,
    nivel = EXCLUDED.nivel,
    modalidade = EXCLUDED.modalidade,
    turno = EXCLUDED.turno,
    periodo = EXCLUDED.periodo;

SELECT COUNT(*) AS total_instituicoes
FROM instituicoes;

SELECT COUNT(*) AS total_ofertas
FROM ofertas;

SELECT
    estado,
    COUNT(*) AS total
FROM instituicoes
GROUP BY estado
ORDER BY estado;