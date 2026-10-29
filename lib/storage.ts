// Armazenamento local tolerante a falhas: navegação privada ou cota cheia nunca quebram a página.
export const storageKeys = {
  compare: "matriculou-compare",
  compareCourses: "matriculou-compare-cursos",
  catalog: "matriculou-catalogo-v2",
} as const;

export function readList(key: string, max: number): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? value.filter((x) => typeof x === "string").slice(0, max)
      : [];
  } catch {
    return [];
  }
}

export function writeList(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem armazenamento, a lista vale só para esta visita.
  }
}

export function readCache<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = JSON.parse(sessionStorage.getItem(key) || "null");
    return raw && Date.now() - raw.at < maxAgeMs ? (raw.data as T) : null;
  } catch {
    return null;
  }
}

export function writeCache(key: string, data: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // O cache é apenas uma otimização.
  }
}

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// CSV compatível com o Excel em português: separador ";" e BOM para manter os acentos.
export function toCsv(rows: (string | number | null | undefined)[][]) {
  const cell = (value: string | number | null | undefined) => {
    const text = String(value ?? "");
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return /[";\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return `﻿${rows.map((row) => row.map(cell).join(";")).join("\n")}`;
}
