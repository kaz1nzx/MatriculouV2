"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "../app/AppProvider";
import { useCinema } from "../cinema/CinemaProvider";
import PasswordInput, {
  PasswordStrength,
  passwordScore,
} from "../auth/PasswordInput";
import { ConfirmDialog, Field, Icon } from "../ui";
import { supabase } from "../../lib/supabase";
import { courseAreas } from "../../lib/courses";
import { stateNames } from "../../lib/search";
import { clean, fieldError, guard } from "../../lib/sanitize";
import { dateLabel, formatPhone, initials } from "../../lib/format";
import { legal } from "../../lib/legal";
import { downloadFile } from "../../lib/storage";

const educationLevels = [
  "Ensino fundamental em andamento",
  "Ensino médio em andamento",
  "Ensino médio concluído",
  "Ensino técnico",
  "Graduação em andamento",
  "Graduação concluída",
  "Pós-graduação",
];

const schemaHint = (message: string) =>
  /column|schema cache/i.test(message)
    ? "Os novos campos do perfil ainda não existem no banco. Execute supabase/painel-instituicoes.sql."
    : "Não foi possível salvar agora. Tente novamente.";

function SectionHead({ title, text }: { title: string; text: string }) {
  return (
    <header className="sectionHead">
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </header>
  );
}

