import type { CourseDetail, Institution, Offer } from "./types";
import { mecLabel, money, plural, priceLabel } from "./format";
import { normalize } from "./text";
import { stateNames } from "./search";

// "lower"/"higher": quanto menor/maior, melhor. "flag": 1 é um ponto a favor e null é
// desconhecido (nunca conta como ponto contra). "info" aparece na tabela sem vencedor.
type Kind = "lower" | "higher" | "flag" | "info";

export type Metric<T> = {
  key: string;
  label: string;
  hint: string;
  kind: Kind;
  weight: number;
  value: (item: T) => number | null;
  display: (item: T, value: number | null) => string;
  strength?: (item: T, value: number) => string;
  caution?: (item: T, value: number | null) => string | null;
};

export type Cell = {
  display: string;
  value: number | null;
  best: boolean;
  worst: boolean;
};
export type Row = {
  key: string;
  label: string;
  hint: string;
  kind: Kind;
  cells: Cell[];
  decided: boolean;
};
export type Verdict = {
  index: number;
  name: string;
  score: number | null;
  rank: number;
  strengths: string[];
  cautions: string[];
};
export type Comparison = {
  rows: Row[];
  verdicts: Verdict[];
  leaders: { label: string; names: string[] }[];
  summary: string;
};

const relativeScore = (value: number, values: number[], kind: Kind) => {
  if (kind === "flag") return value > 0 ? 1 : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 1;
  return kind === "lower"
    ? (max - value) / (max - min)
    : (value - min) / (max - min);
};

export function compare<T>(
  items: T[],
  metrics: Metric<T>[],
  nameOf: (item: T) => string,
): Comparison {
  const totals = items.map(() => ({ weighted: 0, weights: 0 }));
  const strengths: string[][] = items.map(() => []);
  const cautions: string[][] = items.map(() => []);
  const leaders: Comparison["leaders"] = [];

  const rows: Row[] = metrics.map((metric) => {
    const values = items.map(metric.value);
    const known = values.filter((v): v is number => v !== null);
    const target =
      metric.kind === "lower"
        ? Math.min(...known)
        : metric.kind === "info"
          ? NaN
          : Math.max(...known);
    const comparable =
      metric.kind !== "info" && known.length >= 2 && new Set(known).size > 1;
    // Um critério só tem vencedor quando há diferença real entre ao menos duas opções.
    const decided =
      metric.kind === "flag"
        ? known.some((v) => v > 0) && values.some((v) => !v)
        : comparable;
    const worstValue =
      metric.kind === "lower"
        ? Math.max(...known)
        : metric.kind === "higher"
          ? Math.min(...known)
          : NaN;

    const cells = items.map((item, index) => {
      const value = values[index];
      const best =
        decided &&
        value !== null &&
        value === target &&
        (metric.kind !== "flag" || value > 0);
      const worst =
        decided && comparable && value !== null && value === worstValue;
      if (
        value !== null &&
        metric.kind !== "info" &&
        metric.weight > 0 &&
        known.length
      ) {
        totals[index].weighted +=
          metric.weight * relativeScore(value, known, metric.kind);
        totals[index].weights += metric.weight;
      }
      if (best && metric.strength)
        strengths[index].push(metric.strength(item, value as number));
      const caution = metric.caution?.(item, value);
      if (
        caution &&
        (worst ||
          value === null ||
          metric.kind === "flag" ||
          metric.kind === "info")
      )
        cautions[index].push(caution);
      return { display: metric.display(item, value), value, best, worst };
    });

    if (decided) {
      leaders.push({
        label: metric.label,
        names: cells.flatMap((cell, index) =>
          cell.best ? [nameOf(items[index])] : [],
        ),
      });
    }
    return {
      key: metric.key,
      label: metric.label,
      hint: metric.hint,
      kind: metric.kind,
      cells,
      decided,
    };
  });

  const scores = totals.map((t) =>
    t.weights ? Math.round((t.weighted / t.weights) * 100) : null,
  );
  const order = scores
    .map((score, index) => ({ score: score ?? -1, index }))
    .sort((a, b) => b.score - a.score);
  const verdicts: Verdict[] = items.map((item, index) => ({
    index,
    name: nameOf(item),
    score: scores[index],
    rank: order.findIndex((o) => o.index === index) + 1,
    strengths: strengths[index],
    cautions: cautions[index],
  }));

  return { rows, verdicts, leaders, summary: summarize(verdicts, leaders) };
}

