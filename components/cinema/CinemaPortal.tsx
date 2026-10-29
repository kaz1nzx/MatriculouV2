"use client";

import Image from "next/image";
import Link from "next/link";
import { CinemaIcon } from "./CinemaIcon";
import { useScrollScene } from "./useScrollScene";

export default function CinemaPortal() {
  const { ref, motion } = useScrollScene<HTMLElement>(
    (gsap, _scroll, element) => {
      const media = gsap.matchMedia();
      media.add("(min-width: 900px) and (min-height: 740px)", () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
          },
        });
        timeline.fromTo(
          ".cinemaPortalFrame",
          { clipPath: "inset(14% 15% 14% 15% round 160px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            duration: 0.7,
            ease: "power1.inOut",
          },
          0,
        );
        timeline.fromTo(
          ".cinemaPortalPhoto",
          { scale: 1.28, yPercent: -7 },
          { scale: 1, yPercent: 4, duration: 1, ease: "none" },
          0,
        );
        timeline.fromTo(
          ".cinemaPortalCopy",
          { y: 70, opacity: 0.15 },
          { y: 0, opacity: 1, duration: 0.65, ease: "none" },
          0.15,
        );
        timeline.fromTo(
          ".cinemaPortalOutline",
          { xPercent: -12 },
          { xPercent: 8, duration: 1, ease: "none" },
          0,
        );
        timeline.fromTo(
          ".cinemaPortalProgress > i",
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: "none" },
          0,
        );
      });
      return () => media.revert();
    },
  );

  return (
    <section
      ref={ref}
      className={`cinemaPortal ${motion ? "isMotion" : ""}`}
      aria-label="Um novo horizonte"
    >
      <div className="cinemaPortalViewport">
        <div className="cinemaPortalFrame">
          <div className="cinemaPortalPhoto">
            <Image
              src="/images/cinema/campus.jpg"
              alt="Formandos de beca jogam os capelos para o alto em uma formatura ao ar livre"
              fill
              sizes="100vw"
            />
          </div>
          <div className="cinemaPortalShade" />
          <span className="cinemaPortalOutline" aria-hidden="true">
            POSSIBILIDADES
          </span>
        </div>
        <div className="cinemaPortalCopy">
          <span className="filmSectionLabel">
            <i />O HORIZONTE SE ABRE
          </span>
          <h2>
            Você ainda tem
            <br />
            <em>muito para viver.</em>
          </h2>
          <p>
            Novos lugares. Novas ideias. Uma história que só você pode escrever.
          </p>
          <Link href="/instituicoes" className="filmTextLink">
            Encontre seu próximo capítulo
            <CinemaIcon name="diagonal" size={20} />
          </Link>
        </div>
        <div className="cinemaPortalBottom">
          <span>IMAGINE O QUE VEM DEPOIS</span>
          <div className="cinemaPortalProgress">
            <i />
          </div>
          <CinemaIcon name="down" size={23} />
        </div>
      </div>
    </section>
  );
}
