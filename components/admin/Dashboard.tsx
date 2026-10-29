"use client";

import { useEffect, useState } from "react";
import type { AdminContext } from "./AdminApp";
import { SetupNotice } from "./AccessRequest";
import { Badge, Icon, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { plural, relativeTime, statusInfo } from "../../lib/format";
import type { Application, ApplicationStatus } from "../../lib/types";

type Metrics = {
  favoritos: number;
  cursos_ativos: number;
  mensagens_nao_lidas: number;
  candidaturas: Partial<Record<ApplicationStatus, number>>;
};

const funnel = ["enviada", "em_analise", "aprovada", "matriculada"] as const;
const stageLabels: Record<(typeof funnel)[number], string> = {
  enviada: "Recebidas",
  em_analise: "Analisadas",
  aprovada: "Aprovadas",
  matriculada: "Matriculadas",
};

export default function Dashboard({ institution, go }: AdminContext) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.rpc("metricas_instituicao", { inst: institution.id }),
      supabase
        .from("candidaturas")
        .select("*")
        .eq("instituicao_id", institution.id)
        .order("created_at", { ascending: false })
        .limit(6),
    ]).then(([m, r]) => {
      setMissing(isMissingTable(m.error) || isMissingTable(r.error));
      setMetrics(
        (m.data as Metrics) || {
          favoritos: 0,
          cursos_ativos: 0,
          mensagens_nao_lidas: 0,
          candidaturas: {},
        },
      );
      setRecent((r.data as Application[]) || []);
    });
  }, [institution.id]);

  if (missing) return <SetupNotice />;
  if (!metrics) return <Spinner label="Carregando indicadores" />;

  const byStatus = metrics.candidaturas || {};
  const total = Object.values(byStatus).reduce((a, b) => a + (b || 0), 0);
  const enrolled = byStatus.matriculada || 0;
  const conversion = total ? Math.round((enrolled / total) * 100) : 0;
  const count = (status: ApplicationStatus) => byStatus[status] || 0;
  // Cada etapa conta quem chegou até ela, mesmo que já tenha avançado.
  const reached: Record<(typeof funnel)[number], number> = {
    enviada: total,
    em_analise: total - count("enviada") - count("cancelada"),
    aprovada: count("aprovada") + count("matriculada"),
    matriculada: count("matriculada"),
  };

  const profileChecks = [
    { label: "Descrição", done: !!institution.description },
    { label: "Site oficial", done: !!institution.site },
    { label: "E-mail de contato", done: !!institution.email },
    { label: "Telefone", done: !!institution.phone },
    { label: "Endereço", done: !!institution.address },
    { label: "Foto da instituição", done: !!institution.image },
    {
      label: "Mensalidade informada",
      done: institution.network === "publica" || institution.price > 0,
    },
  ];
  const completion = Math.round(
    (profileChecks.filter((c) => c.done).length / profileChecks.length) * 100,
  );

  return (
    <div className="adminStack">
      <div className="kpiGrid">
        <button
          type="button"
          className="kpi"
          onClick={() => go("candidaturas")}
        >
          <span>
            <Icon name="inbox" /> Novas candidaturas
          </span>
          <b>{byStatus.enviada || 0}</b>
          <small>
            {plural(total, "candidatura no total", "candidaturas no total")}
          </small>
        </button>
        <button
          type="button"
          className="kpi"
          onClick={() => go("candidaturas")}
        >
          <span>
            <Icon name="chat" /> Mensagens não lidas
          </span>
          <b>{metrics.mensagens_nao_lidas}</b>
          <small>de estudantes</small>
        </button>
        <div className="kpi">
          <span>
            <Icon name="trophy" /> Conversão em matrícula
          </span>
          <b>{conversion}%</b>
          <small>
            {plural(enrolled, "matrícula confirmada", "matrículas confirmadas")}
          </small>
        </div>
        <div className="kpi">
          <span>
            <Icon name="heart" /> Favoritada por
          </span>
          <b>{metrics.favoritos}</b>
          <small>{metrics.favoritos === 1 ? "estudante" : "estudantes"}</small>
        </div>
        <button type="button" className="kpi" onClick={() => go("cursos")}>
          <span>
            <Icon name="book" /> Cursos ativos
          </span>
          <b>{metrics.cursos_ativos}</b>
          <small>publicados no catálogo</small>
        </button>
      </div>

      <div className="adminGrid">
        <section className="panel">
          <header className="cardHead">
            <h2>Funil de candidaturas</h2>
          </header>
          {total ? (
            <ol className="funnel">
              {funnel.map((status) => {
                const value = reached[status];
                return (
                  <li key={status}>
                    <span>{stageLabels[status]}</span>
                    <div className="funnelBar" aria-hidden="true">
                      <i
                        style={{
                          width: `${Math.max(4, (value / total) * 100)}%`,
                        }}
                      />
                    </div>
                    <b>{value}</b>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="muted">
              As candidaturas enviadas por estudantes aparecem aqui.
            </p>
          )}
        </section>

        <section className="panel">
          <header className="cardHead">
            <h2>Página pública</h2>
            <b className="completion">{completion}%</b>
          </header>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Página completa"
          >
            <span style={{ width: `${completion}%` }} />
          </div>
          <ul className="checklist">
            {profileChecks.map((c) => (
              <li key={c.label} className={c.done ? "done" : ""}>
                <Icon name={c.done ? "check" : "dot"} size={15} /> {c.label}
              </li>
            ))}
          </ul>
          {completion < 100 && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => go("perfil")}
            >
              <Icon name="edit" size={16} /> Completar dados
            </button>
          )}
        </section>

        <section className="panel span2">
          <header className="cardHead">
            <h2>Candidaturas recentes</h2>
            <button
              type="button"
              className="textButton"
              onClick={() => go("candidaturas")}
            >
              Ver todas
            </button>
          </header>
          {recent.length ? (
            <ul className="miniList">
              {recent.map((a) => (
                <li key={a.id}>
                  <span>
                    <b>{a.nome}</b>
                    <small>
                      {a.curso_nome || "Curso a definir"} ·{" "}
                      {relativeTime(a.created_at)}
                    </small>
                  </span>
                  <Badge tone={statusInfo[a.status].tone}>
                    {statusInfo[a.status].label}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              Nenhuma candidatura ainda. Mantenha cursos e inscrições
              atualizados para atrair estudantes.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
