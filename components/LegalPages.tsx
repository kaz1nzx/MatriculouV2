"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { browserStorage, legal, legalLinks, requestTypes } from "../lib/legal";
import { useApp } from "./app/AppProvider";
import { clean, guard } from "../lib/sanitize";
import { openConsentPreferences } from "../lib/consent";

export type LegalView =
  | "privacidade"
  | "termos-uso"
  | "termos-servico"
  | "cookies"
  | "lgpd";

const hrefByView: Record<LegalView, string> = {
  privacidade: "/privacidade",
  "termos-uso": "/termos-de-uso",
  "termos-servico": "/termos-de-servico",
  cookies: "/cookies",
  lgpd: "/lgpd",
};

function Controller() {
  return (
    <>
      <b>{legal.controller}</b>
      {legal.document && <>, inscrita sob o nº {legal.document}</>}
      {legal.address && <>, com endereço em {legal.address}</>}
    </>
  );
}

function Contact() {
  return legal.email ? (
    <>
      pelo e-mail <a href={`mailto:${legal.email}`}>{legal.email}</a> ou pelo{" "}
      <Link href="/lgpd">formulário de solicitações LGPD</Link>
    </>
  ) : (
    <>
      pelo <Link href="/lgpd">formulário de solicitações LGPD</Link>
    </>
  );
}

