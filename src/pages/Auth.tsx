import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/lightning/Header";
import { getLiveConfig } from "@/lib/lightning";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const config = getLiveConfig();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = `account · ${config.siteName}`;
  }, [config.siteName]);

  if (!loading && user) return <Navigate to="/" replace />;

  // We use username + password by mapping username -> a synthetic email.
  const usernameToEmail = (u: string) =>
    `${u.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")}@user.lightning.local`;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    if (!u || u.length < 3) {
      toast({ title: "username too short", description: "use at least 3 characters" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "password too short", description: "use at least 6 characters" });
      return;
    }
    setBusy(true);
    try {
      const email = usernameToEmail(u);
      if (mode === "signup") {
        // Check username availability
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", u)
          .maybeSingle();
        if (existing) {
          toast({ title: "username taken" });
          setBusy(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: u },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "account created" });
        nav("/");
      } else {
        // Lookup email by username (in case different from synthesized)
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "signed in" });
        nav("/");
      }
    } catch (err: any) {
      toast({ title: "auth failed", description: err.message ?? String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
        <main className="mx-auto mt-16 max-w-md">
          <div className="mb-6">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ account</div>
            <h1 className="text-5xl font-bold tracking-tighter">
              <span className="bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                {mode === "signin" ? "sign in" : "sign up"}
              </span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              your saves sync across any pc you sign in on.
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur shadow-soft"
          >
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "..." : mode === "signin" ? "sign in" : "create account"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="w-full text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "no account? sign up" : "have an account? sign in"}
            </button>
            <Link
              to="/"
              className="block text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              ← back
            </Link>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Auth;