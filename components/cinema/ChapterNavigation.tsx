"use client";
import { useEffect, useState } from "react";
const chapters = [
  { id: "cinema-inicio", label: "O começo" },
  { id: "cinema-instituicoes", label: "Seu lugar" },
  { id: "cinema-cursos", label: "Novos caminhos" },
  { id: "cinema-jornada", label: "Sua jornada" },
];
export default function ChapterNavigation() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let next = 0;
      chapters.forEach((chapter, index) => {
        const element = document.getElementById(chapter.id);
        if (element && element.getBoundingClientRect().top < innerHeight * 0.45)
          next = index;
      });
      setActive(next);
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    addEventListener("scroll", scroll, { passive: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", scroll);
    };
  }, []);
  return (
    <nav className="filmChapterNav" aria-label="Capítulos da página">
      {chapters.map((chapter, index) => (
        <a
          href={`#${chapter.id}`}
          key={chapter.id}
          className={active === index ? "isActive" : ""}
          aria-label={chapter.label}
          aria-current={active === index ? "location" : undefined}
        >
          <span>{chapter.label}</span>
          <i />
        </a>
      ))}
    </nav>
  );
}
