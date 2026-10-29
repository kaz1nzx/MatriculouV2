"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "../app/AppProvider";
import { Badge, EmptyState, Field, Icon } from "../ui";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { clean, fieldError, guard } from "../../lib/sanitize";
import { matchesQuery } from "../../lib/search";
import { dateLabel } from "../../lib/format";
import { legal } from "../../lib/legal";
import { OPEN_MIA_EVENT } from "../../lib/events";

const faq = [
  {
    topic: "Conta",
    q: "Preciso pagar para usar o Matriculou?",
    a: "Não. O Matriculou é gratuito para estudantes e famílias. Pagamentos de matrícula e mensalidade são feitos apenas com a instituição.",
  },
  {
    topic: "Conta",
    q: "Esqueci minha senha. Como recupero o acesso?",
    a: "Na tela de login, toque em “Esqueci minha senha”, informe seu e-mail e siga o link que enviaremos para criar uma nova senha.",
  },
  {
    topic: "Conta",
    q: "Fico conectado depois de fechar o navegador?",
    a: "Sim, até você tocar em “Sair”. Em computadores compartilhados, saia da conta ao terminar. Em Configurações você também encerra o acesso em outros aparelhos.",
  },
  {
    topic: "Candidaturas",
    q: "O que acontece quando envio uma candidatura?",
    a: "A instituição recebe seu nome, e-mail, telefone e mensagem e pode responder pelo próprio Matriculou. Você acompanha o status no perfil. A matrícula e o processo seletivo são feitos diretamente com a instituição.",
  },
  {
    topic: "Candidaturas",
    q: "Posso cancelar uma candidatura?",
    a: "Sim. Em Perfil › Candidaturas, toque em “Cancelar”. A instituição verá o status atualizado.",
  },
  {
    topic: "Catálogo",
    q: "De onde vêm os dados de mensalidade e conceito MEC?",
    a: "O conceito MEC vem do e-MEC. Mensalidades e bolsas são referências publicadas pelas instituições ou atualizadas por elas no painel. Sempre confirme com a instituição antes de decidir.",
  },
  {
    topic: "Catálogo",
    q: "Como funciona a comparação inteligente?",
    a: "Você escolhe até quatro instituições ou cursos e define o que mais importa. Cada critério recebe uma nota relativa às opções comparadas, ponderada pelas suas prioridades. Dados não informados não contam a favor nem contra.",
  },
  {
    topic: "Catálogo",
    q: "Encontrei uma informação errada. O que faço?",
    a: "Abra um chamado na categoria “Dados do catálogo” com o nome da instituição e o que precisa ser corrigido. Instituições cadastradas podem corrigir seus dados pelo painel.",
  },
  {
    topic: "Instituições",
    q: "Sou de uma instituição. Como gerencio nossa página?",
    a: "Crie uma conta, acesse “Para instituições” no rodapé e envie o pedido de acesso. Depois da aprovação, você gerencia dados, cursos, candidaturas, comunicados e equipe no painel.",
  },
  {
    topic: "Privacidade",
    q: "Como baixo ou apago meus dados?",
    a: "Em Perfil › Privacidade e dados você baixa uma cópia completa e pode excluir a conta. Outros pedidos da LGPD vão pelo formulário de direitos do titular.",
  },
];

const categories = [
  { value: "duvida", label: "Dúvida de uso" },
  { value: "conta", label: "Minha conta e acesso" },
  { value: "dados", label: "Dados do catálogo" },
  { value: "instituicao", label: "Sou de uma instituição" },
  { value: "problema", label: "Algo não funciona" },
  { value: "sugestao", label: "Sugestão" },
];

type Ticket = {
  id: string;
  assunto: string;
  categoria: string;
  status: string;
  resposta: string | null;
  created_at: string;
};

const ticketTone = {
  aberto: "info",
  em_andamento: "warning",
  resolvido: "success",
} as const;
const ticketLabel: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
};

