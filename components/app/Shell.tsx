"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApp } from "./AppProvider";
import SearchDialog from "./SearchDialog";
import NextChapter from "../cinema/NextChapter";
import { Icon } from "../ui";
import { firstName, initials } from "../../lib/format";
import { legal, legalLinks } from "../../lib/legal";
import { openConsentPreferences } from "../../lib/consent";

const nav = [
  { href: "/instituicoes", label: "Instituições" },
  { href: "/cursos", label: "Cursos" },
  { href: "/comparar", label: "Comparar" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/ajuda", label: "Ajuda" },
];

const chapterByPath: Record<string, string> = {
  "/instituicoes": "instituicoes",
  "/cursos": "cursos",
  "/comparar": "comparar",
  "/como-funciona": "como",
  "/sobre": "sobre",
};

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

function Avatar({
  name,
  url,
  size = 36,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  return url ? (
    <img className="avatar" src={url} alt="" width={size} height={size} />
  ) : (
    <span
      className="avatar"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

function UserMenu() {
  const { user, memberships, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const outside = (e: MouseEvent) =>
      !root.current?.contains(e.target as Node) && setOpen(false);
    const keyboard = (e: KeyboardEvent) => {
      const items = [
        ...(root.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ||
          []),
      ];
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLElement>("button")?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(index + 1) % items.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
      } else if (e.key === "Tab") setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", keyboard);
    };
  }, [open]);

  if (!user) return null;
  const manages = memberships.length > 0 || user.role === "plataforma";

  return (
    <div className="userMenu" ref={root}>
      <button
        type="button"
        className="userTrigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar name={user.name} url={user.avatar_url} size={34} />
        <span>{firstName(user.name)}</span>
        <Icon name="chevron" size={15} />
      </button>
      {open && (
        <div className="userDropdown" role="menu" aria-label="Menu da conta">
          <div className="userDropdownHead">
            <b>{user.name}</b>
            <small>{user.email}</small>
          </div>
          <Link role="menuitem" href="/perfil">
            <Icon name="user" /> Meu perfil
          </Link>
          <Link role="menuitem" href="/perfil?secao=candidaturas">
            <Icon name="inbox" /> Candidaturas
          </Link>
          <Link role="menuitem" href="/perfil?secao=favoritos">
            <Icon name="heart" /> Favoritas
          </Link>
          <Link role="menuitem" href="/perfil?secao=seguranca">
            <Icon name="settings" /> Configurações
          </Link>
          {manages && (
            <Link role="menuitem" href="/admin" className="accentItem">
              <Icon name="building" /> Painel da instituição
            </Link>
          )}
          <button role="menuitem" type="button" onClick={signOut}>
            <Icon name="logout" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
}) {
  const { user, memberships, signOut, compareIds } = useApp();
  const pathname = usePathname();
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key !== "Tab") return;
      const items = [
        ...(panel.current?.querySelectorAll<HTMLElement>("a[href],button") ||
          []),
      ];
      const [first, last] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keyboard);
      previous?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => close.current(), [pathname]);
  if (!open) return null;

  return (
    <>
      <div className="drawerScrim" onClick={onClose} aria-hidden="true" />
      <aside
        className="drawer"
        id="menu-principal"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="drawerHead">
          <img
            src="/images/matriculou-logo-white.png"
            alt="Matriculou"
            width={130}
            height={44}
          />
          <button
            type="button"
            className="iconButton"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <Icon name="close" size={22} />
          </button>
        </div>
        <button
          type="button"
          className="drawerSearch"
          onClick={() => {
            onClose();
            onSearch();
          }}
        >
          <Icon name="search" /> Buscar instituição, curso ou página
        </button>
        <nav aria-label="Navegação principal">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            <Icon name="home" /> Início
          </Link>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              <Icon
                name={
                  {
                    "/instituicoes": "school",
                    "/cursos": "book",
                    "/comparar": "compare",
                    "/como-funciona": "layers",
                    "/ajuda": "help",
                  }[item.href] || "dot"
                }
              />
              {item.label}
              {item.href === "/comparar" && compareIds.length > 0 && (
                <small className="count">{compareIds.length}</small>
              )}
            </Link>
          ))}
        </nav>
        <div className="drawerAccount">
          {user ? (
            <>
              <div className="drawerUser">
                <Avatar name={user.name} url={user.avatar_url} size={40} />
                <span>
                  <b>{user.name}</b>
                  <small>{user.email}</small>
                </span>
              </div>
              <Link href="/perfil">
                <Icon name="user" /> Meu perfil
              </Link>
              {(memberships.length > 0 || user.role === "plataforma") && (
                <Link href="/admin">
                  <Icon name="building" /> Painel da instituição
                </Link>
              )}
              <button type="button" onClick={signOut}>
                <Icon name="logout" /> Sair
              </button>
            </>
          ) : (
            <div className="drawerAuth">
              <Link href="/login" className="btn ghost">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn primary">
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function NavBar({
  onSearch,
  onMenu,
  menuOpen,
}: {
  onSearch: () => void;
  onMenu: () => void;
  menuOpen: boolean;
}) {
  const { user, authReady, compareIds } = useApp();
  const pathname = usePathname();

  return (
    <header className="nav siteNav">
      <div className="navInner">
        <Link
          className="brand"
          href="/"
          aria-label="Matriculou, página inicial"
        >
          <img
            src="/images/matriculou-logo-white.png"
            alt="Matriculou"
            width={150}
            height={51}
          />
        </Link>
        <nav className="navLinks" aria-label="Navegação principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
              {item.href === "/comparar" && compareIds.length > 0 && (
                <small
                  className="count"
                  aria-label={`${compareIds.length} selecionadas`}
                >
                  {compareIds.length}
                </small>
              )}
            </Link>
          ))}
        </nav>
        <div className="navActions">
          <button
            type="button"
            className="searchTrigger"
            onClick={onSearch}
            aria-label="Buscar (Ctrl+K)"
          >
            <Icon name="search" size={18} />
            <span>Buscar</span>
            <kbd>Ctrl K</kbd>
          </button>
          {user ? (
            <UserMenu />
          ) : (
            <div className={`navAuth ${authReady ? "" : "isPending"}`}>
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className="navLogin"
              >
                Entrar
              </Link>
              <Link href="/cadastro" className="btn primary small">
                Criar conta
              </Link>
            </div>
          )}
          <button
            type="button"
            className="iconButton menuButton"
            onClick={onMenu}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <img
            src="/images/matriculou-logo-white.png"
            alt="Matriculou"
            width={150}
            height={51}
            loading="lazy"
          />
          <p>
            Pesquise, compare e organize sua escolha de instituição e curso em
            um só lugar.
          </p>
        </div>
        <div>
          <b>Explorar</b>
          <Link href="/instituicoes">Instituições</Link>
          <Link href="/cursos">Cursos</Link>
          <Link href="/comparar">Comparar</Link>
        </div>
        <div>
          <b>Matriculou</b>
          <Link href="/como-funciona">Como funciona</Link>
          <Link href="/sobre">Sobre a BIJK</Link>
          <Link href="/ajuda">Central de ajuda</Link>
          <Link href="/admin">Para instituições</Link>
        </div>
        <div>
          <b>Legal</b>
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="footerLegal">
        <span>
          © {new Date().getFullYear()} {legal.controller}
          {legal.document ? ` · ${legal.document}` : ""}. O Matriculou não
          realiza matrículas e não tem vínculo com as instituições listadas.
        </span>
        <button type="button" onClick={openConsentPreferences}>
          Preferências de cookies
        </button>
      </div>
    </footer>
  );
}

