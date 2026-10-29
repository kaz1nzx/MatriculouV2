import type { ApplicationStatus, Institution } from "./types";
import { normalize } from "./text";

export const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export const priceLabel = (i: Institution, suffix = "/mês") =>
  i.price > 0
    ? `${money(i.price)}${suffix}`
    : i.network === "publica"
      ? "Gratuita"
      : "Não informada";

export const networkLabel = (network: string) =>
  network === "publica" ? "Pública" : "Privada";

const typeLabels: Record<string, string> = {
  universidade: "Universidade",
  faculdade: "Faculdade",
  tecnico: "Ensino técnico",
  escola: "Escola",
  instituto: "Instituto",
  "centro universitário": "Centro universitário",
};

export const typeLabel = (type: string) =>
  typeLabels[type] ||
  (type ? type[0].toUpperCase() + type.slice(1) : "Não informado");

// O conceito do MEC (CI/IGC) só existe para o ensino superior.
export const mecLabel = (i: Institution) =>
  i.type === "escola"
    ? "Não se aplica"
    : i.mec
      ? `${i.mec} de 5`
      : "Não informado";

export const modalityLabel = (modality?: string | null) => {
  const key = normalize(modality || "");
  if (key === "ead") return "EAD";
  if (["hibrido", "semipresencial"].includes(key)) return "Híbrido";
  return "Presencial";
};

export const levelLabel = (level?: string | null) =>
  ({
    graduacao: "Graduação",
    tecnico: "Técnico",
    fundamental: "Ensino fundamental",
    medio: "Ensino médio",
    pos: "Pós-graduação",
  })[level || ""] ||
  level ||
  "Não informado";

export const initials = (name = "Usuário") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const firstName = (name: string) => name.split(" ")[0] || name;

export const dateLabel = (value: string | null | undefined) =>
  value
    ? new Date(
        value.length === 10 ? `${value}T12:00:00` : value,
      ).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

export const relativeTime = (value: string) => {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  if (diff < 60) return "agora";
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
  if (diff < 604800) return rtf.format(-Math.round(diff / 86400), "day");
  return dateLabel(value);
};

export const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const statusInfo: Record<
  ApplicationStatus,
  { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" }
> = {
  enviada: { label: "Enviada", tone: "info" },
  em_analise: { label: "Em análise", tone: "warning" },
  aprovada: { label: "Aprovada", tone: "success" },
  lista_espera: { label: "Lista de espera", tone: "warning" },
  recusada: { label: "Não aprovada", tone: "danger" },
  matriculada: { label: "Matriculada", tone: "success" },
  cancelada: { label: "Cancelada", tone: "neutral" },
};

// A mesma graduação escrita de formas diferentes no banco vira um único curso.
const courseAliases: Record<string, string> = {
  "engenharia da computacao": "Engenharia de Computação",
  "licenciatura em fisica": "Física",
  "design grafico": "Design",
};

export const canonicalCourse = (name: string) =>
  courseAliases[normalize(name.trim())] || name.trim();

// Telefone brasileiro com DDD, formatado enquanto a pessoa digita.
export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const genericWords =
  /^(colégio|universidade|universitário|faculdade|faculdades|instituto|centro|escola|fundação|federal|estadual|de|da|do|das|dos|e)$/i;

// Sigla da instituição para o monograma: "(UFRJ)", "PUC-SP — Campus…", "Centro Universitário Facens".
export const monogram = (name: string) => {
  const outside = name.replace(/\(.*?\)/g, "").trim();
  const inParens = name.match(/\(([^)]+)\)/)?.[1]?.trim();
  const prefix = name.includes(" — ") ? name.split(" — ")[0].trim() : "";
  const single = (s?: string, max = 10) =>
    s && !/\s/.test(s) && s.length >= 2 && s.length <= max ? s : undefined;
  const caps = outside
    .split(/\s+/)
    .find((w) => /^[A-ZÀ-Ú][A-ZÀ-Ú0-9-]{1,7}$/.test(w));
  const words = outside
    .split(/\s+/)
    .filter(
      (w) => /[a-zà-ú]/i.test(w) && w.length > 1 && !genericWords.test(w),
    );
  const fallback =
    words.length === 1 && words[0].length <= 12
      ? words[0]
      : words
          .slice(0, 3)
          .map((w) => w[0])
          .join("");
  return (
    single(inParens) ||
    single(prefix, 8) ||
    caps ||
    single(inParens?.split(" ")[0], 8) ||
    fallback ||
    name.slice(0, 2)
  ).toUpperCase();
};

export const placeholderImage = (name: string) => {
  const letters = monogram(name);
  const size = Math.min(84, Math.floor(520 / letters.length));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><rect width="400" height="260" fill="#172229"/><circle cx="330" cy="40" r="120" fill="none" stroke="#f18465" stroke-opacity=".3"/><text x="50%" y="56%" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="700" fill="#f3f1ea">${letters}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Destino interno seguro para redirecionar depois do login: só caminhos do próprio site.
export const safeNext = (
  value: string | null | undefined,
  fallback = "/perfil",
) =>
  value &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.startsWith("/\\")
    ? value
    : fallback;
