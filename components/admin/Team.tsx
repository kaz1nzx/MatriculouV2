"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { AdminContext } from "./AdminApp";
import { SetupNotice } from "./AccessRequest";
import { useApp } from "../app/AppProvider";
import { Badge, ConfirmDialog, Field, Icon, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { clean, guard } from "../../lib/sanitize";
import { dateLabel, initials } from "../../lib/format";

type Member = {
  user_id: string;
  nome: string | null;
  email: string;
  papel: "admin" | "editor";
  created_at: string;
};

const roles = {
  admin: "Administrador: gerencia tudo, inclusive a equipe.",
  editor: "Editor: atualiza dados, cursos, comunicados e candidaturas.",
};

export default function Team({ institution, role }: AdminContext) {
  const { user, notify } = useApp();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "editor">("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<Member | null>(null);
  const canManage = role === "admin" || role === "plataforma";

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase.rpc(
      "equipe_instituicao",
      { inst: institution.id },
    );
    setMissing(isMissingTable(loadError));
    setMembers((data as Member[]) || []);
  }, [institution.id]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("adicionar_gestor", {
      inst: institution.id,
      email_usuario: clean(email),
      novo_papel: newRole,
    });
    setBusy(false);
    if (rpcError)
      return setError(
        /Nenhuma conta/.test(rpcError.message)
          ? rpcError.message
          : "Não foi possível adicionar. Verifique o e-mail.",
      );
    setEmail("");
    notify("Pessoa adicionada à equipe", "success");
    load();
  };

  const changeRole = async (m: Member, papel: "admin" | "editor") => {
    const { error: rpcError } = await supabase.rpc("adicionar_gestor", {
      inst: institution.id,
      email_usuario: m.email,
      novo_papel: papel,
    });
    if (rpcError) return notify("Não foi possível alterar o papel.", "error");
    notify("Papel atualizado", "success");
    load();
  };

  const remove = async () => {
    if (!removing) return;
    const { error: rpcError } = await supabase.rpc("remover_gestor", {
      inst: institution.id,
      alvo: removing.user_id,
    });
    setRemoving(null);
    if (rpcError)
      return notify(
        /pelo menos um administrador/.test(rpcError.message)
          ? "A instituição precisa ter pelo menos um administrador."
          : "Não foi possível remover.",
        "error",
      );
    notify("Pessoa removida da equipe");
    load();
  };

  if (missing) return <SetupNotice />;

  return (
    <div className="adminGrid">
      <section className="panel span2">
        <h2>Pessoas com acesso</h2>
        {members === null ? (
          <Spinner />
        ) : (
          <ul className="memberList">
            {members.map((m) => (
              <li key={m.user_id}>
                <span className="avatar" aria-hidden="true">
                  {initials(m.nome || m.email)}
                </span>
                <span>
                  <b>
                    {m.nome || m.email}{" "}
                    {m.user_id === user?.id && <small>(você)</small>}
                  </b>
                  <small>
                    {m.email} · desde {dateLabel(m.created_at)}
                  </small>
                </span>
                {canManage && m.user_id !== user?.id ? (
                  <>
                    <select
                      aria-label={`Papel de ${m.nome || m.email}`}
                      value={m.papel}
                      onChange={(e) =>
                        changeRole(m, e.target.value as "admin" | "editor")
                      }
                    >
                      <option value="admin">Administrador</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      type="button"
                      className="iconButton danger"
                      onClick={() => setRemoving(m)}
                      aria-label={`Remover ${m.nome || m.email}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </>
                ) : (
                  <Badge tone={m.papel === "admin" ? "accent" : "neutral"}>
                    {m.papel === "admin" ? "Administrador" : "Editor"}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {canManage ? (
        <form className="panel stack" onSubmit={add}>
          <h2>Adicionar pessoa</h2>
          <p className="muted">
            A pessoa precisa ter uma conta no Matriculou com este e-mail.
          </p>
          <Field label="E-mail">
            <input
              type="email"
              required
              maxLength={160}
              value={email}
              onChange={guard("email", setEmail)}
            />
          </Field>
          <fieldset className="field">
            <legend>Papel</legend>
            {(Object.keys(roles) as ("admin" | "editor")[]).map((r) => (
              <label key={r} className="radioRow">
                <input
                  type="radio"
                  name="papel"
                  value={r}
                  checked={newRole === r}
                  onChange={() => setNewRole(r)}
                />
                <span>{roles[r]}</span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="formError" role="alert">
              <Icon name="alert" size={16} /> {error}
            </p>
          )}
          <button className="btn primary" disabled={busy}>
            <Icon name="plus" size={16} />{" "}
            {busy ? "Adicionando…" : "Adicionar à equipe"}
          </button>
        </form>
      ) : (
        <section className="panel">
          <h2>Papéis</h2>
          <p className="muted">
            {roles.editor} Peça a um administrador para mudar a equipe.
          </p>
        </section>
      )}

      {removing && (
        <ConfirmDialog
          title="Remover da equipe?"
          confirmLabel="Remover"
          danger
          onConfirm={remove}
          onClose={() => setRemoving(null)}
        >
          {removing.nome || removing.email} perde o acesso ao painel de{" "}
          {institution.name}.
        </ConfirmDialog>
      )}
    </div>
  );
}
