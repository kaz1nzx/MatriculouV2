"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../app/AppProvider";
import { Badge, EmptyState, Icon, Spinner } from "../ui";
import { InstitutionImage } from "../institutions/InstitutionCard";
import Applications from "./Applications";
import Documents, { type UserDocument } from "./Documents";
import { EditProfile, Preferences, Privacy, Security } from "./AccountSettings";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { courseInfo } from "../../lib/courses";
import { normalize } from "../../lib/text";
import {
  dateLabel,
  firstName,
  initials,
  plural,
  statusInfo,
} from "../../lib/format";
import type { Application } from "../../lib/types";

export const signedUrlTtl = 60 * 60;

const sections = [
  { id: "visao", label: "Visão geral", icon: "home", group: "Minha jornada" },
  {
    id: "candidaturas",
    label: "Candidaturas",
    icon: "inbox",
    group: "Minha jornada",
  },
  {
    id: "favoritos",
    label: "Favoritas",
    icon: "heart",
    group: "Minha jornada",
  },
  {
    id: "documentos",
    label: "Documentos",
    icon: "file",
    group: "Minha jornada",
  },
  { id: "editar", label: "Editar perfil", icon: "edit", group: "Conta" },
  {
    id: "seguranca",
    label: "Segurança e acesso",
    icon: "lock",
    group: "Conta",
  },
  {
    id: "preferencias",
    label: "Preferências",
    icon: "settings",
    group: "Conta",
  },
  {
    id: "privacidade",
    label: "Privacidade e dados",
    icon: "shield",
    group: "Conta",
  },
] as const;

export type SectionId = (typeof sections)[number]["id"];

function Locked() {
  const pathname = usePathname();
  return (
    <main className="page container lockedPage" id="conteudo">
      <EmptyState
        icon="lock"
        heading="h1"
        title="Entre para ver seu perfil"
        action={
          <div className="inlineActions">
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className="btn primary"
            >
              Entrar <Icon name="arrow" size={16} />
            </Link>
            <Link href="/cadastro" className="btn ghost">
              Criar conta grátis
            </Link>
          </div>
        }
      >
        Seu perfil reúne favoritas, candidaturas, documentos e configurações da
        conta.
      </EmptyState>
    </main>
  );
}

