"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CinemaIcon } from "./CinemaIcon";
import { useScrollScene } from "./useScrollScene";
import { photoAlt } from "./photoAlt";

const stories = {
  possibilities: {
    label: "UM OLHAR MUDA TUDO",
    title: "Antes da escolha,",
    accent: "existe uma descoberta.",
    chapters: [
      {
        title: "Um lugar que faz sentido.",
        text: "Não é só sobre onde estudar. É sobre encontrar um ambiente que combina com seus planos, sua rotina e o que você quer construir.",
        image: "library",
        caption: "PERTENCER",
        icon: "pin",
        href: "/instituicoes",
        link: "Encontre o seu lugar",
      },
      {
        title: "Uma curiosidade que cresce.",
        text: "Uma pergunta pode virar interesse. Um interesse pode abrir uma profissão. Conheça as áreas que despertam a sua vontade de aprender.",
        image: "classroom",
        caption: "DESCOBRIR",
        icon: "book",
        href: "/cursos",
        link: "Explore os cursos",
      },
      {
        title: "Uma escolha com a sua cara.",
        text: "Olhe de perto. Compare o que importa. O próximo capítulo fica mais claro quando você conhece suas possibilidades.",
        image: "future",
        caption: "TRANSFORMAR",
        icon: "compare",
        href: "/comparar",
        link: "Compare possibilidades",
      },
    ],
  },
  guide: {
    label: "PASSO A PASSO, NO SEU RITMO",
    title: "Da primeira pesquisa",
    accent: "à sua próxima conquista.",
    chapters: [
      {
        title: "Pesquise",
        text: "Encontre instituições por nome, cidade, estado, rede, tipo, preço e modalidade. A sua busca começa pelo que importa para você.",
        image: "library",
        caption: "ENCONTRE SEU LUGAR",
        icon: "search",
        href: "/instituicoes",
        link: "Começar a pesquisa",
      },
      {
        title: "Entenda",
        text: "Abra uma instituição ou curso para conhecer duração, disciplinas e possibilidades antes de tomar uma decisão.",
        image: "classroom",
        caption: "AMPLIE SEU OLHAR",
        icon: "book",
        href: "/cursos",
        link: "Conhecer os cursos",
      },
      {
        title: "Compare",
        text: "Escolha até quatro instituições e veja localização, conceito MEC e investimento lado a lado. Cada detalhe ajuda a enxergar melhor.",
        image: "students",
        caption: "GANHE PERSPECTIVA",
        icon: "compare",
        href: "/comparar",
        link: "Abrir o comparador",
      },
      {
        title: "Favorite",
        text: "Salve suas opções na conta e encontre tudo novamente no seu perfil. Mantenha por perto os lugares que chamaram sua atenção.",
        image: "library",
        caption: "GUARDE POSSIBILIDADES",
        icon: "heart",
        href: "/perfil",
        link: "Acessar meu perfil",
      },
      {
        title: "Organize",
        text: "Envie documentos para manter sua jornada organizada. Reúna o que você precisa para continuar sua pesquisa com tranquilidade.",
        image: "classroom",
        caption: "PREPARE O PRÓXIMO PASSO",
        icon: "check",
        href: "/perfil",
        link: "Organizar minha jornada",
      },
      {
        title: "Decida",
        text: "Com informações reunidas em um só lugar, você ganha clareza para escolher o próximo passo. O futuro começa com uma escolha sua.",
        image: "future",
        caption: "COMECE UM NOVO CAPÍTULO",
        icon: "check",
        href: "/instituicoes",
        link: "Explorar possibilidades",
      },
    ],
  },
  purpose: {
    label: "O PROPÓSITO POR TRÁS DA EXPERIÊNCIA",
    title: "Ideias que conectam.",
    accent: "Escolhas que transformam.",
    chapters: [
      {
        title: "Começa com as pessoas.",
        text: "Pesquisar o futuro pode parecer complicado. A BIJK parte dessa experiência para criar caminhos mais claros entre estudantes, famílias e instituições.",
        image: "students",
        caption: "PESSOAS NO CENTRO",
        icon: "heart",
        href: "/como-funciona",
        link: "Conheça a experiência",
      },
      {
        title: "Ganha forma na tecnologia.",
        text: "Informações, comparação e organização se encontram em uma interface pensada para simplificar decisões do dia a dia.",
        image: "classroom",
        caption: "TECNOLOGIA COM PROPÓSITO",
        icon: "globe",
        href: "/cursos",
        link: "Descubra os caminhos",
      },
      {
        title: "Continua na sua história.",
        text: "O Matriculou aproxima você das suas possibilidades. Cada pesquisa é uma oportunidade de encontrar um próximo passo que faça sentido.",
        image: "future",
        caption: "UM FUTURO DE POSSIBILIDADES",
        icon: "arrow",
        href: "/instituicoes",
        link: "Encontre seu próximo passo",
      },
    ],
  },
};

