"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "../ui";

export const passwordChecks = [
  { label: "8 caracteres ou mais", test: (v: string) => v.length >= 8 },
  {
    label: "Letra maiúscula e minúscula",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { label: "Um número", test: (v: string) => /\d/.test(v) },
  { label: "Um símbolo (!@#…)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export const passwordScore = (value: string) =>
  passwordChecks.filter((c) => c.test(value)).length;

export function PasswordStrength({ value }: { value: string }) {
  const score = passwordScore(value);
  const label = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"][score];
  return (
    <div className="strength" aria-live="polite">
      <div className={`strengthBar s${score}`} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <span>
        Força da senha: <b>{value ? label : "—"}</b>
      </span>
      <ul>
        {passwordChecks.map((check) => (
          <li key={check.label} className={check.test(value) ? "ok" : ""}>
            <Icon name={check.test(value) ? "check" : "dot"} size={13} />{" "}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Campo de senha com botão de mostrar/ocultar e aviso de Caps Lock.
export default function PasswordInput(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  const [visible, setVisible] = useState(false);
  const [caps, setCaps] = useState(false);
  const detect = (e: React.KeyboardEvent<HTMLInputElement>) =>
    setCaps(e.getModifierState?.("CapsLock") ?? false);
  return (
    <>
      <div className="passwordField">
        <input
          {...props}
          type={visible ? "text" : "password"}
          onKeyUp={detect}
          onKeyDown={detect}
        />
        <button
          type="button"
          className="iconButton"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          <Icon name={visible ? "eyeOff" : "eye"} size={18} />
        </button>
      </div>
      {caps && (
        <p className="fieldHint warn">
          <Icon name="alert" size={14} /> Caps Lock está ativado.
        </p>
      )}
    </>
  );
}