function summarize(verdicts: Verdict[], leaders: Comparison["leaders"]) {
  const ranked = [...verdicts]
    .filter((v) => v.score !== null)
    .sort((a, b) => a.rank - b.rank);
  if (!ranked.length)
    return "Ainda não há dados suficientes para apontar diferenças entre as opções.";
  const [first, second] = ranked;
  const tie = second && second.score === first.score;
  const head = tie
    ? `${first.name} e ${second.name} empatam no equilíbrio geral para as suas prioridades.`
    : `${first.name} tem o melhor equilíbrio para as suas prioridades.`;
  const others = leaders
    .filter((leader) => !leader.names.includes(first.name))
    .slice(0, 2)
    .map(
      (leader) =>
        `${leader.names.join(" e ")} se destaca em ${leader.label.toLowerCase()}`,
    );
  return others.length ? `${head} Por outro lado, ${others.join("; ")}.` : head;
}

export type InstitutionPriorities = {
  custo: number;
  qualidade: number;
  cursos: number;
  flexibilidade: number;
  bolsas: number;
};

export const defaultInstitutionPriorities: InstitutionPriorities = {
  custo: 3,
  qualidade: 3,
  cursos: 2,
  flexibilidade: 1,
  bolsas: 1,
};

export const institutionPriorityLabels: Record<
  keyof InstitutionPriorities,
  string
> = {
  custo: "Custo",
  qualidade: "Conceito MEC",
  cursos: "Variedade de cursos",
  flexibilidade: "Modalidades",
  bolsas: "Bolsas",
};

const modalityKey = (modality?: string | null) => {
  const key = normalize(modality || "presencial");
  return key === "semipresencial" ? "hibrido" : key;
};

