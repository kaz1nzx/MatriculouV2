"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { SetupNotice } from "./AccessRequest";
import { useApp } from "../app/AppProvider";
import { Badge, EmptyState, Field, Icon, Segmented, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { clean, fieldError, guard } from "../../lib/sanitize";
import { relativeTime } from "../../lib/format";
import { stateNames } from "../../lib/search";

type AccessItem = {
  id: string;
  user_id: string;
  instituicao_id: string | null;
  nome_instituicao: string;
  cargo: string;
  telefone: string | null;
  mensagem: string | null;
  status: string;
  created_at: string;
};

export function AccessRequests() {
  const { institutions, notify } = useApp();
  const [items, setItems] = useState<AccessItem[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [filter, setFilter] = useState<"pendente" | "aprovada" | "recusada">(
    "pendente",
  );
  const [target, setTarget] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("solicitacoes_gestor")
      .select("*")
      .order("created_at", { ascending: false });
    setMissing(isMissingTable(error));
    setItems((data as AccessItem[]) || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (item: AccessItem, approve: boolean) => {
    const inst = target[item.id] || item.instituicao_id;
    if (approve && !inst)
      return notify("Escolha a instituição que será vinculada.", "error");
    const { error } = await supabase.rpc("analisar_solicitacao_gestor", {
      solicitacao: item.id,
      aprovar: approve,
      inst: inst || null,
    });
    if (error) return notify("Não foi possível concluir a análise.", "error");
    notify(approve ? "Acesso aprovado" : "Pedido recusado", "success");
    load();
  };

  if (missing) return <SetupNotice />;
  if (items === null) return <Spinner />;
  const visible = items.filter((i) => i.status === filter);

  return (
    <div className="adminStack">
      <Segmented
        label="Situação"
        value={filter}
        onChange={setFilter}
        options={[
          {
            value: "pendente",
            label: "Pendentes",
            count: items.filter((i) => i.status === "pendente").length,
          },
          { value: "aprovada", label: "Aprovados" },
          { value: "recusada", label: "Recusados" },
        ]}
      />
      {visible.length ? (
        <ul className="requestList">
          {visible.map((item) => (
            <li key={item.id} className="panel">
              <header>
                <div>
                  <b>{item.nome_instituicao}</b>
                  <small>
                    {item.cargo} · {relativeTime(item.created_at)}
                    {item.telefone ? ` · ${item.telefone}` : ""}
                  </small>
                </div>
                <Badge
                  tone={
                    item.status === "aprovada"
                      ? "success"
                      : item.status === "recusada"
                        ? "danger"
                        : "warning"
                  }
                >
                  {item.status}
                </Badge>
              </header>
              {item.mensagem && <p>{item.mensagem}</p>}
              {item.status === "pendente" && (
                <div className="toolbar">
                  <select
                    aria-label="Instituição a vincular"
                    value={target[item.id] ?? item.instituicao_id ?? ""}
                    onChange={(e) =>
                      setTarget((t) => ({ ...t, [item.id]: e.target.value }))
                    }
                  >
                    <option value="">Escolha a instituição</option>
                    {institutions.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => decide(item, false)}
                  >
                    Recusar
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => decide(item, true)}
                  >
                    <Icon name="check" size={16} /> Aprovar como administrador
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="lock" title="Nenhum pedido nesta situação" />
      )}
    </div>
  );
}

type Ticket = {
  id: string;
  nome: string;
  email: string;
  categoria: string;
  assunto: string;
  mensagem: string;
  status: "aberto" | "em_andamento" | "resolvido";
  resposta: string | null;
  created_at: string;
};

export function SupportTickets() {
  const { notify } = useApp();
  const [items, setItems] = useState<Ticket[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [filter, setFilter] = useState<Ticket["status"]>("aberto");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("tickets_suporte")
      .select("*")
      .order("created_at", { ascending: false });
    setMissing(isMissingTable(error));
    setItems((data as Ticket[]) || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (t: Ticket, status: Ticket["status"]) => {
    const answer = clean(answers[t.id] ?? t.resposta ?? "", true);
    if (fieldError(answer, "text"))
      return notify(fieldError(answer, "text"), "error");
    const { error } = await supabase
      .from("tickets_suporte")
      .update({ status, resposta: answer || null })
      .eq("id", t.id);
    if (error) return notify("Não foi possível salvar.", "error");
    notify("Chamado atualizado", "success");
    load();
  };

  if (missing) return <SetupNotice />;
  if (items === null) return <Spinner />;
  const visible = items.filter((t) => t.status === filter);

  return (
    <div className="adminStack">
      <Segmented
        label="Situação"
        value={filter}
        onChange={setFilter}
        options={[
          {
            value: "aberto",
            label: "Abertos",
            count: items.filter((t) => t.status === "aberto").length,
          },
          {
            value: "em_andamento",
            label: "Em andamento",
            count: items.filter((t) => t.status === "em_andamento").length,
          },
          { value: "resolvido", label: "Resolvidos" },
        ]}
      />
      {visible.length ? (
        <ul className="requestList">
          {visible.map((t) => (
            <li key={t.id} className="panel">
              <header>
                <div>
                  <b>{t.assunto}</b>
                  <small>
                    {t.nome} · <a href={`mailto:${t.email}`}>{t.email}</a> ·{" "}
                    {relativeTime(t.created_at)}
                  </small>
                </div>
                <Badge>{t.categoria}</Badge>
              </header>
              <p>{t.mensagem}</p>
              <Field label="Resposta (visível para quem abriu o chamado)">
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={answers[t.id] ?? t.resposta ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [t.id]: e.target.value }))
                  }
                />
              </Field>
              <div className="inlineActions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => save(t, "em_andamento")}
                >
                  Em andamento
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => save(t, "resolvido")}
                >
                  <Icon name="check" size={16} /> Responder e resolver
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="help" title="Nenhum chamado nesta situação" />
      )}
    </div>
  );
}

const slug = (state: string, name: string) =>
  `${state.toLowerCase()}-${name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)}`;

export function PlatformInstitutions() {
  const { reloadCatalog, notify } = useApp();
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "SP",
    network: "privada",
    type: "faculdade",
    mec: "",
    group: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const name = clean(form.name);
    const invalid = fieldError(name, "text") || fieldError(form.city, "name");
    if (invalid || name.length < 3)
      return setError(invalid || "Informe o nome completo.");
    setBusy(true);
    setError("");
    const { error: insertError } = await supabase.from("instituicoes").insert({
      id: slug(form.state, name),
      nome: name,
      cidade: clean(form.city),
      estado: form.state,
      rede: form.network,
      tipo: form.type,
      nota_mec: Number(form.mec) || 0,
      rede_ensino: clean(form.group) || null,
    });
    setBusy(false);
    if (insertError)
      return setError(
        insertError.code === "23505"
          ? "Já existe uma instituição com esse identificador."
          : "Não foi possível cadastrar.",
      );
    notify("Instituição cadastrada", "success");
    setForm((f) => ({ ...f, name: "", city: "", mec: "" }));
    reloadCatalog();
  };

  return (
    <form className="panel formGrid" onSubmit={submit}>
      <h2 className="span2">Cadastrar instituição</h2>
      <p className="muted span2">
        Confira nome, campus e conceito no e-MEC antes de cadastrar. Depois,
        aprove o acesso da equipe da instituição em “Pedidos de acesso”.
      </p>
      <Field label="Nome oficial" className="span2">
        <input
          required
          maxLength={160}
          value={form.name}
          onChange={guard("text", (v) => set("name", v))}
        />
      </Field>
      <Field label="Cidade">
        <input
          required
          maxLength={80}
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
        />
      </Field>
      <Field label="Estado">
        <select
          value={form.state}
          onChange={(e) => set("state", e.target.value)}
        >
          {Object.entries(stateNames).map(([uf, n]) => (
            <option key={uf} value={uf}>
              {n}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Rede">
        <select
          value={form.network}
          onChange={(e) => set("network", e.target.value)}
        >
          <option value="publica">Pública</option>
          <option value="privada">Privada</option>
        </select>
      </Field>
      <Field label="Tipo">
        <select value={form.type} onChange={(e) => set("type", e.target.value)}>
          <option value="universidade">Universidade</option>
          <option value="centro universitário">Centro universitário</option>
          <option value="faculdade">Faculdade</option>
          <option value="tecnico">Ensino técnico</option>
          <option value="escola">Escola</option>
        </select>
      </Field>
      <Field
        label="Conceito MEC (IGC ou CI)"
        optional
        hint="De 1 a 5. Deixe vazio se não houver."
      >
        <input
          type="number"
          min={1}
          max={5}
          value={form.mec}
          onChange={(e) => set("mec", e.target.value)}
        />
      </Field>
      <Field
        label="Rede de ensino"
        optional
        hint="Agrupa campi e unidades (ex.: SENAI, Centro Paula Souza)."
      >
        <input
          maxLength={80}
          value={form.group}
          onChange={(e) => set("group", e.target.value)}
        />
      </Field>
      {error && (
        <p className="formError span2" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
      <div className="formActions span2">
        <button className="btn primary" disabled={busy}>
          <Icon name="plus" size={16} /> {busy ? "Cadastrando…" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