export function EditProfile() {
  const { user, refreshUser, notify } = useApp();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    city: user?.city || "",
    state: user?.state || "",
    birthDate: user?.birthDate || "",
    education: user?.education || "",
    bio: user?.bio || "",
    interests: user?.interests || [],
  });
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!user) return null;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const today = new Date().toISOString().slice(0, 10);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const name = clean(form.name);
    if (name.length < 2) next.name = "Informe seu nome completo.";
    else if (fieldError(name, "name")) next.name = fieldError(name, "name");
    if (form.phone && form.phone.replace(/\D/g, "").length < 10)
      next.phone = "Informe o telefone com DDD.";
    if (fieldError(form.city, "name"))
      next.city = "Use apenas letras no nome da cidade.";
    if (fieldError(form.bio, "text")) next.bio = fieldError(form.bio, "text");
    if (form.birthDate && form.birthDate > today)
      next.birthDate = "A data não pode estar no futuro.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const { error } = await supabase
      .from("usuarios")
      .update({
        nome_completo: name,
        telefone: form.phone || null,
        cidade: clean(form.city) || null,
        estado: form.state || null,
        data_nascimento: form.birthDate || null,
        escolaridade: form.education || null,
        bio: clean(form.bio, true) || null,
        areas_interesse: form.interests,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) return notify(schemaHint(error.message), "error");
    await refreshUser();
    notify("Perfil atualizado", "success");
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
      return notify("Use uma imagem JPG, PNG ou WEBP.", "error");
    if (file.size > 2 * 1024 * 1024)
      return notify("A foto deve ter até 2 MB.", "error");
    setAvatarBusy(true);
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, cacheControl: "3600" });
    if (error) {
      setAvatarBusy(false);
      return notify(
        /Bucket not found/i.test(error.message)
          ? "O espaço de fotos não existe. Execute supabase/setup.sql."
          : "Não foi possível enviar a foto.",
        "error",
      );
    }
    const url = supabase.storage.from("avatars").getPublicUrl(path)
      .data.publicUrl;
    await supabase
      .from("usuarios")
      .update({ avatar_url: url })
      .eq("id", user.id);
    await removeOldAvatar();
    await refreshUser();
    setAvatarBusy(false);
    notify("Foto atualizada", "success");
  };

  const removeOldAvatar = async () => {
    const old = user.avatar_url?.split("/avatars/")[1]?.split("?")[0];
    if (old)
      await supabase.storage.from("avatars").remove([decodeURIComponent(old)]);
  };

  const removeAvatar = async () => {
    setAvatarBusy(true);
    await removeOldAvatar();
    await supabase
      .from("usuarios")
      .update({ avatar_url: null })
      .eq("id", user.id);
    await refreshUser();
    setAvatarBusy(false);
    notify("Foto removida");
  };

  return (
    <div className="accountSection">
      <SectionHead
        title="Editar perfil"
        text="Essas informações aparecem só para você e preenchem suas candidaturas automaticamente."
      />
      <div className="accountCard avatarRow">
        {user.avatar_url ? (
          <img
            className="avatar xl"
            src={user.avatar_url}
            alt="Sua foto de perfil"
            width={88}
            height={88}
          />
        ) : (
          <span className="avatar xl" aria-hidden="true">
            {initials(user.name)}
          </span>
        )}
        <div>
          <b>Foto de perfil</b>
          <small>JPG, PNG ou WEBP, até 2 MB.</small>
          <div className="inlineActions">
            <label className="btn ghost small fileButton">
              <Icon name="camera" size={15} />{" "}
              {avatarBusy ? "Enviando…" : "Trocar foto"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={avatarBusy}
                onChange={(e) => uploadAvatar(e.target.files?.[0])}
              />
            </label>
            {user.avatar_url && (
              <button
                type="button"
                className="btn ghost small"
                onClick={removeAvatar}
                disabled={avatarBusy}
              >
                Remover
              </button>
            )}
          </div>
        </div>
      </div>

      <form className="accountCard formGrid" onSubmit={save} noValidate>
        <Field label="Nome completo" error={errors.name} className="span2">
          <input
            value={form.name}
            maxLength={120}
            autoComplete="name"
            onChange={guard("name", (v) => set("name", v))}
          />
        </Field>
        <Field label="Telefone" optional error={errors.phone}>
          <input
            value={form.phone}
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 91234-5678"
            onChange={(e) => set("phone", formatPhone(e.target.value))}
          />
        </Field>
        <Field label="Data de nascimento" optional error={errors.birthDate}>
          <input
            type="date"
            value={form.birthDate}
            max={today}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </Field>
        <Field label="Cidade" optional error={errors.city}>
          <input
            value={form.city}
            maxLength={80}
            autoComplete="address-level2"
            onChange={(e) => set("city", e.target.value)}
          />
        </Field>
        <Field label="Estado" optional>
          <select
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          >
            <option value="">Selecione</option>
            {Object.entries(stateNames).map(([uf, name]) => (
              <option key={uf} value={uf}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Escolaridade" optional className="span2">
          <select
            value={form.education}
            onChange={(e) => set("education", e.target.value)}
          >
            <option value="">Selecione</option>
            {educationLevels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </Field>
        <fieldset className="field span2">
          <legend>Áreas de interesse</legend>
          <div className="chipChoices">
            {courseAreas.map((area) => {
              const on = form.interests.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    set(
                      "interests",
                      on
                        ? form.interests.filter((a) => a !== area)
                        : [...form.interests, area],
                    )
                  }
                >
                  {on && <Icon name="check" size={13} />} {area}
                </button>
              );
            })}
          </div>
          <p className="fieldHint">
            Usamos para sugerir cursos na sua visão geral.
          </p>
        </fieldset>
        <Field
          label="Sobre você"
          optional
          error={errors.bio}
          hint={`${form.bio.length}/500 caracteres`}
          className="span2"
        >
          <textarea
            rows={4}
            maxLength={500}
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Seus objetivos, o que você procura em uma instituição…"
          />
        </Field>
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

export function Security() {
  const { user, notify } = useApp();
  const [email, setEmail] = useState(user?.email || "");
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"" | "email" | "password" | "others">("");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{ last?: string; created?: string }>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setMeta({
        last: data.user?.last_sign_in_at,
        created: data.user?.created_at,
      }),
    );
  }, []);
  if (!user) return null;

  const changeEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (clean(email) === user.email) return;
    setBusy("email");
    const { error: updateError } = await supabase.auth.updateUser(
      { email: clean(email) },
      { emailRedirectTo: `${location.origin}/perfil?secao=seguranca` },
    );
    setBusy("");
    if (updateError)
      return notify(
        "Não foi possível alterar o e-mail. Verifique o endereço.",
        "error",
      );
    notify("Enviamos um link de confirmação para o novo e-mail.", "success");
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (passwordScore(password) < 3)
      return setError("Use uma senha mais forte.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setBusy("password");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
    });
    if (authError) {
      setBusy("");
      return setError("A senha atual está incorreta.");
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy("");
    if (updateError)
      return setError(
        "Não foi possível trocar a senha. Escolha uma diferente da atual.",
      );
    setCurrent("");
    setPassword("");
    setConfirm("");
    notify("Senha alterada", "success");
  };

  const signOutOthers = async () => {
    setBusy("others");
    const { error: signOutError } = await supabase.auth.signOut({
      scope: "others",
    });
    setBusy("");
    notify(
      signOutError
        ? "Não foi possível encerrar as outras sessões."
        : "Sessões em outros aparelhos encerradas.",
      signOutError ? "error" : "success",
    );
  };

  return (
    <div className="accountSection">
      <SectionHead
        title="Segurança e acesso"
        text="Controle seu e-mail de acesso, sua senha e os aparelhos conectados."
      />
      <dl className="factGrid compact accountCard">
        <div>
          <dt>Conta criada em</dt>
          <dd>{dateLabel(meta.created) || "—"}</dd>
        </div>
        <div>
          <dt>Último acesso</dt>
          <dd>
            {meta.last ? new Date(meta.last).toLocaleString("pt-BR") : "—"}
          </dd>
        </div>
      </dl>
      <form className="accountCard" onSubmit={changeEmail}>
        <h2>E-mail de acesso</h2>
        <Field
          label="E-mail"
          hint="Ao mudar, você confirma o novo endereço pelo link que enviaremos."
        >
          <input
            type="email"
            required
            maxLength={160}
            autoComplete="email"
            value={email}
            onChange={guard("email", setEmail)}
          />
        </Field>
        <div className="formActions">
          <button
            className="btn ghost"
            disabled={busy === "email" || clean(email) === user.email}
          >
            {busy === "email" ? "Enviando…" : "Alterar e-mail"}
          </button>
        </div>
      </form>
      <form className="accountCard" onSubmit={changePassword}>
        <h2>Senha</h2>
        <div className="field">
          <label htmlFor="senha-atual">Senha atual</label>
          <PasswordInput
            id="senha-atual"
            required
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="senha-nova">Nova senha</label>
          <PasswordInput
            id="senha-nova"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength value={password} />
        </div>
        <Field
          label="Confirme a nova senha"
          error={
            confirm && confirm !== password
              ? "As senhas não coincidem."
              : undefined
          }
        >
          <input
            type="password"
            required
            maxLength={72}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        {error && (
          <p className="formError" role="alert">
            <Icon name="alert" size={16} /> {error}
          </p>
        )}
        <div className="formActions">
          <button className="btn primary" disabled={busy === "password"}>
            {busy === "password" ? "Salvando…" : "Trocar senha"}
          </button>
        </div>
      </form>
      <div className="accountCard rowCard">
        <div>
          <h2>Outros aparelhos</h2>
          <p className="muted">
            Encerra o acesso em todos os navegadores, menos neste.
          </p>
        </div>
        <button
          type="button"
          className="btn ghost"
          onClick={signOutOthers}
          disabled={busy === "others"}
        >
          <Icon name="logout" size={16} />{" "}
          {busy === "others" ? "Encerrando…" : "Sair dos outros aparelhos"}
        </button>
      </div>
    </div>
  );
}