export function compareInstitutions(
  institutions: Institution[],
  offers: Offer[],
  options: {
    priorities: InstitutionPriorities;
    course?: string;
    state?: string;
  },
) {
  const byInstitution = new Map<string, Offer[]>();
  for (const offer of offers) {
    if (offer.active === false) continue;
    const list = byInstitution.get(offer.institution_id) || [];
    list.push(offer);
    byInstitution.set(offer.institution_id, list);
  }
  const coursesOf = (i: Institution) =>
    new Set(
      (byInstitution.get(i.id) || []).map((o) => normalize(o.course_name)),
    );
  const modalitiesOf = (i: Institution) =>
    new Set(
      (byInstitution.get(i.id) || []).map((o) => modalityKey(o.modality)),
    );
  const courseOffer = (i: Institution) =>
    options.course
      ? (byInstitution.get(i.id) || []).filter(
          (o) => normalize(o.course_name) === normalize(options.course!),
        )
      : [];
  const { priorities } = options;

  const metrics: Metric<Institution>[] = [
    ...(options.course
      ? [
          {
            key: "curso",
            label: `Oferece ${options.course}`,
            hint: "Se o curso que você procura consta no catálogo da instituição.",
            kind: "flag" as const,
            weight: 4,
            value: (i: Institution) => (courseOffer(i).length ? 1 : 0),
            display: (i: Institution) => {
              const found = courseOffer(i);
              if (!found.length) return "Não consta no catálogo";
              const modes = [
                ...new Set(
                  found.map((o) =>
                    modalityKey(o.modality) === "ead"
                      ? "EAD"
                      : modalityKey(o.modality) === "hibrido"
                        ? "Híbrido"
                        : "Presencial",
                  ),
                ),
              ];
              return `Sim · ${modes.join(" e ")}`;
            },
            strength: () => `Oferece ${options.course}`,
            caution: (_: Institution, v: number | null) =>
              v ? null : `${options.course} não consta no catálogo`,
          },
        ]
      : []),
    ...(options.state
      ? [
          {
            key: "local",
            label: `Fica em ${stateNames[options.state] || options.state}`,
            hint: "Se a instituição está no estado onde você quer estudar.",
            kind: "flag" as const,
            weight: 3,
            value: (i: Institution) => (i.state === options.state ? 1 : 0),
            display: (i: Institution) => `${i.city}, ${i.state}`,
            strength: (i: Institution) => `Fica em ${i.city}, ${i.state}`,
            caution: (i: Institution, v: number | null) =>
              v ? null : `Fica fora de ${options.state} (${i.state})`,
          },
        ]
      : []),
    {
      key: "custo",
      label: "Custo",
      hint: "Mensalidade média de referência. Instituições públicas são gratuitas; privadas sem valor informado ficam de fora deste critério.",
      kind: "lower",
      weight: priorities.custo,
      value: (i) =>
        i.network === "publica" ? 0 : i.price > 0 ? i.price : null,
      display: (i) => priceLabel(i),
      strength: (i, v) =>
        v === 0
          ? i.network === "publica"
            ? "Ensino gratuito"
            : "Menor custo"
          : `Menor mensalidade (${money(v)})`,
      caution: (i, v) =>
        v === null
          ? "Mensalidade não informada"
          : v > 0
            ? `Mensalidade mais alta (${money(v)}/mês)`
            : null,
    },
    {
      key: "qualidade",
      label: "Conceito MEC",
      hint: "Conceito Institucional ou IGC do e-MEC, de 1 a 5. Não se aplica a escolas e não existe para universidades estaduais.",
      kind: "higher",
      weight: priorities.qualidade,
      value: (i) => (i.type !== "escola" && i.mec > 0 ? i.mec : null),
      display: (i) => mecLabel(i),
      strength: (_, v) => `Maior conceito MEC (${v} de 5)`,
      caution: (i, v) =>
        v === null
          ? i.type === "escola"
            ? null
            : "Conceito MEC não informado"
          : `Conceito MEC menor (${v} de 5)`,
    },
    {
      key: "cursos",
      label: "Cursos no catálogo",
      hint: "Quantidade de cursos diferentes que a instituição oferece no Matriculou.",
      kind: "higher",
      weight: priorities.cursos,
      value: (i) => coursesOf(i).size || null,
      display: (_, v) => (v ? plural(v, "curso", "cursos") : "Não informado"),
      strength: (_, v) => `Mais opções de curso (${v})`,
      caution: (_, v) =>
        v === null ? "Cursos não informados" : `Menos opções de curso (${v})`,
    },
    {
      key: "flexibilidade",
      label: "Modalidades",
      hint: "Presencial, EAD e híbrido. Mais modalidades significam mais flexibilidade de rotina.",
      kind: "higher",
      weight: priorities.flexibilidade,
      value: (i) => modalitiesOf(i).size || null,
      display: (i) => {
        const set = modalitiesOf(i);
        if (!set.size) return "Não informado";
        return [...set]
          .map((m) =>
            m === "ead" ? "EAD" : m === "hibrido" ? "Híbrido" : "Presencial",
          )
          .join(" · ");
      },
      strength: (i) =>
        modalitiesOf(i).has("ead")
          ? "Tem cursos a distância (EAD)"
          : "Mais modalidades",
    },
    {
      key: "bolsas",
      label: "Bolsas e auxílios",
      hint: "Bolsas próprias, ProUni ou assistência estudantil informadas pela instituição.",
      kind: "flag",
      weight: priorities.bolsas,
      value: (i) => (i.scholarships ? 1 : null),
      display: (i) => (i.scholarships ? "Disponíveis" : "Não informado"),
      strength: () => "Oferece bolsas ou auxílios",
    },
    {
      key: "inscricoes",
      label: "Inscrições",
      hint: "Processo seletivo aberto, informado pela própria instituição no painel.",
      kind: "flag",
      weight: 1,
      value: (i) => (i.enrollmentOpen ? 1 : null),
      display: (i) =>
        i.enrollmentOpen
          ? i.enrollmentUntil
            ? `Abertas até ${new Date(`${i.enrollmentUntil}T12:00:00`).toLocaleDateString("pt-BR")}`
            : "Abertas"
          : "Consulte a instituição",
      strength: () => "Inscrições abertas agora",
    },
  ];

  return compare(institutions, metrics, (i) => shortName(i.name));
}

