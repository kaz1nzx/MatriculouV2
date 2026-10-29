"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useApp } from "../app/AppProvider";
import { ConfirmDialog, EmptyState, Field, Icon, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { clean, fieldError, guard } from "../../lib/sanitize";
import { dateLabel } from "../../lib/format";

export type UserDocument = {
  id: string;
  nome: string;
  path: string | null;
  created_at: string;
  url: string;
};

const accepted = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const maxSize = 10 * 1024 * 1024;
const signedTtl = 60 * 60;

export default function Documents({
  docs,
  setDocs,
}: {
  docs: UserDocument[] | null;
  setDocs: (
    update: (current: UserDocument[] | null) => UserDocument[] | null,
  ) => void;
}) {
  const { user, notify } = useApp();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<UserDocument | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<UserDocument | null>(null);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setName("");
    setFile(null);
    setEditing(null);
    setConsent(false);
    setError("");
  };

  const choose = (chosen?: File) => {
    if (!chosen) return;
    if (!accepted.includes(chosen.type))
      return setError("Envie um PDF ou uma imagem JPG, PNG ou WEBP.");
    if (chosen.size > maxSize) return setError("O arquivo deve ter até 10 MB.");
    setError("");
    setFile(chosen);
    if (!name) setName(chosen.name.replace(/\.[^.]+$/, "").slice(0, 120));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const title = clean(name);
    const invalid = fieldError(title, "text");
    if (!title || invalid)
      return setError(invalid || "Informe o nome do documento.");
    if (!editing && !file) return setError("Selecione o arquivo do documento.");
    if (file && !consent)
      return setError("Confirme o consentimento para guardar o documento.");
    setBusy(true);
    setError("");
    let path = editing?.path || null;
    let url = editing?.url || "";
    if (file) {
      path = `${user.id}/documentos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("pre-matriculas")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setBusy(false);
        return setError(
          /Bucket not found/i.test(uploadError.message)
            ? "O espaço de documentos não existe. Execute supabase/setup.sql."
            : "Não foi possível enviar o arquivo.",
        );
      }
      const { data: signed } = await supabase.storage
        .from("pre-matriculas")
        .createSignedUrl(path, signedTtl);
      url = signed?.signedUrl || "";
    }
    if (editing) {
      const { error: updateError } = await supabase
        .from("documentos_usuario")
        .update({ nome: title, path })
        .eq("id", editing.id)
        .eq("user_id", user.id);
      if (updateError) {
        setBusy(false);
        return setError("Não foi possível salvar a edição.");
      }
      if (file && editing.path)
        await supabase.storage.from("pre-matriculas").remove([editing.path]);
      setDocs((current) =>
        (current || []).map((d) =>
          d.id === editing.id ? { ...d, nome: title, path, url } : d,
        ),
      );
      notify("Documento atualizado", "success");
    } else {
      const { data, error: insertError } = await supabase
        .from("documentos_usuario")
        .insert({ user_id: user.id, nome: title, path })
        .select("id,nome,path,created_at")
        .single();
      if (insertError) {
        setBusy(false);
        return setError("Não foi possível guardar o documento.");
      }
      setDocs((current) => [{ ...data, url }, ...(current || [])]);
      notify("Documento guardado", "success");
    }
    setBusy(false);
    reset();
  };

  const remove = async () => {
    if (!removing || !user) return;
    setBusy(true);
    const { error: deleteError } = await supabase
      .from("documentos_usuario")
      .delete()
      .eq("id", removing.id)
      .eq("user_id", user.id);
    if (!deleteError && removing.path)
      await supabase.storage.from("pre-matriculas").remove([removing.path]);
    setBusy(false);
    setRemoving(null);
    if (deleteError)
      return notify("Não foi possível apagar o documento.", "error");
    setDocs((current) => (current || []).filter((d) => d.id !== removing.id));
    if (editing?.id === removing.id) reset();
    notify("Documento apagado");
  };

  return (
    <div className="accountSection">
      <header className="sectionHead">
        <div>
          <h1>Documentos</h1>
          <p>
            Guarde cópias dos seus documentos para ter tudo à mão na hora da
            matrícula. Só você tem acesso.
          </p>
        </div>
      </header>
      <div className="twoCol wide">
        <form className="accountCard" onSubmit={save}>
          <h2>{editing ? "Editar documento" : "Adicionar documento"}</h2>
          <Field label="Nome do documento">
            <input
              value={name}
              maxLength={120}
              onChange={guard("text", setName)}
              placeholder="Ex.: Histórico escolar"
            />
          </Field>
          <label
            className={`dropzone ${dragging ? "isDragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              choose(e.dataTransfer.files[0]);
            }}
          >
            <Icon name="upload" size={26} />
            <b>
              {file
                ? file.name
                : editing
                  ? "Trocar arquivo (opcional)"
                  : "Arraste o arquivo ou clique para escolher"}
            </b>
            <span>PDF, JPG, PNG ou WEBP · até 10 MB</span>
            <input
              type="file"
              accept={accepted.join(",")}
              onChange={(e) => choose(e.target.files?.[0])}
            />
          </label>
          {file && (
            <label className="check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Autorizo o Matriculou a guardar este documento de forma privada,
                só para minha organização. Posso apagá-lo quando quiser.{" "}
                <Link href="/privacidade">Saiba mais</Link>.
              </span>
            </label>
          )}
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
              <Icon name="check" size={16} />{" "}
              {busy ? "Salvando…" : editing ? "Salvar" : "Guardar documento"}
            </button>
          </div>
        </form>

        <div className="accountCard">
          <h2>Seus documentos</h2>
          <p className="muted small">
            Privados. Os links de abertura expiram em 1 hora.
          </p>
          {docs === null ? (
            <Spinner />
          ) : docs.length ? (
            <ul className="docList">
              {docs.map((d) => (
                <li key={d.id}>
                  <span className="docIcon">
                    <Icon name="file" />
                  </span>
                  <div>
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noopener noreferrer">
                        {d.nome}
                      </a>
                    ) : (
                      <b>{d.nome}</b>
                    )}
                    <small>Enviado em {dateLabel(d.created_at)}</small>
                  </div>
                  <button
                    type="button"
                    className="iconButton"
                    onClick={() => {
                      setEditing(d);
                      setName(d.nome);
                      setFile(null);
                    }}
                    aria-label={`Editar ${d.nome}`}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    type="button"
                    className="iconButton danger"
                    onClick={() => setRemoving(d)}
                    aria-label={`Apagar ${d.nome}`}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="file" title="Nenhum documento guardado">
              RG, histórico escolar e comprovante de residência são os mais
              pedidos na matrícula.
            </EmptyState>
          )}
        </div>
      </div>
      {removing && (
        <ConfirmDialog
          title="Apagar documento?"
          confirmLabel="Apagar"
          danger
          busy={busy}
          onConfirm={remove}
          onClose={() => setRemoving(null)}
        >
          “{removing.nome}” será apagado de forma definitiva.
        </ConfirmDialog>
      )}
    </div>
  );
}