function ToastView() {
  const { toast } = useApp();
  return (
    <div className="toastRegion" role="status" aria-live="polite">
      {toast && (
        <div className={`toast tone-${toast.tone}`} key={toast.id}>
          <Icon
            name={
              toast.tone === "error"
                ? "alert"
                : toast.tone === "success"
                  ? "check"
                  : "info"
            }
          />
          {toast.text}
        </div>
      )}
    </div>
  );
}

const bare = ["/login", "/cadastro", "/redefinir-senha"];

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const { catalogStatus, reloadCatalog } = useApp();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  if (pathname.startsWith("/admin")) {
    return (
      <>
        {children}
        <ToastView />
      </>
    );
  }

  const chapter = chapterByPath[pathname];
  const isBare = bare.includes(pathname);
  const showsCatalog = ["/instituicoes", "/comparar", "/cursos", "/"].includes(
    pathname,
  );

  return (
    <>
      <NavBar
        onSearch={() => setSearch(true)}
        onMenu={() => setMenu(true)}
        menuOpen={menu}
      />
      <MobileMenu
        open={menu}
        onClose={() => setMenu(false)}
        onSearch={() => setSearch(true)}
      />
      {search && <SearchDialog onClose={() => setSearch(false)} />}
      <div className="pageTransition" key={pathname}>
        {catalogStatus === "error" && showsCatalog && (
          <p className="catalogNotice" role="alert">
            Não foi possível carregar o catálogo agora.
            <button type="button" onClick={reloadCatalog}>
              Tentar novamente
            </button>
          </p>
        )}
        {catalogStatus === "demo" && showsCatalog && pathname !== "/" && (
          <p className="catalogNotice">
            Modo demonstração: instituições e valores fictícios.
          </p>
        )}
        {children}
        {chapter && <NextChapter view={chapter} />}
      </div>
      {!isBare && <Footer />}
      <ToastView />
    </>
  );
}
