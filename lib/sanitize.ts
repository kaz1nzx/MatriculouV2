// Input hygiene for every form. React already escapes what it renders and Supabase sends
// parameterized queries, so this is a second layer: markup and script fragments are refused
// at the field (with the browser's own validation bubble) and stored values are normalized.
import type { ChangeEvent } from "react";

export type FieldKind = "name" | "email" | "text";

const markup =
  /[<>`{}\\]|javascript:|vbscript:|data:text\/html|\bon[a-z]+\s*=/i;
const nameChars = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}' .-]*$", "u");

const messages: Record<FieldKind, string> = {
  name: "Use apenas letras, espaços, apóstrofo e hífen.",
  email:
    "Informe um e-mail válido, sem caracteres especiais como < > ou aspas.",
  text: "Remova os caracteres < > ` { } \\ e trechos de código.",
};

export function fieldError(value: string, kind: FieldKind): string {
  const v = value.trim();
  if (!v) return "";
  if (kind === "name") return nameChars.test(v) ? "" : messages.name;
  if (kind === "email") return /[<>"'`\\\s]/.test(v) ? messages.email : "";
  return markup.test(v) ? messages.text : "";
}

// Removes control characters (keeping line breaks in long text), normalizes accents and
// collapses repeated spaces, so what is stored matches what the person typed.
export function clean(value: string, multiline = false): string {
  const text = value
    .normalize("NFC")
    .replace(
      multiline
        ? /[\u0000-\u0009\u000B-\u001F\u007F]/g
        : /[\u0000-\u001F\u007F]/g,
      "",
    );
  return (
    multiline ? text.replace(/[^\S\n]+/g, " ") : text.replace(/\s+/g, " ")
  ).trim();
}

// onChange helper: flags the field natively and hands the raw value back to state.
export function guard(kind: FieldKind, set: (value: string) => void) {
  return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.setCustomValidity(fieldError(e.target.value, kind));
    set(e.target.value);
  };
}
