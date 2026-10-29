"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { CinemaIcon } from "./CinemaIcon";
import { useScrollScene } from "./useScrollScene";
import { photoAlt } from "./photoAlt";

const scenes = {
  institutions: {
    image: "library",
    caption: "Um lugar para pertencer.",
    number: "01",
  },
  courses: {
    image: "classroom",
    caption: "Conhecimento abre caminhos.",
    number: "02",
  },
  compare: {
    image: "students",
    caption: "Perspectiva para decidir.",
    number: "03",
  },
};

export default function CinematicPageHero({
  kind,
  children,
}: {
  kind: keyof typeof scenes;
  children: ReactNode;
}) {
  const scene = scenes[kind];
  const { ref } = useScrollScene<HTMLElement>((gsap, _scroll, element) => {
    const media = gsap.matchMedia();
    media.add("(min-width: 800px)", () => {
      gsap.fromTo(
        ".routeCinemaPicture",
        { yPercent: -7, scale: 1.12, rotate: 2 },
        {
          yPercent: 12,
          scale: 1,
          rotate: -2,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top top",
            end: "bottom top",
            scrub: 0.7,
          },
        },
      );
      gsap.to(".routeCinemaOrbit", {
        rotate: 100,
        y: 55,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });
    return () => media.revert();
  });

  return (
    <header
      ref={ref}
      className={`pageHero routeCinemaHero routeCinema-${kind}`}
    >
      <div className="routeCinemaOrbit" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="routeCinemaLayout">
        <div className="routeCinemaCopy">{children}</div>
        <div className="routeCinemaVisual" aria-hidden="true">
          <div className="routeCinemaPicture">
            <Image
              src={`/images/cinema/${scene.image}.jpg`}
              alt={photoAlt[scene.image]}
              fill
              sizes="(max-width: 799px) 100vw, 38vw"
              priority
            />
            <span />
          </div>
          <span className="routeCinemaCaption">
            <CinemaIcon name="pin" size={18} />
            {scene.caption}
          </span>
          <span className="routeCinemaNumber">{scene.number}</span>
        </div>
      </div>
    </header>
  );
}
