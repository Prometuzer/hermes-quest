import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- Mock storage pour quand Supabase n'est pas configuré (dev/tests) ---
const MOCK_KEY = "hermes_mock_users";
const MOCK_SESSION = "hermes_mock_session";
interface MockUser { email: string; password: string; id: string; }

function getMockUsers(): MockUser[] {
  try { return JSON.parse(localStorage.getItem(MOCK_KEY) || "[]"); }
  catch { return []; }
}
function setMockUsers(u: MockUser[]) { localStorage.setItem(MOCK_KEY, JSON.stringify(u)); }

/** Construit un faux User Supabase à partir d'un mock. */
function toMockUser(u: MockUser): User {
  return {
    id: u.id,
    aud: "authenticated",
    role: "authenticated",
    email: u.email,
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
  } as unknown as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, session: null, loading: true, configured: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!supabase) {
      // Mode mock : restore session
      try {
        const raw = localStorage.getItem(MOCK_SESSION);
        if (raw) {
          const mu: MockUser = JSON.parse(raw);
          const user = toMockUser(mu);
          setState({ user, session: { user } as unknown as Session, loading: false, configured: false });
          return;
        }
      } catch { /* ignore */ }
      setState({ user: null, session: null, loading: false, configured: false });
      return;
    }

    // Mode réel Supabase
    supabase.auth.getSession().then(({ data }) => {
      setState({
        user: data.session?.user ?? null,
        session: data.session,
        loading: false,
        configured: true,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false, configured: true });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      const users = getMockUsers();
      if (users.find(u => u.email === email)) {
        return { error: "Un compte existe déjà avec cet email (mode démo)." };
      }
      const u: MockUser = { email, password, id: crypto.randomUUID() };
      users.push(u);
      setMockUsers(users);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      const users = getMockUsers();
      const u = users.find(u => u.email === email && u.password === password);
      if (!u) return { error: "Email ou mot de passe invalide (mode démo)." };
      localStorage.setItem(MOCK_SESSION, JSON.stringify(u));
      const user = toMockUser(u);
      setState({ user, session: { user } as unknown as Session, loading: false, configured: false });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) {
      localStorage.removeItem(MOCK_SESSION);
      setState({ user: null, session: null, loading: false, configured: false });
      return;
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  return ctx;
}
