"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { AdminContext } from "./AdminApp";
import { SetupNotice } from "./AccessRequest";
import { useApp } from "../app/AppProvider";
import { Badge, ConfirmDialog, EmptyState, Field, Icon, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { clean, fieldError, guard } from "../../lib/sanitize";
import { dateLabel } from "../../lib/format";
import type { Announcement } from "../../lib/types";

export default function Announcements({ institution }: AdminContext) {
  const { user, notify } = useApp();
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<Announcement | null>(null);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("comunicados")
      .select("*")
      .eq("instituicao_id", institution.id)
      .order("created_at", { ascending: false });
    setMissing(isMissingTable(loadError));
    setItems((data as Announcement[]) || []);
  }, [institution.id]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditing(null);
    setTitle("");
    setText("");
    setPublished(true);
    setError("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = clean(title);
    const body = clean(text, true);
    const invalid = fieldError(t, "text") || fieldError(body, "text");
    if (invalid) return setError(invalid);
    if (t.length < 3 || !body) return setError("Preencha o título e o texto.");
    setBusy(true);
    const row = {
      instituicao_id: institution.id,
      titulo: t,
      texto: body,
      publicado: published,
    };
    const { error: saveError } = editing
      ? await supabase.from("comunicados").update(row).eq("id", editing.id)
      : await supabase
          .from("comunicados")
          .insert({ ...row, autor_id: user?.id });
    setBusy(false);
    if (saveError) return setError("Não foi possível salvar o comunicado.");
    notify(
      editing
        ? "Comunicado atualizado"
        : published
          ? "Comunicado publicado"
          : "Rascunho salvo",
      "success",
    );
    reset();
    load();
  };

  const remove = async () => {
    if (!removing) return;
    await supabase.from("comunicados").delete().eq("id", removing.id);
    setRemoving(null);
    notify("Comunicado excluído");
    load();
  };

  if (missing) return <SetupNotice />;

  return (
    <div className="adminGrid">
      <form className="panel stack" onSubmit={submit}>
        <h2>{editing ? "Editar comunicado" : "Novo comunicado"}</h2>
        <p className="muted">
          Avisos de processo seletivo, datas, eventos e bolsas. Aparecem na
          página pública da instituição.
        </p>
        <Field label="Título">
          <input
            maxLength={120}
            value={title}
            onChange={guard("text", setTitle)}
            placeholder="Ex.: Vestibular de verão com inscrições abertas"
          />
        </Field>
        <Field label="Texto" hint={`${text.length}/2000`}>
          <textarea
            rows={6}
            maxLength={2000}
            value={text}
            onChange={guard("text", setText)}
          />
        </Field>
        <label className="switchRow">
          <input
            type="checkbox"
            role="switch"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span>Publicar agora (desmarque para salvar como rascunho)</span>
        </label>
        {error && (
          <p className="formError" role="alert">
            <Icon name="alert" size={16} /> {error}
          </p>
        )}
        <div className="formActions">
          {editing && (
            <button type="button" className="btn ghost" onClick={reset}>
              Cancelar
            </button>
          )}
          <button className="btn primary" disabled={busy}>
            <Icon name="megaphone" size={16} />{" "}
            {busy
              ? "Salvando…"
              : editing
                ? "Salvar"
                : published
                  ? "Publicar"
                  : "Salvar rascunho"}
          </button>
        </div>
      </form>

      <section className="panel">
        <h2>Publicados e rascunhos</h2>
        {items === null ? (
          <Spinner />
        ) : items.length ? (
          <ul className="newsList admin">
            {items.map((n) => (
              <li key={n.id}>
                <div>
                  <time dateTime={n.created_at}>{dateLabel(n.created_at)}</time>
                  {!n.publicado && <Badge tone="warning">Rascunho</Badge>}
                </div>
                <b>{n.titulo}</b>
                <p>{n.texto}</p>
                <div className="inlineActions">
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => {
                      setEditing(n);
                      setTitle(n.titulo);
                      setText(n.texto);
                      setPublished(n.publicado);
                    }}
                  >
                    <Icon name="edit" size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    className="btn ghost small dangerText"
                    onClick={() => setRemoving(n)}
                  >
                    <Icon name="trash" size={14} /> Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="megaphone" title="Nenhum comunicado">
            Publique avisos para quem está acompanhando a instituição.
          </EmptyState>
        )}
      </section>
      {removing && (
        <ConfirmDialog
          title="Excluir comunicado?"
          confirmLabel="Excluir"
          danger
          onConfirm={remove}
          onClose={() => setRemoving(null)}
        >
          “{removing.titulo}” deixará de aparecer na página da instituição.
        </ConfirmDialog>
      )}
    </div>
  );
}
