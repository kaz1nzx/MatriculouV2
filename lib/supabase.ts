import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && key);

// Sem configuração, as páginas públicas continuam no ar com o catálogo de demonstração;
// toda chamada de dados e autenticação passa antes por isSupabaseConfigured.
export const supabase = createClient(
  url || "https://preview.invalid",
  key || "preview-only",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "matriculou-sessao",
    },
  },
);
