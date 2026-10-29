import type { Illustration } from "./illustrations";

export type Institution = {
  id: string;
  name: string;
  city: string;
  state: string;
  network: "publica" | "privada" | string;
  type: string;
  mec: number;
  price: number;
  scholarships: boolean;
  image: string | null;
  imageCredit?: { author: string; license: string; source: string } | null;
  illustration?: Illustration;
  description?: string | null;
  site?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  enrollmentOpen?: boolean;
  enrollmentUntil?: string | null;
  group?: string | null;
};

export type Offer = {
  id: string;
  institution_id: string;
  course_name: string;
  level: string;
  modality: string;
  shift: string | null;
  period: string | null;
  price?: number | null;
  seats?: number | null;
  duration?: string | null;
  description?: string | null;
  active?: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: "estudante" | "plataforma";
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  birthDate?: string | null;
  education?: string | null;
  interests: string[];
  bio?: string | null;
  notifications: boolean;
};

export type Membership = { institutionId: string; role: "admin" | "editor" };

export type CourseLevel =
  | "Bacharelado"
  | "Licenciatura"
  | "Bacharelado ou Licenciatura"
  | "Tecnólogo"
  | "Técnico de nível médio"
  | "Educação básica";

export type CourseDetail = {
  name: string;
  area: string;
  icon: string;
  level: CourseLevel | string;
  duration: string;
  years: number;
  hours: number | null;
  council: string | null;
  presentialOnly: boolean;
  desc: string;
  profile: string;
  practicalFocus: string;
  internship: string;
  skills: string[];
  careers: string[];
  grade: string[];
  known: boolean;
};

export type ApplicationStatus =
  | "enviada"
  | "em_analise"
  | "aprovada"
  | "lista_espera"
  | "recusada"
  | "matriculada"
  | "cancelada";

export type Application = {
  id: string;
  user_id: string;
  instituicao_id: string;
  oferta_id: string | null;
  curso_nome: string | null;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string | null;
  status: ApplicationStatus;
  created_at: string;
  atualizado_em: string;
};

export type Message = {
  id: string;
  candidatura_id: string;
  autor_id: string | null;
  autor_tipo: "estudante" | "instituicao";
  texto: string;
  lida_em: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  instituicao_id: string;
  titulo: string;
  texto: string;
  publicado: boolean;
  created_at: string;
};
