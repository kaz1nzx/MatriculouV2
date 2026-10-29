"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useApp } from "../app/AppProvider";
import { Badge, DataNotice, Field, Icon, Modal, Segmented } from "../ui";
import { ImageCredit, InstitutionImage } from "./InstitutionCard";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { isMissingTable } from "../../lib/catalog";
import { clean, fieldError, guard } from "../../lib/sanitize";
import {
  dateLabel,
  formatPhone,
  levelLabel,
  mecLabel,
  modalityLabel,
  money,
  networkLabel,
  priceLabel,
  typeLabel,
} from "../../lib/format";
import type { Announcement, Institution, Offer } from "../../lib/types";

function ApplyForm({
  i,
  offers,
  onDone,
}: {
  i: Institution;
  offers: Offer[];
  onDone: () => void;
}) {
  const { user, notify } = useApp();
  const [offerId, setOfferId] = useState(offers[0]?.id || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const text = clean(message, true);
    const invalid = fieldError(text, "text");
    if (invalid) return setError(invalid);
    setBusy(true);
    setError("");
    const offer = offers.find((o) => o.id === offerId);
    const { error: insertError } = await supabase.from("candidaturas").insert({
      user_id: user.id,
      instituicao_id: i.id,
      oferta_id: offer?.id ?? null,
      curso_nome: offer?.course_name ?? null,
      nome: user.name,
      email: user.email,
      telefone: phone.replace(/\D/g, "").length >= 10 ? phone : null,
      mensagem: text || null,
    });
    setBusy(false);
    if (insertError) {
      if (insertError.code === "23505")
        return setError(
          "Você já tem uma candidatura ativa para este curso nesta instituição.",
        );
      if (isMissingTable(insertError))
        return setError(
          "As candidaturas ainda não foram ativadas. Execute supabase/painel-instituicoes.sql.",
        );
      return setError(
        "Não foi possível enviar agora. Tente novamente em instantes.",
      );
    }
    notify("Candidatura enviada. Acompanhe pelo seu perfil.", "success");
    onDone();
  };

  return (
    <form className="applyForm" onSubmit={submit}>
      <p className="muted">
        A instituição recebe seu nome, e-mail, telefone e mensagem para entrar
        em contato. A matrícula é feita diretamente com ela.
      </p>
      <Field label="Curso de interesse">
        <select value={offerId} onChange={(e) => setOfferId(e.target.value)}>
          {offers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.course_name} · {modalityLabel(o.modality)}
            </option>
          ))}
          <option value="">Ainda não decidi o curso</option>
        </select>
      </Field>
      <Field
        label="Telefone ou WhatsApp"
        optional
        hint="Com DDD. Ajuda a instituição a falar com você."
      >
        <input
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="(11) 91234-5678"
        />
      </Field>
      <Field
        label="Mensagem"
        optional
        hint="Conte o que você quer saber: bolsas, turnos, processo seletivo…"
      >
        <textarea
          rows={4}
          maxLength={1000}
          value={message}
          onChange={guard("text", setMessage)}
        />
      </Field>
      <label className="check">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Autorizo o envio dos meus dados de contato para {i.name}, conforme a{" "}
          <Link href="/privacidade" target="_blank">
            Política de Privacidade
          </Link>
          . Posso cancelar a candidatura quando quiser.
        </span>
      </label>
      {error && (
        <p className="formError" role="alert">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}
      <div className="formActions">
        <button type="button" className="btn ghost" onClick={onDone}>
          Voltar
        </button>
        <button className="btn primary" disabled={busy || !consent}>
          {busy ? "Enviando…" : "Enviar candidatura"}{" "}
          <Icon name="send" size={16} />
        </button>
      </div>
    </form>
  );
}

