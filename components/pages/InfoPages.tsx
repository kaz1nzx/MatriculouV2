"use client";

import Link from "next/link";
import ScrollStory from "../cinema/ScrollStory";
import { Icon } from "../ui";

const steps = [
  {
    icon: "search",
    title: "Pesquise",
    text: "Filtre instituições por estado, rede, curso, modalidade e mensalidade. Os filtros ficam no link, prontos para compartilhar.",
  },
  {
    icon: "book",
    title: "Entenda os cursos",
    text: "Veja duração, carga horária oficial, registro profissional, disciplinas, carreiras e onde cada curso é oferecido.",
  },
  {
    icon: "compare",
    title: "Compare com inteligência",
    text: "Escolha até quatro opções e diga o que importa. O Matriculou aponta o melhor em cada critério e recomenda a mais equilibrada.",
  },
  {
    icon: "send",
    title: "Candidate-se",
    text: "Envie seus dados de contato à instituição com um toque, acompanhe o status e converse com ela pelo perfil.",
  },
];

export function HowItWorksPage() {
  return (
    <main className="page" id="conteudo">
      <header className="pageHeader container">
        <span className="eyebrow">Como funciona</span>
        <h1>Da dúvida à decisão, em quatro passos.</h1>
        <p>
          O Matriculou organiza informações públicas e dados enviados pelas
          próprias instituições para você escolher com segurança.
        </p>
      </header>
      <ol className="container stepGrid">
        {steps.map((step, index) => (
          <li key={step.title} data-cinema-reveal>
            <span className="stepNumber">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Icon name={step.icon} size={24} />
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <ScrollStory variant="guide" />
      <section className="container ctaBand">
        <div>
          <h2>Para instituições e redes de ensino</h2>
          <p>
            Mantenha dados, cursos e mensalidades atualizados, publique
            comunicados e receba candidaturas com o painel gratuito.
          </p>
        </div>
        <Link href="/admin" className="btn primary">
          Conhecer o painel <Icon name="arrow" size={16} />
        </Link>
      </section>
    </main>
  );
}

export function AboutPage() {
  return (
    <main className="page" id="conteudo">
      <section className="container aboutIntro">
        <div>
          <span className="eyebrow">Sobre a BIJK</span>
          <h1>Tecnologia para decisões que mudam vidas.</h1>
          <p>
            A <b>BIJK</b> é uma startup de desenvolvimento que cria produtos
            digitais simples e úteis. O Matriculou nasceu da ideia de que
            escolher onde estudar não deveria exigir dezenas de abas abertas e
            planilhas improvisadas.
          </p>
          <p>
            Reunimos o catálogo, a comparação, as candidaturas e a conversa com
            as instituições em um só lugar, com dados de referência
            transparentes e respeito à privacidade de quem usa.
          </p>
        </div>
        <div className="aboutLogoCard">
          <img
            src="/images/bijk-logo.png"
            alt="BIJK"
            width={280}
            height={280}
          />
        </div>
      </section>
      <ul className="container valueGrid">
        <li>
          <Icon name="shield" size={22} />
          <h2>Transparência</h2>
          <p>
            Mostramos a origem de cada dado e nunca inventamos notas, avaliações
            ou valores.
          </p>
        </li>
        <li>
          <Icon name="lock" size={22} />
          <h2>Privacidade</h2>
          <p>
            Seus dados só chegam a uma instituição quando você decide se
            candidatar.
          </p>
        </li>
        <li>
          <Icon name="users" size={22} />
          <h2>Acessibilidade</h2>
          <p>
            Navegação por teclado, leitores de tela, contraste alto e movimento
            reduzido.
          </p>
        </li>
      </ul>
    </main>
  );
}
