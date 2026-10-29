import { normalize } from "./text";

export const stateNames: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

// Every word of the query must appear somewhere in the text, in any order, ignoring
// accents, case and punctuation: "sao paulo, sp", "ufrj rio" and "medicina bahia" all match.
export function matchesQuery(text: string, query: string): boolean {
  const words = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (!words.length) return true;
  const haystack = ` ${normalize(text).replace(/[^a-z0-9]+/g, " ")} `;
  // Short words ("sp", "rj", "uf") only match at the start of a word, so "sp" does not hit "Espírito".
  return words.every((word) =>
    haystack.includes(word.length <= 2 ? ` ${word}` : word),
  );
}