export type CourseStats = {
  institutions: number;
  publicCount: number;
  states: number;
  modalities: Set<string>;
  medianPrice: number | null;
};

export function courseStats(
  name: string,
  institutions: Institution[],
  offers: Offer[],
): CourseStats {
  const key = normalize(name);
  const related = offers.filter(
    (o) => o.active !== false && normalize(o.course_name) === key,
  );
  const byId = new Map(institutions.map((i) => [i.id, i]));
  const places = [...new Set(related.map((o) => o.institution_id))]
    .map((id) => byId.get(id))
    .filter(Boolean) as Institution[];
  const prices = related
    .map(
      (o) =>
        o.price ||
        (byId.get(o.institution_id)?.network === "privada"
          ? byId.get(o.institution_id)?.price
          : 0) ||
        0,
    )
    .filter((p) => p > 0)
    .sort((a, b) => a - b);
  const middle = Math.floor(prices.length / 2);
  return {
    institutions: places.length,
    publicCount: places.filter((i) => i.network === "publica").length,
    states: new Set(places.map((i) => i.state)).size,
    modalities: new Set(related.map((o) => modalityKey(o.modality))),
    medianPrice: prices.length
      ? prices.length % 2
        ? prices[middle]
        : Math.round((prices[middle - 1] + prices[middle]) / 2)
      : null,
  };
}

export type CoursePriorities = {
  rapidez: number;
  custo: number;
  oferta: number;
  flexibilidade: number;
};

export const defaultCoursePriorities: CoursePriorities = {
  rapidez: 2,
  custo: 2,
  oferta: 2,
  flexibilidade: 1,
};

export const coursePriorityLabels: Record<keyof CoursePriorities, string> = {
  rapidez: "Formar mais rápido",
  custo: "Custo",
  oferta: "Opções de onde estudar",
  flexibilidade: "Flexibilidade (EAD)",
};