export default function HelpPage() {
  const { user } = useApp();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    category: "duvida",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (user)
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        email: f.email || user.email,
      }));
    if (!user || !isSupabaseConfigured) return;
    supabase
      .from("tickets_suporte")
      .select("id,assunto,categoria,status,resposta,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTickets((data as Ticket[]) || []));
  }, [user, status]);

  const topics = [...new Set(faq.map((f) => f.topic))];
  const answers = faq.filter(
    (f) =>
      (!topic || f.topic === topic) && matchesQuery(`${f.q} ${f.a}`, query),
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const subject = clean(form.subject);
    const message = clean(form.message, true);
    const invalid =
      fieldError(subject, "text") ||
      fieldError(message, "text") ||
      fieldError(form.name, "name");
    if (invalid) return setError(invalid);
    if (message.length < 10)
      return setError(
        "Descreva um pouco mais o que aconteceu (mínimo de 10 caracteres).",
      );
    if (!isSupabaseConfigured)
      return setError("O envio está indisponível nesta demonstração.");
    setStatus("sending");
    setError("");
    const { error: insertError } = await supabase
      .from("tickets_suporte")
      .insert({
        user_id: user?.id ?? null,
        nome: clean(form.name),
        email: clean(form.email),
        categoria: form.category,
        assunto: subject,
        mensagem: message,
      });
    if (insertError) {
      setStatus("idle");
      return setError(
        isMissingTable(insertError)
          ? "O suporte ainda não foi ativado. Execute supabase/painel-instituicoes.sql."
          : "Não foi possível enviar agora. Tente novamente.",
      );
    }
    setStatus("sent");
    setForm((f) => ({ ...f, subject: "", message: "" }));
  };

  return (
    <main className="page" id="conteudo">
      <header className="pageHeader container">
        <span className="eyebrow">Central de ajuda</span>
        <h1>Como podemos ajudar?</h1>
        <p>
          Respostas rápidas, conversa com a Mia ou um chamado com a nossa
          equipe.
        </p>
        <label className="searchField large">
          <Icon name="search" size={20} />
          <span className="srOnly">Buscar nas perguntas frequentes</span>
          <input
            type="search"
            value={query}
            maxLength={120}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: senha, candidatura, mensalidade"
          />
        </label>
      </header>

      <section
        className="container helpChannels"
        aria-label="Canais de atendimento"
      >
        <button
          type="button"
          className="channel"
          onClick={() => window.dispatchEvent(new Event(OPEN_MIA_EVENT))}
        >
          <Icon name="chat" size={22} />
          <b>Converse com a Mia</b>
          <small>Guia automático do catálogo, disponível agora.</small>
        </button>
        <a className="channel" href="#chamado">
          <Icon name="inbox" size={22} />
          <b>Abrir um chamado</b>
          <small>Nossa equipe responde em até 2 dias úteis.</small>
        </a>
        <Link className="channel" href="/lgpd">
          <Icon name="shield" size={22} />
          <b>Privacidade e LGPD</b>
          <small>Pedidos sobre seus dados pessoais.</small>
        </Link>
      </section>

      <section className="container helpGrid">
        <div>
          <div className="sectionBar">
            <h2>Perguntas frequentes</h2>
            <div className="pillRow compact" role="group" aria-label="Temas">
              {["", ...topics].map((t) => (
                <button
                  key={t || "todos"}
                  type="button"
                  className="pill"
                  aria-pressed={topic === t}
                  onClick={() => setTopic(t)}
                >
                  {t || "Todos"}
                </button>
              ))}
            </div>
          </div>
          {answers.length ? (
            <div className="faqList">
              {answers.map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <Icon name="chevron" size={16} />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          ) : (
            <EmptyState icon="help" title="Nenhuma resposta encontrada">
              Tente outras palavras ou abra um chamado abaixo.
            </EmptyState>
          )}
        </div>

        <aside id="chamado" className="accountCard supportCard">
          <h2>Abrir um chamado</h2>
          {status === "sent" ? (
            <div className="successBox" role="status">
              <Icon name="check" size={20} />
              <div>
                <b>Chamado registrado.</b>
                <p>
                  Responderemos em {form.email}
                  {user ? " e aqui na central" : ""}.
                </p>
                <button
                  type="button"
                  className="textButton"
                  onClick={() => setStatus("idle")}
                >
                  Abrir outro chamado
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="stack">
              <Field label="Nome">
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  value={form.name}
                  onChange={guard("name", (v) =>
                    setForm((f) => ({ ...f, name: v })),
                  )}
                />
              </Field>
              <Field label="E-mail para resposta">
                <input
                  required
                  type="email"
                  maxLength={160}
                  autoComplete="email"
                  value={form.email}
                  onChange={guard("email", (v) =>
                    setForm((f) => ({ ...f, email: v })),
                  )}
                />
              </Field>
              <Field label="Assunto">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Título">
                <input
                  required
                  minLength={3}
                  maxLength={120}
                  value={form.subject}
                  onChange={guard("text", (v) =>
                    setForm((f) => ({ ...f, subject: v })),
                  )}
                />
              </Field>
              <Field
                label="Mensagem"
                hint="Não envie senhas ou documentos por aqui."
              >
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  value={form.message}
                  onChange={guard("text", (v) =>
                    setForm((f) => ({ ...f, message: v })),
                  )}
                />
              </Field>
              {error && (
                <p className="formError" role="alert">
                  <Icon name="alert" size={16} /> {error}
                </p>
              )}
              <button
                className="btn primary block"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Enviando…" : "Enviar chamado"}{" "}
                <Icon name="send" size={16} />
              </button>
              <p className="muted small">
                Ao enviar, você concorda com o uso destes dados para responder
                ao chamado, conforme a{" "}
                <Link href="/privacidade">Política de Privacidade</Link>.
                {legal.email && (
                  <>
                    {" "}
                    Também atendemos em{" "}
                    <a href={`mailto:${legal.email}`}>{legal.email}</a>.
                  </>
                )}
              </p>
            </form>
          )}

          {tickets.length > 0 && (
            <div className="ticketList">
              <h3>Seus chamados</h3>
              <ul>
                {tickets.map((t) => (
                  <li key={t.id}>
                    <span>
                      <b>{t.assunto}</b>
                      <small>{dateLabel(t.created_at)}</small>
                    </span>
                    <Badge
                      tone={
                        ticketTone[t.status as keyof typeof ticketTone] ||
                        "neutral"
                      }
                    >
                      {ticketLabel[t.status] || t.status}
                    </Badge>
                    {t.resposta && <p className="ticketAnswer">{t.resposta}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
