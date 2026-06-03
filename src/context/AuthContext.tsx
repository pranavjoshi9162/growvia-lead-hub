import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "super_admin" | "sales_executive";

export interface AuthUser {
  email: string;
  name: string;
  initials: string;
  role: Role;
  /** For sales executives, the display name used in the Lead.assignedTo field. */
  salesName?: string;
}

interface MockUser extends AuthUser {
  password: string;
}

/** Internal users only — no public signup. */
const MOCK_USERS: MockUser[] = [
  {
    email: "admin@growvia.in",
    password: "admin123",
    name: "Omii Jariwala",
    initials: "OJ",
    role: "super_admin",
  },
  {
    email: "priya@growvia.in",
    password: "sales123",
    name: "Priya Shah",
    initials: "PS",
    role: "sales_executive",
    salesName: "Priya Shah",
  },
  {
    email: "rahul@growvia.in",
    password: "sales123",
    name: "Rahul Mehta",
    initials: "RM",
    role: "sales_executive",
    salesName: "Rahul Mehta",
  },
  {
    email: "aisha@growvia.in",
    password: "sales123",
    name: "Aisha Khan",
    initials: "AK",
    role: "sales_executive",
    salesName: "Aisha Khan",
  },
];

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string, remember: boolean) => { ok: true; user: AuthUser } | { ok: false; error: string };
  signOut: () => void;
  demoUsers: { email: string; password: string; role: Role; name: string }[];
}

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "growvia.sales.auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const signIn: AuthCtx["signIn"] = (email, password, remember) => {
    const m = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!m) return { ok: false, error: "Invalid email or password." };
    const { password: _p, ...auth } = m;
    setUser(auth);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(auth));
    (remember ? sessionStorage : localStorage).removeItem(STORAGE_KEY);
    return { ok: true, user: auth };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        demoUsers: MOCK_USERS.map((u) => ({ email: u.email, password: u.password, role: u.role, name: u.name })),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
