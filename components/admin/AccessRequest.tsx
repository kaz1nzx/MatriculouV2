"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "../app/AppProvider";
import { Badge, Field, Icon, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { clean, fieldError, guard } from "../../lib/sanitize";
import { dateLabel, formatPhone } from "../../lib/format";

type Request = {
  id: string;
  nome_instituicao: string;
  status: string;
  created_at: string;
};

export function SetupNotice() {
  return (
    <div className="setupNotice" role="alert">
      <Icon name="alert" />
      <p>
        O painel ainda não foi ativado no banco de dados. Execute{" "}
        <code>supabase/painel-instituicoes.sql</code> no SQL Editor do Supabase
        e recarregue a página.
      </p>
    </div>
  );
}

export default function AccessRequest() {
  const { user, institutions, notify } = useApp();
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState({
    institutionId: "",
    name: "",
    role: "",
    phone: user?.phone || "",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { data, error: loadError } = await supabase
      .from("solicitacoes_gestor")
      .select("id,nome_instituicao,status,created_at")
      .order("created_at", { ascending: false });
    setMissing(isMissingTable(loadError));
    setRequests((data as Request[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const chosen = institutions.find((i) => i.id === form.institutionId);
    const name = chosen?.name || clean(form.name);
    const invalid =
      fieldError(name, "text") ||
      fieldError(form.role, "text") ||
      fieldError(form.message, "text");
    if (invalid) return setError(invalid);
    if (name.length < 2) return setError("Informe a instituição.");
    setBusy(true);
    setError("");
    const { error: insertError } = await supabase
      .from("solicitacoes_gestor")
      .insert({
        user_id: user.id,
        instituicao_id: chosen?.id ?? null,
        nome_instituicao: name,
        cargo: clean(form.role),
        telefone: form.phone || null,
        mensagem: clean(form.message, true) || null,
      });
    setBusy(false);
    if (insertError)
      return setError(
        isMissingTable(insertError)
          ? "O painel ainda não foi ativado no banco."
          : "Não foi possível enviar o pedido.",
      );
    notify("Pedido enviado. Avisaremos por e-mail após a análise.", "success");
    load();
  };

  const pending = requests?.some((r) => r.status === "pendente");

  return (
    <section className="adminPitch">
      <span className="eyebrow">Acesso ao painel</span>
      <h1>Peça acesso para gerenciar sua instituição.</h1>
      <p>
        Para proteger as instituições, cada acesso é conferido pela equipe do
        Matriculou. Use o e-mail institucional quando possível: isso agiliza a
        análise.
      </p>
      {missing && <SetupNotice />}
      {requests === null ? (
        <Spinner />
      ) : (
        <>
          {requests.length > 0 && (
            <ul className="miniList card">
              {requests.map((r) => (
                <li key={r.id}>
                  <span>
                    <b>{r.nome_instituicao}</b>
                    <small>Enviado em {dateLabel(r.created_at)}</small>
                  </span>
                  <Badge
                    tone={
                      r.status === "aprovada"
                        ? "success"
                        : r.status === "recusada"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {r.status === "aprovada"
                      ? "Aprovado"
                      : r.status === "recusada"
                        ? "Não aprovado"
                        : "Em análise"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {requests.some((r) => r.status === "aprovada") && (
            <p className="successBox">
              <Icon name="check" /> Seu acesso foi aprovado.{" "}
              <button
                type="button"
                className="textButton"
                onClick={() => location.reload()}
              >
                Recarregar o painel
              </button>
            </p>
          )}
          {!pending && !missing && (
            <form className="accountCard formGrid" onSubmit={submit}>
              <Field
                label="Instituição"
                className="span2"
                hint="Não encontrou? Escolha “Outra” e digite o nome."
              >
                <select
                  value={form.institutionId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, institutionId: e.target.value }))
                  }
                >
                  <option value="">Outra (não está no catálogo)</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </Field>
              {!form.institutionId && (
                <Field label="Nome da instituição ou rede" className="span2">
                  <input
                    required
                    maxLength={160}
                    value={form.name}
                    onChange={guard("text", (v) =>
                      setForm((f) => ({ ...f, name: v })),
                    )}
                  />
                </Field>
              )}
              <Field label="Seu cargo">
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.role}
                  onChange={guard("text", (v) =>
                    setForm((f) => ({ ...f, role: v })),
                  )}
                  placeholder="Ex.: Coordenação de admissões"
                />
              </Field>
              <Field label="Telefone" optional>
                <input
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      phone: formatPhone(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Mensagem" optional className="span2">
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.message}
                  onChange={guard("text", (v) =>
                    setForm((f) => ({ ...f, message: v })),
                  )}
                  placeholder="Conte como podemos confirmar seu vínculo com a instituição."
                />
              </Field>
              {error && (
                <p className="formError span2" role="alert">
                  <Icon name="alert" size={16} /> {error}
                </p>
              )}
              <div className="formActions span2">
                <button className="btn primary" disabled={busy}>
                  {busy ? "Enviando…" : "Enviar pedido"}{" "}
                  <Icon name="send" size={16} />
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
