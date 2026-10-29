"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useApp } from "./AppProvider";
import { Icon } from "../ui";
import { courseInfo } from "../../lib/courses";
import { matchesQuery, stateNames } from "../../lib/search";
import { networkLabel, typeLabel } from "../../lib/format";

type Result = {
  id: string;
  group: string;
  title: string;
  detail: string;
  href: string;
  icon: string;
};

const pages: Result[] = [
  {
    id: "p-inst",
    group: "Páginas",
    title: "Instituições",
    detail: "Catálogo com filtros",
    href: "/instituicoes",
    icon: "school",
  },
  {
    id: "p-cursos",
    group: "Páginas",
    title: "Cursos",
    detail: "Descrições, grades e carreiras",
    href: "/cursos",
    icon: "book",
  },
  {
    id: "p-comparar",
    group: "Páginas",
    title: "Comparar instituições",
    detail: "Comparação inteligente lado a lado",
    href: "/comparar",
    icon: "compare",
  },
  {
    id: "p-perfil",
    group: "Páginas",
    title: "Meu perfil",
    detail: "Favoritas, candidaturas e configurações",
    href: "/perfil",
    icon: "user",
  },
  {
    id: "p-ajuda",
    group: "Páginas",
    title: "Central de ajuda",
    detail: "Perguntas frequentes e suporte",
    href: "/ajuda",
    icon: "help",
  },
  {
    id: "p-admin",
    group: "Páginas",
    title: "Painel da instituição",
    detail: "Gestão para instituições e redes de ensino",
    href: "/admin",
    icon: "building",
  },
  {
    id: "p-lgpd",
    group: "Páginas",
    title: "Privacidade e LGPD",
    detail: "Seus direitos sobre seus dados",
    href: "/lgpd",
    icon: "shield",
  },
];

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { institutions } = useApp();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    input.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim();
    const found: Result[] = [];
    if (q) {
      found.push(
        ...institutions
          .filter((i) =>
            matchesQuery(
              `${i.name} ${i.city} ${i.state} ${stateNames[i.state] || ""}`,
              q,
            ),
          )
          .slice(0, 6)
          .map((i) => ({
            id: `i-${i.id}`,
            group: "Instituições",
            title: i.name,
            detail: `${i.city}, ${i.state} · ${networkLabel(i.network)} · ${typeLabel(i.type)}`,
            href: `/instituicoes?q=${encodeURIComponent(i.name)}&abrir=${i.id}`,
            icon: "school",
          })),
        ...courseInfo
          .filter((c) =>
            matchesQuery(
              `${c.name} ${c.area} ${c.level} ${c.careers.join(" ")}`,
              q,
            ),
          )
          .slice(0, 6)
          .map((c) => ({
            id: `c-${c.name}`,
            group: "Cursos",
            title: c.name,
            detail: `${c.area} · ${c.level} · ${c.duration}`,
            href: `/cursos?curso=${encodeURIComponent(c.name)}`,
            icon: "book",
          })),
      );
    }
    found.push(
      ...pages
        .filter((p) => !q || matchesQuery(`${p.title} ${p.detail}`, q))
        .slice(0, q ? 3 : 7),
    );
    return found;
  }, [institutions, query]);

  useEffect(() => setActive(0), [query]);

  const go = (result?: Result) => {
    if (!result) {
      if (query.trim())
        router.push(`/instituicoes?q=${encodeURIComponent(query.trim())}`);
      return onClose();
    }
    router.push(result.href);
    onClose();
  };

  const groups = [...new Set(results.map((r) => r.group))];

  return (
    <div
      className="modalLayer searchLayer"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="searchPanel"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar no Matriculou"
      >
        <div className="searchInput">
          <Icon name="search" size={20} />
          <input
            ref={input}
            value={query}
            maxLength={120}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Instituição, cidade, curso ou página"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={
              results[active] ? `${listId}-${results[active].id}` : undefined
            }
            aria-autocomplete="list"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(results[active]);
              } else if (e.key === "Escape") onClose();
              else if (e.key === "Tab") e.preventDefault();
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <div
          className="searchResults"
          id={listId}
          role="listbox"
          aria-label="Resultados"
        >
          {!results.length && (
            <p className="searchEmpty">
              Nada encontrado para “{query}”. Pressione Enter para buscar no
              catálogo.
            </p>
          )}
          {groups.map((group) => (
            <div key={group} role="group" aria-label={group}>
              <span className="searchGroup">{group}</span>
              {results
                .filter((r) => r.group === group)
                .map((r) => {
                  const index = results.indexOf(r);
                  return (
                    <div
                      key={r.id}
                      id={`${listId}-${r.id}`}
                      role="option"
                      aria-selected={index === active}
                      className="searchOption"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(r)}
                    >
                      <Icon name={r.icon} />
                      <span>
                        <b>{r.title}</b>
                        <small>{r.detail}</small>
                      </span>
                      <Icon name="arrow" size={16} />
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
        <p className="searchHint">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navegar
          </span>
          <span>
            <kbd>Enter</kbd> abrir
          </span>
        </p>
      </div>
    </div>
  );
}
