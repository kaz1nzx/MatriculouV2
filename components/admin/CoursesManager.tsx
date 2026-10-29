"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { AdminContext } from "./AdminApp";
import { SetupNotice } from "./AccessRequest";
import { useApp } from "../app/AppProvider";
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Field,
  Icon,
  Modal,
  Segmented,
  Spinner,
} from "../ui";
import { supabase } from "../../lib/supabase";
import { isMissingTable, mapOffer } from "../../lib/catalog";
import { courseInfo, getCourseDetail } from "../../lib/courses";
import { clean, fieldError } from "../../lib/sanitize";
import { levelLabel, modalityLabel, money } from "../../lib/format";
import { matchesQuery } from "../../lib/search";
import type { Offer } from "../../lib/types";

type Draft = {
  id?: string;
  course: string;
  level: string;
  modality: string;
  shift: string;
  duration: string;
  price: string;
  seats: string;
  description: string;
  active: boolean;
};

const empty: Draft = {
  course: "",
  level: "graduacao",
  modality: "presencial",
  shift: "",
  duration: "",
  price: "",
  seats: "",
  description: "",
  active: true,
};
const shifts = ["Manhã", "Tarde", "Noite", "Integral", "Flexível (EAD)"];

function CourseForm({
  draft,
  onClose,
  onSaved,
  institutionId,
}: {
  draft: Draft;
  onClose: () => void;
  onSaved: () => void;
  institutionId: string;
}) {
  const { notify } = useApp();
  const [form, setForm] = useState(draft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const detail = form.course ? getCourseDetail(form.course) : null;
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const course = clean(form.course);
    if (course.length < 2) next.course = "Informe o nome do curso.";
    else if (fieldError(course, "text"))
      next.course = fieldError(course, "text");
    if (detail?.presentialOnly && form.modality !== "presencial")
      next.modality =
        "Este curso só pode ser presencial (Decreto nº 12.456/2025).";
    if (fieldError(form.description, "text"))
      next.description = fieldError(form.description, "text");
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const row = {
      instituicao_id: institutionId,
      curso_nome: course,
      nivel: form.level,
      modalidade: form.modality,
      turno: form.shift || null,
      duracao: clean(form.duration) || null,
      mensalidade: form.price ? Number(form.price) : null,
      vagas: form.seats ? Number(form.seats) : null,
      descricao: clean(form.description, true) || null,
      ativo: form.active,
    };
    const { error } = form.id
      ? await supabase.from("ofertas").update(row).eq("id", form.id)
      : await supabase.from("ofertas").insert(row);
    setBusy(false);
    if (error)
      return notify(
        /column|schema/i.test(error.message)
          ? "Execute supabase/painel-instituicoes.sql para ativar a gestão de cursos."
          : "Não foi possível salvar o curso.",
        "error",
      );
    notify(form.id ? "Curso atualizado" : "Curso publicado", "success");
    onSaved();
  };

  return (
    <Modal
      title={form.id ? "Editar curso" : "Novo curso"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="course-form"
            className="btn primary"
            disabled={busy}
          >
            {busy ? "Salvando…" : "Salvar curso"}
          </button>
        </>
      }
    >
      <form id="course-form" className="formGrid" onSubmit={submit} noValidate>
        <Field
          label="Curso"
          className="span2"
          error={errors.course}
          hint={
            detail?.known
              ? `${detail.level} · referência de ${detail.duration}`
              : "Escolha da lista para usar a ficha completa do catálogo."
          }
        >
          <input
            list="lista-cursos"
            value={form.course}
            maxLength={120}
            onChange={(e) => set("course", e.target.value)}
            data-autofocus
          />
        </Field>
        <datalist id="lista-cursos">
          {courseInfo.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
        <Field label="Nível">
          <select
            value={form.level}
            onChange={(e) => set("level", e.target.value)}
          >
            <option value="graduacao">Graduação</option>
            <option value="tecnico">Técnico</option>
            <option value="pos">Pós-graduação</option>
            <option value="fundamental">Ensino fundamental</option>
            <option value="medio">Ensino médio</option>
          </select>
        </Field>
        <Field label="Modalidade" error={errors.modality}>
          <select
            value={form.modality}
            onChange={(e) => set("modality", e.target.value)}
          >
            <option value="presencial">Presencial</option>
            <option value="hibrido">Híbrido</option>
            <option value="ead" disabled={detail?.presentialOnly}>
              EAD
            </option>
          </select>
        </Field>
        <Field label="Turno" optional>
          <select
            value={form.shift}
            onChange={(e) => set("shift", e.target.value)}
          >
            <option value="">Não informado</option>
            {shifts.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Duração"
          optional
          hint={detail?.known ? `Referência: ${detail.duration}` : undefined}
        >
          <input
            value={form.duration}
            maxLength={40}
            placeholder="Ex.: 8 semestres"
            onChange={(e) => set("duration", e.target.value)}
          />
        </Field>
        <Field
          label="Mensalidade (R$)"
          optional
          hint="Deixe vazio em instituições gratuitas."
        >
          <input
            type="number"
            min={0}
            step={10}
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </Field>
        <Field label="Vagas por ano" optional>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={form.seats}
            onChange={(e) => set("seats", e.target.value)}
          />
        </Field>
        <Field
          label="Diferenciais do curso"
          optional
          className="span2"
          error={errors.description}
        >
          <textarea
            rows={3}
            maxLength={1000}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Laboratórios, parcerias, nota no ENADE, intercâmbio…"
          />
        </Field>
        <label className="switchRow span2">
          <input
            type="checkbox"
            role="switch"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
          />
          <span>Publicado no catálogo</span>
        </label>
      </form>
    </Modal>
  );
}

export default function CoursesManager({ institution }: AdminContext) {
  const { reloadCatalog, notify } = useApp();
  const [items, setItems] = useState<Offer[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">(
    "todos",
  );
  const [editing, setEditing] = useState<Draft | null>(null);
  const [removing, setRemoving] = useState<Offer | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("ofertas")
      .select("*")
      .eq("instituicao_id", institution.id)
      .order("curso_nome");
    setMissing(isMissingTable(error));
    setItems((data || []).map(mapOffer));
  }, [institution.id]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () =>
      (items || [])
        .filter(
          (o) =>
            filter === "todos" ||
            (filter === "ativos" ? o.active !== false : o.active === false),
        )
        .filter((o) =>
          matchesQuery(
            `${o.course_name} ${levelLabel(o.level)} ${modalityLabel(o.modality)}`,
            query,
          ),
        ),
    [filter, items, query],
  );

  const refresh = () => {
    setEditing(null);
    load();
    reloadCatalog();
  };

  const toggle = async (o: Offer) => {
    const { error } = await supabase
      .from("ofertas")
      .update({ ativo: o.active === false })
      .eq("id", o.id);
    if (error) return notify("Não foi possível alterar o curso.", "error");
    notify(
      o.active === false ? "Curso publicado" : "Curso ocultado do catálogo",
    );
    refresh();
  };

  const remove = async () => {
    if (!removing) return;
    const { error } = await supabase
      .from("ofertas")
      .delete()
      .eq("id", removing.id);
    setRemoving(null);
    if (error)
      return notify(
        "Não foi possível excluir. Há candidaturas ligadas a este curso? Prefira ocultá-lo.",
        "error",
      );
    notify("Curso excluído");
    refresh();
  };

  const edit = (o: Offer) =>
    setEditing({
      id: o.id,
      course: o.course_name,
      level: o.level || "graduacao",
      modality: (o.modality || "presencial").toLowerCase(),
      shift: o.shift || "",
      duration: o.duration || "",
      price: o.price ? String(o.price) : "",
      seats: o.seats ? String(o.seats) : "",
      description: o.description || "",
      active: o.active !== false,
    });

  if (items === null) return <Spinner label="Carregando cursos" />;
  const activeCount = items.filter((o) => o.active !== false).length;

  return (
    <div className="adminStack">
      {missing && <SetupNotice />}
      <div className="toolbar">
        <label className="searchField compact">
          <Icon name="search" />
          <span className="srOnly">Buscar curso</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar curso"
          />
        </label>
        <Segmented
          label="Situação"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "todos", label: "Todos", count: items.length },
            { value: "ativos", label: "Publicados", count: activeCount },
            {
              value: "inativos",
              label: "Ocultos",
              count: items.length - activeCount,
            },
          ]}
        />
        <button
          type="button"
          className="btn primary"
          onClick={() => setEditing({ ...empty })}
        >
          <Icon name="plus" size={16} /> Novo curso
        </button>
      </div>

      {visible.length ? (
        <div
          className="tableScroll panel flush"
          role="region"
          aria-label="Cursos da instituição"
          tabIndex={0}
        >
          <table className="dataTable">
            <thead>
              <tr>
                <th scope="col">Curso</th>
                <th scope="col">Nível</th>
                <th scope="col">Modalidade</th>
                <th scope="col">Turno</th>
                <th scope="col">Mensalidade</th>
                <th scope="col">Vagas</th>
                <th scope="col">Situação</th>
                <th scope="col">
                  <span className="srOnly">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id}>
                  <th scope="row">{o.course_name}</th>
                  <td>{levelLabel(o.level)}</td>
                  <td>{modalityLabel(o.modality)}</td>
                  <td>{o.shift || "—"}</td>
                  <td>{o.price ? money(o.price) : "—"}</td>
                  <td>{o.seats ?? "—"}</td>
                  <td>
                    {o.active === false ? (
                      <Badge>Oculto</Badge>
                    ) : (
                      <Badge tone="success">Publicado</Badge>
                    )}
                  </td>
                  <td className="rowActions">
                    <button
                      type="button"
                      className="iconButton"
                      onClick={() => edit(o)}
                      aria-label={`Editar ${o.course_name}`}
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      type="button"
                      className="iconButton"
                      onClick={() => toggle(o)}
                      aria-label={
                        o.active === false
                          ? `Publicar ${o.course_name}`
                          : `Ocultar ${o.course_name}`
                      }
                    >
                      <Icon
                        name={o.active === false ? "eye" : "eyeOff"}
                        size={16}
                      />
                    </button>
                    <button
                      type="button"
                      className="iconButton danger"
                      onClick={() => setRemoving(o)}
                      aria-label={`Excluir ${o.course_name}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="book"
          title={
            items.length
              ? "Nenhum curso com esse filtro"
              : "Nenhum curso publicado"
          }
          action={
            <button
              type="button"
              className="btn primary"
              onClick={() => setEditing({ ...empty })}
            >
              Publicar o primeiro curso
            </button>
          }
        >
          Cursos publicados aparecem na página da instituição, na busca e na
          comparação.
        </EmptyState>
      )}

      {editing && (
        <CourseForm
          draft={editing}
          institutionId={institution.id}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      )}
      {removing && (
        <ConfirmDialog
          title="Excluir curso?"
          confirmLabel="Excluir"
          danger
          onConfirm={remove}
          onClose={() => setRemoving(null)}
        >
          “{removing.course_name}” sai do catálogo de forma definitiva. Para
          tirá-lo do ar temporariamente, use “Ocultar”.
        </ConfirmDialog>
      )}
    </div>
  );
}
