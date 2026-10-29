"use client";

import { useEffect, useRef, useState } from "react";

// Texto de busca ligado ao parâmetro ?q= da URL, com atraso para não navegar a cada tecla.
// A URL só substitui o que está digitado quando muda por fora (link, voltar, limpar), nunca
// pela confirmação atrasada da própria digitação, que apagaria o que a pessoa acabou de digitar.
export function useQueryDraft(
  current: string,
  commit: (value: string | null) => void,
) {
  const [draft, setDraft] = useState(current);
  const pushed = useRef(current);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => {
    if (current === pushed.current) return;
    pushed.current = current;
    setDraft(current);
  }, [current]);

  useEffect(() => {
    const value = draft.trim();
    if (value === pushed.current) return;
    const timer = setTimeout(() => {
      pushed.current = value;
      commitRef.current(value || null);
    }, 250);
    return () => clearTimeout(timer);
  }, [draft]);

  return [draft, setDraft] as const;
}
