"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "../app/AppProvider";
import { Badge, ConfirmDialog, EmptyState, Icon, Spinner } from "../ui";
import MessageThread from "../shared/MessageThread";
import { supabase } from "../../lib/supabase";
import { dateLabel, statusInfo } from "../../lib/format";
import type { Application, ApplicationStatus } from "../../lib/types";

const steps: ApplicationStatus[] = [
  "enviada",
  "em_analise",
  "aprovada",
  "matriculada",
];

export default function Applications({
  items,
  unread,
  reload,
}: {
  items: Application[] | null;
  unread: Record<string, number>;
  reload: () => Promise<void>;
}) {
  const { user, institutions, notify } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);
  const byId = new Map(institutions.map((i) => [i.id, i]));

  const cancel = async () => {
    if (!cancelling) return;
    setBusy(true);
    const { error } = await supabase
      .from("candidaturas")
      .update({ status: "cancelada" })
      .eq("id", cancelling.id);
    setBusy(false);
    setCancelling(null);
    if (error) return notify("Não foi possível cancelar agora.", "error");
    notify("Candidatura cancelada.");
    reload();
  };

  return (
    <div className="accountSection">
      <header className="sectionHead">
        <div>
          <h1>Candidaturas</h1>
          <p>
            Acompanhe o status e converse com as instituições. A matrícula é
            feita diretamente com cada uma.
          </p>
        </div>
      </header>
      {items === null ? (
        <Spinner />
      ) : items.length ? (
        <ul className="applicationList">
          {items.map((a) => {
            const institution = byId.get(a.instituicao_id);
            const info = statusInfo[a.status];
            const current = steps.indexOf(a.status);
            const closed = ["cancelada", "recusada"].includes(a.status);
            return (
              <li key={a.id} className="accountCard application">
                <header>
                  <div>
                    <b>{institution?.name || "Instituição"}</b>
                    <small>
                      {a.curso_nome || "Curso a definir"} · enviada em{" "}
                      {dateLabel(a.created_at)}
                    </small>
                  </div>
                  <Badge tone={info.tone}>{info.label}</Badge>
                </header>
                {!closed && (
                  <ol className="stepper" aria-label="Etapas da candidatura">
                    {steps.map((step, index) => (
                      <li
                        key={step}
                        className={
                          index <= current ||
                          (a.status === "lista_espera" && index <= 1)
                            ? "done"
                            : ""
                        }
                        aria-current={a.status === step ? "step" : undefined}
                      >
                        <span />
                        {statusInfo[step].label}
                      </li>
                    ))}
                  </ol>
                )}
                <div className="inlineActions">
                  <button
                    type="button"
                    className="btn ghost small"
                    aria-expanded={open === a.id}
                    onClick={() => setOpen(open === a.id ? null : a.id)}
                  >
                    <Icon name="chat" size={15} /> Mensagens
                    {unread[a.id] ? (
                      <small className="count alert">{unread[a.id]}</small>
                    ) : null}
                  </button>
                  {institution && (
                    <Link
                      href={`/instituicoes?abrir=${institution.id}`}
                      className="btn ghost small"
                    >
                      Ver instituição
                    </Link>
                  )}
                  {!closed && a.status !== "matriculada" && (
                    <button
                      type="button"
                      className="btn ghost small dangerText"
                      onClick={() => setCancelling(a)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
                {open === a.id && user && (
                  <MessageThread
                    applicationId={a.id}
                    as="estudante"
                    userId={user.id}
                    disabled={
                      a.status === "cancelada"
                        ? "Esta candidatura foi cancelada."
                        : undefined
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon="inbox"
          title="Nenhuma candidatura enviada"
          action={
            <Link href="/instituicoes" className="btn primary">
              Encontrar instituições
            </Link>
          }
        >
          Abra uma instituição e toque em “Tenho interesse” para enviar seus
          dados de contato a ela.
        </EmptyState>
      )}
      {cancelling && (
        <ConfirmDialog
          title="Cancelar candidatura?"
          confirmLabel="Cancelar candidatura"
          danger
          busy={busy}
          onConfirm={cancel}
          onClose={() => setCancelling(null)}
        >
          A instituição será avisada pelo status. Você pode enviar uma nova
          candidatura depois.
        </ConfirmDialog>
      )}
    </div>
  );
}
