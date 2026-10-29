import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const routes = [
  "",
  "/instituicoes",
  "/cursos",
  "/comparar",
  "/como-funciona",
  "/ajuda",
  "/sobre",
  "/cadastro",
  "/privacidade",
  "/termos-de-uso",
  "/termos-de-servico",
  "/cookies",
  "/lgpd",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${site}${route}`,
    changeFrequency: "weekly",
    priority: route ? 0.7 : 1,
  }));
}
