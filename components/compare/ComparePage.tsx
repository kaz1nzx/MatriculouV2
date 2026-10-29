"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { compareLimit, useApp } from "../app/AppProvider";
import CinematicPageHero from "../cinema/CinematicPageHero";
import { ComparisonView, PriorityPanel } from "./ComparisonView";
import { InstitutionImage } from "../institutions/InstitutionCard";
import { EmptyState, Icon, Modal, Segmented } from "../ui";
import {
  compareInstitutions,
  defaultInstitutionPriorities,
  institutionPriorityLabels,
  type InstitutionPriorities,
} from "../../lib/compare";
import { matchesQuery, stateNames } from "../../lib/search";
import { networkLabel, typeLabel } from "../../lib/format";
import type { Institution } from "../../lib/types";

function Picker({ onClose }: { onClose: () => void }) {
  const { institutions, compareIds, toggleCompare } = useApp();
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState<"todas" | "publica" | "privada">(
    "todas",
  );
  const full = compareIds.length >= compareLimit;
  const options = institutions
    .filter((i) => network === "todas" || i.network === network)
    .filter((i) =>
      matchesQuery(
        `${i.name} ${i.city} ${i.state} ${stateNames[i.state] || ""}`,
        query,
      ),
    )
    .slice(0, 60);

  return (
    <Modal
      title="Escolha as instituições"
      eyebrow={`${compareIds.length} de ${compareLimit} selecionadas`}
      onClose={onClose}
    >
      <label className="searchField compact">
        <Icon name="search" />
        <span className="srOnly">Pesquisar instituição</span>
        <input
          data-autofocus
          type="search"
          value={query}
          maxLength={120}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome, cidade ou estado"
        />
      </label>
      <Segmented
        label="Rede"
        value={network}
        onChange={setNetwork}
        options={[
          { value: "todas", label: "Todas" },
          { value: "publica", label: "Públicas" },
          { value: "privada", label: "Privadas" },
        ]}
      />
      <ul className="pickList">
        {options.map((i) => {
          const selected = compareIds.includes(i.id);
          return (
            <li key={i.id}>
              <button
                type="button"
                aria-pressed={selected}
                disabled={!selected && full}
                onClick={() => toggleCompare(i.id)}
              >
                <InstitutionImage i={i} sizes="64px" />
                <span>
                  <b>{i.name}</b>
                  <small>
                    {i.city}, {i.state} · {networkLabel(i.network)}
                  </small>
                </span>
                <Icon name={selected ? "check" : "plus"} />
              </button>
            </li>
          );
        })}
        {!options.length && (
          <li className="muted">Nenhuma instituição encontrada.</li>
        )}
      </ul>
    </Modal>
  );
}

export default function ComparePage() {
  const { institutions, offers, compareIds, setCompareIds, user } = useApp();
  const [picking, setPicking] = useState(false);
  const [priorities, setPriorities] = useState<InstitutionPriorities>(
    defaultInstitutionPriorities,
  );
  const [course, setCourse] = useState("");
  const [state, setState] = useState(user?.state || "");

  const selected = compareIds
    .map((id) => institutions.find((i) => i.id === id))
    .filter(Boolean) as Institution[];
  const courseOptions = useMemo(() => {
    const ids = new Set(selected.map((i) => i.id));
    return [
      ...new Set(
        offers
          .filter((o) => ids.has(o.institution_id))
          .map((o) => o.course_name),
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [offers, selected]);

  const result = useMemo(
    () =>
      selected.length >= 2
        ? compareInstitutions(selected, offers, { priorities, course, state })
        : null,
    [course, offers, priorities, selected, state],
  );

  return (
    <main className="page" id="conteudo">
      <CinematicPageHero kind="compare">
        <span className="eyebrow light">Comparação inteligente</span>
        <h1>Compare com clareza.</h1>
        <p>
          Escolha até quatro instituições. O Matriculou cruza custo, conceito
          MEC, cursos, modalidades e bolsas, aponta o melhor em cada critério e
          recomenda a opção mais equilibrada para as suas prioridades.
        </p>
      </CinematicPageHero>

      <section className="container compareSection">
        <div className="compareSlots" aria-label="Instituições selecionadas">
          {Array.from({ length: compareLimit }, (_, slot) => {
            const i = selected[slot];
            return i ? (
              <div className="slot isFilled" key={i.id}>
                <InstitutionImage i={i} sizes="120px" />
                <span>
                  <b>{i.name}</b>
                  <small>
                    {i.city}, {i.state} · {typeLabel(i.type)}
                  </small>
                </span>
                <button
                  type="button"
                  className="iconButton"
                  onClick={() =>
                    setCompareIds(compareIds.filter((id) => id !== i.id))
                  }
                  aria-label={`Remover ${i.name}`}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="slot"
                key={slot}
                onClick={() => setPicking(true)}
              >
                <Icon name="plus" size={22} />
                <span>Adicionar instituição</span>
              </button>
            );
          })}
        </div>

        {selected.length < 2 ? (
          <EmptyState
            icon="compare"
            title={
              selected.length
                ? "Adicione mais uma instituição"
                : "Monte sua comparação"
            }
            action={
              <div className="inlineActions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => setPicking(true)}
                >
                  <Icon name="plus" size={16} /> Adicionar instituição
                </button>
                <Link href="/instituicoes" className="btn ghost">
                  Explorar o catálogo
                </Link>
              </div>
            }
          >
            Com duas ou mais, você vê o melhor de cada uma e uma recomendação
            para o seu perfil.
          </EmptyState>
        ) : (
          <>
            <PriorityPanel
              values={priorities}
              labels={institutionPriorityLabels}
              onChange={setPriorities}
            >
              <div className="priorityExtras">
                <label className="field">
                  <span>Curso que você procura</span>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="">Qualquer curso</option>
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Onde você quer estudar</span>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Qualquer estado</option>
                    {Object.entries(stateNames).map(([uf, name]) => (
                      <option key={uf} value={uf}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="textButton"
                  onClick={() => setPriorities(defaultInstitutionPriorities)}
                >
                  Restaurar prioridades
                </button>
              </div>
            </PriorityPanel>
            {result && (
              <ComparisonView
                result={result}
                heads={selected.map((i) => ({
                  key: i.id,
                  title: i.name,
                  subtitle: `${i.city}, ${i.state} · ${networkLabel(i.network)}`,
                  media: (
                    <InstitutionImage
                      i={i}
                      sizes="56px"
                      className="rankThumb"
                    />
                  ),
                }))}
                onRemove={(index) =>
                  setCompareIds(
                    compareIds.filter((id) => id !== selected[index].id),
                  )
                }
              />
            )}
            <p className="methodNote">
              <Icon name="info" size={15} /> Como calculamos: cada critério
              recebe uma nota de 0 a 100 relativa às opções comparadas,
              ponderada pelas suas prioridades. Dados não informados não contam
              a favor nem contra. Confirme os valores com a instituição e no
              e-MEC antes de decidir.
            </p>
          </>
        )}
      </section>

      {picking && <Picker onClose={() => setPicking(false)} />}
    </main>
  );
}
