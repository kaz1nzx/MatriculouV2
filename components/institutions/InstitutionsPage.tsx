"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../app/AppProvider";
import CinematicPageHero from "../cinema/CinematicPageHero";
import InstitutionCard from "./InstitutionCard";
import InstitutionDetail from "./InstitutionDetail";
import { EmptyState, Icon, SkeletonCards } from "../ui";
import { useQueryDraft } from "../shared/useQueryDraft";
import { matchesQuery, stateNames } from "../../lib/search";
import { normalize } from "../../lib/text";
import {
  modalityLabel,
  money,
  networkLabel,
  plural,
  typeLabel,
} from "../../lib/format";

const sorts = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "nome", label: "Nome (A–Z)" },
  { value: "preco", label: "Menor mensalidade" },
  { value: "mec", label: "Maior conceito MEC" },
  { value: "cursos", label: "Mais cursos" },
];

const pageSize = 24;

export default function InstitutionsPage() {
  const {
    institutions,
    offers,
    catalogStatus,
    liked,
    toggleLike,
    compareIds,
    toggleCompare,
  } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [limit, setLimit] = useState(pageSize);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const filters = {
    q: params.get("q") || "",
    rede: params.get("rede") || "",
    tipo: params.get("tipo") || "",
    uf: params.get("uf") || "",
    modalidade: params.get("modalidade") || "",
    curso: params.get("curso") || "",
    max: params.get("max") || "",
    bolsas: params.get("bolsas") === "1",
    abertas: params.get("abertas") === "1",
    ordem: params.get("ordem") || "relevancia",
  };
  const opened = institutions.find((i) => i.id === params.get("abrir")) || null;

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  const [draft, setDraft] = useQueryDraft(filters.q, (q) => update({ q }));

  const offersByInstitution = useMemo(() => {
    const map = new Map<
      string,
      { courses: Set<string>; modalities: Set<string>; names: string[] }
    >();
    for (const o of offers) {
      const entry = map.get(o.institution_id) || {
        courses: new Set(),
        modalities: new Set(),
        names: [],
      };
      entry.courses.add(normalize(o.course_name));
      entry.modalities.add(normalize(modalityLabel(o.modality)));
      entry.names.push(o.course_name);
      map.set(o.institution_id, entry);
    }
    return map;
  }, [offers]);

  const options = useMemo(
    () => ({
      types: [
        ...new Set(institutions.map((i) => i.type).filter(Boolean)),
      ].sort(),
      states: [
        ...new Set(institutions.map((i) => i.state).filter(Boolean)),
      ].sort(),
      courses: [...new Set(offers.map((o) => o.course_name))].sort((a, b) =>
        a.localeCompare(b),
      ),
    }),
    [institutions, offers],
  );

  const results = useMemo(() => {
    const max = Number(filters.max);
    const list = institutions.filter((i) => {
      const entry = offersByInstitution.get(i.id);
      const text = [
        i.name,
        i.city,
        i.state,
        stateNames[i.state] || "",
        typeLabel(i.type),
        networkLabel(i.network),
        ...(entry?.names || []),
      ].join(" ");
      if (filters.q && !matchesQuery(text, filters.q)) return false;
      if (filters.rede && i.network !== filters.rede) return false;
      if (filters.tipo && i.type !== filters.tipo) return false;
      if (filters.uf && i.state !== filters.uf) return false;
      if (filters.curso && !entry?.courses.has(normalize(filters.curso)))
        return false;
      if (
        filters.modalidade &&
        !entry?.modalities.has(normalize(modalityLabel(filters.modalidade)))
      )
        return false;
      // Privadas sem mensalidade publicada ficam de fora: o valor é desconhecido, não zero.
      if (
        filters.max &&
        max >= 0 &&
        !(i.network === "publica" || (i.price > 0 && i.price <= max))
      )
        return false;
      if (filters.bolsas && !i.scholarships) return false;
      if (filters.abertas && !i.enrollmentOpen) return false;
      return true;
    });
    const courses = (id: string) =>
      offersByInstitution.get(id)?.courses.size || 0;
    const price = (p: number, network: string) =>
      network === "publica" ? 0 : p > 0 ? p : Infinity;
    const byName = (a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name);
    const sorters: Record<
      string,
      (a: (typeof list)[number], b: (typeof list)[number]) => number
    > = {
      nome: byName,
      preco: (a, b) =>
        price(a.price, a.network) - price(b.price, b.network) || byName(a, b),
      mec: (a, b) => b.mec - a.mec || byName(a, b),
      cursos: (a, b) => courses(b.id) - courses(a.id) || byName(a, b),
      relevancia: (a, b) => {
        const q = normalize(filters.q);
        const hit = (n: string) => (q && normalize(n).includes(q) ? 1 : 0);
        return (
          hit(b.name) - hit(a.name) ||
          Number(b.enrollmentOpen) - Number(a.enrollmentOpen) ||
          courses(b.id) - courses(a.id) ||
          byName(a, b)
        );
      },
    };
    return list.sort(sorters[filters.ordem] || sorters.relevancia);
  }, [
    filters.q,
    filters.rede,
    filters.tipo,
    filters.uf,
    filters.curso,
    filters.modalidade,
    filters.max,
    filters.bolsas,
    filters.abertas,
    filters.ordem,
    institutions,
    offersByInstitution,
  ]);

  useEffect(() => setLimit(pageSize), [results.length]);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || limit >= results.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setLimit((n) => n + pageSize),
      {
        rootMargin: "600px",
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [limit, results.length]);

  const chips = [
    filters.q && { key: "q", label: `“${filters.q}”` },
    filters.rede && { key: "rede", label: networkLabel(filters.rede) },
    filters.tipo && { key: "tipo", label: typeLabel(filters.tipo) },
    filters.uf && { key: "uf", label: stateNames[filters.uf] || filters.uf },
    filters.curso && { key: "curso", label: filters.curso },
    filters.modalidade && {
      key: "modalidade",
      label: modalityLabel(filters.modalidade),
    },
    filters.max && { key: "max", label: `Até ${money(Number(filters.max))}` },
    filters.bolsas && { key: "bolsas", label: "Com bolsas" },
    filters.abertas && { key: "abertas", label: "Inscrições abertas" },
  ].filter(Boolean) as { key: string; label: string }[];

  const clearAll = () => {
    setDraft("");
    router.replace(pathname, { scroll: false });
  };

  const loading = catalogStatus === "loading";

  return (
    <main className="page" id="conteudo">
      <CinematicPageHero kind="institutions">
        <span className="eyebrow light">Catálogo de instituições</span>
        <h1>Encontre a instituição certa.</h1>
        <p>
          Filtre por localização, rede, curso, modalidade e investimento. Os
          filtros ficam no endereço da página, então dá para compartilhar a
          busca.
        </p>
      </CinematicPageHero>

      <section
        className="catalogLayout container"
        id="busca"
        aria-label="Busca de instituições"
      >
        <aside
          className={`filterPanel ${filtersOpen ? "isOpen" : ""}`}
          aria-label="Filtros"
        >
          <div className="filterPanelHead">
            <h2>Filtros</h2>
            {chips.length > 0 && (
              <button type="button" className="textButton" onClick={clearAll}>
                Limpar tudo
              </button>
            )}
          </div>
          <label className="field">
            <span>Rede</span>
            <select
              aria-label="Rede"
              value={filters.rede}
              onChange={(e) => update({ rede: e.target.value || null })}
            >
              <option value="">Pública ou privada</option>
              <option value="publica">Pública (gratuita)</option>
              <option value="privada">Privada</option>
            </select>
          </label>
          <label className="field">
            <span>Tipo</span>
            <select
              aria-label="Tipo de instituição"
              value={filters.tipo}
              onChange={(e) => update({ tipo: e.target.value || null })}
            >
              <option value="">Todos os tipos</option>
              {options.types.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Estado</span>
            <select
              aria-label="Estado"
              value={filters.uf}
              onChange={(e) => update({ uf: e.target.value || null })}
            >
              <option value="">Todos os estados</option>
              {options.states.map((s) => (
                <option key={s} value={s}>
                  {stateNames[s] || s}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Curso</span>
            <select
              aria-label="Curso"
              value={filters.curso}
              onChange={(e) => update({ curso: e.target.value || null })}
            >
              <option value="">Qualquer curso</option>
              {options.courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="field">
            <legend>Modalidade</legend>
            <div className="chipChoices">
              {[
                ["", "Todas"],
                ["presencial", "Presencial"],
                ["ead", "EAD"],
                ["hibrido", "Híbrido"],
              ].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={filters.modalidade === value}
                  onClick={() => update({ modalidade: value || null })}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Mensalidade máxima</span>
            <div className="inputAffix">
              <small>R$</small>
              <input
                type="number"
                min={0}
                step={50}
                inputMode="numeric"
                placeholder="Sem limite"
                aria-label="Mensalidade máxima em reais"
                value={filters.max}
                onChange={(e) =>
                  update({ max: e.target.value.replace(/^-/, "") || null })
                }
              />
            </div>
            <small className="fieldHint">
              Inclui as públicas e as privadas com mensalidade informada.
            </small>
          </label>
          <label className="switchRow">
            <input
              type="checkbox"
              role="switch"
              checked={filters.bolsas}
              onChange={(e) =>
                update({ bolsas: e.target.checked ? "1" : null })
              }
            />
            <span>Com bolsas ou auxílios</span>
          </label>
          <label className="switchRow">
            <input
              type="checkbox"
              role="switch"
              checked={filters.abertas}
              onChange={(e) =>
                update({ abertas: e.target.checked ? "1" : null })
              }
            />
            <span>Inscrições abertas</span>
          </label>
          <button
            type="button"
            className="btn primary filterApply"
            onClick={() => setFiltersOpen(false)}
          >
            Ver {plural(results.length, "resultado", "resultados")}
          </button>
        </aside>

        <div className="catalogMain">
          <div className="searchBar">
            <label className="searchField">
              <Icon name="search" size={20} />
              <span className="srOnly">
                Pesquisar instituição, cidade, estado ou curso
              </span>
              <input
                type="search"
                value={draft}
                maxLength={120}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Instituição, cidade, estado ou curso"
              />
            </label>
            <button
              type="button"
              className="btn ghost filterToggle"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <Icon name="sliders" size={16} /> Filtros{" "}
              {chips.length > 0 && (
                <small className="count">{chips.length}</small>
              )}
            </button>
          </div>

          <div className="resultHead">
            <p aria-live="polite">
              {loading ? (
                "Carregando instituições…"
              ) : (
                <>
                  <b>{results.length}</b>{" "}
                  {results.length === 1
                    ? "instituição encontrada"
                    : "instituições encontradas"}
                </>
              )}
            </p>
            <label className="sortField">
              <Icon name="sort" size={16} />
              <span className="srOnly">Ordenar por</span>
              <select
                value={filters.ordem}
                onChange={(e) =>
                  update({
                    ordem:
                      e.target.value === "relevancia" ? null : e.target.value,
                  })
                }
              >
                {sorts.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <ul className="activeChips" aria-label="Filtros aplicados">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={() => {
                      if (chip.key === "q") setDraft("");
                      update({ [chip.key]: null });
                    }}
                    aria-label={`Remover filtro ${chip.label}`}
                  >
                    {chip.label} <Icon name="close" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {loading ? (
            <SkeletonCards />
          ) : results.length ? (
            <div className="cardGrid">
              {results.slice(0, limit).map((i) => (
                <InstitutionCard
                  key={i.id}
                  i={i}
                  courses={offersByInstitution.get(i.id)?.courses.size}
                  liked={liked.includes(i.id)}
                  comparing={compareIds.includes(i.id)}
                  onLike={() => toggleLike(i.id)}
                  onCompare={() => toggleCompare(i.id)}
                  onOpen={() => update({ abrir: i.id })}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search"
              title="Nenhuma instituição com esses filtros"
              action={
                <button type="button" className="btn ghost" onClick={clearAll}>
                  Limpar filtros
                </button>
              }
            >
              Tente outra palavra, outro estado ou remova algum filtro.
            </EmptyState>
          )}
          {limit < results.length && (
            <div ref={sentinel} className="loadMore" aria-hidden="true" />
          )}
        </div>
      </section>

      {compareIds.length > 0 && (
        <div className="compareDock" role="region" aria-label="Comparador">
          <span>
            <Icon name="compare" />{" "}
            {plural(compareIds.length, "instituição", "instituições")} no
            comparador
          </span>
          <Link className="btn primary small" href="/comparar">
            Comparar agora
          </Link>
        </div>
      )}

      {opened && (
        <InstitutionDetail i={opened} onClose={() => update({ abrir: null })} />
      )}
    </main>
  );
}
