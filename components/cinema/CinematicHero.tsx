"use client";
import Image from "next/image";
import { loadMotion } from "./loadMotion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CinemaIcon } from "./CinemaIcon";
import { useCinema } from "./CinemaProvider";
import { useFilmCarousel } from "./useFilmCarousel";
import FilmAtmosphere from "./FilmAtmosphere";
import { photoAlt } from "./photoAlt";

const scenes = [
  {
    image: "students",
    label: "Um novo começo",
    eyebrow: "Grandes histórias começam com uma escolha",
    title: ["Seu próximo", "capítulo", "começa aqui."],
    description:
      "Existe um lugar para quem você quer se tornar. Descubra instituições, explore cursos e encontre o seu caminho.",
    cta: "Explorar possibilidades",
    href: "/instituicoes",
  },
  {
    image: "campus",
    label: "Novos horizontes",
    eyebrow: "Um mundo inteiro para descobrir",
    title: ["Encontre", "onde você", "vai além."],
    description:
      "Cada instituição abre um novo horizonte. Conheça os lugares que podem fazer parte da sua história.",
    cta: "Conhecer instituições",
    href: "/instituicoes",
  },
  {
    image: "library",
    label: "Siga a curiosidade",
    eyebrow: "O conhecimento abre novos caminhos",
    title: ["Curiosidade.", "Que abre", "caminhos."],
    description:
      "Conheça áreas, disciplinas e oportunidades. Encontre um curso que combine com o que move você.",
    cta: "Descobrir cursos",
    href: "/cursos",
  },
  {
    image: "classroom",
    label: "Escolha com clareza",
    eyebrow: "Mais informação. Mais confiança.",
    title: ["Boas escolhas", "transformam", "o futuro."],
    description:
      "Compare localização, mensalidades e conceito MEC. Veja suas possibilidades com mais clareza antes de decidir.",
    cta: "Comparar instituições",
    href: "/comparar",
  },
  {
    image: "future",
    label: "A história é sua",
    eyebrow: "O próximo passo tem o seu nome",
    title: ["Imagine.", "Comece", "agora."],
    description:
      "Guarde suas favoritas, organize sua pesquisa e dê o primeiro passo em direção aos seus planos.",
    cta: "Começar minha jornada",
    href: "/cadastro",
  },
];

