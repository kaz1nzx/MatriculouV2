"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "../app/AppProvider";
import { Badge, DataNotice, Icon, Modal } from "../ui";
import { courseStats } from "../../lib/compare";
import { modalityLabel, money, networkLabel, plural } from "../../lib/format";
import { stateNames } from "../../lib/search";
import { normalize } from "../../lib/text";
import type { CourseDetail } from "../../lib/types";

export default function CourseDetailModal({
  course,
  onClose,
}: {
  course: CourseDetail;
  onClose: () => void;
}) {
  const { institutions, offers } = useApp();
  const [uf, setUf] = useState("");
  const [network, setNetwork] = useState("");
  const stats = useMemo(
    () => courseStats(course.name, institutions, offers),
    [course.name, institutions, offers],
  );

  const places = useMemo(() => {
    const key = normalize(course.name);
    const byId = new Map(institutions.map((i) => [i.id, i]));
    const grouped = new Map<
      string,
      { modalities: Set<string>; price: number | null }
    >();
    for (const o of offers) {
      if (normalize(o.course_name) !== key) continue;
      const entry = grouped.get(o.institution_id) || {
        modalities: new Set<string>(),
        price: null,
      };
      entry.modalities.add(modalityLabel(o.modality));
      if (o.price) entry.price = o.price;
      grouped.set(o.institution_id, entry);
    }
    return [...grouped.entries()]
      .map(([id, entry]) => ({ i: byId.get(id)!, ...entry }))
      .filter((p) => p.i)
      .sort(
        (a, b) =>
          Number(b.i.network === "publica") -
            Number(a.i.network === "publica") ||
          a.i.name.localeCompare(b.i.name),
      );
  }, [course.name, institutions, offers]);

  const filtered = places.filter(
    (p) => (!uf || p.i.state === uf) && (!network || p.i.network === network),
  );
  const states = [...new Set(places.map((p) => p.i.state))].sort();

  return (
    <Modal
      title={course.name}
      eyebrow={`${course.area} · ${course.level}`}
      onClose={onClose}
      size="lg"
    >
      <div className="courseDetail">
        <div className="courseIntro">
          <img src={course.icon} alt="" width={72} height={72} />
          <p>{course.desc}</p>
        </div>

        <dl className="statStrip">
          <div>
            <dt>Instituições</dt>
            <dd>{stats.institutions || "—"}</dd>
          </div>
          <div>
            <dt>Públicas</dt>
            <dd>{stats.institutions ? stats.publicCount : "—"}</dd>
          </div>
          <div>
            <dt>Estados</dt>
            <dd>{stats.states || "—"}</dd>
          </div>
          <div>
            <dt>Mensalidade mediana</dt>
            <dd>{stats.medianPrice ? money(stats.medianPrice) : "—"}</dd>
          </div>
        </dl>

        <dl className="factGrid">
          <div>
            <dt>Formação</dt>
            <dd>{course.level}</dd>
          </div>
          <div>
            <dt>Duração</dt>
            <dd>{course.duration}</dd>
          </div>
          <div>
            <dt>Carga horária mínima</dt>
            <dd>
              {course.hours
                ? `${course.hours.toLocaleString("pt-BR")} horas`
                : "Definida pela instituição"}
            </dd>
          </div>
          <div>
            <dt>Registro profissional</dt>
            <dd>{course.council || "Não exige conselho de classe"}</dd>
          </div>
          <div>
            <dt>Estágio</dt>
            <dd>{course.internship}</dd>
          </div>
          <div>
            <dt>Modalidade</dt>
            <dd>
              {course.presentialOnly
                ? "Somente presencial (Decreto nº 12.456/2025)"
                : stats.modalities.size
                  ? [...stats.modalities]
                      .map((m) => modalityLabel(m))
                      .join(" · ")
                  : "Consulte a instituição"}
            </dd>
          </div>
        </dl>

        {course.known && (
          <>
            <div className="twoCol">
              <section>
                <h3>Para quem é</h3>
                <p>{course.profile}</p>
              </section>
              <section>
                <h3>Como é a prática</h3>
                <p>{course.practicalFocus}</p>
              </section>
            </div>
            <section>
              <h3>O que você vai aprender</h3>
              <ul className="tagList">
                {course.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Disciplinas de referência</h3>
              <ol className="gradeList">
                {course.grade.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ol>
            </section>
            <section>
              <h3>Onde pode trabalhar</h3>
              <ul className="tagList accent">
                {course.careers.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          </>
        )}

        <section className="wherePanel" aria-labelledby="onde-estudar">
          <header>
            <h3 id="onde-estudar">Onde estudar</h3>
            <span>
              {plural(filtered.length, "instituição", "instituições")}
            </span>
          </header>
          {places.length > 0 ? (
            <>
              <div className="inlineFilters">
                <select
                  aria-label="Filtrar por estado"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {stateNames[s] || s}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filtrar por rede"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                >
                  <option value="">Pública ou privada</option>
                  <option value="publica">Pública</option>
                  <option value="privada">Privada</option>
                </select>
              </div>
              <ul className="placeList">
                {filtered.map(({ i, modalities, price }) => (
                  <li key={i.id}>
                    <Link href={`/instituicoes?abrir=${i.id}`}>
                      <span>
                        <b>{i.name}</b>
                        <small>
                          {i.city}, {i.state} · {[...modalities].join(" · ")}
                        </small>
                      </span>
                      <Badge
                        tone={i.network === "publica" ? "info" : "neutral"}
                      >
                        {i.network === "publica"
                          ? "Gratuita"
                          : price
                            ? `${money(price)}/mês`
                            : networkLabel(i.network)}
                      </Badge>
                      <Icon name="arrow" size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                className="btn ghost"
                href={`/instituicoes?curso=${encodeURIComponent(course.name)}`}
              >
                Ver no catálogo de instituições <Icon name="arrow" size={16} />
              </Link>
            </>
          ) : (
            <p className="muted">
              Nenhuma instituição do catálogo publicou este curso ainda.
            </p>
          )}
        </section>

        <DataNotice />
      </div>
    </Modal>
  );
}
