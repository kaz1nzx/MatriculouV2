"use client";
import Image from "next/image";
import { loadMotion, scheduleRefresh } from "./loadMotion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CinemaIcon } from "./CinemaIcon";
import { useCinema } from "./CinemaProvider";
import { photoAlt } from "./photoAlt";

const chapters = [
  {
    title: "Siga a sua curiosidade.",
    word: "Descubra.",
    description:
      "Um lugar, um curso, uma possibilidade. Explore instituições e encontre o que faz sentido para os seus planos.",
    image: "library",
    icon: "search",
    label: "Comece a explorar",
    href: "/instituicoes",
    detail: "Novos caminhos começam com uma pergunta.",
  },
  {
    title: "Veja além da primeira impressão.",
    word: "Compare.",
    description:
      "Coloque suas opções lado a lado. Localização, conceito MEC e investimento, reunidos para uma escolha mais consciente.",
    image: "classroom",
    icon: "compare",
    label: "Conhecer o comparador",
    href: "/comparar",
    detail: "Mais perspectiva. Mais clareza para decidir.",
  },
  {
    title: "O próximo passo é seu.",
    word: "Escolha.",
    description:
      "Salve suas instituições favoritas e organize seus documentos. Continue sua história com tudo o que importa por perto.",
    image: "future",
    icon: "heart",
    label: "Criar minha conta",
    href: "/cadastro",
    detail: "O futuro se constrói uma escolha por vez.",
  },
];

export default function FilmJourney() {
  const { enabled, lite } = useCinema();
  const root = useRef<HTMLElement>(null),
    progress = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0),
    [enhanced, setEnhanced] = useState(false);
  useEffect(() => {
    if (!enabled || lite) {
      setEnhanced(false);
      return;
    }
    let cancelled = false,
      revert = () => {},
      raf = 0;
    loadMotion()
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(min-width: 900px) and (min-height: 740px)", () => {
          setEnhanced(true);
          let context: ReturnType<typeof gsap.context> | undefined;
          raf = requestAnimationFrame(() => {
            if (cancelled) return;
            context = gsap.context(() => {
              let last = -1;
              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: root.current,
                  start: "top 105px",
                  end: "bottom bottom",
                  scrub: 0.65,
                  invalidateOnRefresh: true,
                  onUpdate: (self) => {
                    const chapter = Math.min(2, Math.floor(self.progress * 3));
                    if (chapter !== last) {
                      last = chapter;
                      setActive(chapter);
                    }
                    if (progress.current)
                      progress.current.style.transform = `scaleX(${self.progress})`;
                  },
                },
              });
              timeline.fromTo(
                ".filmJourneyArt",
                { rotateY: -6, rotateZ: 2, scale: 0.9 },
                {
                  rotateY: 4,
                  rotateZ: -2,
                  scale: 1.025,
                  duration: 1,
                  ease: "none",
                },
              );
              timeline.fromTo(
                ".filmJourneyOrbit",
                { rotation: -25, scale: 0.8 },
                { rotation: 45, scale: 1.13, duration: 1, ease: "none" },
                0,
              );
              scheduleRefresh(ScrollTrigger);
            }, root);
          });
          return () => {
            cancelAnimationFrame(raf);
            context?.revert();
            setEnhanced(false);
          };
        });
        revert = () => media.revert();
      })
      .catch(() => {
        setEnhanced(false);
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      revert();
    };
  }, [enabled, lite]);

  const goTo = (index: number) => {
    if (!root.current || !enhanced) return;
    const start =
      root.current.getBoundingClientRect().top + window.scrollY - 105;
    const distance = root.current.offsetHeight - innerHeight + 105;
    window.scrollTo({
      top: start + distance * ((index + 0.35) / 3),
      behavior: "smooth",
    });
  };

  return (
    <section
      className={`filmJourney ${enhanced ? "isEnhanced" : ""}`}
      ref={root}
      id="cinema-jornada"
    >
      <div className="filmJourneyViewport">
        <div className="filmJourneyHeader">
          <span className="filmSectionLabel">
            <i /> A SUA HISTÓRIA, EM MOVIMENTO
          </span>
          <span>DO PRIMEIRO OLHAR AO PRÓXIMO PASSO</span>
        </div>
        <div className="filmJourneyOrbit" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="filmJourneyScenes">
          {chapters.map((chapter, index) => (
            <article
              className={`filmJourneyScene ${index === active ? "isActive" : ""}`}
              key={chapter.word}
              aria-hidden={enhanced && index !== active ? "true" : undefined}
            >
              <div className="filmJourneyCopy">
                <span className="filmJourneyNumber" aria-hidden="true">
                  0{index + 1}
                  <small>/03</small>
                </span>
                <h2>
                  {chapter.title}
                  <em>{chapter.word}</em>
                </h2>
                <p>{chapter.description}</p>
                <Link
                  className="button gold"
                  href={chapter.href}
                  tabIndex={enhanced && index !== active ? -1 : undefined}
                  data-magnetic
                >
                  {chapter.label}
                  <CinemaIcon name="diagonal" size={18} />
                </Link>
              </div>
              <div className="filmJourneyArt">
                <div className="filmJourneyImage">
                  <Image
                    src={`/images/cinema/${chapter.image}.jpg`}
                    alt={photoAlt[chapter.image]}
                    fill
                    sizes="(max-width: 899px) 90vw, 48vw"
                  />
                  <span className="filmJourneyImageShade" />
                </div>
                <span className="filmJourneyArtTag">
                  <CinemaIcon name={chapter.icon} size={18} />
                  {chapter.word.replace(".", "")}
                </span>
                <div className="filmJourneyCaption">
                  <span>CAPÍTULO 0{index + 1}</span>
                  <p>{chapter.detail}</p>
                  <CinemaIcon name="diagonal" size={24} />
                </div>
                <div className="filmJourneyCorner" aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
        {enhanced && (
          <div className="filmJourneyNavigation">
            <div className="filmJourneySteps">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.word}
                  onClick={() => goTo(index)}
                  aria-current={index === active ? "step" : undefined}
                  className={index === active ? "isActive" : ""}
                >
                  <span>0{index + 1}</span>
                  {chapter.word.replace(".", "")}
                </button>
              ))}
            </div>
            <div className="filmJourneyProgress">
              <span ref={progress} />
            </div>
            <span className="filmJourneyScroll">
              CONTINUE EXPLORANDO <CinemaIcon name="down" size={12} />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
