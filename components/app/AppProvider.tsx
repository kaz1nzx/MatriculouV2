"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { fetchCatalog } from "../../lib/catalog";
import { demoInstitutions, demoOffers } from "../../lib/demo-content";
import {
  readCache,
  readList,
  storageKeys,
  writeCache,
  writeList,
} from "../../lib/storage";
import type {
  Institution,
  Membership,
  Offer,
  UserProfile,
} from "../../lib/types";

type CatalogStatus = "loading" | "ready" | "error" | "demo";
type Tone = "neutral" | "success" | "error";
export type Toast = { id: number; text: string; tone: Tone };

type AppState = {
  institutions: Institution[];
  offers: Offer[];
  catalogStatus: CatalogStatus;
  reloadCatalog: () => void;
  user: UserProfile | null;
  authReady: boolean;
  memberships: Membership[];
  setUser: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  liked: string[];
  toggleLike: (id: string) => Promise<void>;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  setCompareIds: (ids: string[]) => void;
  toast: Toast | null;
  notify: (text: string, tone?: Tone) => void;
  requireLogin: (message?: string) => void;
};

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de AppProvider");
  return context;
};

const catalogTtl = 10 * 60 * 1000;
export const compareLimit = 4;

const mapProfile = (
  row: Record<string, any>,
  fallbackEmail = "",
): UserProfile => ({
  id: row.id,
  email: row.email || fallbackEmail,
  name: row.nome_completo || "Usuário",
  avatar_url: row.avatar_url || null,
  role: row.papel === "plataforma" ? "plataforma" : "estudante",
  phone: row.telefone ?? null,
  city: row.cidade ?? null,
  state: row.estado ?? null,
  birthDate: row.data_nascimento ?? null,
  education: row.escolaridade ?? null,
  interests: Array.isArray(row.areas_interesse) ? row.areas_interesse : [],
  bio: row.bio ?? null,
  notifications: row.notificacoes ?? true,
});

