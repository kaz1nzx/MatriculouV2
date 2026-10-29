"use client";
import { useEffect, useRef } from "react";
import { loadMotion } from "./loadMotion";
import { CinemaIcon } from "./CinemaIcon";
import { useCinema } from "./CinemaProvider";

export default function ScrollStatement() {
  const ref = useRef<HTMLElement>(null);
  const { enabled, lite } = useCinema();
  useEffect(() => {
    if (!enabled || lite) return;
    let cancelled = false,
      revert = () => {};
    loadMotion()
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          gsap.fromTo(
            ".filmStatementWord",
            { opacity: 0.62 },
            {
              opacity: 1,
              stagger: 0.1,
              ease: "none",
              scrollTrigger: {
                trigger: ref.current,
                start: "top 80%",
                end: "bottom 60%",
                scrub: 0.35,
              },
            },
          );
          gsap.fromTo(
            ".filmStatementOrbit",
            { rotate: -30 },
            {
              rotate: 60,
              ease: "none",
              scrollTrigger: {
                trigger: ref.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        }, ref);
        revert = () => context.revert();
      })
      .catch(() => {
        /* The statement is readable without the animation layer. */
      });
    return () => {
      cancelled = true;
      revert();
    };
  }, [enabled, lite]);
  return (
    <section ref={ref} className="filmStatement" id="cinema-descoberta">
      <div className="filmStatementMeta">
        <span className="filmSectionLabel">
          <i /> MUITO ALÉM DE UMA ESCOLHA
        </span>
        <span>01 — PERSPECTIVA</span>
      </div>
      <div className="filmStatementBody">
        <div className="filmStatementOrbit" aria-hidden="true">
          <i />
          <CinemaIcon name="globe" size={31} />
        </div>
        <h2 aria-label="O lugar onde você estuda muda a forma como você vê o mundo.">
          {"O lugar onde você estuda muda a forma como você vê o mundo."
            .split(" ")
            .map((word, index) => (
              <span
                key={index}
                className={`filmStatementWord ${index > 8 ? "accent" : ""}`}
                aria-hidden="true"
              >
                {word}{" "}
              </span>
            ))}
        </h2>
        <p>
          E a sua próxima escolha pode abrir
          <br />
          possibilidades que você ainda nem imaginou.
        </p>
      </div>
    </section>
  );
}
