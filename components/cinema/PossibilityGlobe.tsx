"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { CinemaIcon } from "./CinemaIcon";
import { useScrollScene } from "./useScrollScene";

const paths = [
  {
    area: "Tecnologia",
    title: "Dê forma ao que ainda não existe.",
    text: "De uma linha de código a uma ideia que muda o cotidiano. Explore os caminhos da tecnologia.",
    number: "01",
  },
  {
    area: "Saúde",
    title: "Faça do cuidado o seu caminho.",
    text: "Conhecimento que se transforma em atenção, presença e qualidade de vida.",
    number: "02",
  },
  {
    area: "Artes e design",
    title: "O mundo também precisa do seu olhar.",
    text: "Transforme referências em novas ideias. Descubra formações para criar, comunicar e experimentar.",
    number: "03",
  },
  {
    area: "Negócios",
    title: "Conecte ideias. Movimente futuros.",
    text: "Estratégia, pessoas e projetos: encontre uma formação para tirar planos do papel.",
    number: "04",
  },
];

export default function PossibilityGlobe() {
  const [active, setActive] = useState(0),
    [rotation, setRotation] = useState(0);
  const drag = useRef<{ x: number; rotation: number } | null>(null);
  const path = paths[active];
  const { ref } = useScrollScene<HTMLElement>((gsap, _scroll, element) => {
    gsap.fromTo(
      ".atlasScrollLayer",
      { rotateZ: -14, y: 30 },
      {
        rotateZ: 14,
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );
  });
  const select = (index: number) => {
    setActive(index);
    setRotation(index * 90);
  };
  return (
    <section className="atlasSection filmContainer" ref={ref} id="atlas">
      <div className="atlasIntro" data-cinema-reveal>
        <span className="filmSectionLabel">
          <i />
          04 — SEU MUNDO PODE SER MAIOR
        </span>
        <h2>
          Não existe um só
          <br />
          <em>jeito de ir além.</em>
        </h2>
        <p>
          Explore uma área. Mude a perspectiva.
          <br />
          Encontre o que faz seus olhos brilharem.
        </p>
      </div>
      <div className="atlasExperience">
        <div
          className="atlasViewport"
          role="slider"
          tabIndex={0}
          aria-label="Girar esfera de áreas de estudo"
          aria-valuemin={0}
          aria-valuemax={3}
          aria-valuenow={active}
          aria-valuetext={path.area}
          onKeyDown={(e) => {
            if (
              [
                "ArrowRight",
                "ArrowUp",
                "ArrowLeft",
                "ArrowDown",
                "Home",
                "End",
              ].includes(e.key)
            ) {
              e.preventDefault();
              select(
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? 3
                    : (active +
                        (["ArrowRight", "ArrowUp"].includes(e.key) ? 1 : 3)) %
                      4,
              );
            }
          }}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, rotation };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current) {
              const next =
                drag.current.rotation + (e.clientX - drag.current.x) * 0.65;
              setRotation(next);
              setActive(((Math.round(next / 90) % 4) + 4) % 4);
            }
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <div className="atlasCoordinates" aria-hidden="true">
            <span>∞ POSSIBILIDADES</span>
            <span>EXPLORE SEU UNIVERSO</span>
          </div>
          <div className="atlasScrollLayer">
            <div
              className="atlasSphere"
              style={{ "--globe-rotation": `${rotation}deg` } as CSSProperties}
              aria-hidden="true"
            >
              <div className="atlasAutoRotate">
                {Array.from({ length: 12 }, (_, i) => (
                  <i
                    className="atlasMeridian"
                    key={i}
                    style={{ transform: `rotateY(${i * 15}deg)` }}
                  />
                ))}
                {[-60, -30, 0, 30, 60].map((degree) => (
                  <i
                    className="atlasLatitude"
                    key={degree}
                    style={{
                      transform: `rotateX(90deg) translateZ(${Math.sin((degree * Math.PI) / 180) * 145}px) scale(${Math.cos((degree * Math.PI) / 180)})`,
                    }}
                  />
                ))}
                <span className="atlasCore" />
                <span className="atlasSatellite" />
              </div>
            </div>
            <span className="atlasEquator" />
          </div>
          <span className="atlasDragHint">
            <CinemaIcon name="globe" size={14} />
            Arraste para mudar sua perspectiva
          </span>
        </div>
        <div className="atlasContent">
          <div className="atlasTabs" aria-label="Áreas de estudo">
            {paths.map((p, i) => (
              <button
                key={p.area}
                onClick={() => select(i)}
                aria-pressed={active === i}
              >
                <span>{p.number}</span>
                {p.area}
              </button>
            ))}
          </div>
          <div className="atlasDetail" key={active}>
            <span className="atlasNumber">{path.number} / 04</span>
            <h3>{path.title}</h3>
            <p>{path.text}</p>
            <Link
              className="filmTextLink"
              href={`/cursos?area=${encodeURIComponent(path.area)}`}
            >
              Explorar {path.area.toLowerCase()}
              <CinemaIcon name="diagonal" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
