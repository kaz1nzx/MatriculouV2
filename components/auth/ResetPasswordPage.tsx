"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useApp } from "../app/AppProvider";
import { Field, Icon, Spinner } from "../ui";
import PasswordInput, {
  PasswordStrength,
  passwordScore,
} from "./PasswordInput";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { notify } = useApp();
  const [state, setState] = useState<"checking" | "ready" | "invalid">(
    "checking",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // O link do e-mail cria uma sessão de recuperação, lida automaticamente da URL.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setState("ready");
    });
    const timer = setTimeout(async () => {
      const { data: current } = await supabase.auth.getSession();
      setState((s) => (s === "ready" || current.session ? "ready" : "invalid"));
    }, 1200);
    return () => {
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordScore(password) < 3)
      return setError("Use uma senha mais forte.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError)
      return setError(
        "Não foi possível salvar a nova senha. Peça um novo link.",
      );
    notify("Senha atualizada com sucesso.", "success");
    router.replace("/perfil");
  };

  return (
    <main className="authPage single" id="conteudo">
      <section className="authPanel">
        <Link href="/login" className="backLink">
          <Icon name="left" size={16} /> Voltar para o login
        </Link>
        <span className="eyebrow">Segurança</span>
        <h1>Crie uma nova senha</h1>
        {state === "checking" && <Spinner label="Validando o link" />}
        {state === "invalid" && (
          <div className="formError" role="alert">
            <Icon name="alert" size={16} /> O link é inválido ou expirou.{" "}
            <Link href="/login">Peça um novo link</Link> na tela de login, em
            “Esqueci minha senha”.
          </div>
        )}
        {state === "ready" && (
          <form className="authForm" onSubmit={submit}>
            <div className="field">
              <label htmlFor="nova-senha">Nova senha</label>
              <PasswordInput
                id="nova-senha"
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
            <button className="btn primary block" disabled={busy}>
              {busy ? "Salvando…" : "Salvar nova senha"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