export default function InstitutionDetail({
  i,
  onClose,
}: {
  i: Institution;
  onClose: () => void;
}) {
  const {
    offers,
    liked,
    toggleLike,
    compareIds,
    toggleCompare,
    user,
    requireLogin,
    notify,
  } = useApp();
  const [tab, setTab] = useState<"visao" | "cursos" | "avisos">("visao");
  const [applying, setApplying] = useState(false);
  const [news, setNews] = useState<Announcement[]>([]);
  const own = useMemo(
    () =>
      offers
        .filter((o) => o.institution_id === i.id)
        .sort((a, b) => a.course_name.localeCompare(b.course_name)),
    [i.id, offers],
  );
  const levels = [...new Set(own.map((o) => o.level))];

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("comunicados")
      .select("id,instituicao_id,titulo,texto,publicado,created_at")
      .eq("instituicao_id", i.id)
      .eq("publicado", true)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setNews((data as Announcement[]) || []));
  }, [i.id]);

  const share = async () => {
    const url = `${location.origin}/instituicoes?abrir=${i.id}`;
    try {
      if (navigator.share) await navigator.share({ title: i.name, url });
      else {
        await navigator.clipboard.writeText(url);
        notify("Link copiado", "success");
      }
    } catch {
      // Compartilhamento cancelado pela pessoa.
    }
  };

  const facts = [
    { label: "Localização", value: `${i.city}, ${i.state}`, icon: "pin" },
    {
      label: "Rede",
      value: `${networkLabel(i.network)} · ${typeLabel(i.type)}`,
      icon: "building",
    },
    { label: "Mensalidade média", value: priceLabel(i), icon: "chart" },
    { label: "Conceito MEC", value: mecLabel(i), icon: "award" },
    {
      label: "Bolsas e auxílios",
      value: i.scholarships ? "Disponíveis" : "Não informado",
      icon: "star",
    },
    {
      label: "Inscrições",
      value: i.enrollmentOpen
        ? i.enrollmentUntil
          ? `Abertas até ${dateLabel(i.enrollmentUntil)}`
          : "Abertas"
        : "Consulte a instituição",
      icon: "calendar",
    },
  ];

  return (
    <Modal
      title={i.name}
      eyebrow={`${networkLabel(i.network)} · ${typeLabel(i.type)}`}
      onClose={onClose}
      size="lg"
    >
      {applying && user ? (
        <ApplyForm i={i} offers={own} onDone={() => setApplying(false)} />
      ) : (
        <div className="institutionDetail">
          <div className="detailHero">
            <InstitutionImage
              i={i}
              className="detailImage"
              sizes="(max-width: 900px) 100vw, 860px"
              priority
            />
            <div className="detailHeroActions">
              <button
                type="button"
                className={`btn glass ${liked.includes(i.id) ? "isOn" : ""}`}
                aria-pressed={liked.includes(i.id)}
                onClick={() => toggleLike(i.id)}
              >
                <Icon name="heart" size={16} />{" "}
                {liked.includes(i.id) ? "Favoritada" : "Favoritar"}
              </button>
              <button type="button" className="btn glass" onClick={share}>
                <Icon name="external" size={16} /> Compartilhar
              </button>
            </div>
          </div>

          <Segmented
            label="Seções da instituição"
            value={tab}
            onChange={setTab}
            options={[
              { value: "visao", label: "Visão geral" },
              { value: "cursos", label: "Cursos", count: own.length },
              { value: "avisos", label: "Comunicados", count: news.length },
            ]}
          />

          {tab === "visao" && (
            <>
              {i.description && <p className="detailLead">{i.description}</p>}
              <dl className="factGrid">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt>
                      <Icon name={f.icon} size={15} /> {f.label}
                    </dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              {(i.site || i.email || i.phone || i.address) && (
                <div className="contactList">
                  {i.site && (
                    <a href={i.site} target="_blank" rel="noopener noreferrer">
                      <Icon name="globe" /> Site oficial
                    </a>
                  )}
                  {i.email && (
                    <a href={`mailto:${i.email}`}>
                      <Icon name="mail" /> {i.email}
                    </a>
                  )}
                  {i.phone && (
                    <a href={`tel:${i.phone.replace(/\D/g, "")}`}>
                      <Icon name="phone" /> {i.phone}
                    </a>
                  )}
                  {i.address && (
                    <span>
                      <Icon name="pin" /> {i.address}
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {tab === "cursos" &&
            (own.length ? (
              levels.map((level) => (
                <section key={level} className="offerGroup">
                  <h3>{levelLabel(level)}</h3>
                  <ul>
                    {own
                      .filter((o) => o.level === level)
                      .map((o) => (
                        <li key={o.id}>
                          <Link
                            href={`/cursos?curso=${encodeURIComponent(o.course_name)}`}
                          >
                            {o.course_name}
                          </Link>
                          <span>
                            {modalityLabel(o.modality)}
                            {o.shift ? ` · ${o.shift}` : ""}
                            {o.price ? ` · ${money(o.price)}/mês` : ""}
                            {o.seats ? ` · ${o.seats} vagas` : ""}
                          </span>
                        </li>
                      ))}
                  </ul>
                </section>
              ))
            ) : (
              <p className="muted">
                A instituição ainda não publicou cursos no catálogo.
              </p>
            ))}

          {tab === "avisos" &&
            (news.length ? (
              <ul className="newsList">
                {news.map((n) => (
                  <li key={n.id}>
                    <time dateTime={n.created_at}>
                      {dateLabel(n.created_at)}
                    </time>
                    <b>{n.titulo}</b>
                    <p>{n.texto}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                Nenhum comunicado publicado por esta instituição.
              </p>
            ))}

          <DataNotice />
          <ImageCredit i={i} />

          <div className="detailFooter">
            <button
              type="button"
              className={`btn ghost ${compareIds.includes(i.id) ? "isOn" : ""}`}
              aria-pressed={compareIds.includes(i.id)}
              onClick={() => toggleCompare(i.id)}
            >
              <Icon
                name={compareIds.includes(i.id) ? "check" : "compare"}
                size={16}
              />
              {compareIds.includes(i.id)
                ? "No comparador"
                : "Adicionar ao comparador"}
            </button>
            {i.enrollmentOpen && (
              <Badge tone="success">Inscrições abertas</Badge>
            )}
            <button
              type="button"
              className="btn primary"
              onClick={() =>
                user
                  ? setApplying(true)
                  : requireLogin("Entre para enviar sua candidatura.")
              }
            >
              Tenho interesse <Icon name="send" size={16} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
