"use client";

import { useEffect, useState } from "react";
import type { AdminContext } from "./AdminApp";
import { SetupNotice } from "./AccessRequest";
import { EmptyState, Icon, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { relativeTime, statusInfo } from "../../lib/format";
import type { ApplicationStatus } from "../../lib/types";

type Entry = {
  id: number;
  tabela: string;
  acao: string;
  registro: string | null;
  detalhes: Record<string, unknown> | null;
  created_at: string;
  user_id: string | null;
};

const subjects: Record<string, [string, string]> = {
  instituicoes: ["building", "Dados da instituição"],
  ofertas: ["book", "Curso"],
  candidaturas: ["inbox", "Candidatura"],
  comunicados: ["megaphone", "Comunicado"],
  gestores: ["shield", "Equipe"],
};
const verbs: Record<string, string> = {
  insert: "criado",
  update: "alterado",
  delete: "excluído",
};

const describe = (e: Entry) => {
  const d = e.detalhes || {};
  if (e.tabela === "candidaturas" && d.status)
    return `Status alterado para “${statusInfo[d.status as ApplicationStatus]?.label || d.status}”`;
  if (e.tabela === "ofertas" && "ativo" in d)
    return d.ativo ? "Curso publicado" : "Curso ocultado";
  const fields = Object.keys(d).filter(
    (k) => !["id", "criado_em", "created_at"].includes(k),
  );
  const [, label] = subjects[e.tabela] || ["dot", e.tabela];
  return `${label} ${verbs[e.acao] || e.acao}${fields.length ? `: ${fields.map((f) => f.replace(/_/g, " ")).join(", ")}` : ""}`;
};

export default function Activity({ institution }: AdminContext) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase
      .from("auditoria")
      .select("*")
      .eq("instituicao_id", institution.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        setMissing(isMissingTable(error));
        setEntries((data as Entry[]) || []);
      });
  }, [institution.id]);

  if (missing) return <SetupNotice />;
  if (entries === null) return <Spinner label="Carregando atividade" />;

  return (
    <section className="panel">
      <p className="muted">
        Registro automático das alterações feitas pela equipe nos últimos 100
        eventos. Ele não pode ser editado.
      </p>
      {entries.length ? (
        <ol className="timeline">
          {entries.map((e) => (
            <li key={e.id}>
              <span className="timelineIcon">
                <Icon name={(subjects[e.tabela] || ["dot"])[0]} size={15} />
              </span>
              <div>
                <b>{describe(e)}</b>
                <time dateTime={e.created_at}>
                  {relativeTime(e.created_at)}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState icon="history" title="Nenhuma atividade registrada">
          As alterações da equipe aparecem aqui.
        </EmptyState>
      )}
    </section>
  );
}
