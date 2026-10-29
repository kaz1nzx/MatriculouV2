// Identificação do controlador exibida nas políticas, nos termos e no rodapé.
// PREENCHA ANTES DO DEPLOY: as políticas só têm validade com dados reais do responsável.
export const legal = {
  product: "Matriculou",
  controller: process.env.NEXT_PUBLIC_LEGAL_NAME || "BIJK",
  document: process.env.NEXT_PUBLIC_LEGAL_DOCUMENT || "",
  address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS || "",
  email: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "",
  dpo: process.env.NEXT_PUBLIC_DPO_NAME || "",
  version: "2026-10-29",
  updated: "29 de outubro de 2026",
};

export const legalLinks = [
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/termos-de-servico", label: "Termos de Serviço" },
  { href: "/cookies", label: "Política de Cookies" },
  { href: "/lgpd", label: "Seus direitos (LGPD)" },
];

export const requestTypes = [
  { value: "confirmacao", label: "Confirmar se tratamos meus dados" },
  { value: "acesso", label: "Acessar meus dados" },
  { value: "correcao", label: "Corrigir dados incompletos ou desatualizados" },
  {
    value: "anonimizacao",
    label: "Anonimizar, bloquear ou eliminar dados desnecessários",
  },
  { value: "portabilidade", label: "Portabilidade dos dados" },
  { value: "eliminacao", label: "Eliminar dados tratados com consentimento" },
  {
    value: "compartilhamento",
    label: "Saber com quem compartilhamos meus dados",
  },
  { value: "revogacao", label: "Revogar consentimento" },
  { value: "oposicao", label: "Opor-me a um tratamento" },
  { value: "outro", label: "Outra dúvida sobre privacidade" },
] as const;

// Itens gravados no navegador; a Política de Cookies lista exatamente estes.
export const browserStorage = [
  {
    key: "matriculou-sessao",
    where: "localStorage",
    purpose:
      "Manter você conectado à sua conta entre visitas. Some ao clicar em “Sair”.",
    duration: "Até você sair da conta",
  },
  {
    key: "matriculou-compare",
    where: "localStorage",
    purpose: "Guardar as instituições escolhidas no comparador.",
    duration: "Até você remover",
  },
  {
    key: "matriculou-compare-cursos",
    where: "localStorage",
    purpose: "Guardar os cursos escolhidos para comparar.",
    duration: "Até você remover",
  },
  {
    key: "matriculou-catalogo-v2",
    where: "sessionStorage",
    purpose:
      "Cópia temporária do catálogo público, para as páginas abrirem mais rápido.",
    duration: "Até fechar a aba",
  },
  {
    key: "matriculou-mia-v1",
    where: "sessionStorage",
    purpose: "Manter a conversa com a Mia enquanto você navega.",
    duration: "Até fechar a aba",
  },
  {
    key: "matriculou-cinema-paused",
    where: "sessionStorage",
    purpose: "Lembrar se você pausou os efeitos visuais.",
    duration: "Até fechar a aba",
  },
  {
    key: "matriculou-consent",
    where: "localStorage",
    purpose:
      "Guardar suas escolhas de cookies (essenciais, analíticos e marketing).",
    duration: "Até você mudar a escolha",
  },
];