export default function CinematicHero({
  count,
  states,
}: {
  count: number;
  states: number;
}) {
  const { index, paused, setPaused, setFocused, goTo, root, bar, running } =
    useFilmCarousel(scenes.length);
  // Only the first scene competes for bandwidth at load; the rest arrive once the page is idle.
  const [allFrames, setAllFrames] = useState(false);
  useEffect(() => {
    const show = () => setAllFrames(true);
    if (document.readyState === "complete") {
      const t = setTimeout(show, 600);
      return () => clearTimeout(t);
    }
    addEventListener("load", show, { once: true });
    return () => removeEventListener("load", show);
  }, []);
  const { enabled, lite } = useCinema();
  const imageLayer = useRef<HTMLDivElement>(null),
    copy = useRef<HTMLDivElement>(null);
  const current = scenes[index];
  useEffect(() => {
    if (!enabled || lite) return;
    let cancelled = false,
      revert = () => {};
    loadMotion()
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(min-width: 800px)", () => {
          gsap.to(imageLayer.current, {
            yPercent: 15,
            scale: 1.035,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
          gsap.to(copy.current, {
            y: -35,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top -10%",
              end: "bottom 15%",
              scrub: 0.5,
            },
          });
        });
        revert = () => media.revert();
      })
      .catch(() => {
        /* Keep the still composition if animation cannot load. */
      });
    return () => {
      cancelled = true;
      revert();
    };
  }, [enabled, lite, root]);

  return (
    <section
      ref={root}
      id="cinema-inicio"
      className="filmHero"
      aria-roledescription="carrossel"
      aria-label="Descubra seu próximo capítulo"
      data-running={running}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="filmImages" ref={imageLayer} aria-hidden="true">
        {scenes.map((scene, i) => (
          <div
            key={scene.image}
            className={`filmFrame ${i === index ? "isActive" : ""} filmFrame-${scene.image}`}
          >
            {(i === 0 || i === index || allFrames) && (
              <Image
                src={`/images/cinema/${scene.image}.jpg`}
                alt={photoAlt[scene.image]}
                fill
                sizes="100vw"
                quality={75}
                priority={i === 0}
              />
            )}
          </div>
        ))}
      </div>
      <div className="filmShade" />
      <FilmAtmosphere />

      <div className="filmViewfinder" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="filmHeroInner">
        <div className="filmHeroTop">
          <span>
            <i /> MATRICULOU · UM MUNDO DE POSSIBILIDADES
          </span>
          <span className="filmSceneLabel">
            CENA 0{index + 1} <b>—</b> {current.label}
          </span>
        </div>
        <div className="filmHeroMain">
          <div className="filmHeroCopy" ref={copy}>
            <div className="filmEyebrow" key={`kicker-${index}`}>
              <span />
              {current.eyebrow}
            </div>
            <h1 key={`title-${index}`} className="filmTitle">
              {current.title.map((line, i) => (
                <span
                  className={`filmTitleMask ${i === 1 ? "filmTitleAccent" : ""}`}
                  key={line}
                >
                  <span style={{ animationDelay: `${i * 0.11}s` }}>
                    {line}
                    {i === 1 && (
                      <svg
                        className="filmUnderline"
                        viewBox="0 0 420 24"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path d="M4 17C110 1 270 0 416 11" />
                      </svg>
                    )}
                  </span>
                </span>
              ))}
            </h1>
            <p className="filmDescription" key={`description-${index}`}>
              {current.description}
            </p>
            <div className="filmHeroActions">
              <Link
                className="button gold filmPrimary"
                href={current.href}
                data-magnetic
              >
                {current.cta}
                <CinemaIcon name="diagonal" size={19} />
              </Link>
              <Link href="/como-funciona" className="filmSecondary">
                <span>
                  <CinemaIcon name="play" size={12} />
                </span>
                Conheça a experiência
              </Link>
            </div>
          </div>
          <div className="filmHeroEditorial">
            <span className="filmEditorialLine" />
            <span>
              ESCOLHAS QUE
              <br />
              ABREM FUTUROS.
            </span>
            <CinemaIcon name="diagonal" size={26} />
          </div>
          <div className="filmSceneRail" aria-label="Cenas da abertura">
            {scenes.map((scene, i) => (
              <button
                key={scene.label}
                onClick={() => goTo(i)}
                aria-label={`Ir para ${scene.label}`}
                aria-pressed={index === i}
              >
                <span>0{i + 1}</span>
                <i />
              </button>
            ))}
          </div>
        </div>
        <div className="filmHeroDestinations">
          <Link href="/instituicoes">
            <span>01 / ENCONTRE SEU LUGAR</span>
            <p>
              Há um lugar que combina
              <br />
              com quem você quer ser.
            </p>
            <b>
              Explorar instituições <CinemaIcon name="diagonal" size={15} />
            </b>
          </Link>
          <Link href="/cursos">
            <span>02 / SIGA SUA CURIOSIDADE</span>
            <p>
              O que move você pode ser
              <br />o seu próximo caminho.
            </p>
            <b>
              Descobrir cursos <CinemaIcon name="diagonal" size={15} />
            </b>
          </Link>
          <Link href="/comparar">
            <span>03 / ESCOLHA COM CLAREZA</span>
            <p>
              Novas perspectivas para
              <br />
              uma decisão que é sua.
            </p>
            <b>
              Comparar possibilidades <CinemaIcon name="diagonal" size={15} />
            </b>
          </Link>
        </div>
        <div className="filmHeroBottom">
          <a
            className="filmScrollCue"
            href="#cinema-descoberta"
            aria-label="Rolar para a próxima seção"
          >
            <span>
              <CinemaIcon name="down" size={15} />
            </span>
            <div>
              O SEU FUTURO ESTÁ EM MOVIMENTO<small>Role para descobrir</small>
            </div>
          </a>
          <div className="filmControls">
            <button
              onClick={() => goTo(index - 1)}
              className="filmArrow"
              aria-label="Cena anterior"
            >
              <CinemaIcon name="left" size={16} />
            </button>
            <div className="filmSceneCount">
              <b>0{index + 1}</b>
              <span>/ 05</span>
            </div>
            <div className="filmSceneDots">
              {scenes.map((scene, i) => (
                <button
                  className={index === i ? "isActive" : ""}
                  key={scene.label}
                  onClick={() => goTo(i)}
                  aria-label={`Ver cena ${i + 1}: ${scene.label}`}
                  aria-current={i === index ? "true" : undefined}
                >
                  {index === i && <span ref={bar} />}
                </button>
              ))}
            </div>
            <button
              onClick={() => goTo(index + 1)}
              className="filmArrow"
              aria-label="Próxima cena"
            >
              <CinemaIcon name="right" size={16} />
            </button>
            <button
              onClick={() => setPaused(!paused)}
              className="filmPause"
              aria-label={paused ? "Reproduzir carrossel" : "Pausar carrossel"}
              aria-pressed={paused}
            >
              <CinemaIcon name={paused ? "play" : "pause"} size={13} />
            </button>
          </div>
        </div>
      </div>
      <div className="filmHeroFooter" aria-hidden="true">
        <span>DESCOBRIR. CONECTAR. TRANSFORMAR.</span>
        <span>
          {states > 0
            ? `${states} ${states === 1 ? "UF" : "UFS"} · UM NOVO HORIZONTE`
            : "O PRÓXIMO CAPÍTULO É SEU"}
        </span>
      </div>
    </section>
  );
}
