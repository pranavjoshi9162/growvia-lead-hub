import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SignIn() {
  const { user, signIn, demoUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const to = user.role === "super_admin" ? "/" : "/leads";
    return <Navigate to={to} replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = signIn(email, password, remember);
    setSubmitting(false);
    if (res.ok) {
      toast.success(`Welcome, ${res.user.name}`);
      const from = (location.state as { from?: string } | null)?.from;
      const fallback = res.user.role === "super_admin" ? "/" : "/leads";
      navigate(from && from !== "/signin" ? from : fallback, { replace: true });
    } else {
      setError(res.error);
    }
  };

  const fillDemo = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="min-h-screen w-full bg-secondary/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-baseline mb-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">Grow</span>
            <span className="text-3xl font-bold tracking-tight text-primary">via</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Growvia Sales CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Internal Sales & Lead Management Platform</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6 backdrop-blur-md shadow-[0_10px_40px_-20px_rgba(0,0,0,0.15)]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(250,250,255,0.7) 100%)",
            borderColor: "hsl(var(--border))",
          }}
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-9 h-11"
                  placeholder="you@growvia.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-9 pr-10 h-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("Contact your admin to reset your password.")}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full h-11 text-base">
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* Demo accounts helper */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              <ShieldCheck className="h-3 w-3" /> Demo Accounts
            </div>
            <div className="space-y-1.5">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fillDemo(u.email, u.password)}
                  className="w-full text-left text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-secondary transition flex items-center justify-between gap-2"
                >
                  <span className="truncate">
                    <span className="font-medium text-foreground">{u.name}</span>{" "}
                    <span className="text-muted-foreground">· {u.email}</span>
                  </span>
                  <span
                    className={
                      u.role === "super_admin"
                        ? "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                        : "shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-info-soft text-info"
                    }
                  >
                    {u.role === "super_admin" ? "Super Admin" : "Sales Exec"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Internal access only · Accounts are created by your administrator.
        </p>
      </div>
    </div>
  );
}