export function compareCourses(
  courses: CourseDetail[],
  institutions: Institution[],
  offers: Offer[],
  priorities: CoursePriorities,
) {
  const stats = new Map(
    courses.map((c) => [c.name, courseStats(c.name, institutions, offers)]),
  );
  const s = (c: CourseDetail) => stats.get(c.name)!;

  const metrics: Metric<CourseDetail>[] = [
    {
      key: "formacao",
      label: "Formação",
      hint: "Tipo de diploma: bacharelado, licenciatura, tecnólogo ou técnico.",
      kind: "info",
      weight: 0,
      value: () => 0,
      display: (c) => c.level,
    },
    {
      key: "duracao",
      label: "Tempo de formação",
      hint: "Duração mínima de referência para concluir o curso.",
      kind: "lower",
      weight: priorities.rapidez,
      value: (c) => c.years || null,
      display: (c) => c.duration,
      strength: (c) => `Forma mais rápido (${c.duration})`,
      caution: (c, v) =>
        v === null ? null : `Curso mais longo (${c.duration})`,
    },
    {
      key: "carga",
      label: "Carga horária mínima",
      hint: "Mínimo definido pelas Diretrizes Curriculares Nacionais ou pelos catálogos oficiais do MEC.",
      kind: "info",
      weight: 0,
      value: (c) => c.hours,
      display: (c) =>
        c.hours
          ? `${c.hours.toLocaleString("pt-BR")} horas`
          : "Definida pela instituição",
    },
    {
      key: "oferta",
      label: "Instituições no catálogo",
      hint: "Quantas instituições do Matriculou oferecem o curso.",
      kind: "higher",
      weight: priorities.oferta,
      value: (c) => s(c).institutions || null,
      display: (c) =>
        s(c).institutions
          ? plural(s(c).institutions, "instituição", "instituições")
          : "Nenhuma no catálogo",
      strength: (c) => `Mais lugares para estudar (${s(c).institutions})`,
      caution: (c, v) =>
        v === null
          ? "Ainda sem oferta no catálogo"
          : `Menos opções de instituição (${v})`,
    },
    {
      key: "gratuitas",
      label: "Opções gratuitas",
      hint: "Instituições públicas do catálogo que oferecem o curso.",
      kind: "higher",
      weight: priorities.custo,
      value: (c) => (s(c).institutions ? s(c).publicCount : null),
      display: (c) =>
        s(c).institutions
          ? plural(s(c).publicCount, "pública", "públicas")
          : "—",
      strength: (c) => `Mais opções gratuitas (${s(c).publicCount})`,
    },
    {
      key: "preco",
      label: "Mensalidade mediana",
      hint: "Mediana das mensalidades informadas pelas instituições privadas do catálogo que oferecem o curso.",
      kind: "lower",
      weight: priorities.custo,
      value: (c) => s(c).medianPrice,
      display: (c) =>
        s(c).medianPrice
          ? `${money(s(c).medianPrice!)}/mês`
          : "Sem valores informados",
      strength: (c) => `Mensalidade mais baixa (${money(s(c).medianPrice!)})`,
      caution: (c, v) =>
        v === null ? null : `Mensalidade mais alta (${money(v)}/mês)`,
    },
    {
      key: "flexibilidade",
      label: "Modalidades",
      hint: "Modalidades encontradas no catálogo. Medicina, Direito, Odontologia, Enfermagem e Psicologia só podem ser presenciais (Decreto nº 12.456/2025).",
      kind: "higher",
      weight: priorities.flexibilidade,
      value: (c) => (c.presentialOnly ? 1 : s(c).modalities.size || null),
      display: (c) =>
        c.presentialOnly
          ? "Somente presencial"
          : s(c).modalities.size
            ? [...s(c).modalities]
                .map((m) =>
                  m === "ead"
                    ? "EAD"
                    : m === "hibrido"
                      ? "Híbrido"
                      : "Presencial",
                )
                .join(" · ")
            : "—",
      strength: (c) =>
        s(c).modalities.has("ead") ? "Também há opção EAD" : "Mais modalidades",
      caution: (c) => (c.presentialOnly ? "Exige frequência presencial" : null),
    },
    {
      key: "abrangencia",
      label: "Estados com oferta",
      hint: "Em quantos estados o curso aparece no catálogo.",
      kind: "higher",
      weight: Math.max(1, priorities.oferta - 1),
      value: (c) => s(c).states || null,
      display: (c) =>
        s(c).states ? plural(s(c).states, "estado", "estados") : "—",
      strength: (c) => `Presente em mais estados (${s(c).states})`,
    },
    {
      key: "registro",
      label: "Registro profissional",
      hint: "Conselho de classe exigido para exercer a profissão.",
      kind: "info",
      weight: 0,
      value: () => 0,
      display: (c) => c.council || "Não exige",
      caution: (c) =>
        c.council && /exame/i.test(c.council)
          ? `Exige ${c.council.split(",")[0]} com exame`
          : null,
    },
  ];

  return compare(courses, metrics, (c) => c.name);
}

export const shortName = (name: string) => {
  const sigla = name.match(/\(([^)]+)\)/)?.[1];
  if (sigla && sigla.length <= 22) return sigla;
  return name.length > 34 ? `${name.slice(0, 32).trim()}…` : name;
};