export default function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [institutions, setInstitutions] = useState<Institution[]>(
    isSupabaseConfigured ? [] : demoInstitutions,
  );
  const [offers, setOffers] = useState<Offer[]>(
    isSupabaseConfigured ? [] : demoOffers,
  );
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>(
    isSupabaseConfigured ? "loading" : "demo",
  );
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [compareIds, setCompare] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const notify = useCallback((text: string, tone: Tone = "neutral") => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, tone });
    toastTimer.current = setTimeout(
      () => setToast(null),
      tone === "error" ? 6000 : 3500,
    );
  }, []);

  const loadCatalog = useCallback(async (useCache: boolean) => {
    if (!isSupabaseConfigured) return;
    const cached = useCache
      ? readCache<{ institutions: Institution[]; offers: Offer[] }>(
          storageKeys.catalog,
          catalogTtl,
        )
      : null;
    if (cached) {
      setInstitutions(cached.institutions);
      setOffers(cached.offers);
      setCatalogStatus("ready");
      return;
    }
    setCatalogStatus((current) => (current === "ready" ? current : "loading"));
    try {
      const data = await fetchCatalog();
      setInstitutions(data.institutions);
      setOffers(data.offers.filter((o) => o.active !== false));
      setCatalogStatus("ready");
      writeCache(storageKeys.catalog, {
        institutions: data.institutions,
        offers: data.offers.filter((o) => o.active !== false),
      });
    } catch {
      setCatalogStatus("error");
    }
  }, []);

  const loadUser = useCallback(async (id: string, email = "") => {
    const [{ data: profile }, favorites, team] = await Promise.all([
      supabase.from("usuarios").select("*").eq("id", id).maybeSingle(),
      supabase.from("favoritos").select("instituicao_id").eq("user_id", id),
      supabase
        .from("gestores")
        .select("instituicao_id,papel")
        .eq("user_id", id),
    ]);
    setUserState(
      profile ? mapProfile(profile, email) : mapProfile({ id, email }, email),
    );
    setLiked(
      favorites.error
        ? []
        : (favorites.data || []).map((f) => f.instituicao_id),
    );
    // Sem a tabela de gestores (script do painel ainda não executado), ninguém é gestor.
    setMemberships(
      team.error
        ? []
        : (team.data || []).map((m) => ({
            institutionId: m.instituicao_id,
            role: m.papel,
          })),
    );
  }, []);

  useEffect(() => {
    setCompare(readList(storageKeys.compare, compareLimit));
    loadCatalog(true);
    if (!isSupabaseConfigured) return;
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session)
        await loadUser(data.session.user.id, data.session.user.email);
      if (alive) setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setUserState(null);
          setLiked([]);
          setMemberships([]);
          return;
        }
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          // Fora do callback: chamadas ao Supabase dentro dele podem travar a sessão.
          setTimeout(
            () =>
              loadUser(session.user.id, session.user.email).then(() =>
                setAuthReady(true),
              ),
            0,
          );
        }
      },
    );
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [loadCatalog, loadUser]);

  const requireLogin = useCallback(
    (message = "Entre na sua conta para continuar.") => {
      notify(message);
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
    },
    [notify, pathname, router],
  );

  const toggleLike = useCallback(
    async (id: string) => {
      if (!user)
        return requireLogin("Entre na sua conta para salvar favoritas.");
      const has = liked.includes(id);
      setLiked((current) =>
        has ? current.filter((x) => x !== id) : [...current, id],
      );
      const { error } = has
        ? await supabase
            .from("favoritos")
            .delete()
            .eq("user_id", user.id)
            .eq("instituicao_id", id)
        : await supabase.from("favoritos").insert({
            user_id: user.id,
            instituicao_id: id,
            instituicao_nome: institutions.find((i) => i.id === id)?.name,
          });
      if (error) {
        setLiked((current) =>
          has ? [...current, id] : current.filter((x) => x !== id),
        );
        return notify(
          "Não foi possível atualizar as favoritas. Tente novamente.",
          "error",
        );
      }
      notify(
        has ? "Removida das favoritas" : "Adicionada às favoritas",
        "success",
      );
    },
    [institutions, liked, notify, requireLogin, user],
  );

  const setCompareIds = useCallback((ids: string[]) => {
    const next = [...new Set(ids)].slice(0, compareLimit);
    setCompare(next);
    writeList(storageKeys.compare, next);
  }, []);

  const toggleCompare = useCallback(
    (id: string) => {
      if (compareIds.includes(id)) {
        setCompareIds(compareIds.filter((x) => x !== id));
        return notify("Removida do comparador");
      }
      if (compareIds.length >= compareLimit)
        return notify(
          `O comparador aceita até ${compareLimit} instituições. Remova uma para adicionar outra.`,
          "error",
        );
      setCompareIds([...compareIds, id]);
      notify(
        `Adicionada ao comparador (${compareIds.length + 1}/${compareLimit})`,
        "success",
      );
    },
    [compareIds, notify, setCompareIds],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserState(null);
    setLiked([]);
    setMemberships([]);
    router.push("/");
    notify("Você saiu da sua conta.");
  }, [notify, router]);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) await loadUser(data.user.id, data.user.email);
  }, [loadUser]);

  const value = useMemo<AppState>(
    () => ({
      institutions,
      offers,
      catalogStatus,
      reloadCatalog: () => loadCatalog(false),
      user,
      authReady,
      memberships,
      setUser: setUserState,
      refreshUser,
      signOut,
      liked,
      toggleLike,
      compareIds,
      toggleCompare,
      setCompareIds,
      toast,
      notify,
      requireLogin,
    }),
    [
      institutions,
      offers,
      catalogStatus,
      loadCatalog,
      user,
      authReady,
      memberships,
      refreshUser,
      signOut,
      liked,
      toggleLike,
      compareIds,
      toggleCompare,
      setCompareIds,
      toast,
      notify,
      requireLogin,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
