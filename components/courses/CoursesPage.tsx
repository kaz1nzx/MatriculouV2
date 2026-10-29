"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../app/AppProvider";
import CinematicPageHero from "../cinema/CinematicPageHero";
import CourseDetailModal from "./CourseDetailModal";
import { ComparisonView, PriorityPanel } from "../compare/ComparisonView";
import { Badge, EmptyState, Icon } from "../ui";
import { useQueryDraft } from "../shared/useQueryDraft";
import {
  courseAreas,
  courseInfo,
  courseLevels,
  getCourseDetail,
  matchesLevel,
} from "../../lib/courses";
import {
  compareCourses,
  coursePriorityLabels,
  defaultCoursePriorities,
  type CoursePriorities,
} from "../../lib/compare";
import { matchesQuery } from "../../lib/search";
import { normalize } from "../../lib/text";
import { plural } from "../../lib/format";
import { readList, storageKeys, writeList } from "../../lib/storage";

const limit = 4;

export default function CoursesPage() {
  const { institutions, offers, notify } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [priorities, setPriorities] = useState<CoursePriorities>(
    defaultCoursePriorities,
  );

  const q = params.get("q") || "";
  const area = params.get("area") || "";
  const level = params.get("nivel") || "todos";
  const onlyOffered = params.get("oferta") === "1";
  const sort = params.get("ordem") || "nome";
  const openName = params.get("curso");

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes))
        value ? next.set(key, value) : next.delete(key);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  useEffect(() => setSelected(readList(storageKeys.compareCourses, limit)), []);
  const [draft, setDraft] = useQueryDraft(q, (value) => update({ q: value }));

  const counts = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const o of offers) {
      const key = normalize(o.course_name);
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(o.institution_id);
    }
    return map;
  }, [offers]);

  const all = useMemo(() => {
    const names = new Map(courseInfo.map((c) => [normalize(c.name), c.name]));
    for (const o of offers)
      if (!names.has(normalize(o.course_name)))
        names.set(normalize(o.course_name), o.course_name);
    return [...names.values()].map(getCourseDetail);
  }, [offers]);

  const count = (name: string) => counts.get(normalize(name))?.size || 0;
  const validArea =
    courseAreas.includes(area) || all.some((c) => c.area === area) ? area : "";

  const results = all
    .filter((c) =>
      matchesQuery(
        `${c.name} ${c.area} ${c.level} ${c.desc} ${c.skills.join(" ")} ${c.careers.join(" ")}`,
        q,
      ),
    )
    .filter((c) => !validArea || c.area === validArea)
    .filter((c) => matchesLevel(c, level))
    .filter((c) => !onlyOffered || count(c.name) > 0)
    .sort((a, b) =>
      sort === "oferta"
        ? count(b.name) - count(a.name) || a.name.localeCompare(b.name)
        : sort === "duracao"
          ? (a.years || 99) - (b.years || 99) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
    );

  const toggle = (name: string) => {
    const next = selected.includes(name)
      ? selected.filter((n) => n !== name)
      : [...selected, name];
    if (next.length > limit)
      return notify(`Compare até ${limit} cursos por vez.`, "error");
    setSelected(next);
    writeList(storageKeys.compareCourses, next);
  };

  const chosen = selected.map(getCourseDetail);
  const result = useMemo(() => {
    const list = selected.map(getCourseDetail);
    return comparing && list.length >= 2
      ? compareCourses(list, institutions, offers, priorities)
      : null;
  }, [comparing, selected, institutions, offers, priorities]);
  const open = openName ? getCourseDetail(openName) : null;
  const areas = [
    ...new Set([...courseAreas, ...all.map((c) => c.area)]),
  ].filter((a) => a !== "Outras áreas");

  return (
    <main className="page" id="conteudo">
      <CinematicPageHero kind="courses">
        <span className="eyebrow light">
          {plural(all.length, "curso", "cursos")} no catálogo
        </span>
        <h1>Entenda antes de escolher.</h1>
        <p>
          Duração, carga horária oficial, registro profissional, disciplinas,
          carreiras e as instituições que oferecem cada curso.
        </p>
      </CinematicPageHero>

      {result ? (
        <section className="container compareSection">
          <div className="sectionBar">
            <div>
              <span className="eyebrow">Comparação de cursos</span>
              <h2>{chosen.map((c) => c.name).join(" × ")}</h2>
            </div>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setComparing(false)}
            >
              <Icon name="left" size={16} /> Voltar aos cursos
            </button>
          </div>
          <PriorityPanel
            values={priorities}
            labels={coursePriorityLabels}
            onChange={setPriorities}
          />
          <ComparisonView
            result={result}
            heads={chosen.map((c) => ({
              key: c.name,
              title: c.name,
              subtitle: `${c.area} · ${c.level}`,
              media: (
                <img
                  src={c.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="rankThumb"
                />
              ),
            }))}
            onRemove={(index) => {
              const next = selected.filter((n) => n !== chosen[index].name);
              setSelected(next);
              writeList(storageKeys.compareCourses, next);
              if (next.length < 2) setComparing(false);
            }}
          />
        </section>
      ) : (
        <section className="container coursesSection">
          <div className="searchBar">
            <label className="searchField">
              <Icon name="search" size={20} />
              <span className="srOnly">Pesquisar curso, área ou profissão</span>
              <input
                type="search"
                value={draft}
                maxLength={120}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Curso, área ou profissão (ex.: programador, advogado)"
              />
            </label>
            <select
              aria-label="Tipo de formação"
              value={level}
              onChange={(e) =>
                update({
                  nivel: e.target.value === "todos" ? null : e.target.value,
                })
              }
            >
              <option value="todos">Todas as formações</option>
              {courseLevels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              aria-label="Ordenar cursos"
              value={sort}
              onChange={(e) =>
                update({
                  ordem: e.target.value === "nome" ? null : e.target.value,
                })
              }
            >
              <option value="nome">Nome (A–Z)</option>
              <option value="oferta">Mais instituições</option>
              <option value="duracao">Menor duração</option>
            </select>
          </div>

          <div className="pillRow" role="group" aria-label="Áreas">
            {["", ...areas].map((a) => (
              <button
                key={a || "todas"}
                type="button"
                className="pill"
                aria-pressed={validArea === a}
                onClick={() => update({ area: a || null })}
              >
                {a || "Todas as áreas"}
              </button>
            ))}
            <label className="switchRow inline">
              <input
                type="checkbox"
                role="switch"
                checked={onlyOffered}
                onChange={(e) =>
                  update({ oferta: e.target.checked ? "1" : null })
                }
              />
              <span>Só com oferta no catálogo</span>
            </label>
          </div>

          <p className="resultHead" aria-live="polite">
            <span>
              <b>{results.length}</b>{" "}
              {results.length === 1 ? "curso" : "cursos"}
            </span>
          </p>

          {results.length ? (
            <div className="courseGrid">
              {results.map((c) => {
                const isSelected = selected.includes(c.name);
                const n = count(c.name);
                return (
                  <article
                    key={c.name}
                    className={`courseCard ${isSelected ? "isSelected" : ""}`}
                  >
                    <div className="courseCardTop">
                      <img
                        src={c.icon}
                        alt=""
                        width={44}
                        height={44}
                        loading="lazy"
                      />
                      <div>
                        <span>{c.area}</span>
                        <small>{c.level}</small>
                      </div>
                    </div>
                    <h3>
                      <button
                        type="button"
                        className="linkish"
                        onClick={() => update({ curso: c.name })}
                      >
                        {c.name}
                      </button>
                    </h3>
                    <p>{c.desc}</p>
                    <ul className="courseMeta">
                      <li>
                        <Icon name="clock" size={15} /> {c.duration}
                      </li>
                      <li>
                        <Icon name="school" size={15} />{" "}
                        {n
                          ? plural(n, "instituição", "instituições")
                          : "Sem oferta no catálogo"}
                      </li>
                      {c.presentialOnly && (
                        <li>
                          <Badge>Só presencial</Badge>
                        </li>
                      )}
                    </ul>
                    <div className="courseActions">
                      <button
                        type="button"
                        className={`btn ghost ${isSelected ? "isOn" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() => toggle(c.name)}
                      >
                        <Icon
                          name={isSelected ? "check" : "compare"}
                          size={16}
                        />
                        {isSelected ? "Selecionado" : "Comparar"}
                      </button>
                      <button
                        type="button"
                        className="btn primary"
                        onClick={() => update({ curso: c.name })}
                      >
                        Conhecer <Icon name="arrow" size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="book"
              title="Nenhum curso encontrado"
              action={
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => router.replace(pathname, { scroll: false })}
                >
                  Limpar busca
                </button>
              }
            >
              Tente o nome de uma profissão, como “engenheiro” ou “professor”.
            </EmptyState>
          )}
        </section>
      )}

      {selected.length > 0 && !result && (
        <div
          className="compareDock"
          role="region"
          aria-label="Cursos para comparar"
        >
          <span>
            <Icon name="compare" /> {selected.length}/{limit} cursos:{" "}
            {selected.join(", ")}
          </span>
          <div className="inlineActions">
            <button
              type="button"
              className="btn ghost small"
              onClick={() => {
                setSelected([]);
                writeList(storageKeys.compareCourses, []);
              }}
            >
              Limpar
            </button>
            <button
              type="button"
              className="btn primary small"
              disabled={selected.length < 2}
              onClick={() => setComparing(true)}
            >
              {selected.length < 2 ? "Escolha mais um" : "Comparar agora"}
            </button>
          </div>
        </div>
      )}

      {open && (
        <CourseDetailModal
          course={open}
          onClose={() => update({ curso: null })}
        />
      )}
    </main>
  );
}
