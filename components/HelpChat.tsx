"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { chatReply, welcome, type ChatMessage } from "../lib/chat";
import { CinemaIcon } from "./cinema/CinemaIcon";
import { clean, guard } from "../lib/sanitize";
import { OPEN_MIA_EVENT } from "../lib/events";

const storageKey = "matriculou-mia-v1";
const suggestions = [
  "Descobrir cursos",
  "Instituições públicas",
  "Estudar perto de mim",
  "Comparar opções",
];

export default function HelpChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [awaitingCity, setAwaitingCity] = useState(false);
  const [ready, setReady] = useState(false);
  const panel = useRef<HTMLElement>(null),
    input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null),
    launcher = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(),
    busy = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (Array.isArray(saved?.messages)) {
        const valid = saved.messages
          .filter(
            (m: ChatMessage) =>
              typeof m.id === "string" &&
              ["bot", "user"].includes(m.from) &&
              typeof m.text === "string" &&
              (!m.href ||
                /^\/(instituicoes|cursos|comparar|perfil|como-funciona|ajuda|privacidade|lgpd|cookies)(\?|$)/.test(
                  m.href,
                )),
          )
          .slice(-60);
        if (valid.length) setMessages(valid);
        setAwaitingCity(saved.awaitingCity === true);
      }
    } catch {
      /* A blocked session store does not prevent chatting. */
    }
    setReady(true);
    return () => clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ messages, awaitingCity }),
        );
      } catch {}
  }, [messages, awaitingCity, ready]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const openChat = () => setOpen(true);
    addEventListener(OPEN_MIA_EVENT, openChat);
    return () => removeEventListener(OPEN_MIA_EVENT, openChat);
  }, []);
  useEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        launcher.current?.focus();
      }
      if (e.key === "Tab") {
        const focusable = panel.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a,input:not(:disabled)",
        );
        if (!focusable?.length) return;
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, typing, open]);

  const close = () => {
    setOpen(false);
    launcher.current?.focus();
  };
  const send = (value: string) => {
    const text = value.trim().slice(0, 500);
    if (!text || busy.current) return;
    busy.current = true;
    setMessages((current) =>
      [
        ...current,
        { id: crypto.randomUUID(), from: "user" as const, text },
      ].slice(-59),
    );
    setDraft("");
    setTyping(true);
    const reply = chatReply(text, awaitingCity);
    timer.current = setTimeout(
      () => {
        setMessages((current) => [...current, reply.message]);
        setAwaitingCity(reply.awaitingCity);
        setTyping(false);
        busy.current = false;
        input.current?.focus({ preventScroll: true });
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550,
    );
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(clean(draft));
  };
  const reset = () => {
    clearTimeout(timer.current);
    busy.current = false;
    setTyping(false);
    setMessages([welcome]);
    setAwaitingCity(false);
    setDraft("");
    input.current?.focus();
  };
  const download = () => {
    const text = messages
      .map(
        (m) =>
          `${m.from === "bot" ? "Mia" : "Você"}: ${m.text}${m.href ? `\n${location.origin}${m.href}` : ""}`,
      )
      .join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "minha-conversa-matriculou.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="miaChat">
      {open && (
        <div className="miaBackdrop" onClick={close} aria-hidden="true" />
      )}
      {open && (
        <section
          id="mia-panel"
          className="miaPanel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mia-title"
          ref={panel}
        >
          <header className="miaHeader">
            <span className="miaAvatar">
              <CinemaIcon name="chat" size={24} />
            </span>
            <div>
              <h2 id="mia-title">
                Mia <span>/ Matriculou</span>
              </h2>
              <p>
                <i />
                Seu guia de possibilidades
              </p>
            </div>
            <button onClick={close} aria-label="Fechar conversa">
              ×
            </button>
          </header>
          <div className="miaToolbar">
            <span>UMA CONVERSA. NOVOS CAMINHOS.</span>
            <button
              onClick={download}
              aria-label="Baixar conversa"
              title="Baixar conversa"
            >
              <CinemaIcon name="down" size={15} />
            </button>
            <button
              onClick={reset}
              aria-label="Nova conversa"
              title="Nova conversa"
            >
              ↺
            </button>
          </div>
          <div
            className="miaMessages"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Mensagens da conversa"
            ref={log}
          >
            {messages.map((m) => (
              <article key={m.id} className={`miaMessage ${m.from}`}>
                <span>{m.from === "bot" ? "MIA" : "VOCÊ"}</span>
                <p>{m.text}</p>
                {m.href && (
                  <Link href={m.href} onClick={close}>
                    {m.linkLabel}
                    <CinemaIcon name="diagonal" size={15} />
                  </Link>
                )}
              </article>
            ))}
            {typing && (
              <div
                className="miaTyping"
                role="status"
                aria-label="Mia está respondendo"
              >
                <i />
                <i />
                <i />
              </div>
            )}
          </div>
          <div className="miaSuggestions" aria-label="Sugestões de perguntas">
            {suggestions.map((s) => (
              <button key={s} disabled={typing} onClick={() => send(s)}>
                {s}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <form className="miaForm" onSubmit={submit}>
            <label className="srOnly" htmlFor="mia-input">
              Sua mensagem
            </label>
            <input
              ref={input}
              id="mia-input"
              value={draft}
              onChange={guard("text", setDraft)}
              placeholder={
                awaitingCity
                  ? "Em qual cidade você quer estudar?"
                  : "O que você quer descobrir?"
              }
              maxLength={500}
              autoComplete="off"
            />
            <button
              disabled={!draft.trim() || typing}
              aria-label="Enviar mensagem"
              type="submit"
            >
              <CinemaIcon name="right" size={20} />
            </button>
          </form>
          <p className="miaDisclaimer">
            Guia automático do catálogo · conversa salva só neste navegador ·
            não digite dados pessoais
          </p>
        </section>
      )}
      <button
        ref={launcher}
        className={`miaLauncher ${open ? "isOpen" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fechar assistente" : "Abrir assistente"}
        aria-expanded={open}
        aria-controls={open ? "mia-panel" : undefined}
      >
        <CinemaIcon name="chat" size={21} />
        <span>{open ? "Fechar" : "Converse com a Mia"}</span>
        <i />
      </button>
    </div>
  );
}