export default function ScrollStory({
  variant,
}: {
  variant: keyof typeof stories;
}) {
  const story = stories[variant];
  const [active, setActive] = useState(0);
  const { ref, motion } = useScrollScene<HTMLElement>(
    (gsap, ScrollTrigger, element) => {
      const items = Array.from(
        element.querySelectorAll<HTMLElement>(".scrollStoryChapter"),
      );
      let current = -1;
      const syncChapter = () => {
        let next = 0;
        items.forEach((item, index) => {
          if (item.getBoundingClientRect().top <= innerHeight * 0.58)
            next = index;
        });
        if (next !== current) {
          current = next;
          setActive(next);
        }
      };
      ScrollTrigger.create({
        trigger: element.querySelector(".scrollStoryGrid"),
        start: "top bottom",
        end: "bottom top",
        onUpdate: syncChapter,
        onRefresh: syncChapter,
      });
      syncChapter();
      items.forEach((item) => {
        gsap.fromTo(
          item.querySelector(".scrollStoryRule > i"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              end: "bottom 60%",
              scrub: 0.4,
            },
          },
        );
      });
      gsap.fromTo(
        ".scrollStoryMeter > i",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: element.querySelector(".scrollStoryGrid"),
            start: "top 35%",
            end: "bottom 65%",
            scrub: 0.5,
          },
        },
      );
      const media = gsap.matchMedia();
      media.add("(min-width: 800px) and (min-height: 700px)", () => {
        gsap.fromTo(
          ".scrollStoryImages",
          { scale: 1.07, yPercent: -3 },
          {
            scale: 1,
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });
      return () => media.revert();
    },
  );

  return (
    <section
      ref={ref}
      className={`scrollStory scrollStory-${variant} ${motion ? "isMotion" : ""}`}
      aria-label={story.label}
    >
      <div className="scrollStoryHeading" data-cinema-reveal>
        <span className="filmSectionLabel">
          <i />
          {story.label}
        </span>
        <h2>
          {story.title}
          <br />
          <em>{story.accent}</em>
        </h2>
        <span className="scrollStoryHint">
          <CinemaIcon name="down" size={15} />
          Uma história para descobrir ao rolar
        </span>
      </div>
      <div className="scrollStoryGrid">
        <div className="scrollStoryVisual" aria-hidden="true">
          <div className="scrollStoryImages">
            {story.chapters.map((chapter, index) => (
              <div
                className={`scrollStoryImage ${active === index ? "isActive" : ""}`}
                key={index}
              >
                <Image
                  src={`/images/cinema/${chapter.image}.jpg`}
                  alt={photoAlt[chapter.image]}
                  fill
                  sizes="(max-width: 799px) 90vw, 43vw"
                />
              </div>
            ))}
          </div>
          <div className="scrollStoryShade" />
          <span className="scrollStoryViewfinder" />
          <span className="scrollStoryVisualTop">
            MATRICULOU <i /> HISTÓRIAS EM CONSTRUÇÃO
          </span>
          <span className="scrollStoryVisualWord" key={active}>
            {story.chapters[active].caption}
          </span>
          <div className="scrollStoryVisualBottom">
            <CinemaIcon name={story.chapters[active].icon} size={29} />
            <span>
              UM NOVO OLHAR
              <br />
              <b>
                0{active + 1} <small>/ 0{story.chapters.length}</small>
              </b>
            </span>
          </div>
          <div className="scrollStoryMeter">
            <i />
          </div>
        </div>
        <div className="scrollStoryChapters">
          {story.chapters.map((chapter, index) => (
            <article
              className={`scrollStoryChapter ${active === index ? "isActive" : ""}`}
              id={`story-${variant}-${index}`}
              key={chapter.title}
              aria-current={motion && active === index ? "step" : undefined}
            >
              <div className="scrollStoryRule">
                <i />
              </div>
              <span className="scrollStoryIndex">
                0{index + 1}
                <CinemaIcon name={chapter.icon} size={20} />
              </span>
              <h3>{chapter.title}</h3>
              <p>{chapter.text}</p>
              <Link href={chapter.href} className="filmTextLink">
                {chapter.link}
                <CinemaIcon name="diagonal" size={17} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