export function Preferences() {
  const { user, refreshUser, notify } = useApp();
  const cinema = useCinema();
  const [saving, setSaving] = useState(false);
  if (!user) return null;

  const toggleNotifications = async (value: boolean) => {
    setSaving(true);
    const { error } = await supabase
      .from("usuarios")
      .update({ notificacoes: value })
      .eq("id", user.id);
    setSaving(false);
    if (error) return notify(schemaHint(error.message), "error");
    await refreshUser();
    notify("Preferência salva", "success");
  };

  return (
    <div className="accountSection">
      <SectionHead
        title="Preferências"
        text="Ajuste como o Matriculou fala com você e como o site se comporta."
      />
      <div className="accountCard settingsList">
        <label className="settingRow">
          <span>
            <b>Avisos por e-mail</b>
            <small>
              Receber e-mails quando uma instituição responder ou mudar o status
              de uma candidatura.
            </small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={user.notifications}
            disabled={saving}
            onChange={(e) => toggleNotifications(e.target.checked)}
          />
        </label>
        <label className="settingRow">
          <span>
            <b>Efeitos visuais e animações</b>
            <small>
              {cinema.reduced
                ? "Desativados porque seu sistema pede menos movimento."
                : "Pausar deixa a navegação mais leve em aparelhos simples."}
            </small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={cinema.enabled}
            disabled={cinema.reduced}
            onChange={cinema.toggle}
          />
        </label>
      </div>
    </div>
  );
}

