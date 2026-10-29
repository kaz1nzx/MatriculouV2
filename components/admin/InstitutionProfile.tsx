"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { AdminContext } from "./AdminApp";
import { useApp } from "../app/AppProvider";
import { Field, Icon, Spinner } from "../ui";
import { InstitutionImage } from "../institutions/InstitutionCard";
import { supabase } from "../../lib/supabase";
import { mapInstitution } from "../../lib/catalog";
import { clean, fieldError, guard } from "../../lib/sanitize";
import {
  formatPhone,
  mecLabel,
  networkLabel,
  typeLabel,
} from "../../lib/format";
import type { Institution } from "../../lib/types";

export default function InstitutionProfile({ institution }: AdminContext) {
  const { reloadCatalog, notify } = useApp();
  const [current, setCurrent] = useState<Institution | null>(null);
  const [form, setForm] = useState({
    description: "",
    site: "",
    email: "",
    phone: "",
    address: "",
    price: "",
    scholarships: false,
    open: false,
    until: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    supabase
      .from("instituicoes")
      .select("*")
      .eq("id", institution.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const i = mapInstitution(data);
        setCurrent(i);
        setForm({
          description: i.description || "",
          site: i.site || "",
          email: i.email || "",
          phone: i.phone || "",
          address: i.address || "",
          price: i.price ? String(i.price) : "",
          scholarships: i.scholarships,
          open: !!i.enrollmentOpen,
          until: i.enrollmentUntil || "",
        });
      });
  }, [institution.id]);

  if (!current) return <Spinner label="Carregando dados" />;
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.site && !/^https:\/\/[^\s]+\.[^\s]+$/i.test(form.site))
      next.site = "Use um endereço completo começando com https://";
    if (form.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(form.email))
      next.email = "Informe um e-mail válido.";
    if (fieldError(form.description, "text"))
      next.description = fieldError(form.description, "text");
    if (fieldError(form.address, "text"))
      next.address = fieldError(form.address, "text");
    if (
      form.price &&
      (Number(form.price) < 0 || Number.isNaN(Number(form.price)))
    )
      next.price = "Informe um valor válido.";
    if (
      form.open &&
      form.until &&
      form.until < new Date().toISOString().slice(0, 10)
    )
      next.until = "A data de encerramento já passou.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const { error } = await supabase
      .from("instituicoes")
      .update({
        descricao: clean(form.description, true) || null,
        site: form.site.trim() || null,
        email_contato: clean(form.email) || null,
        telefone: form.phone || null,
        endereco: clean(form.address) || null,
        mensalidade_media:
          current.network === "publica" ? 0 : Number(form.price) || 0,
        possui_bolsas: form.scholarships,
        inscricoes_abertas: form.open,
        inscricoes_ate: form.open && form.until ? form.until : null,
      })
      .eq("id", institution.id);
    setBusy(false);
    if (error)
      return notify(
        /column|schema/i.test(error.message)
          ? "Execute supabase/painel-instituicoes.sql para ativar estes campos."
          : "Não foi possível salvar. Verifique os dados.",
        "error",
      );
    reloadCatalog();
    notify("Dados da instituição atualizados", "success");
  };

  const upload = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
      return notify("Use uma imagem JPG, PNG ou WEBP.", "error");
    if (file.size > 5 * 1024 * 1024)
      return notify("A foto deve ter até 5 MB.", "error");
    setPhotoBusy(true);
    const path = `${institution.id}/capa-${Date.now()}.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
    const { error } = await supabase.storage
      .from("instituicoes")
      .upload(path, file, { contentType: file.type, cacheControl: "86400" });
    if (error) {
      setPhotoBusy(false);
      return notify(
        "Não foi possível enviar a foto. Verifique se o painel foi ativado no banco.",
        "error",
      );
    }
    const url = supabase.storage.from("instituicoes").getPublicUrl(path)
      .data.publicUrl;
    const { error: updateError } = await supabase
      .from("instituicoes")
      .update({
        foto_capa: url,
        foto_autor: current.name,
        foto_licenca: "Cedida pela instituição",
        foto_fonte: null,
      })
      .eq("id", institution.id);
    setPhotoBusy(false);
    if (updateError)
      return notify(
        "A foto foi enviada, mas não foi possível vinculá-la.",
        "error",
      );
    setCurrent({
      ...current,
      image: url,
      imageCredit: {
        author: current.name,
        license: "Cedida pela instituição",
        source: "",
      },
    });
    reloadCatalog();
    notify("Foto atualizada", "success");
  };

  return (
    <div className="adminStack">
      <section className="panel photoPanel">
        <InstitutionImage i={current} sizes="320px" className="photoPreview" />
        <div>
          <h2>Foto de capa</h2>
          <p className="muted">
            Use uma foto própria da instituição, de preferência horizontal, com
            pelo menos 1200 px de largura. Ela substitui a imagem ilustrativa.
          </p>
          <label className="btn ghost fileButton">
            <Icon name="camera" size={16} />{" "}
            {photoBusy ? "Enviando…" : "Enviar nova foto"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={photoBusy}
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Dados oficiais</h2>
        <p className="muted">
          Estes dados identificam a instituição e são alterados apenas pela
          equipe do Matriculou, mediante comprovação. Peça uma correção pela
          Central de ajuda.
        </p>
        <dl className="factGrid compact">
          <div>
            <dt>Nome</dt>
            <dd>{current.name}</dd>
          </div>
          <div>
            <dt>Localização</dt>
            <dd>
              {current.city}, {current.state}
            </dd>
          </div>
          <div>
            <dt>Rede e tipo</dt>
            <dd>
              {networkLabel(current.network)} · {typeLabel(current.type)}
            </dd>
          </div>
          <div>
            <dt>Conceito MEC</dt>
            <dd>{mecLabel(current)}</dd>
          </div>
        </dl>
      </section>

      <form className="panel formGrid" onSubmit={save} noValidate>
        <h2 className="span2">Informações públicas</h2>
        <Field
          label="Apresentação"
          className="span2"
          optional
          error={errors.description}
          hint={`${form.description.length}/1500 · Aparece no topo da página da instituição.`}
        >
          <textarea
            rows={5}
            maxLength={1500}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Site oficial" optional error={errors.site}>
          <input
            type="url"
            inputMode="url"
            placeholder="https://"
            value={form.site}
            onChange={(e) => set("site", e.target.value)}
          />
        </Field>
        <Field label="E-mail de contato" optional error={errors.email}>
          <input
            type="email"
            maxLength={160}
            value={form.email}
            onChange={guard("email", (v) => set("email", v))}
          />
        </Field>
        <Field label="Telefone" optional>
          <input
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set("phone", formatPhone(e.target.value))}
          />
        </Field>
        <Field label="Endereço" optional error={errors.address}>
          <input
            maxLength={200}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
        {current.network !== "publica" && (
          <Field
            label="Mensalidade média (R$)"
            optional
            error={errors.price}
            hint="Valor de referência mostrado no catálogo e usado na comparação."
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
        )}
        <div className="field">
          <span className="fieldLabel">Bolsas e auxílios</span>
          <label className="switchRow">
            <input
              type="checkbox"
              role="switch"
              checked={form.scholarships}
              onChange={(e) => set("scholarships", e.target.checked)}
            />
            <span>
              Oferecemos bolsas, ProUni, FIES ou assistência estudantil
            </span>
          </label>
        </div>
        <div className="field span2 enrollBox">
          <label className="switchRow">
            <input
              type="checkbox"
              role="switch"
              checked={form.open}
              onChange={(e) => set("open", e.target.checked)}
            />
            <span>
              <b>Inscrições abertas</b> · destaca a instituição no catálogo e na
              comparação
            </span>
          </label>
          {form.open && (
            <Field label="Inscrições até" optional error={errors.until}>
              <input
                type="date"
                value={form.until}
                onChange={(e) => set("until", e.target.value)}
              />
            </Field>
          )}
        </div>
        <div className="formActions span2">
          <button className="btn primary" disabled={busy}>
            <Icon name="check" size={16} />{" "}
            {busy ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
