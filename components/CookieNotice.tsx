"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CONSENT_EVENT,
  OPEN_PREFERENCES_EVENT,
  gatedScripts,
  readConsent,
  saveConsent,
  type Consent,
  type ConsentCategory,
} from "../lib/consent";

// Third-party scripts only reach the page after their category is allowed. Revoking a category
// removes the tag and reloads, since a script that already ran cannot be undone in place.
function applyConsent(consent: Consent | null) {
  const root = document.documentElement;
  root.dataset.consentAnalytics = String(!!consent?.analytics);
  root.dataset.consentMarketing = String(!!consent?.marketing);
  let revoked = false;
  for (const script of gatedScripts) {
    const allowed = !!consent?.[script.category];
    const tag = document.getElementById(script.id);
    if (allowed && !tag) {
      const el = document.createElement("script");
      el.id = script.id;
      el.async = true;
      el.src = script.src;
      document.head.appendChild(el);
      if (script.init) {
        const init = document.createElement("script");
        init.id = `${script.id}-init`;
        init.text = script.init;
        document.head.appendChild(init);
      }
    } else if (!allowed && tag) {
      tag.remove();
      document.getElementById(`${script.id}-init`)?.remove();
      revoked = true;
    }
  }
  if (revoked) location.reload();
}

const categories: {
  id: "essential" | ConsentCategory;
  title: string;
  text: string;
}[] = [
  {
    id: "essential",
    title: "Essenciais",
    text: "Mantêm o comparador, a conversa com a Mia e suas escolhas de privacidade. Sempre ativos.",
  },
  {
    id: "analytics",
    title: "Analíticos",
    text: "Medem, de forma anônima, quais páginas são mais úteis.",
  },
  {
    id: "marketing",
    title: "Marketing",
    text: "Permitiriam anúncios personalizados. Hoje não usamos nenhum.",
  },
];

export default function CookieNotice() {
  const [open, setOpen] = useState(false);
  const [managing, setManaging] = useState(false);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = readConsent();
    applyConsent(stored);
    if (stored)
      setChoice({ analytics: stored.analytics, marketing: stored.marketing });
    else setOpen(true);
    const reopen = () => {
      const current = readConsent();
      if (current)
        setChoice({
          analytics: current.analytics,
          marketing: current.marketing,
        });
      setManaging(true);
      setOpen(true);
    };
    const changed = (e: Event) =>
      applyConsent((e as CustomEvent<Consent>).detail);
    addEventListener(OPEN_PREFERENCES_EVENT, reopen);
    addEventListener(CONSENT_EVENT, changed);
    return () => {
      removeEventListener(OPEN_PREFERENCES_EVENT, reopen);
      removeEventListener(CONSENT_EVENT, changed);
    };
  }, []);

  useEffect(() => {
    if (managing)
      panel.current
        ?.querySelector<HTMLElement>("input:not(:disabled)")
        ?.focus();
  }, [managing]);

  if (!open) return null;

  const decide = (value: { analytics: boolean; marketing: boolean }) => {
    saveConsent(value);
    setChoice(value);
    setManaging(false);
    setOpen(false);
  };

  return (
    <aside
      ref={panel}
      className={`consentBanner ${managing ? "isManaging" : ""}`}
      role="region"
      aria-label="Preferências de cookies"
    >
      <div className="consentCopy">
        <h2>Sua privacidade</h2>
        <p>
          Usamos apenas o armazenamento essencial para o site funcionar. Outras
          categorias só são ativadas com a sua permissão.{" "}
          <Link href="/cookies">Política de Cookies</Link>
        </p>
      </div>

      {managing && (
        <fieldset className="consentOptions">
          <legend className="srOnly">Categorias de cookies</legend>
          {categories.map((item) => {
            const essential = item.id === "essential";
            const checked = essential
              ? true
              : choice[item.id as ConsentCategory];
            return (
              <label key={item.id} className="consentOption">
                <span>
                  <b>{item.title}</b>
                  <small>{item.text}</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className="consentSwitch"
                  checked={checked}
                  disabled={essential}
                  aria-checked={checked}
                  onChange={(e) =>
                    setChoice((current) => ({
                      ...current,
                      [item.id]: e.target.checked,
                    }))
                  }
                />
              </label>
            );
          })}
        </fieldset>
      )}

      <div className="consentActions">
        {managing ? (
          <button
            type="button"
            className="consentButton primary"
            onClick={() => decide(choice)}
          >
            Salvar preferências
          </button>
        ) : (
          <button
            type="button"
            className="consentButton ghost"
            onClick={() => setManaging(true)}
            aria-expanded={false}
          >
            Gerenciar preferências
          </button>
        )}
        <button
          type="button"
          className="consentButton"
          onClick={() => decide({ analytics: false, marketing: false })}
        >
          Rejeitar
        </button>
        <button
          type="button"
          className="consentButton primary"
          onClick={() => decide({ analytics: true, marketing: true })}
        >
          Aceitar todos
        </button>
      </div>
    </aside>
  );
}
