"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useApp } from "../app/AppProvider";
import { Badge, EmptyState, Icon, Spinner } from "../ui";
import AccessRequest from "./AccessRequest";
import Dashboard from "./Dashboard";
import InstitutionProfile from "./InstitutionProfile";
import CoursesManager from "./CoursesManager";
import ApplicationsManager from "./ApplicationsManager";
import Students from "./Students";
import Announcements from "./Announcements";
import Team from "./Team";
import Activity from "./Activity";
import {
  AccessRequests,
  PlatformInstitutions,
  SupportTickets,
} from "./Platform";
import { initials, typeLabel } from "../../lib/format";
import type { Institution } from "../../lib/types";

export type AdminContext = {
  institution: Institution;
  role: "admin" | "editor" | "plataforma";
  go: (section: string) => void;
};

const sections = [
  { id: "visao", label: "Visão geral", icon: "chart", group: "Instituição" },
  {
    id: "candidaturas",
    label: "Candidaturas",
    icon: "inbox",
    group: "Instituição",
  },
  {
    id: "alunos",
    label: "Alunos e contatos",
    icon: "users",
    group: "Instituição",
  },
  { id: "cursos", label: "Cursos", icon: "book", group: "Instituição" },
  {
    id: "perfil",
    label: "Dados da instituição",
    icon: "building",
    group: "Instituição",
  },
  {
    id: "comunicados",
    label: "Comunicados",
    icon: "megaphone",
    group: "Instituição",
  },
  { id: "equipe", label: "Equipe", icon: "shield", group: "Gestão" },
  { id: "atividade", label: "Atividade", icon: "history", group: "Gestão" },
  {
    id: "pedidos",
    label: "Pedidos de acesso",
    icon: "lock",
    group: "Plataforma",
    platform: true,
  },
  {
    id: "suporte",
    label: "Suporte",
    icon: "help",
    group: "Plataforma",
    platform: true,
  },
  {
    id: "instituicoes",
    label: "Instituições",
    icon: "layers",
    group: "Plataforma",
    platform: true,
  },
];

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="adminFrame">
      <header className="adminTop simple">
        <Link href="/" className="brand">
          <img
            src="/images/matriculou-logo-white.png"
            alt="Matriculou"
            width={130}
            height={44}
          />
        </Link>
        <span className="adminTag">Painel das instituições</span>
        <Link href="/" className="btn ghost small">
          <Icon name="left" size={15} /> Voltar ao site
        </Link>
      </header>
      <main className="adminSolo" id="conteudo">
        {children}
      </main>
    </div>
  );
}

