"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminContext } from "./AdminApp";
import { SetupNotice } from "./AccessRequest";
import { Badge, EmptyState, Icon, Segmented, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { dateLabel, initials, plural, statusInfo } from "../../lib/format";
import { matchesQuery } from "../../lib/search";
import { downloadFile, toCsv } from "../../lib/storage";
import type { Application } from "../../lib/types";

type Student = {
  key: string;
  name: string;
  email: string;
  phone: string | null;
  courses: string[];
  latest: Application;
  enrolled: boolean;
  count: number;
};

// A instituição só conhece os estudantes que enviaram candidatura a ela, com os dados que eles
// mesmos compartilharam. Favoritos e perfis completos nunca são expostos.
export default function Students({ institution }: AdminContext) {
  const [items, setItems] = useState<Application[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "todos" | "matriculados" | "em_processo"
  >("todos");

  useEffect(() => {
    supabase
      .from("candidaturas")
      .select("*")
      .eq("instituicao_id", institution.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setMissing(isMissingTable(error));
        setItems((data as Application[]) || []);
      });
  }, [institution.id]);

  const students = useMemo(() => {
    const map = new Map<string, Student>();
    for (const a of items || []) {
      const entry = map.get(a.user_id);
      if (entry) {
        entry.count += 1;
        if (a.curso_nome && !entry.courses.includes(a.curso_nome))
          entry.courses.push(a.curso_nome);
        entry.enrolled ||= a.status === "matriculada";
      } else
        map.set(a.user_id, {
          key: a.user_id,
          name: a.nome,
          email: a.email,
          phone: a.telefone,
          courses: a.curso_nome ? [a.curso_nome] : [],
          latest: a,
          enrolled: a.status === "matriculada",
          count: 1,
        });
    }
    return [...map.values()];
  }, [items]);

  const visible = students
    .filter(
      (s) =>
        filter === "todos" ||
        (filter === "matriculados"
          ? s.enrolled
          : !s.enrolled &&
            !["cancelada", "recusada"].includes(s.latest.status)),
    )
    .filter((s) =>
      matchesQuery(`${s.name} ${s.email} ${s.courses.join(" ")}`, query),
    );

  if (missing) return <SetupNotice />;
  if (items === null) return <Spinner label="Carregando alunos" />;

  const exportCsv = () =>
    downloadFile(
      `alunos-${institution.id}.csv`,
      toCsv([
        [
          "Nome",
          "E-mail",
          "Telefone",
          "Cursos",
          "Situação",
          "Última atualização",
        ],
        ...visible.map((s) => [
          s.name,
          s.email,
          s.phone,
          s.courses.join(", "),
          s.enrolled ? "Matriculado" : statusInfo[s.latest.status].label,
          dateLabel(s.latest.atualizado_em),
        ]),
      ]),
      "text/csv;charset=utf-8",
    );

  return (
    <div className="adminStack">
      <p className="muted">
        Estudantes que se candidataram à instituição, com os dados de contato
        que eles autorizaram compartilhar. Use-os apenas para o processo de
        admissão.
      </p>
      <div className="toolbar">
        <label className="searchField compact">
          <Icon name="search" />
          <span className="srOnly">Buscar aluno</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, e-mail ou curso"
          />
        </label>
        <Segmented
          label="Situação"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "todos", label: "Todos", count: students.length },
            { value: "em_processo", label: "Em processo" },
            {
              value: "matriculados",
              label: "Matriculados",
              count: students.filter((s) => s.enrolled).length,
            },
          ]}
        />
        <button
          type="button"
          className="btn ghost"
          onClick={exportCsv}
          disabled={!visible.length}
        >
          <Icon name="download" size={16} /> Exportar CSV
        </button>
      </div>
      {visible.length ? (
        <ul className="peopleGrid">
          {visible.map((s) => (
            <li key={s.key} className="panel person">
              <header>
                <span className="avatar" aria-hidden="true">
                  {initials(s.name)}
                </span>
                <div>
                  <b>{s.name}</b>
                  <small>
                    {plural(s.count, "candidatura", "candidaturas")}
                  </small>
                </div>
                <Badge
                  tone={
                    s.enrolled ? "success" : statusInfo[s.latest.status].tone
                  }
                >
                  {s.enrolled
                    ? "Matriculado"
                    : statusInfo[s.latest.status].label}
                </Badge>
              </header>
              <a href={`mailto:${s.email}`}>
                <Icon name="mail" size={15} /> {s.email}
              </a>
              {s.phone && (
                <a href={`tel:${s.phone.replace(/\D/g, "")}`}>
                  <Icon name="phone" size={15} /> {s.phone}
                </a>
              )}
              {s.courses.length > 0 && (
                <p>
                  <Icon name="book" size={15} /> {s.courses.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="users" title="Nenhum aluno com esse filtro">
          Os estudantes aparecem aqui assim que enviam a primeira candidatura.
        </EmptyState>
      )}
    </div>
  );
}
