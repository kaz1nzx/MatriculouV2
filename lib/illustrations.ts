// Illustrative photos for institutions without a licensed photo of their own. They show a
// generic learning space, never the institution, and are always labelled as illustrative.
// The Pexels photos used in the hero and home sections are not in this pool, so an
// illustrative card never repeats a picture seen elsewhere on the site.
export type Illustration = {
  src: string;
  alt: string;
  author: string;
  license: string;
  source: string;
};

const commons = (
  file: string,
  alt: string,
  author: string,
  license: string,
  source: string,
): Illustration => ({
  src: `/images/ilustrativas/${file}`,
  alt,
  author,
  license,
  source,
});
const wiki = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${file}`;

const sets: Record<string, Illustration[]> = {
  tecnico: [
    commons(
      "tecnico-8.jpg",
      "Laboratório de eletricidade com bancadas de experimentos",
      "Bruno Oliveira",
      "CC BY-SA 4.0",
      wiki("Laborat%C3%B3rio_Eletricidade_FEAU.jpg"),
    ),
    commons(
      "tecnico-11.jpg",
      "Laboratório de informática com fileiras de computadores",
      "Kiruthikapalani",
      "CC BY-SA 4.0",
      wiki("Computer_Laboratory.jpg"),
    ),
    commons(
      "tecnico-9.jpg",
      "Bancada de eletrônica com osciloscópio e multímetro",
      "Radarvector",
      "CC BY-SA 4.0",
      wiki(
        "Keysight_InfiniiVision_DSOX_4024A_and_digital_multimeter_and_power_supply_in_laboratory_use.jpg",
      ),
    ),
    commons(
      "tecnico-12.jpg",
      "Fileira de computadores e cadeiras em um laboratório de informática",
      "ProjectManhattan",
      "CC BY-SA 3.0",
      wiki("Computer_lab_2.jpg"),
    ),
    commons(
      "tecnico-13.jpg",
      "Laboratório de design com computadores sobre mesas escuras",
      "Mbrickn",
      "CC BY-SA 4.0",
      wiki("Center_for_Advanced_Visualization_and_Education.jpg"),
    ),
    commons(
      "tecnico-14.jpg",
      "Pequeno laboratório de informática com quatro computadores",
      "Yusongc",
      "CC BY-SA 4.0",
      wiki("Computer_Lab_Picture.jpg"),
    ),
    commons(
      "tecnico-15.jpg",
      "Computadores em mesas com rodízios e cadeiras vermelhas",
      "DFW FAA Brianvators",
      "CC BY-SA 4.0",
      wiki("Computers.jpg"),
    ),
    commons(
      "tecnico-16.jpg",
      "Laboratório de informática amplo com mesas em fileiras",
      "JackFromWisconsin",
      "CC0",
      wiki("Computer_Lab_Baraboo.jpg"),
    ),
    commons(
      "tecnico-17.jpg",
      "Laboratório de computadores com estações separadas por divisórias",
      "ManoBV16",
      "CC0",
      wiki("AI_Lab_1.jpg"),
    ),
    commons(
      "tecnico-18.jpg",
      "Bancada com computador e kit de eletrônica para aulas práticas",
      "JesusRamirez",
      "CC BY 3.0",
      wiki("Combo_Equipos.jpg"),
    ),
  ],
  escola: [
    commons(
      "tecnico-1.jpg",
      "Sala multimídia escolar com computadores e cadeiras vermelhas",
      "Mosborne01",
      "CC BY-SA 3.0",
      wiki("Ashs-media-suite.jpg"),
    ),
    commons(
      "escola-2.jpg",
      "Sala de aula vazia com carteiras e quadro branco",
      "JúlioJpc",
      "CC0",
      wiki("IMGSala_de_Aula.jpg"),
    ),
    commons(
      "escola-3.jpg",
      "Sala de aula com carteiras azuis e mural colorido na parede",
      "Ámonbaal",
      "CC0",
      wiki("Sala_de_aula_escola_Ferreira_Mendes.jpg"),
    ),
    commons(
      "escola-4.jpg",
      "Biblioteca infantil com pufes coloridos e estantes de livros",
      "Juliana matos86",
      "CC BY-SA 4.0",
      wiki("Biblioteca_maristaRosario.jpg"),
    ),
    commons(
      "escola-5.jpg",
      "Biblioteca escolar com estantes vermelhas e azuis e mesa de leitura",
      "Nyxh Filippovna",
      "CC BY-SA 4.0",
      wiki("LIBRIS_-_Biblioteca_Modelo_1.jpg"),
    ),
    commons(
      "escola-6.jpg",
      "Sala de leitura com mesas redondas e estantes de livros",
      "Isabel Sacco",
      "CC BY-SA 4.0",
      wiki("Biblioteca_U3_Cambridge_(8).jpg"),
    ),
  ],
  universidade: [
    commons(
      "universidade-0.jpg",
      "Prédio universitário com gramado em frente",
      "Universidade de Brasília",
      "CC BY 2.0",
      wiki(
        "Pr%C3%A9dio_de_Ci%C3%AAncia_da_Computa%C3%A7%C3%A3o_e_Estat%C3%ADstica_e_Instituto_de_Ci%C3%AAncia_Pol%C3%ADtica_(29187520524).jpg",
      ),
    ),
    commons(
      "universidade-5.jpg",
      "Prédios de um campus universitário sob céu azul",
      "Universidade de Brasília",
      "CC BY 2.0",
      wiki(
        "CIC_Est_-_Departamentos_de_Ci%C3%AAncia_da_Computa%C3%A7%C3%A3o_e_Estat%C3%ADstica._(29764879028).jpg",
      ),
    ),
    commons(
      "universidade-6.jpg",
      "Biblioteca universitária com estantes, mesas e computadores",
      "Marina Macambyra",
      "CC BY-SA 4.0",
      wiki("Biblioteca_da_ECA_vista_geral_01.jpg"),
    ),
    commons(
      "universidade-7.jpg",
      "Corredores de estantes em uma biblioteca universitária",
      "Marina Macambyra",
      "CC BY-SA 4.0",
      wiki("Biblioteca_da_ECA_vista_parcial_01.jpg"),
    ),
    commons(
      "universidade-8.jpg",
      "Biblioteca com estantes vermelhas e notebooks para consulta",
      "Raquel da Silva Santos",
      "CC BY-SA 4.0",
      wiki("Biblioteca_CJA_2020.jpg"),
    ),
    commons(
      "universidade-9.jpg",
      "Vista do alto de uma biblioteca ampla com dois andares",
      "Roger de Miranda Guedes",
      "CC BY-SA 4.0",
      wiki("Interior_da_Biblioteca_de_S%C3%A3o_Paulo_-_SP.jpg"),
    ),
    commons(
      "universidade-10.jpg",
      "Auditório em semicírculo com poltronas vermelhas",
      "ארז האורז",
      "CC BY-SA 4.0",
      wiki("Chase_hall.jpg"),
    ),
    commons(
      "universidade-11.jpg",
      "Auditório com cadeiras vermelhas, telão e janelas amplas",
      "Mike Peel",
      "CC BY-SA 4.0",
      wiki("At_Chicago_2024_067.jpg"),
    ),
  ],
  faculdade: [
    commons(
      "faculdade-1.jpg",
      "Auditório de aulas com fileiras de cadeiras",
      "Yinan Chen",
      "Domínio público",
      wiki("Gfp-lecture-hall.jpg"),
    ),
    commons(
      "faculdade-2.jpg",
      "Estantes de livros em uma biblioteca universitária",
      "TAGU",
      "CC BY-SA 4.0",
      wiki("Estantes_-_Biblioteca_de_Veterinarias.JPG"),
    ),
    commons(
      "faculdade-4.jpg",
      "Anfiteatro de aulas com bancadas claras em degraus",
      "Derzsi Elekes Andor",
      "CC BY-SA 3.0",
      wiki("Budapesti_Corvinus_Egyetem_-_2014.06.12_(20).JPG"),
    ),
    commons(
      "faculdade-5.jpg",
      "Sala de aula em degraus com bancadas longas",
      "Globetrotter19",
      "CC BY-SA 3.0",
      wiki(
        "%27G%C3%B3lyav%C3%A1r%27_Geb%C3%A4ude,_H%C3%B6rsaal_P%C3%A1zm%C3%A1ny,_2022_J%C3%B3zsefv%C3%A1ros.jpg",
      ),
    ),
  ],
};

const setFor = (type: string) => sets[type] || sets.universidade;
const hashOf = (id: string) => {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
};

/** Fallback when an institution was not part of an assignment: stable, but may repeat. */
export function illustrationFor(id: string, type: string): Illustration {
  const set = setFor(type);
  return set[hashOf(id) % set.length];
}

/**
 * Gives every institution without a photo its own picture: first an unused one from its
 * type, then any unused one, and only when the whole pool is taken the least used one.
 * Institutions are visited in id order, so each keeps the same picture between visits.
 */
export function assignIllustrations(
  institutions: { id: string; type: string; image: string | null }[],
): Map<string, Illustration> {
  const uses = new Map<string, number>();
  const assigned = new Map<string, Illustration>();
  const pool = Object.values(sets).flat();
  const pending = institutions
    .filter((i) => !i.image)
    .sort((a, b) => a.id.localeCompare(b.id));
  for (const { id, type } of pending) {
    const own = setFor(type);
    const start = hashOf(id);
    const rotate = (list: Illustration[]) =>
      list.map((_, k) => list[(start + k) % list.length]);
    const pick =
      rotate(own).find((art) => !uses.has(art.src)) ||
      rotate(pool).find((art) => !uses.has(art.src)) ||
      rotate(pool).reduce((least, art) =>
        (uses.get(art.src) || 0) < (uses.get(least.src) || 0) ? art : least,
      );
    uses.set(pick.src, (uses.get(pick.src) || 0) + 1);
    assigned.set(id, pick);
  }
  return assigned;
}

export const allIllustrations = Object.values(sets).flat();