export function Privacy() {
  const { user, institutions } = useApp();
  const [deleting, setDeleting] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!user) return null;

  // Portabilidade (LGPD, art. 18, V): cópia de tudo o que está guardado para a conta.
  const exportData = async () => {
    const [profile, favorites, documents, applications, messages] =
      await Promise.all([
        supabase.from("usuarios").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("favoritos")
          .select("instituicao_id,instituicao_nome,created_at")
          .eq("user_id", user.id),
        supabase
          .from("documentos_usuario")
          .select("nome,path,created_at")
          .eq("user_id", user.id),
        supabase.from("candidaturas").select("*").eq("user_id", user.id),
        supabase
          .from("mensagens")
          .select("candidatura_id,autor_tipo,texto,created_at"),
      ]);
    const names = new Map(institutions.map((i) => [i.id, i.name]));
    downloadFile(
      "meus-dados-matriculou.json",
      JSON.stringify(
        {
          exportado_em: new Date().toISOString(),
          controlador: legal.controller,
          perfil: profile.data,
          favoritos: favorites.data || [],
          documentos: documents.data || [],
          candidaturas: (applications.data || []).map((a) => ({
            ...a,
            instituicao: names.get(a.instituicao_id),
          })),
          mensagens: messages.data || [],
        },
        null,
        2,
      ),
      "application/json",
    );
  };

  const deleteAccount = async () => {
    setBusy(true);
    setError("");
    for (const bucket of ["pre-matriculas", "avatars"]) {
      const [{ data: root }, { data: nested }] = await Promise.all([
        supabase.storage.from(bucket).list(user.id),
        supabase.storage.from(bucket).list(`${user.id}/documentos`),
      ]);
      const files = [
        ...(root || []).filter((f) => f.id).map((f) => `${user.id}/${f.name}`),
        ...(nested || [])
          .filter((f) => f.id)
          .map((f) => `${user.id}/documentos/${f.name}`),
      ];
      if (files.length) await supabase.storage.from(bucket).remove(files);
    }
    const { error: rpcError } = await supabase.rpc("delete_own_account");
    if (rpcError) {
      setBusy(false);
      return setError(
        "Não foi possível excluir agora. Use o formulário LGPD para concluir o pedido.",
      );
    }
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="accountSection">
      <SectionHead
        title="Privacidade e dados"
        text="Seus dados, sob o seu controle, como prevê a LGPD."
      />
      <div className="actionList">
        <button type="button" className="actionItem" onClick={exportData}>
          <Icon name="download" />
          <span>
            <b>Baixar meus dados</b>
            <small>
              Cadastro, favoritas, documentos, candidaturas e mensagens em um
              arquivo JSON.
            </small>
          </span>
        </button>
        <Link href="/lgpd" className="actionItem">
          <Icon name="mail" />
          <span>
            <b>Outras solicitações LGPD</b>
            <small>
              Correção, informação sobre compartilhamento ou revogação de
              consentimento.
            </small>
          </span>
        </Link>
        <Link href="/privacidade" className="actionItem">
          <Icon name="book" />
          <span>
            <b>Política de Privacidade</b>
            <small>Como tratamos e protegemos seus dados.</small>
          </span>
        </Link>
      </div>
      <div className="accountCard dangerZone">
        <div>
          <h2>Excluir minha conta</h2>
          <p className="muted">
            Apaga cadastro, favoritas, foto, documentos e candidaturas de forma
            definitiva.
          </p>
        </div>
        <button
          type="button"
          className="btn danger"
          onClick={() => setDeleting(true)}
        >
          <Icon name="trash" size={16} /> Excluir conta
        </button>
      </div>
      {deleting && (
        <ConfirmDialog
          title="Excluir sua conta?"
          confirmLabel="Excluir definitivamente"
          danger
          busy={busy}
          disabled={typed.trim().toUpperCase() !== "EXCLUIR"}
          onConfirm={deleteAccount}
          onClose={() => setDeleting(false)}
        >
          <p>
            Essa ação não pode ser desfeita. As instituições deixam de ver suas
            candidaturas.
          </p>
          <Field label="Digite EXCLUIR para confirmar">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
          </Field>
          {error && (
            <p className="formError" role="alert">
              {error}
            </p>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
