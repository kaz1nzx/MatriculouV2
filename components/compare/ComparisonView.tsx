"use client";

import type { ReactNode } from "react";
import { Icon } from "../ui";
import type { Comparison } from "../../lib/compare";

const levels = ["Ignorar", "Pouco", "Importante", "Essencial"];

export function PriorityPanel<K extends string>({
  values,
  labels,
  onChange,
  children,
}: {
  values: Record<K, number>;
  labels: Record<K, string>;
  onChange: (next: Record<K, number>) => void;
  children?: ReactNode;
}) {
  return (
    <section className="priorityPanel" aria-labelledby="prioridades-titulo">
      <header>
        <Icon name="sliders" />
        <div>
          <h2 id="prioridades-titulo">O que mais importa para você?</h2>
          <p>
            A pontuação e a recomendação mudam conforme as suas prioridades.
          </p>
        </div>
      </header>
      <div className="priorityGrid">
        {(Object.keys(labels) as K[]).map((key) => (
          <fieldset key={key} className="priorityItem">
            <legend>{labels[key]}</legend>
            <div className="priorityScale">
              {levels.map((label, value) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={values[key] === value}
                  onClick={() => onChange({ ...values, [key]: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {children}
    </section>
  );
}

export function ComparisonView({
  result,
  heads,
  onRemove,
}: {
  result: Comparison;
  heads: { key: string; title: string; subtitle: string; media?: ReactNode }[];
  onRemove?: (index: number) => void;
}) {
  const ranked = [...result.verdicts].sort((a, b) => a.rank - b.rank);
  const top = ranked[0];

  return (
    <div className="comparison">
      <section className="verdict" aria-labelledby="veredito">
        <span className="verdictIcon">
          <Icon name="trophy" size={24} />
        </span>
        <div>
          <span className="eyebrow">Análise da comparação</span>
          <h2 id="veredito">{result.summary}</h2>
          {result.leaders.length > 0 && (
            <ul className="leaderList">
              {result.leaders.map((leader) => (
                <li key={leader.label}>
                  <span>{leader.label}</span>
                  <b>{leader.names.join(" · ")}</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ol className="rankGrid" aria-label="Ranking para as suas prioridades">
        {ranked.map((verdict) => {
          const head = heads[verdict.index];
          return (
            <li
              key={head.key}
              className={`rankCard ${verdict === top && verdict.score !== null ? "isTop" : ""}`}
            >
              <div className="rankHead">
                <span
                  className="rankPosition"
                  aria-label={`${verdict.rank}º lugar`}
                >
                  {verdict.rank}º
                </span>
                {head.media}
                <div>
                  <b>{head.title}</b>
                  <small>{head.subtitle}</small>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    className="iconButton"
                    onClick={() => onRemove(verdict.index)}
                    aria-label={`Remover ${head.title} da comparação`}
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>
              <div
                className="scoreBar"
                aria-label={
                  verdict.score === null
                    ? "Sem dados para pontuar"
                    : `${verdict.score} de 100 pontos`
                }
              >
                <span style={{ width: `${verdict.score ?? 0}%` }} />
                <b>{verdict.score ?? "—"}</b>
              </div>
              {verdict.strengths.length > 0 && (
                <ul className="pros" aria-label="Pontos fortes">
                  {verdict.strengths.map((s) => (
                    <li key={s}>
                      <Icon name="check" size={15} /> {s}
                    </li>
                  ))}
                </ul>
              )}
              {verdict.cautions.length > 0 && (
                <ul className="cons" aria-label="Pontos de atenção">
                  {verdict.cautions.map((c) => (
                    <li key={c}>
                      <Icon name="alert" size={15} /> {c}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div
        className="tableScroll"
        role="region"
        aria-label="Tabela comparativa"
        tabIndex={0}
      >
        <table className="compareTable">
          <caption className="srOnly">
            Comparação lado a lado. O melhor valor de cada critério aparece
            destacado.
          </caption>
          <thead>
            <tr>
              <th scope="col">Critério</th>
              {heads.map((h) => (
                <th scope="col" key={h.key}>
                  {h.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">
                  {row.label}
                  <small>{row.hint}</small>
                </th>
                {row.cells.map((cell, index) => (
                  <td
                    key={heads[index].key}
                    className={
                      cell.best ? "isBest" : cell.worst ? "isWorst" : ""
                    }
                  >
                    {cell.display}
                    {cell.best && (
                      <span className="bestTag">
                        <Icon name="star" size={12} /> Melhor
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
