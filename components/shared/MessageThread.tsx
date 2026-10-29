"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon, Spinner } from "../ui";
import { supabase } from "../../lib/supabase";
import { clean, fieldError } from "../../lib/sanitize";
import { relativeTime } from "../../lib/format";
import type { Message } from "../../lib/types";

export default function MessageThread({
  applicationId,
  as,
  userId,
  disabled,
}: {
  applicationId: string;
  as: "estudante" | "instituicao";
  userId: string;
  disabled?: string;
}) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const log = useRef<HTMLOListElement>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from("mensagens")
        .select("*")
        .eq("candidatura_id", applicationId)
        .order("created_at");
      if (!alive) return;
      setMessages((data as Message[]) || []);
      supabase
        .rpc("marcar_mensagens_lidas", { candidatura: applicationId, como: as })
        .then(() => undefined);
    };
    load();
    const channel = supabase
      .channel(`mensagens-${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `candidatura_id=eq.${applicationId}`,
        },
        (payload) => {
          setMessages((current) =>
            current?.some((m) => m.id === (payload.new as Message).id)
              ? current
              : [...(current || []), payload.new as Message],
          );
        },
      )
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [applicationId, as]);

  useEffect(() => {
    log.current?.lastElementChild?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = clean(draft, true);
    if (!text) return;
    const invalid = fieldError(text, "text");
    if (invalid) return setError(invalid);
    setBusy(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("mensagens")
      .insert({
        candidatura_id: applicationId,
        autor_id: userId,
        autor_tipo: as,
        texto: text,
      })
      .select("*")
      .single();
    setBusy(false);
    if (insertError)
      return setError("Não foi possível enviar. Tente novamente.");
    setDraft("");
    setMessages((current) =>
      current?.some((m) => m.id === data.id)
        ? current
        : [...(current || []), data as Message],
    );
  };

  return (
    <div className="thread">
      {messages === null ? (
        <Spinner label="Carregando mensagens" />
      ) : messages.length ? (
        <ol
          className="threadLog"
          ref={log}
          aria-label="Mensagens"
          aria-live="polite"
        >
          {messages.map((m) => (
            <li key={m.id} className={m.autor_tipo === as ? "mine" : "theirs"}>
              <span>
                {m.autor_tipo === "instituicao" ? "Instituição" : "Estudante"}
              </span>
              <p>{m.texto}</p>
              <time dateTime={m.created_at}>
                {relativeTime(m.created_at)}
                {m.autor_tipo === as && m.lida_em && " · lida"}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">Nenhuma mensagem ainda. Escreva a primeira.</p>
      )}
      {disabled ? (
        <p className="muted">{disabled}</p>
      ) : (
        <form className="threadForm" onSubmit={send}>
          <label className="srOnly" htmlFor={`msg-${applicationId}`}>
            Escreva uma mensagem
          </label>
          <textarea
            id={`msg-${applicationId}`}
            rows={2}
            maxLength={2000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(e);
            }}
            placeholder="Escreva uma mensagem… (Ctrl+Enter envia)"
          />
          <button
            className="btn primary"
            disabled={busy || !draft.trim()}
            aria-label="Enviar mensagem"
          >
            <Icon name="send" size={16} />
          </button>
        </form>
      )}
      {error && (
        <p className="formError" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
