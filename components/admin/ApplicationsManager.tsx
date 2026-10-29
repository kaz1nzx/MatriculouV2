"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminContext } from "./AdminApp";
import { SetupNotice } from "./AccessRequest";
import { useApp } from "../app/AppProvider";
import { Badge, EmptyState, Icon, Modal, Spinner } from "../ui";
import MessageThread from "../shared/MessageThread";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { dateLabel, relativeTime, statusInfo } from "../../lib/format";
import { matchesQuery } from "../../lib/search";
import { downloadFile, toCsv } from "../../lib/storage";
import type { Application, ApplicationStatus } from "../../lib/types";

const flow: ApplicationStatus[] = [
  "enviada",
  "em_analise",
  "aprovada",
  "lista_espera",
  "matriculada",
  "recusada",
];

export default function ApplicationsManager({ institution }: AdminContext) {
  const { user, notify } = useApp();
  const [items, setItems] = useState<Application[] | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [missing, setMissing] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus | "todas">("todas");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Application | null>(null);

  const load = useCallback(async () => {
    const [{ data, error }, messages] = await Promise.all([
      supabase
        .from("candidaturas")
        .select("*")
        .eq("instituicao_id", institution.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("mensagens")
        .select("candidatura_id")
        .eq("autor_tipo", "estudante")
        .is("lida_em", null),
    ]);
    setMissing(isMissingTable(error));
    setItems((data as Application[]) || []);
    const counts: Record<string, number> = {};
    for (const m of messages.data || [])
      counts[m.candidatura_id] = (counts[m.candidatura_id] || 0) + 1;
    setUnread(counts);
  }, [institution.id]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      (items || [])
        .filter((a) => status === "todas" || a.status === status)
        .filter((a) =>
          matchesQuery(`${a.nome} ${a.email} ${a.curso_nome || ""}`, query),
        ),
    [items, query, status],
  );

  const changeStatus = async (a: Application, next: ApplicationStatus) => {
    const { error } = await supabase
      .from("candidaturas")
      .update({ status: next })
      .eq("id", a.id);
    if (error) return notify("Não foi possível atualizar o status.", "error");
    setItems((current) =>
      (current || []).map((x) => (x.id === a.id ? { ...x, status: next } : x)),
    );
    setOpen((current) =>
      current?.id === a.id ? { ...current, status: next } : current,
    );
    notify(`Status alterado para “${statusInfo[next].label}”`, "success");
  };

  const exportCsv = () =>
    downloadFile(
      `candidaturas-${institution.id}.csv`,
      toCsv([
        [
          "Nome",
          "E-mail",
          "Telefone",
          "Curso",
          "Status",
          "Mensagem",
          "Enviada em",
        ],
        ...visible.map((a) => [
          a.nome,
          a.email,
          a.telefone,
          a.curso_nome,
          statusInfo[a.status].label,
          a.mensagem,
          dateLabel(a.created_at),
        ]),
      ]),
      "text/csv;charset=utf-8",
    );

  if (missing) return <SetupNotice />;
  if (items === null) return <Spinner label="Carregando candidaturas" />;

  const countOf = (s: ApplicationStatus) =>
    items.filter((a) => a.status === s).length;

  return (
    <div className="adminStack">
      <div className="statusTabs" role="group" aria-label="Filtrar por status">
        <button
          type="button"
          aria-pressed={status === "todas"}
          onClick={() => setStatus("todas")}
        >
          Todas <small>{items.length}</small>
        </button>
        {[...flow, "cancelada" as const].map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={status === s}
            onClick={() => setStatus(s)}
          >
            {statusInfo[s].label} <small>{countOf(s)}</small>
          </button>
        ))}
      </div>
      <div className="toolbar">
        <label className="searchField compact">
          <Icon name="search" />
          <span className="srOnly">Buscar candidato</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, e-mail ou curso"
          />
        </label>
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
        <div
          className="tableScroll panel flush"
          role="region"
          aria-label="Candidaturas"
          tabIndex={0}
        >
          <table className="dataTable">
            <thead>
              <tr>
                <th scope="col">Candidato</th>
                <th scope="col">Curso</th>
                <th scope="col">Recebida</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="srOnly">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr
                  key={a.id}
                  className={a.status === "enviada" ? "isNew" : ""}
                >
                  <th scope="row">
                    <b>{a.nome}</b>
                    <small>{a.email}</small>
                  </th>
                  <td>{a.curso_nome || "A definir"}</td>
                  <td>{relativeTime(a.created_at)}</td>
                  <td>
                    <Badge tone={statusInfo[a.status].tone}>
                      {statusInfo[a.status].label}
                    </Badge>
                  </td>
                  <td className="rowActions">
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => setOpen(a)}
                    >
                      Abrir{" "}
                      {unread[a.id] ? (
                        <small className="count alert">{unread[a.id]}</small>
                      ) : null}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="inbox"
          title={
            items.length
              ? "Nenhuma candidatura com esse filtro"
              : "Nenhuma candidatura ainda"
          }
        >
          Quando um estudante tocar em “Tenho interesse” na página da
          instituição, a candidatura aparece aqui.
        </EmptyState>
      )}

      {open && user && (
        <Modal
          title={open.nome}
          eyebrow={`Candidatura · ${open.curso_nome || "curso a definir"}`}
          size="lg"
          onClose={() => {
            setOpen(null);
            load();
          }}
        >
          <div className="applicationDetail">
            <dl className="factGrid compact">
              <div>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${open.email}`}>{open.email}</a>
                </dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>
                  {open.telefone ? (
                    <a href={`tel:${open.telefone.replace(/\D/g, "")}`}>
                      {open.telefone}
                    </a>
                  ) : (
                    "Não informado"
                  )}
                </dd>
              </div>
              <div>
                <dt>Enviada em</dt>
                <dd>{dateLabel(open.created_at)}</dd>
              </div>
              <div>
                <dt>Última atualização</dt>
                <dd>{relativeTime(open.atualizado_em)}</dd>
              </div>
            </dl>
            {open.mensagem && (
              <blockquote className="quote">
                <Icon name="chat" size={16} /> {open.mensagem}
              </blockquote>
            )}
            <fieldset className="statusPicker">
              <legend>Status da candidatura</legend>
              {open.status === "cancelada" ? (
                <p className="muted">O estudante cancelou esta candidatura.</p>
              ) : (
                <div className="chipChoices">
                  {flow.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={open.status === s}
                      onClick={() => changeStatus(open, s)}
                    >
                      {statusInfo[s].label}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
            <h3>Conversa com o estudante</h3>
            <MessageThread
              applicationId={open.id}
              as="instituicao"
              userId={user.id}
              disabled={
                open.status === "cancelada"
                  ? "Candidatura cancelada pelo estudante."
                  : undefined
              }
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
