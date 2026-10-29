import type { Institution, Offer } from "./types";

// Fictional institutions used only when the project has no configured backend.
// No MEC grade or rating: inventing official scores would mislead visitors.
export const demoInstitutions: Institution[] = [
  {
    id: "demo-1",
    name: "Universidade Horizonte",
    city: "São Paulo",
    state: "SP",
    network: "privada",
    type: "universidade",
    mec: 0,
    price: 790,
    scholarships: true,
    image: "/images/cinema/library.jpg",
  },
  {
    id: "demo-2",
    name: "Instituto Novos Caminhos",
    city: "Belo Horizonte",
    state: "MG",
    network: "publica",
    type: "instituto",
    mec: 0,
    price: 0,
    scholarships: false,
    image: "/images/cinema/students.jpg",
  },
  {
    id: "demo-3",
    name: "Faculdade Aurora",
    city: "Curitiba",
    state: "PR",
    network: "privada",
    type: "faculdade",
    mec: 0,
    price: 620,
    scholarships: true,
    image: "/images/cinema/classroom.jpg",
  },
  {
    id: "demo-4",
    name: "Universidade do Amanhã",
    city: "Rio de Janeiro",
    state: "RJ",
    network: "publica",
    type: "universidade",
    mec: 0,
    price: 0,
    scholarships: false,
    image: "/images/cinema/campus.jpg",
  },
  {
    id: "demo-5",
    name: "Centro Universitário Conecta",
    city: "São Paulo",
    state: "SP",
    network: "privada",
    type: "centro universitário",
    mec: 0,
    price: 980,
    scholarships: true,
    image: "/images/cinema/future.jpg",
  },
  {
    id: "demo-6",
    name: "Instituto Perspectiva",
    city: "Recife",
    state: "PE",
    network: "privada",
    type: "instituto",
    mec: 0,
    price: 540,
    scholarships: true,
    image: null,
  },
];

export const demoOffers: Offer[] = demoInstitutions.flatMap(
  (institution, index) =>
    ["Administração", "Análise e Desenvolvimento de Sistemas", "Direito"].map(
      (name, course) => ({
        id: `demo-offer-${index}-${course}`,
        institution_id: institution.id,
        course_name: name,
        level: "graduacao",
        modality: course === 1 ? "ead" : "presencial",
        shift: "Noite",
        period: "Noturno",
        active: true,
      }),
    ),
);
