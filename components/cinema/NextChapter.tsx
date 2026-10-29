"use client";

import Link from "next/link";
import { CinemaIcon } from "./CinemaIcon";
import { useScrollScene } from "./useScrollScene";

const chapters: Record<
  string,
  { title: string; text: string; href: string; label: string }
> = {
  instituicoes: {
    title: "Um lugar. Muitos caminhos.",
    text: "Agora, descubra os cursos que podem fazer parte da sua história.",
    href: "/cursos",
    label: "Explorar cursos",
  },
  cursos: {
    title: "Conhecer muda a escolha.",
    text: "Coloque suas instituições favoritas lado a lado e amplie sua perspectiva.",
    href: "/comparar",
    label: "Comparar instituições",
  },
  comparar: {
    title: "O próximo passo tem o seu nome.",
    text: "Continue sua pesquisa e encontre as possibilidades que combinam com você.",
    href: "/instituicoes",
    label: "Conhecer instituições",
  },
  como: {
    title: "A sua história começa agora.",
    text: "Uma pesquisa pode abrir um mundo de possibilidades.",
    href: "/instituicoes",
    label: "Começar a explorar",
  },
  sobre: {
    title: "Feito para o que vem depois.",
    text: "Conheça os caminhos que o Matriculou ajuda você a descobrir.",
    href: "/instituicoes",
    label: "Descobrir possibilidades",
  },
  perfil: {
    title: "Seus planos continuam por aqui.",
    text: "Encontre mais possibilidades para a sua jornada.",
    href: "/instituicoes",
    label: "Continuar explorando",
  },
};

export default function NextChapter({ view }: { view: string }) {
  const chapter = chapters[view];
  const { ref } = useScrollScene<HTMLElement>((gsap, _scroll, element) => {
    gsap.fromTo(
      ".nextChapterLine",
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top 95%",
          end: "top 40%",
          scrub: 0.5,
        },
      },
    );
    gsap.fromTo(
      ".nextChapterOrbit",
      { rotate: -30, scale: 0.8 },
      {
        rotate: 40,
        scale: 1.05,
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
  if (!chapter) return null;
  return (
    <aside
      ref={ref}
      className="nextChapter"
      aria-label="Continue a sua história"
    >
      <div className="nextChapterLine" />
      <div className="nextChapterOrbit" aria-hidden="true">
        <i />
        <i />
        <CinemaIcon name="arrow" size={44} />
      </div>
      <div data-cinema-reveal>
        <span className="filmSectionLabel">
          <i />
          Próximo passo
        </span>
        <h2>{chapter.title}</h2>
        <p>{chapter.text}</p>
        <Link href={chapter.href} className="btn primary" data-magnetic>
          {chapter.label}
          <CinemaIcon name="diagonal" size={18} />
        </Link>
      </div>
    </aside>
  );
}
