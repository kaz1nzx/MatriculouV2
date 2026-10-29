"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useApp } from "../app/AppProvider";
import { Field, Icon } from "../ui";
import PasswordInput, {
  PasswordStrength,
  passwordScore,
} from "./PasswordInput";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { clean, fieldError, guard } from "../../lib/sanitize";
import { legal } from "../../lib/legal";
import { safeNext } from "../../lib/format";

const signUpError = (message: string) => {
  if (/already registered|already exists/i.test(message))
    return "Este e-mail já tem uma conta. Tente entrar.";
  if (/password/i.test(message))
    return "Escolha uma senha mais forte, com pelo menos 8 caracteres.";
  if (/rate limit|too many/i.test(message))
    return "Muitas tentativas. Aguarde alguns minutos.";
  if (/email/i.test(message)) return "Informe um e-mail válido.";
  return "Não foi possível criar a conta agora. Tente novamente.";
};

const lockAfter = 5;
const lockSeconds = 30;

export default function AuthPage({ mode }: { mode: "login" | "cadastro" }) {
  const register = mode === "cadastro";
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/perfil");
  const { user, authReady, notify } = useApp();
  const [view, setView] = useState<"form" | "forgot" | "sent">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [age, setAge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lockedFor, setLockedFor] = useState(0);
  const failures = useRef(0);

  useEffect(() => {
    if (authReady && user) router.replace(next);
  }, [authReady, next, router, user]);

  useEffect(() => {
    if (!lockedFor) return;
    const timer = setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockedFor]);

  const fail = (message: string) => {
    setError(message);
    setBusy(false);
    failures.current += 1;
    if (failures.current >= lockAfter) {
      failures.current = 0;
      setLockedFor(lockSeconds);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured)
      return setError("Login indisponível nesta demonstração.");
    if (register) {
      const nameError = fieldError(clean(name), "name");
      if (clean(name).length < 2 || nameError)
        return setError(nameError || "Informe seu nome completo.");
      if (passwordScore(password) < 3)
        return setError(
          "Use uma senha mais forte: veja os requisitos abaixo do campo.",
        );
      if (password !== confirm) return setError("As senhas não coincidem.");
      if (!terms || !age)
        return setError("Confirme os termos e a declaração de idade.");
    }
    setBusy(true);

    if (register) {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: clean(email),
        password,
        options: {
          emailRedirectTo: `${location.origin}/login`,
          data: {
            nome_completo: clean(name),
            termos_versao: legal.version,
            termos_aceitos_em: new Date().toISOString(),
          },
        },
      });
      if (signUpErr) return fail(signUpError(signUpErr.message));
      if (!data.session) {
        setBusy(false);
        setView("sent");
        return;
      }
      notify("Conta criada. Boas-vindas ao Matriculou!", "success");
      return;
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: clean(email),
      password,
    });
    if (signInErr)
      return fail(
        /confirm/i.test(signInErr.message)
          ? "Confirme seu e-mail antes de entrar. Verifique a caixa de entrada."
          : "E-mail ou senha incorretos.",
      );
    failures.current = 0;
    // O redirecionamento acontece uma única vez, no efeito acima, assim que o perfil carrega.
    notify("Que bom ter você de volta!", "success");
  };

  const forgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured)
      return setError("Recuperação indisponível nesta demonstração.");
    setBusy(true);
    setError("");
    await supabase.auth.resetPasswordForEmail(clean(email), {
      redirectTo: `${location.origin}/redefinir-senha`,
    });
    setBusy(false);
    // A mesma resposta para e-mails cadastrados ou não, para não revelar quem tem conta.
    setView("sent");
  };

  return (
    <main className="authPage" id="conteudo">
      <aside className="authArt" aria-hidden="true">
        <img
          src="/images/matriculou-logo-white.png"
          alt=""
          width={150}
          height={51}
        />
        <div>
          <p className="authArtTitle">
            {register
              ? "Seu próximo capítulo começa com uma escolha."
              : "Tudo o que importa para a sua escolha, em um só lugar."}
          </p>
          <ul>
            <li>
              <Icon name="heart" /> Guarde instituições favoritas
            </li>
            <li>
              <Icon name="compare" /> Compare com recomendações
            </li>
            <li>
              <Icon name="send" /> Envie candidaturas e converse com as
              instituições
            </li>
          </ul>
        </div>
      </aside>

      <section className="authPanel">
        <Link href="/" className="backLink">
          <Icon name="left" size={16} /> Voltar ao início
        </Link>

        {view === "sent" ? (
          <div className="authDone" role="status">
            <span className="emptyIcon">
              <Icon name="mail" size={26} />
            </span>
            <h1>Verifique seu e-mail</h1>
            <p>
              {register
                ? `Enviamos um link de confirmação para ${email}. Depois de confirmar, é só entrar.`
                : `Se houver uma conta com ${email}, você vai receber um link para criar uma nova senha.`}
            </p>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setView("form")}
            >
              Voltar
            </button>
          </div>
        ) : view === "forgot" ? (
          <>
            <span className="eyebrow">Recuperar acesso</span>
            <h1>Esqueceu a senha?</h1>
            <p className="muted">
              Informe seu e-mail e enviaremos um link para você criar uma nova.
            </p>
            <form onSubmit={forgot} className="authForm" noValidate={false}>
              <Field label="E-mail">
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  value={email}
                  onChange={guard("email", setEmail)}
                />
              </Field>
              {error && (
                <p className="formError" role="alert">
                  <Icon name="alert" size={16} /> {error}
                </p>
              )}
              <button className="btn primary block" disabled={busy}>
                {busy ? "Enviando…" : "Enviar link"}
              </button>
              <button
                type="button"
                className="textButton"
                onClick={() => setView("form")}
              >
                Lembrei a senha
              </button>
            </form>
          </>
        ) : (
          <>
            <span className="eyebrow">
              {register ? "Criar conta gratuita" : "Entrar"}
            </span>
            <h1>{register ? "Crie seu perfil." : "Bem-vindo de volta."}</h1>
            <p className="muted">
              {register
                ? "Leva menos de um minuto e é gratuito."
                : "Acesse suas favoritas, candidaturas e documentos."}
            </p>
            <form onSubmit={submit} className="authForm">
              {register && (
                <Field label="Nome completo">
                  <input
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    value={name}
                    onChange={guard("name", setName)}
                  />
                </Field>
              )}
              <Field label="E-mail">
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  value={email}
                  onChange={guard("email", setEmail)}
                />
              </Field>
              <div className="field">
                <div className="labelRow">
                  <label htmlFor="senha">Senha</label>
                  {!register && (
                    <button
                      type="button"
                      className="textButton"
                      onClick={() => setView("forgot")}
                    >
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <PasswordInput
                  id="senha"
                  required
                  minLength={register ? 8 : 6}
                  maxLength={72}
                  autoComplete={register ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {register && <PasswordStrength value={password} />}
              </div>
              {register && (
                <>
                  <Field
                    label="Confirme a senha"
                    error={
                      confirm && confirm !== password
                        ? "As senhas não coincidem."
                        : undefined
                    }
                  >
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      maxLength={72}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </Field>
                  <label className="check">
                    <input
                      type="checkbox"
                      required
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                    />
                    <span>
                      Li e aceito os{" "}
                      <Link href="/termos-de-uso" target="_blank">
                        Termos de Uso
                      </Link>
                      , os{" "}
                      <Link href="/termos-de-servico" target="_blank">
                        Termos de Serviço
                      </Link>{" "}
                      e a{" "}
                      <Link href="/privacidade" target="_blank">
                        Política de Privacidade
                      </Link>
                      .
                    </span>
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      required
                      checked={age}
                      onChange={(e) => setAge(e.target.checked)}
                    />
                    <span>
                      Tenho 18 anos ou mais, ou tenho autorização do meu
                      responsável legal.
                    </span>
                  </label>
                </>
              )}
              {error && (
                <p className="formError" role="alert">
                  <Icon name="alert" size={16} /> {error}
                </p>
              )}
              <button
                className="btn primary block"
                disabled={busy || lockedFor > 0}
              >
                {lockedFor > 0
                  ? `Aguarde ${lockedFor}s para tentar de novo`
                  : busy
                    ? "Aguarde…"
                    : register
                      ? "Criar minha conta"
                      : "Entrar na minha conta"}
                {!busy && !lockedFor && <Icon name="arrow" size={16} />}
              </button>
            </form>
            <p className="switchAuth">
              {register ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
              <Link
                href={`${register ? "/login" : "/cadastro"}${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`}
              >
                {register ? "Entrar" : "Criar conta grátis"}
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