export default function AdminApp() {
  const { user, authReady, memberships, institutions, catalogStatus, signOut } =
    useApp();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const isPlatform = user?.role === "plataforma";

  const managed = useMemo(() => {
    if (isPlatform) return institutions;
    const ids = new Set(memberships.map((m) => m.institutionId));
    return institutions.filter((i) => ids.has(i.id));
  }, [institutions, isPlatform, memberships]);

  const instId = params.get("inst") || managed[0]?.id || "";
  const institution = managed.find((i) => i.id === instId) || managed[0];
  const section =
    sections.find(
      (s) => s.id === params.get("secao") && (!s.platform || isPlatform),
    )?.id || "visao";
  const role = isPlatform
    ? "plataforma"
    : memberships.find((m) => m.institutionId === institution?.id)?.role ||
      "editor";

  useEffect(() => setNavOpen(false), [section, instId]);

  const go = (next: string, inst = institution?.id) => {
    const query = new URLSearchParams();
    if (inst) query.set("inst", inst);
    if (next !== "visao") query.set("secao", next);
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  };

  if (!authReady || (user && catalogStatus === "loading"))
    return (
      <Frame>
        <Spinner label="Carregando o painel" />
      </Frame>
    );

  if (!user)
    return (
      <Frame>
        <section className="adminPitch">
          <span className="eyebrow">
            Para universidades, faculdades, escolas e redes de ensino
          </span>
          <h1>Sua instituição no controle da própria página.</h1>
          <p>
            Atualize dados e mensalidades, publique cursos e comunicados, receba
            candidaturas, converse com estudantes e acompanhe indicadores, com
            sua equipe e com segurança.
          </p>
          <ul className="pitchList">
            <li>
              <Icon name="book" /> Cursos, vagas, turnos e mensalidades sempre
              corretos
            </li>
            <li>
              <Icon name="inbox" /> Candidaturas com status e conversa com o
              estudante
            </li>
            <li>
              <Icon name="chart" /> Indicadores de interesse e conversão
            </li>
            <li>
              <Icon name="users" /> Equipe com papéis de administrador e editor
            </li>
          </ul>
          <div className="inlineActions">
            <Link
              href={`/login?next=${encodeURIComponent("/admin")}`}
              className="btn primary"
            >
              Entrar para continuar <Icon name="arrow" size={16} />
            </Link>
            <Link
              href={`/cadastro?next=${encodeURIComponent("/admin")}`}
              className="btn ghost"
            >
              Criar conta
            </Link>
          </div>
        </section>
      </Frame>
    );

  if (!institution && !isPlatform)
    return (
      <Frame>
        <AccessRequest />
      </Frame>
    );

  if (!institution)
    return (
      <Frame>
        <EmptyState icon="layers" title="Nenhuma instituição no catálogo">
          Cadastre a primeira instituição pelo SQL ou pela seção Instituições.
        </EmptyState>
      </Frame>
    );

  const ctx: AdminContext = { institution, role, go };
  const groups = [
    ...new Set(
      sections.filter((s) => !s.platform || isPlatform).map((s) => s.group),
    ),
  ];
  const current = sections.find((s) => s.id === section)!;

  return (
    <div className="adminFrame">
      <aside
        className={`adminSide ${navOpen ? "isOpen" : ""}`}
        aria-label="Menu do painel"
      >
        <Link href="/" className="brand">
          <img
            src="/images/matriculou-logo-white.png"
            alt="Matriculou"
            width={130}
            height={44}
          />
        </Link>
        <label className="instSwitch">
          <span>
            {isPlatform
              ? "Instituição (visão da plataforma)"
              : managed.length > 1
                ? "Instituição da rede"
                : "Instituição"}
          </span>
          <select
            value={institution.id}
            onChange={(e) => go(section, e.target.value)}
            disabled={managed.length < 2}
          >
            {managed.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        {groups.map((group) => (
          <nav key={group} className="sideNav" aria-label={group}>
            <span>{group}</span>
            {sections
              .filter((s) => s.group === group && (!s.platform || isPlatform))
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-current={section === s.id ? "page" : undefined}
                  onClick={() => go(s.id)}
                >
                  <Icon name={s.icon} />
                  <span>{s.label}</span>
                </button>
              ))}
          </nav>
        ))}
        <div className="adminSideFoot">
          <Link href={`/instituicoes?abrir=${institution.id}`} target="_blank">
            <Icon name="external" /> Ver página pública
          </Link>
          <Link href="/perfil">
            <Icon name="user" /> Meu perfil
          </Link>
          <button type="button" onClick={signOut}>
            <Icon name="logout" /> Sair
          </button>
        </div>
      </aside>
      {navOpen && (
        <div
          className="drawerScrim"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="adminMain">
        <header className="adminTop">
          <button
            type="button"
            className="iconButton adminMenu"
            onClick={() => setNavOpen(true)}
            aria-label="Abrir menu do painel"
            aria-expanded={navOpen}
          >
            <Icon name="menu" size={22} />
          </button>
          <div className="adminTitle">
            <small>
              {institution.name} · {typeLabel(institution.type)}
            </small>
            <h1>{current.label}</h1>
          </div>
          <Badge tone={role === "editor" ? "neutral" : "accent"}>
            {role === "plataforma"
              ? "Plataforma"
              : role === "admin"
                ? "Administrador"
                : "Editor"}
          </Badge>
          <span className="avatar" aria-hidden="true">
            {initials(user.name)}
          </span>
        </header>
        <main
          className="adminContent"
          id="conteudo"
          key={`${institution.id}-${section}`}
        >
          {section === "visao" && <Dashboard {...ctx} />}
          {section === "perfil" && <InstitutionProfile {...ctx} />}
          {section === "cursos" && <CoursesManager {...ctx} />}
          {section === "candidaturas" && <ApplicationsManager {...ctx} />}
          {section === "alunos" && <Students {...ctx} />}
          {section === "comunicados" && <Announcements {...ctx} />}
          {section === "equipe" && <Team {...ctx} />}
          {section === "atividade" && <Activity {...ctx} />}
          {section === "pedidos" && <AccessRequests />}
          {section === "suporte" && <SupportTickets />}
          {section === "instituicoes" && <PlatformInstitutions />}
        </main>
      </div>
    </div>
  );
}