function LegalShell({
  view,
  eyebrow,
  title,
  intro,
  children,
}: {
  view: LegalView;
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="legalPage" id="conteudo">
      <header className="legalHero">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <small>
          Versão {legal.version} · Atualizado em {legal.updated}
        </small>
      </header>
      <div className="legalLayout">
        <nav className="legalNav" aria-label="Documentos legais">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={hrefByView[view] === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <article className="legalBody">{children}</article>
      </div>
    </main>
  );
}

function Privacy() {
  return (
    <LegalShell
      view="privacidade"
      eyebrow="Privacidade"
      title="Política de Privacidade"
      intro="Como o Matriculou coleta, usa, guarda e protege os seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)."
    >
      <section>
        <h2>1. Quem é o controlador</h2>
        <p>
          O controlador dos dados pessoais tratados no Matriculou é{" "}
          <Controller />. Dúvidas sobre esta Política e pedidos sobre os seus
          dados podem ser enviados <Contact />.
        </p>
        <p>
          Encarregado pelo tratamento de dados pessoais (DPO):{" "}
          {legal.dpo ? <b>{legal.dpo}</b> : "contato pelo mesmo canal acima"}.
        </p>
      </section>
      <section>
        <h2>2. Quais dados tratamos</h2>
        <ul>
          <li>
            <b>Dados de cadastro:</b> nome completo, e-mail e senha. A senha é
            armazenada de forma criptografada pelo provedor de autenticação; nós
            não temos acesso a ela.
          </li>
          <li>
            <b>Dados de perfil:</b> foto, telefone, cidade e estado, data de
            nascimento, escolaridade, áreas de interesse e uma breve
            apresentação, todos opcionais e preenchidos por você.
          </li>
          <li>
            <b>Documentos:</b> nome e imagem dos documentos que você decidir
            guardar na área “Documentos”. Documentos de identificação podem
            conter foto, número de registro e outros dados pessoais. Envie
            apenas o necessário.
          </li>
          <li>
            <b>Preferências de uso:</b> instituições favoritas, itens escolhidos
            no comparador e preferência de avisos por e-mail.
          </li>
          <li>
            <b>Candidaturas e mensagens:</b> quando você toca em “Tenho
            interesse”, guardamos o curso escolhido, seu nome, e-mail, telefone
            e mensagem, além das mensagens trocadas com a instituição.
          </li>
          <li>
            <b>Chamados de suporte:</b> nome, e-mail e o conteúdo do chamado.
          </li>
          <li>
            <b>Equipes de instituições:</b> para quem gerencia uma instituição,
            o cargo informado no pedido de acesso e o registro das alterações
            feitas no painel.
          </li>
          <li>
            <b>Registro de aceite:</b> data e versão dos Termos e desta Política
            aceitos no cadastro.
          </li>
          <li>
            <b>Solicitações LGPD:</b> nome, e-mail e o conteúdo do seu pedido.
          </li>
          <li>
            <b>Dados técnicos:</b> endereço IP, data e hora de acesso e
            informações do navegador, registrados pelos provedores de hospedagem
            e de banco de dados para segurança e cumprimento do Marco Civil da
            Internet (Lei nº 12.965/2014).
          </li>
        </ul>
        <p>
          O assistente Mia funciona apenas no seu navegador e não envia a
          conversa para nossos servidores ou para serviços de inteligência
          artificial. Mesmo assim, não digite dados pessoais na conversa.
        </p>
        <p>
          Não coletamos dados pessoais sensíveis de forma intencional. Não
          usamos seus dados para decisões automatizadas, publicidade direcionada
          ou venda a terceiros.
        </p>
      </section>
      <section>
        <h2>3. Para que usamos e com qual base legal</h2>
        <div
          className="legalTable"
          role="region"
          aria-label="Finalidades e bases legais"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Finalidade</th>
                <th>Dados</th>
                <th>Base legal (LGPD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Criar e manter sua conta, favoritos e perfil</td>
                <td>Cadastro, preferências</td>
                <td>Execução de contrato (art. 7º, V)</td>
              </tr>
              <tr>
                <td>Guardar sua foto e seus documentos</td>
                <td>Foto, documentos</td>
                <td>
                  Consentimento (art. 7º, I), revogável a qualquer momento
                </td>
              </tr>
              <tr>
                <td>Enviar sua candidatura à instituição escolhida</td>
                <td>Nome, e-mail, telefone, curso, mensagens</td>
                <td>Consentimento (art. 7º, I), dado a cada candidatura</td>
              </tr>
              <tr>
                <td>Responder chamados de suporte</td>
                <td>Dados do chamado</td>
                <td>Execução de contrato (art. 7º, V)</td>
              </tr>
              <tr>
                <td>Registrar alterações feitas por equipes de instituições</td>
                <td>Autor, data e campos alterados</td>
                <td>
                  Legítimo interesse (art. 7º, IX), para segurança e prestação
                  de contas
                </td>
              </tr>
              <tr>
                <td>Registrar o aceite dos termos</td>
                <td>Data e versão do aceite</td>
                <td>Exercício regular de direitos (art. 7º, VI)</td>
              </tr>
              <tr>
                <td>Responder solicitações de titulares</td>
                <td>Dados da solicitação</td>
                <td>Cumprimento de obrigação legal (art. 7º, II)</td>
              </tr>
              <tr>
                <td>Guardar registros de acesso</td>
                <td>Dados técnicos</td>
                <td>Obrigação legal (art. 7º, II, e art. 15 do Marco Civil)</td>
              </tr>
              <tr>
                <td>Prevenir fraudes e proteger a plataforma</td>
                <td>Dados técnicos, cadastro</td>
                <td>Legítimo interesse (art. 7º, IX)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>4. Com quem compartilhamos</h2>
        <p>
          Compartilhamos dados apenas com operadores que nos ajudam a prestar o
          serviço, sob contrato e na medida do necessário:
        </p>
        <ul>
          <li>
            <b>Supabase</b> — banco de dados, autenticação e armazenamento de
            arquivos.
          </li>
          <li>
            <b>Provedor de hospedagem do site</b> — entrega das páginas e
            registros técnicos de acesso.
          </li>
        </ul>
        <p>
          Também podemos compartilhar dados quando houver ordem judicial ou
          requisição de autoridade competente.{" "}
          <b>
            Uma instituição só recebe seus dados quando você envia uma
            candidatura a ela
          </b>
          , e recebe apenas o que está na candidatura: nome, e-mail, telefone,
          curso e mensagem. Ela vê quantas pessoas favoritaram sua página, nunca
          quem. Documentos e perfil completo nunca são compartilhados. O
          Matriculou não realiza matrículas.
        </p>
      </section>
      <section>
        <h2>5. Transferência internacional</h2>
        <p>
          Os servidores dos nossos operadores podem estar fora do Brasil. Nesses
          casos, a transferência segue o art. 33 da LGPD, com cláusulas
          contratuais e garantias de proteção compatíveis com a lei brasileira.
        </p>
      </section>
      <section>
        <h2>6. Por quanto tempo guardamos</h2>
        <ul>
          <li>
            Dados da conta, favoritos, foto, documentos, candidaturas e
            mensagens: enquanto a conta existir. Ao excluir a conta, são
            apagados imediatamente. Se a instituição já tiver exportado sua
            candidatura, ela passa a responder por essa cópia.
          </li>
          <li>Chamados de suporte: até 2 anos após a resposta.</li>
          <li>
            Registros de acesso: no mínimo 6 meses, conforme o art. 15 do Marco
            Civil da Internet.
          </li>
          <li>Solicitações LGPD: até 5 anos, para comprovar o atendimento.</li>
          <li>
            Dados no navegador: a sessão de login e o comparador ficam até você
            sair ou removê-los; os demais somem ao fechar a aba. Veja a{" "}
            <Link href="/cookies">Política de Cookies</Link>.
          </li>
        </ul>
      </section>
      <section>
        <h2>7. Seus direitos</h2>
        <p>
          Pelo art. 18 da LGPD, você pode, a qualquer momento: confirmar se
          tratamos seus dados; acessá-los; corrigir dados incompletos ou
          desatualizados; pedir anonimização, bloqueio ou eliminação de dados
          desnecessários ou excessivos; pedir a portabilidade; eliminar dados
          tratados com consentimento; saber com quem compartilhamos seus dados;
          ser informado sobre a possibilidade de não consentir; e revogar o
          consentimento.
        </p>
        <p>
          No seu <Link href="/perfil">perfil</Link> você pode corrigir seus
          dados, baixar uma cópia de tudo, apagar documentos, cancelar
          candidaturas e excluir a conta. Para outros pedidos, use o{" "}
          <Link href="/lgpd">formulário LGPD</Link>. Responderemos em até 15
          dias. Você também pode apresentar reclamação à Autoridade Nacional de
          Proteção de Dados (ANPD), em{" "}
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noopener noreferrer"
          >
            gov.br/anpd
          </a>
          .
        </p>
      </section>
      <section>
        <h2>8. Segurança</h2>
        <p>
          Usamos conexão criptografada (HTTPS), controle de acesso no banco de
          dados (cada pessoa e cada instituição só alcança os próprios
          registros), registro de auditoria das ações das equipes e
          armazenamento privado para documentos, acessíveis somente por links
          temporários gerados para o titular. Nenhum sistema é totalmente imune
          a falhas. Se ocorrer um incidente de segurança que possa trazer risco
          ou dano relevante, comunicaremos os titulares afetados e a ANPD,
          conforme o art. 48 da LGPD.
        </p>
      </section>
      <section>
        <h2>9. Crianças e adolescentes</h2>
        <p>
          O cadastro é destinado a maiores de 18 anos. Adolescentes só podem se
          cadastrar com o consentimento e o acompanhamento do pai, da mãe ou do
          responsável legal, conforme o art. 14 da LGPD. Não aceitamos cadastro
          de crianças menores de 12 anos. Se você é responsável legal e acredita
          que um menor se cadastrou sem autorização, fale conosco <Contact />{" "}
          para que os dados sejam excluídos.
        </p>
      </section>
      <section>
        <h2>10. Alterações</h2>
        <p>
          Podemos atualizar esta Política. A versão e a data ficam no topo da
          página. Se a mudança for relevante, avisaremos pelo site ou por e-mail
          antes de ela valer.
        </p>
      </section>
    </LegalShell>
  );
}

function TermsOfUse() {
  return (
    <LegalShell
      view="termos-uso"
      eyebrow="Termos"
      title="Termos de Uso"
      intro="Regras para navegar no Matriculou e usar as informações do catálogo. Ao usar o site, você concorda com estes termos."
    >
      <section>
        <h2>1. O que é o Matriculou</h2>
        <p>
          O Matriculou é uma plataforma informativa, oferecida por{" "}
          <Controller />, que ajuda estudantes e famílias a pesquisar e comparar
          instituições e cursos.{" "}
          <b>
            O Matriculou não é uma instituição de ensino, não realiza
            matrículas, não vende vagas e não concede bolsas.
          </b>{" "}
          A inscrição, a matrícula e qualquer pagamento são feitos diretamente
          com cada instituição.
        </p>
      </section>
      <section>
        <h2>2. Informações do catálogo</h2>
        <p>
          As mensalidades, bolsas, modalidades, conceitos do MEC, grades e
          durações exibidos são <b>referências</b> reunidas de fontes públicas e
          podem estar desatualizados ou variar por campus, curso, turno e
          processo seletivo. Antes de qualquer decisão, confirme as informações
          diretamente com a instituição e no cadastro oficial do MEC, o{" "}
          <a
            href="https://emec.mec.gov.br"
            target="_blank"
            rel="noopener noreferrer"
          >
            e-MEC
          </a>
          .
        </p>
        <p>
          O Matriculou não publica avaliações de usuários. Não exibimos notas,
          comentários ou depoimentos que não tenham sido enviados por pessoas
          reais.
        </p>
        <p>
          Encontrou uma informação errada? Avise pela{" "}
          <Link href="/ajuda">Central de ajuda</Link> e faremos a correção.
        </p>
      </section>
      <section>
        <h2>3. Sem vínculo com as instituições</h2>
        <p>
          A presença de uma instituição no catálogo não significa parceria,
          patrocínio ou recomendação. Os nomes e as marcas pertencem aos seus
          titulares e são usados apenas para identificação. Instituições que
          quiserem corrigir ou retirar suas informações podem entrar em contato{" "}
          <Contact />.
        </p>
      </section>
      <section>
        <h2>4. Assistente Mia</h2>
        <p>
          A Mia é um guia automático que responde a partir de regras e do
          catálogo. Ela não é uma pessoa, não é orientação vocacional
          profissional e pode errar. Use as respostas como ponto de partida.
        </p>
      </section>
      <section>
        <h2>5. Uso permitido</h2>
        <p>Você concorda em não:</p>
        <ul>
          <li>
            usar robôs ou scripts para copiar o conteúdo em massa ou
            sobrecarregar o site;
          </li>
          <li>tentar acessar contas, arquivos ou áreas de outras pessoas;</li>
          <li>
            enviar arquivos com vírus, conteúdo ilícito ou documentos de
            terceiros sem autorização;
          </li>
          <li>
            usar o site para fins ilegais ou que violem direitos de terceiros.
          </li>
        </ul>
      </section>
      <section>
        <h2>6. Propriedade intelectual</h2>
        <p>
          A marca Matriculou, o design, os textos e o código do site pertencem à{" "}
          {legal.controller} ou a seus licenciantes. As fotografias editoriais
          são licenciadas pelo Pexels. As fotos das instituições vêm do
          Wikimedia Commons, sob licenças livres (Creative Commons ou domínio
          público), com autor e licença indicados junto a cada foto. Quando não
          há foto livre de uma instituição, exibimos uma imagem ilustrativa de
          um ambiente de ensino, sempre identificada como tal. É proibido
          reproduzir o conteúdo para fins comerciais sem autorização.
        </p>
      </section>
      <section>
        <h2>7. Responsabilidade</h2>
        <p>
          Trabalhamos para manter o site disponível e as informações corretas,
          mas não garantimos funcionamento ininterrupto. Não nos
          responsabilizamos por decisões tomadas apenas com base nas informações
          de referência do catálogo, nem por conteúdo de sites externos. Nada
          nestes termos afasta os direitos garantidos pelo Código de Defesa do
          Consumidor.
        </p>
      </section>
      <section>
        <h2>8. Alterações e lei aplicável</h2>
        <p>
          Estes termos podem ser atualizados; a versão vigente fica sempre nesta
          página. Aplicam-se as leis brasileiras. Eventuais conflitos podem ser
          resolvidos no foro do domicílio do usuário consumidor.
        </p>
        <p>
          O uso da conta também segue os{" "}
          <Link href="/termos-de-servico">Termos de Serviço</Link>, e o
          tratamento de dados segue a{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>
      </section>
    </LegalShell>
  );
}

function TermsOfService() {
  return (
    <LegalShell
      view="termos-servico"
      eyebrow="Termos"
      title="Termos de Serviço"
      intro="Condições para criar e usar uma conta no Matriculou, incluindo favoritos, documentos, candidaturas e o painel das instituições."
    >
      <section>
        <h2>1. Serviço oferecido</h2>
        <p>
          A conta gratuita permite salvar instituições favoritas, completar um
          perfil, guardar documentos, enviar candidaturas e conversar com as
          instituições. O serviço é prestado por <Controller />. Não há
          cobrança, plano pago ou intermediação de matrícula.
        </p>
      </section>
      <section>
        <h2>2. Cadastro</h2>
        <ul>
          <li>
            O cadastro é destinado a maiores de 18 anos. Adolescentes podem se
            cadastrar apenas com o consentimento do responsável legal. Menores
            de 12 anos não podem criar conta.
          </li>
          <li>
            Você deve informar dados verdadeiros e manter seu e-mail atualizado.
          </li>
          <li>
            A senha é pessoal. Não a compartilhe; avise-nos se suspeitar de uso
            indevido.
          </li>
          <li>
            A sessão fica salva neste navegador até você sair. Em aparelhos
            compartilhados, use “Sair” ao terminar; em Configurações você
            encerra o acesso em outros aparelhos.
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Área de documentos</h2>
        <ul>
          <li>
            Os documentos são privados: ficam em armazenamento restrito e só
            você pode abri-los, por links temporários.
          </li>
          <li>
            Envie apenas documentos seus ou de quem você representa legalmente.
          </li>
          <li>
            O envio depende do seu consentimento, que pode ser revogado apagando
            os documentos ou excluindo a conta.
          </li>
          <li>
            O Matriculou não envia documentos às instituições e não valida a
            autenticidade deles.
          </li>
          <li>
            Formatos aceitos: PDF, JPG, PNG e WEBP, com até 10 MB por arquivo. A
            foto de perfil aceita até 2 MB.
          </li>
        </ul>
      </section>
      <section>
        <h2>4. Candidaturas e painel das instituições</h2>
        <ul>
          <li>
            A candidatura é uma manifestação de interesse: a instituição conduz
            o processo seletivo e a matrícula, sem participação do Matriculou.
          </li>
          <li>
            Instituições acessam o painel apenas após a verificação do vínculo.
            Cada equipe responde pelas informações que publica e deve usar os
            dados de candidatos só para o processo de admissão.
          </li>
          <li>
            Nome, localização, rede e conceito MEC são conferidos pela equipe do
            Matriculou e não podem ser alterados pela própria instituição.
          </li>
        </ul>
      </section>
      <section>
        <h2>5. Encerramento da conta</h2>
        <p>
          Você pode excluir sua conta a qualquer momento no seu{" "}
          <Link href="/perfil">perfil</Link>. A exclusão apaga cadastro,
          favoritos, foto, documentos e candidaturas e não pode ser desfeita.
          Podemos suspender contas que violem os{" "}
          <Link href="/termos-de-uso">Termos de Uso</Link>, com aviso prévio
          sempre que possível.
        </p>
      </section>
      <section>
        <h2>6. Disponibilidade</h2>
        <p>
          O serviço é gratuito e pode passar por manutenções ou mudanças. Se for
          descontinuado, avisaremos com pelo menos 30 dias de antecedência para
          que você baixe seus dados.
        </p>
      </section>
      <section>
        <h2>7. Contato</h2>
        <p>
          Dúvidas sobre a conta ou estes termos podem ser enviadas <Contact />.
        </p>
      </section>
    </LegalShell>
  );
}

function Cookies() {
  return (
    <LegalShell
      view="cookies"
      eyebrow="Cookies"
      title="Política de Cookies"
      intro="O que o Matriculou guarda no seu navegador e por quê."
    >
      <section>
        <h2>1. Resumo</h2>
        <p>
          <b>
            O Matriculou não usa cookies de publicidade, de análise ou de redes
            sociais.
          </b>{" "}
          Não há rastreamento entre sites. Usamos apenas armazenamento local
          estritamente necessário para que as funções que você escolhe usar
          funcionem.
        </p>
      </section>
      <section>
        <h2>2. O que guardamos no seu navegador</h2>
        <div
          className="legalTable"
          role="region"
          aria-label="Itens guardados no navegador"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Finalidade</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              {browserStorage.map((item) => (
                <tr key={item.key}>
                  <td>
                    <code>{item.key}</code>
                  </td>
                  <td>{item.where}</td>
                  <td>{item.purpose}</td>
                  <td>{item.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          A sessão de login (<code>matriculou-sessao</code>) é estritamente
          necessária para manter você conectado e é apagada quando você sai da
          conta.
        </p>
      </section>
      <section>
        <h2>3. Base legal</h2>
        <p>
          Por serem estritamente necessários ao funcionamento solicitado por
          você, esses itens não dependem de consentimento. Cookies analíticos e
          de marketing só são ativados se você permitir no aviso de cookies, e a
          escolha pode ser revista a qualquer momento.
        </p>
        <p>
          <button
            type="button"
            className="legalInlineButton"
            onClick={openConsentPreferences}
          >
            Rever minhas preferências de cookies
          </button>
        </p>
      </section>
      <section>
        <h2>4. Como apagar</h2>
        <p>
          Você pode apagar esses dados nas configurações do navegador, em
          “Privacidade” ou “Dados de sites”. Os itens de sessionStorage somem
          sozinhos ao fechar a aba; os de localStorage ficam até você sair da
          conta ou apagá-los.
        </p>
      </section>
    </LegalShell>
  );
}

function LgpdRequest({ user }: { user: ReturnType<typeof useApp>["user"] }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [type, setType] = useState<string>(requestTypes[0].value);
  const [details, setDetails] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    setStatus("sending");
    setError("");
    const { error: insertError } = await supabase
      .from("solicitacoes_lgpd")
      .insert({
        user_id: user?.id ?? null,
        nome: clean(name),
        email: clean(email),
        tipo: type,
        detalhes: clean(details, true) || null,
      });
    if (insertError) {
      setStatus("error");
      setError(
        "Não foi possível registrar sua solicitação agora. Tente novamente em instantes.",
      );
      return;
    }
    setStatus("sent");
  };

  return (
    <LegalShell
      view="lgpd"
      eyebrow="LGPD"
      title="Seus direitos sobre seus dados"
      intro="Use este formulário para exercer os direitos previstos no art. 18 da LGPD. Responderemos no e-mail informado em até 15 dias."
    >
      <section>
        <h2>Resolva agora pelo seu perfil</h2>
        <p>
          Com a conta aberta, você pode fazer sozinho, sem esperar: corrigir
          seus dados, baixar uma cópia de tudo (portabilidade), apagar
          documentos, cancelar candidaturas e excluir a conta.{" "}
          <Link href="/perfil?secao=privacidade">
            Abrir Privacidade e dados
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>Formulário de solicitação</h2>
        {status === "sent" ? (
          <div className="legalSuccess" role="status">
            <b>Solicitação registrada.</b>
            <p>
              Recebemos seu pedido e responderemos em {email} em até 15 dias.
              Podemos pedir uma confirmação de identidade antes de entregar ou
              apagar dados.
            </p>
          </div>
        ) : !isSupabaseConfigured ? (
          <p className="legalWarning" role="status">
            O envio pelo formulário está indisponível nesta demonstração.{" "}
            {legal.email ? (
              <>
                Envie seu pedido para{" "}
                <a href={`mailto:${legal.email}`}>{legal.email}</a>.
              </>
            ) : null}
          </p>
        ) : (
          <form className="legalForm" onSubmit={submit}>
            <label>
              Nome completo
              <input
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={name}
                onChange={guard("name", setName)}
              />
            </label>
            <label>
              E-mail para resposta
              <input
                required
                type="email"
                maxLength={160}
                autoComplete="email"
                value={email}
                onChange={guard("email", setEmail)}
              />
            </label>
            <label>
              O que você quer solicitar?
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {requestTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Detalhes (opcional)
              <textarea
                maxLength={2000}
                rows={5}
                value={details}
                onChange={guard("text", setDetails)}
                placeholder="Explique o seu pedido. Não envie documentos ou senhas por aqui."
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                required
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
              />
              <span>
                Declaro que sou o titular dos dados ou seu representante legal e
                concordo que os dados deste formulário sejam usados para
                responder ao pedido, conforme a{" "}
                <Link href="/privacidade">Política de Privacidade</Link>.
              </span>
            </label>
            {status === "error" && (
              <p className="legalWarning" role="alert">
                {error}
              </p>
            )}
            <button className="btn primary" disabled={status === "sending"}>
              {status === "sending" ? "Enviando..." : "Enviar solicitação"}
            </button>
          </form>
        )}
      </section>
      <section>
        <h2>Outros canais</h2>
        <p>
          Se preferir, fale conosco <Contact />. Você também pode reclamar à
          ANPD em{" "}
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noopener noreferrer"
          >
            gov.br/anpd
          </a>
          .
        </p>
      </section>
    </LegalShell>
  );
}

export default function LegalPage({ view }: { view: LegalView }) {
  const { user } = useApp();
  switch (view) {
    case "privacidade":
      return <Privacy />;
    case "termos-uso":
      return <TermsOfUse />;
    case "termos-servico":
      return <TermsOfService />;
    case "cookies":
      return <Cookies />;
    default:
      return <LgpdRequest key={user?.id || "visitante"} user={user} />;
  }
}
