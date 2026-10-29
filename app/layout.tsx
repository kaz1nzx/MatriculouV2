import type { Metadata, Viewport } from "next";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./styles/tokens.css";
import "./styles/ui.css";
import "./cinema.css";
import "./site-cinema.css";
import "./editorial.css";
import "./styles/shell.css";
import "./styles/catalog.css";
import "./styles/account.css";
import "./styles/admin.css";
import "./legal.css";
import AppProvider from "../components/app/AppProvider";
import Shell from "../components/app/Shell";
import CinemaProvider from "../components/cinema/CinemaProvider";
import HelpChat from "../components/HelpChat";
import CookieNotice from "../components/CookieNotice";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Matriculou — encontre seu próximo caminho",
    template: "%s · Matriculou",
  },
  description:
    "Compare instituições, descubra cursos, candidate-se e acompanhe sua jornada educacional.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Matriculou",
    images: ["/images/cinema/students.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#172229",
  colorScheme: "dark",
};

// Fontes e imagens são locais: o Supabase é a única origem externa no início da navegação.
const supabaseOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
      : null;
  } catch {
    return null;
  }
})();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {supabaseOrigin && (
          <>
            <link
              rel="preconnect"
              href={supabaseOrigin}
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
      </head>
      <body>
        <a className="skipLink" href="#conteudo">
          Pular para o conteúdo
        </a>
        <CinemaProvider>
          <AppProvider>
            <Shell>{children}</Shell>
            <HelpChat />
          </AppProvider>
          <CookieNotice />
        </CinemaProvider>
      </body>
    </html>
  );
}
