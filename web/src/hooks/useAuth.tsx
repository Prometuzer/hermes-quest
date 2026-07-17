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
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface MockUser { email: string; password: string; id: string; }
const TEST_MODE = import.meta.env.MODE === "test";
const mockUsers: MockUser[] = [];
let mockSession: MockUser | null = null;

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
      if (TEST_MODE && mockSession) {
        const user = toMockUser(mockSession);
        setState({ user, session: { user } as unknown as Session, loading: false, configured: false });
        return;
      }
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

  const signUp = async (email: string, password: string, displayName = "") => {
    if (!supabase) {
      if (!TEST_MODE) return { error: "La création de compte n’est pas encore activée sur cette preview." };
      if (mockUsers.find(u => u.email === email)) {
        return { error: "Un compte existe déjà avec cet email (mode démo)." };
      }
      const u: MockUser = { email, password, id: crypto.randomUUID() };
      mockUsers.push(u);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: `${window.location.origin}/connexion?confirmed=1`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      if (!TEST_MODE) return { error: "La connexion n’est pas encore activée sur cette preview." };
      const u = mockUsers.find(u => u.email === email && u.password === password);
      if (!u) return { error: "Email ou mot de passe invalide (mode démo)." };
      mockSession = u;
      const user = toMockUser(u);
      setState({ user, session: { user } as unknown as Session, loading: false, configured: false });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) {
      mockSession = null;
      setState({ user: null, session: null, loading: false, configured: false });
      return;
    }
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: TEST_MODE ? null : "La réinitialisation n’est pas encore activée sur cette preview." };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) return { error: TEST_MODE ? null : "La réinitialisation n’est pas encore activée sur cette preview." };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  return ctx;
}