export default function ProfilePage() {
  const {
    user,
    authReady,
    institutions,
    liked,
    toggleLike,
    compareIds,
    toggleCompare,
    memberships,
    signOut,
  } = useApp();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const section = (sections.find((s) => s.id === params.get("secao"))?.id ||
    "visao") as SectionId;
  const [docs, setDocs] = useState<UserDocument[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});

  const go = useCallback(
    (id: SectionId) => {
      router.replace(id === "visao" ? pathname : `${pathname}?secao=${id}`, {
        scroll: false,
      });
      document
        .getElementById("perfil-conteudo")
        ?.focus({ preventScroll: true });
    },
    [pathname, router],
  );

  const loadDocs = useCallback(async () => {
    const { data } = await supabase
      .from("documentos_usuario")
      .select("id,nome,path,created_at")
      .order("created_at", { ascending: false });
    const rows = data || [];
    const paths = rows.map((d) => d.path).filter(Boolean) as string[];
    const { data: signed } = paths.length
      ? await supabase.storage
          .from("pre-matriculas")
          .createSignedUrls(paths, signedUrlTtl)
      : { data: [] as { path: string | null; signedUrl: string }[] };
    setDocs(
      rows.map((d) => ({
        ...d,
        url: signed?.find((s) => s.path === d.path)?.signedUrl || "",
      })),
    );
  }, []);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    const [{ data, error }, messages] = await Promise.all([
      supabase
        .from("candidaturas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("mensagens")
        .select("candidatura_id")
        .eq("autor_tipo", "instituicao")
        .is("lida_em", null),
    ]);
    setApplications(error ? [] : (data as Application[]));
    const counts: Record<string, number> = {};
    for (const m of messages.data || [])
      counts[m.candidatura_id] = (counts[m.candidatura_id] || 0) + 1;
    setUnread(counts);
  }, [user]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    loadDocs();
    loadApplications();
  }, [loadApplications, loadDocs, user]);

  const favorites = useMemo(
    () => institutions.filter((i) => liked.includes(i.id)),
    [institutions, liked],
  );

  if (!authReady)
    return (
      <main className="page container lockedPage" id="conteudo">
        <h1 className="srOnly">Meu perfil</h1>
        <Spinner label="Carregando seu perfil" />
      </main>
    );
  if (!user) return <Locked />;

  const counts: Partial<Record<SectionId, number>> = {
    candidaturas: applications?.filter(
      (a) => !["cancelada", "recusada"].includes(a.status),
    ).length,
    favoritos: favorites.length,
    documentos: docs?.length,
  };
  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  const manages = memberships.length > 0 || user.role === "plataforma";

  return (
    <main className="page accountPage" id="conteudo">
      <div className="container accountLayout">
        <aside className="accountSide" aria-label="Menu do perfil">
          <div className="accountCard identity">
            {user.avatar_url ? (
              <img
                className="avatar xl"
                src={user.avatar_url}
                alt=""
                width={88}
                height={88}
              />
            ) : (
              <span className="avatar xl" aria-hidden="true">
                {initials(user.name)}
              </span>
            )}
            <b>{user.name}</b>
            <small>{user.email}</small>
            {user.city && (
              <small>
                <Icon name="pin" size={13} /> {user.city}
                {user.state ? `, ${user.state}` : ""}
              </small>
            )}
            {user.role === "plataforma" && (
              <Badge tone="accent">Administração da plataforma</Badge>
            )}
          </div>
          {["Minha jornada", "Conta"].map((group) => (
            <nav key={group} className="sideNav" aria-label={group}>
              <span>{group}</span>
              {sections
                .filter((s) => s.group === group)
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-current={section === s.id ? "page" : undefined}
                    onClick={() => go(s.id)}
                  >
                    <Icon name={s.icon} />
                    <span>{s.label}</span>
                    {s.id === "candidaturas" && totalUnread > 0 ? (
                      <small
                        className="count alert"
                        aria-label={`${totalUnread} mensagens novas`}
                      >
                        {totalUnread}
                      </small>
                    ) : (
                      counts[s.id] !== undefined && (
                        <small className="count">{counts[s.id]}</small>
                      )
                    )}
                  </button>
                ))}
            </nav>
          ))}
          <nav className="sideNav" aria-label="Outros">
            {manages && (
              <Link href="/admin" className="accentItem">
                <Icon name="building" /> <span>Painel da instituição</span>
              </Link>
            )}
            <button type="button" onClick={signOut}>
              <Icon name="logout" /> <span>Sair</span>
            </button>
          </nav>
        </aside>

        <section
          className="accountMain"
          id="perfil-conteudo"
          tabIndex={-1}
          aria-live="polite"
        >
          {section === "visao" && (
            <Overview
              applications={applications}
              docs={docs?.length ?? 0}
              favorites={favorites.length}
              compare={compareIds.length}
              unread={totalUnread}
              go={go}
            />
          )}
          {section === "candidaturas" && (
            <Applications
              items={applications}
              unread={unread}
              reload={loadApplications}
            />
          )}
          {section === "favoritos" && (
            <div className="accountSection">
              <header className="sectionHead">
                <div>
                  <h1>Instituições favoritas</h1>
                  <p>
                    {plural(
                      favorites.length,
                      "instituição guardada",
                      "instituições guardadas",
                    )}
                    .
                  </p>
                </div>
                <Link href="/instituicoes" className="btn ghost">
                  <Icon name="plus" size={16} /> Encontrar mais
                </Link>
              </header>
              {favorites.length ? (
                <ul className="favoriteGrid">
                  {favorites.map((i) => (
                    <li key={i.id} className="favoriteItem">
                      <InstitutionImage
                        i={i}
                        sizes="(max-width: 600px) 92vw, 280px"
                      />
                      <div>
                        <b>{i.name}</b>
                        <small>
                          <Icon name="pin" size={13} /> {i.city}, {i.state}
                        </small>
                      </div>
                      <div className="inlineActions">
                        <Link
                          href={`/instituicoes?abrir=${i.id}`}
                          className="btn ghost small"
                        >
                          Ver
                        </Link>
                        <button
                          type="button"
                          className={`btn ghost small ${compareIds.includes(i.id) ? "isOn" : ""}`}
                          onClick={() => toggleCompare(i.id)}
                        >
                          <Icon name="compare" size={14} />{" "}
                          {compareIds.includes(i.id)
                            ? "No comparador"
                            : "Comparar"}
                        </button>
                        <button
                          type="button"
                          className="iconButton"
                          onClick={() => toggleLike(i.id)}
                          aria-label={`Remover ${i.name} das favoritas`}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon="heart"
                  title="Nenhuma favorita ainda"
                  action={
                    <Link href="/instituicoes" className="btn primary">
                      Explorar instituições
                    </Link>
                  }
                >
                  Toque no coração de uma instituição para guardá-la aqui.
                </EmptyState>
              )}
            </div>
          )}
          {section === "documentos" && (
            <Documents docs={docs} setDocs={setDocs} />
          )}
          {section === "editar" && <EditProfile />}
          {section === "seguranca" && <Security />}
          {section === "preferencias" && <Preferences />}
          {section === "privacidade" && <Privacy />}
        </section>
      </div>
    </main>
  );
}

function Overview({
  applications,
  docs,
  favorites,
  compare,
  unread,
  go,
}: {
  applications: Application[] | null;
  docs: number;
  favorites: number;
  compare: number;
  unread: number;
  go: (id: SectionId) => void;
}) {
  const { user, institutions, offers } = useApp();
  if (!user) return null;

  const checklist = [
    { label: "Foto de perfil", done: !!user.avatar_url },
    { label: "Telefone", done: !!user.phone },
    { label: "Cidade e estado", done: !!user.city && !!user.state },
    { label: "Data de nascimento", done: !!user.birthDate },
    { label: "Escolaridade", done: !!user.education },
    { label: "Áreas de interesse", done: user.interests.length > 0 },
    { label: "Sobre você", done: !!user.bio },
  ];
  const completion = Math.round(
    ((checklist.filter((c) => c.done).length + 1) / (checklist.length + 1)) *
      100,
  );

  const offerCount = (name: string) =>
    new Set(
      offers
        .filter((o) => normalize(o.course_name) === normalize(name))
        .map((o) => o.institution_id),
    ).size;
  const suggestions = courseInfo
    .filter((c) => user.interests.includes(c.area))
    .sort((a, b) => offerCount(b.name) - offerCount(a.name))
    .slice(0, 4);
  const byId = new Map(institutions.map((i) => [i.id, i]));
  const active = (applications || []).filter(
    (a) => !["cancelada"].includes(a.status),
  );

  return (
    <div className="accountSection">
      <header className="welcome">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h1>Olá, {firstName(user.name)}.</h1>
          <p>Acompanhe sua jornada e continue de onde parou.</p>
        </div>
        <Link href="/instituicoes" className="btn primary">
          <Icon name="search" size={16} /> Explorar instituições
        </Link>
      </header>

      <div className="statCards">
        <button type="button" onClick={() => go("candidaturas")}>
          <span className="statLabel">
            <Icon name="inbox" /> Candidaturas
          </span>
          <b className="statValue">
            {applications === null ? "…" : active.length}
          </b>
          {unread > 0 && (
            <small className="alertText">
              {plural(unread, "mensagem nova", "mensagens novas")}
            </small>
          )}
        </button>
        <button type="button" onClick={() => go("favoritos")}>
          <span className="statLabel">
            <Icon name="heart" /> Favoritas
          </span>
          <b className="statValue">{favorites}</b>
        </button>
        <button type="button" onClick={() => go("documentos")}>
          <span className="statLabel">
            <Icon name="file" /> Documentos
          </span>
          <b className="statValue">{docs}</b>
        </button>
        <Link href="/comparar">
          <span className="statLabel">
            <Icon name="compare" /> No comparador
          </span>
          <b className="statValue">{compare}/4</b>
        </Link>
      </div>

      <div className="overviewGrid">
        <article className="accountCard">
          <header className="cardHead">
            <h2>Complete seu perfil</h2>
            <b className="completion">{completion}%</b>
          </header>
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completion}
            aria-label="Perfil completo"
          >
            <span style={{ width: `${completion}%` }} />
          </div>
          <ul className="checklist">
            {checklist.map((c) => (
              <li key={c.label} className={c.done ? "done" : ""}>
                <Icon name={c.done ? "check" : "dot"} size={15} /> {c.label}
              </li>
            ))}
          </ul>
          {completion < 100 && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => go("editar")}
            >
              <Icon name="edit" size={16} /> Completar agora
            </button>
          )}
        </article>

        <article className="accountCard">
          <header className="cardHead">
            <h2>Últimas candidaturas</h2>
            <button
              type="button"
              className="textButton"
              onClick={() => go("candidaturas")}
            >
              Ver todas
            </button>
          </header>
          {applications === null ? (
            <Spinner />
          ) : active.length ? (
            <ul className="miniList">
              {active.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <span>
                    <b>{byId.get(a.instituicao_id)?.name || "Instituição"}</b>
                    <small>
                      {a.curso_nome || "Curso a definir"} ·{" "}
                      {dateLabel(a.created_at)}
                    </small>
                  </span>
                  <Badge tone={statusInfo[a.status].tone}>
                    {statusInfo[a.status].label}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              Você ainda não enviou candidaturas. Abra uma instituição e toque
              em “Tenho interesse”.
            </p>
          )}
        </article>

        <article className="accountCard span2">
          <header className="cardHead">
            <h2>Cursos para você</h2>
            <button
              type="button"
              className="textButton"
              onClick={() => go("editar")}
            >
              {user.interests.length
                ? "Mudar interesses"
                : "Escolher interesses"}
            </button>
          </header>
          {suggestions.length ? (
            <ul className="suggestGrid">
              {suggestions.map((c) => (
                <li key={c.name}>
                  <Link href={`/cursos?curso=${encodeURIComponent(c.name)}`}>
                    <img src={c.icon} alt="" width={36} height={36} />
                    <span>
                      <b>{c.name}</b>
                      <small>
                        {c.level} · {c.duration} ·{" "}
                        {plural(
                          offerCount(c.name),
                          "instituição",
                          "instituições",
                        )}
                      </small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              Escolha suas áreas de interesse no perfil para receber sugestões
              de cursos.
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
