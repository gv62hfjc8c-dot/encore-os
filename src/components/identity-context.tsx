import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  getCurrentPerson,
  getMyOrganizations,
  type OrganizationWithMembership,
} from "@/lib/identity";
import { chooseOrganization, contextStorageKey } from "@/lib/identity-state";
import { AppShell } from "./app-shell";

type Identity = {
  session: Session | null;
  person: Awaited<ReturnType<typeof getCurrentPerson>>;
  organizations: OrganizationWithMembership[];
  active: OrganizationWithMembership | null;
  loading: boolean;
  error: string | null;
  refresh: (selectId?: string | null) => Promise<void>;
  select: (id: string | null) => void;
  signOut: () => Promise<void>;
};
const IdentityContext = createContext<Identity | null>(null);
export function useIdentity() {
  const value = useContext(IdentityContext);
  if (!value) throw new Error("IdentityProvider required");
  return value;
}
const message = (e: unknown) =>
  e instanceof Error ? e.message : "Não foi possível carregar a identidade.";
function readSaved(userId: string) {
  try {
    return localStorage.getItem(contextStorageKey(userId));
  } catch {
    return null;
  }
}
function save(userId: string, id: string | null) {
  try {
    localStorage.setItem(contextStorageKey(userId), id ?? "");
  } catch {
    /* Selection still works without storage. */
  }
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [person, setPerson] = useState<Identity["person"]>(null);
  const [organizations, setOrganizations] = useState<
    OrganizationWithMembership[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const epoch = useRef(0);
  const currentSession = useRef<Session | null>(null);

  const load = useCallback(
    async (next: Session | null, preferred?: string | null) => {
      const generation = ++epoch.current;
      currentSession.current = next;
      setSession(next);
      setPerson(null);
      setOrganizations([]);
      setActiveId(null);
      setError(null);
      setLoading(true);
      queryClient.clear();
      if (!next) {
        setLoading(false);
        return;
      }
      try {
        const [profile, orgs] = await Promise.all([
          getCurrentPerson(),
          getMyOrganizations(),
        ]);
        if (generation !== epoch.current) return;
        if (!profile)
          throw new Error(
            "A identidade pessoal ainda não está disponível. Verifique as migrations.",
          );
        const selected = chooseOrganization(
          orgs.map((o) => o.id),
          preferred === undefined ? readSaved(next.user.id) : (preferred ?? ""),
        );
        setPerson(profile);
        setOrganizations(orgs);
        setActiveId(selected);
        save(next.user.id, selected);
      } catch (e) {
        if (generation === epoch.current) setError(message(e));
      } finally {
        if (generation === epoch.current) setLoading(false);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    let disposed = false;
    let authEventSeen = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, next) => {
        authEventSeen = true;
        // Immediately invalidate old responses. Supabase API work runs outside the auth lock.
        ++epoch.current;
        setLoading(true);
        setOrganizations([]);
        setPerson(null);
        setActiveId(null);
        const timer = setTimeout(() => {
          timers.delete(timer);
          if (!disposed) void load(next);
        }, 0);
        timers.add(timer);
      });
      void supabase.auth
        .getSession()
        .then(({ data, error: authError }) => {
          if (disposed || authEventSeen) return;
          if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
          }
          void load(data.session);
        })
        .catch((e) => {
          if (!disposed) {
            setError(message(e));
            setLoading(false);
          }
        });
      return () => {
        disposed = true;
        ++epoch.current;
        timers.forEach(clearTimeout);
        subscription.unsubscribe();
      };
    } catch (e) {
      setError(message(e));
      setLoading(false);
      return () => {
        disposed = true;
        ++epoch.current;
      };
    }
  }, [load]);

  function select(id: string | null) {
    if (id !== null && !organizations.some((o) => o.id === id))
      throw new Error("Organização não autorizada.");
    queryClient.clear();
    setActiveId(id);
    if (session) save(session.user.id, id);
  }
  async function signOut() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    await load(null);
  }
  return (
    <IdentityContext.Provider
      value={{
        session,
        person,
        organizations,
        active: organizations.find((o) => o.id === activeId) ?? null,
        loading,
        error,
        select,
        signOut,
        refresh: (preferred) => load(currentSession.current, preferred),
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function IdentityGate({ children }: { children: ReactNode }) {
  const identity = useIdentity();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/auth") return children;
  if (identity.loading)
    return (
      <main className="p-8" role="status">
        A carregar a sua identidade…
      </main>
    );
  if (identity.error)
    return (
      <main className="p-8">
        <p role="alert">{identity.error}</p>
        <button onClick={() => void identity.refresh()}>
          Tentar novamente
        </button>
        <button onClick={() => void identity.signOut()}>Sair</button>
      </main>
    );
  if (!identity.session)
    return (
      <main className="p-8">
        <h1>Encore OS</h1>
        <p>Entre para aceder ao seu espaço pessoal.</p>
        <Link to="/auth" search={{ next: pathname }}>
          Entrar ou criar conta
        </Link>
      </main>
    );
  if (pathname === "/onboarding" || pathname.startsWith("/.lovable/"))
    return children;
  if (!identity.organizations.length && pathname !== "/pessoal")
    return (
      <main className="p-8">
        <h1>Bem-vindo ao Encore OS</h1>
        <Link to="/onboarding">Escolher como começar</Link>
        <p>
          <Link to="/pessoal">Continuar apenas como Person</Link>
        </p>
      </main>
    );
  return (
    <AppShell
      key={`${identity.session.user.id}:${identity.active?.id ?? "personal"}`}
    >
      {pathname !== "/definicoes" && pathname !== "/pessoal" && (
        <p className="mb-4 rounded border p-3 text-sm">
          Demonstração de interface — os dados operacionais são fictícios e não
          pertencem à organização selecionada.
        </p>
      )}
      {children}
    </AppShell>
  );
}

export function OrganizationSwitcher() {
  const { active, organizations, select, signOut } = useIdentity();
  return (
    <div className="space-y-2 px-3 pb-3">
      <label htmlFor="active-organization" className="text-xs">
        Contexto ativo
      </label>
      <select
        id="active-organization"
        className="w-full rounded border bg-background p-2"
        value={active?.id ?? ""}
        onChange={(e) => select(e.target.value || null)}
      >
        <option value="">Espaço pessoal</option>
        {organizations.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} · {o.membership.membership_type}
            {o.membership.is_admin ? " · Admin" : ""}
          </option>
        ))}
      </select>
      <div className="flex gap-3 text-xs">
        <Link to="/onboarding">Criar / aceitar convite</Link>
        <button onClick={() => void signOut()}>Sair</button>
      </div>
    </div>
  );
}
