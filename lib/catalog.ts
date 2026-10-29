import { supabase } from "./supabase";
import { assignIllustrations } from "./illustrations";
import { canonicalCourse } from "./format";
import type { Institution, Offer } from "./types";

type InstitutionRow = Record<string, any>;
type OfferRow = Record<string, any>;

export const mapInstitution = (x: InstitutionRow): Institution => ({
  id: x.id,
  name: x.nome,
  city: x.cidade,
  state: x.estado,
  network: x.rede,
  type: x.tipo || "instituição",
  mec: Number(x.nota_mec) || 0,
  price: Number(x.mensalidade_media) || 0,
  scholarships: Boolean(x.possui_bolsas),
  image: x.foto_capa || null,
  imageCredit:
    x.foto_capa && x.foto_autor
      ? {
          author: x.foto_autor,
          license: x.foto_licenca || "",
          source: x.foto_fonte || "",
        }
      : null,
  description: x.descricao ?? null,
  site: x.site ?? null,
  email: x.email_contato ?? null,
  phone: x.telefone ?? null,
  address: x.endereco ?? null,
  enrollmentOpen: Boolean(x.inscricoes_abertas),
  enrollmentUntil: x.inscricoes_ate ?? null,
  group: x.rede_ensino ?? null,
});

export const mapOffer = (x: OfferRow): Offer => ({
  id: x.id,
  institution_id: x.instituicao_id,
  course_name: x.curso_nome ? canonicalCourse(x.curso_nome) : x.curso_nome,
  level: x.nivel,
  modality: x.modalidade,
  shift: x.turno ?? null,
  period: x.periodo ?? null,
  price: x.mensalidade ?? null,
  seats: x.vagas ?? null,
  duration: x.duracao ?? null,
  description: x.descricao ?? null,
  active: x.ativo ?? true,
});

export const withIllustrations = (list: Institution[]) => {
  const art = assignIllustrations(list);
  return list.map((i) =>
    art.has(i.id) ? { ...i, illustration: art.get(i.id) } : i,
  );
};

export async function fetchCatalog() {
  const [institutions, offers] = await Promise.all([
    supabase.from("instituicoes").select("*").order("nome"),
    supabase.from("ofertas").select("*").limit(5000),
  ]);
  if (institutions.error || offers.error)
    throw institutions.error || offers.error;
  return {
    institutions: withIllustrations(
      (institutions.data || []).map(mapInstitution),
    ),
    offers: (offers.data || []).map(mapOffer).filter((o) => o.course_name),
  };
}

// Erros de tabela ausente indicam que um script de supabase/ ainda não foi executado.
export const isMissingTable = (
  error: { code?: string; message?: string } | null,
) =>
  !!error &&
  (error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.code === "42883" ||
    /does not exist|schema cache/i.test(error.message || ""));
