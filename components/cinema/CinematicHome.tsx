"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import type { Institution } from "../../lib/types";
import { courseInfo } from "../../lib/courses";
import { CinemaIcon } from "./CinemaIcon";
import CinematicHero from "./CinematicHero";
import ScrollStatement from "./ScrollStatement";
import FilmJourney from "./FilmJourney";
import ChapterNavigation from "./ChapterNavigation";
import ScrollStory from "./ScrollStory";
import CinemaPortal from "./CinemaPortal";
import PossibilityGlobe from "./PossibilityGlobe";

export default function CinematicHome({
  institutions,
  loading,
  demo,
  renderInstitution,
}: {
  institutions: Institution[];
  loading: boolean;
  demo: boolean;
  renderInstitution: (institution: Institution) => ReactNode;
}) {
  const gallery = useRef<HTMLDivElement>(null);
  const [galleryPage, setGalleryPage] = useState(0);
  const [galleryAtEnd, setGalleryAtEnd] = useState(false);
  const slides = institutions.slice(0, 6);
  const moveGallery = (direction: number) => {
    const element = gallery.current;
    if (!element) return;
    element.scrollBy({
      left: direction * (element.clientWidth + 24),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };
  return (
    <main className="cinematicHome" id="conteudo">
      <ChapterNavigation />
      <CinematicHero
        count={institutions.length}
        states={new Set(institutions.map((i) => i.state)).size}
      />
      <ScrollStatement />
      <section className="filmDiscovery filmContainer" id="cinema-instituicoes">
        <div className="filmSectionHeading" data-cinema-reveal>
          <div>
            <span className="filmSectionLabel">
              <i /> 02 — ENCONTRE O SEU LUGAR
            </span>
            <h2>
              Lugares que inspiram.
              <br />
              <em>Futuros que começam.</em>
            </h2>
          </div>
          <div className="filmHeadingAside">
            <p>
              Explore instituições e encontre o lugar
              <br />
              que tem a ver com a sua história.
            </p>
            <Link href="/instituicoes" className="filmTextLink">
              Ver todas as instituições <CinemaIcon name="diagonal" size={17} />
            </Link>
          </div>
        </div>
        <div className="filmDiscoveryTopline">
          <span>
            <CinemaIcon name="school" size={15} />
            {loading
              ? "Carregando instituições…"
              : `${institutions.length} ${institutions.length === 1 ? "instituição" : "instituições"}. Novas possibilidades.`}
          </span>
          <div className="filmGalleryControls">
            <button
              aria-label="Instituições anteriores"
              onClick={() => moveGallery(-1)}
              disabled={galleryPage === 0}
            >
              <CinemaIcon name="left" size={17} />
            </button>
            <button
              aria-label="Próximas instituições"
              onClick={() => moveGallery(1)}
              disabled={!slides.length || galleryAtEnd}
            >
              <CinemaIcon name="right" size={17} />
            </button>
          </div>
        </div>
        <div
          className="filmInstitutionGallery"
          ref={gallery}
          onScroll={(e) => {
            const el = e.currentTarget;
            setGalleryPage(el.scrollLeft > 2 ? 1 : 0);
            setGalleryAtEnd(
              el.scrollLeft + el.clientWidth >= el.scrollWidth - 3,
            );
          }}
        >
          {slides.length ? (
            slides.map((i) => (
              <div className="filmGalleryItem" key={i.id} data-cinema-reveal>
                {renderInstitution(i)}
              </div>
            ))
          ) : loading ? (
            [0, 1, 2].map((i) => (
              <div
                className="filmSkeleton"
                key={i}
                aria-label="Carregando instituições"
              >
                <div />
                <i />
                <i />
                <i />
              </div>
            ))
          ) : (
            <p className="filmEmpty">
              Nenhuma instituição disponível no momento. Enquanto isso, explore
              os cursos e descubra seus caminhos.
            </p>
          )}
        </div>
        {demo && (
          <p className="demoCaption">
            Demonstração · instituições e valores fictícios. Fotografias
            ilustrativas.
          </p>
        )}
      </section>
      <section
        className="filmMarquee"
        aria-label="Conhecimento, escolhas, possibilidades e futuro"
      >
        <div aria-hidden="true">
          {[0, 1].map((i) => (
            <div className="filmMarqueeTrack" key={i}>
              <span>Conhecimento</span>
              <CinemaIcon name="dot" size={30} />
              <span>Escolhas</span>
              <CinemaIcon name="dot" size={30} />
              <em>Possibilidades</em>
              <CinemaIcon name="dot" size={30} />
              <span>Futuro</span>
              <CinemaIcon name="dot" size={30} />
            </div>
          ))}
        </div>
      </section>
      <section className="filmCourses filmContainer" id="cinema-cursos">
        <div className="filmSectionHeading" data-cinema-reveal>
          <div>
            <span className="filmSectionLabel">
              <i />
              03 — SIGA O QUE MOVE VOCÊ
            </span>
            <h2>
              O seu futuro tem
              <br />
              <em>muitos caminhos.</em>
            </h2>
          </div>
          <Link href="/cursos" className="filmTextLink">
            Descubra todos os cursos <CinemaIcon name="diagonal" size={17} />
          </Link>
        </div>
        <div className="filmCourseComposition">
          <Link href="/cursos" className="filmCourseFeature" data-cinema-reveal>
            <Image
              src="/images/cinema/classroom.jpg"
              alt="Professor explica geometria no quadro enquanto um aluno levanta a mão"
              fill
              sizes="(max-width: 800px) 90vw, 38vw"
            />
            <div className="filmCourseFeatureShade" />
            <span className="filmFeatureTag">UM NOVO OLHAR</span>
            <div>
              <span>CONHECIMENTO TRANSFORMA</span>
              <h3>
                Descubra o que
                <br />
                desperta você.
              </h3>
              <p>
                Explore áreas, entenda cursos
                <br />e encontre novas possibilidades.
              </p>
              <span className="filmFeatureArrow">
                <CinemaIcon name="diagonal" size={24} />
              </span>
            </div>
          </Link>
          <div className="filmCourseList">
            {courseInfo.slice(0, 5).map((course, index) => (
              <Link
                key={course.name}
                href={`/cursos?q=${encodeURIComponent(course.name)}`}
                className="filmCourseRow"
                data-cinema-reveal
              >
                <span className="filmCourseNumber">0{index + 1}</span>
                <div>
                  <span>{course.area}</span>
                  <h3>{course.name}</h3>
                  <small>{course.duration}</small>
                </div>
                <span className="filmCourseArrow">
                  <CinemaIcon name="diagonal" size={21} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <PossibilityGlobe />
      <ScrollStory variant="possibilities" />
      <FilmJourney />
      <CinemaPortal />
      <section className="filmFinale filmContainer" data-cinema-reveal>
        <div className="filmFinaleOrbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span className="filmSectionLabel">
          <i />
          ESTA HISTÓRIA AINDA ESTÁ SENDO ESCRITA
        </span>
        <h2>
          O futuro não está pronto.
          <br />
          <em>Ele começa com você.</em>
        </h2>
        <p>Uma escolha abre um caminho. Vamos encontrar o seu?</p>
        <Link href="/instituicoes" className="btn primary" data-magnetic>
          Encontre o seu próximo capítulo{" "}
          <CinemaIcon name="diagonal" size={19} />
        </Link>
      </section>
    </main>
  );
}
