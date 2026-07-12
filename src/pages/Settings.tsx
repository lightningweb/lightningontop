import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SETTINGS_KEY = "lightning.user.settings.v1";
const AVATAR_KEY = "thunder.avatar.v1";
const AVATAR_PRESETS = [":)", ":D", ":(", ":P", "XD", ":O"];

type UserSettings = {
  theme: "dark" | "light" | "system";
  reducedMotion: boolean;
};

const DEFAULTS: UserSettings = {
  theme: "dark",
  reducedMotion: false,
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function applySettings(s: UserSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersLight =
    s.theme === "light" ||
    (s.theme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
  root.classList.toggle("theme-light", prefersLight);
  root.style.setProperty("--motion-scale", s.reducedMotion ? "0" : "1");
  root.dataset.reducedMotion = s.reducedMotion ? "1" : "0";
}

// Live-follow the system theme when set to "system".
let sysMql: MediaQueryList | null = null;
let sysHandler: (() => void) | null = null;
export function watchSystemTheme() {
  if (typeof window === "undefined") return;
  if (sysMql && sysHandler) sysMql.removeEventListener("change", sysHandler);
  sysMql = window.matchMedia("(prefers-color-scheme: light)");
  sysHandler = () => {
    const s = loadSettings();
    if (s.theme === "system") applySettings(s);
  };
  sysMql.addEventListener("change", sysHandler);
}

const Settings = () => {
  const config = getLiveConfig();
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [savingAcct, setSavingAcct] = useState(false);
  const [avatar, setAvatar] = useState<string>(() => {
    try { return localStorage.getItem(AVATAR_KEY) || "⚡"; } catch { return "⚡"; }
  });

  const chooseAvatar = (a: string) => {
    setAvatar(a);
    try { localStorage.setItem(AVATAR_KEY, a); } catch {}
    window.dispatchEvent(new Event("thunder-avatar-change"));
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name,username")
        .eq("id", user.id)
        .maybeSingle();
      setDisplayName(data?.display_name ?? data?.username ?? "");
    })();
  }, [user]);

  const saveAccount = async () => {
    if (!user) return;
    setSavingAcct(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || profile?.username || "" })
      .eq("id", user.id);
    setSavingAcct(false);
    if (error) toast({ title: "save failed", description: error.message });
    else toast({ title: "account updated" });
  };

  useEffect(() => {
    document.title = `settings · ${config.siteName}`;
  }, [config.siteName]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  const Toggle = ({
    checked,
    onChange,
    label,
    desc,
  }: { checked: boolean; onChange: () => void; label: string; desc: string }) => (
    <label className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-10 md:pt-14">
          <div className="mb-8">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ preferences</div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
              <span className="bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                settings
              </span>
            </h1>
          </div>

          <section className="mb-6 rounded-2xl border border-border bg-card/40 p-6 backdrop-blur space-y-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ profile picture</div>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-border bg-secondary text-2xl">
                {avatar.startsWith("http") ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : avatar}
              </div>
              <div className="text-xs text-muted-foreground">Pick an emoji or paste an image URL. Shown in the top-right of every page.</div>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_PRESETS.map((a) => (
                <button
                  key={a}
                  onClick={() => chooseAvatar(a)}
                  className={`grid h-10 w-10 place-items-center rounded-full border text-xl transition-colors ${avatar === a ? "border-primary bg-primary/10" : "border-border bg-secondary/60 hover:bg-secondary"}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <input
              placeholder="…or paste an image URL"
              onChange={(e) => e.target.value && chooseAvatar(e.target.value.trim())}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
            />
          </section>

          <section className="mb-6 rounded-2xl border border-border bg-card/40 p-6 backdrop-blur space-y-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ account</div>
            {user ? (
              <>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">username</label>
                  <div className="rounded-md border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground">@{profile?.username}</div>
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">display name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveAccount}
                    disabled={savingAcct}
                    className="rounded-lg bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {savingAcct ? "saving…" : "save account"}
                  </button>
                  <Link
                    to="/messages"
                    className="rounded-lg border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  >
                    open messages →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link to="/auth" className="text-primary hover:underline">sign in</Link> to manage your account, friends, and dms.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur space-y-4">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">theme</div>
              <div className="grid grid-cols-3 gap-2">
                {(["dark", "light", "system"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSettings({ ...settings, theme: t })}
                    className={`rounded-lg border px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                      settings.theme === t
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              label="reduced motion"
              desc="disable card hovers and quote fades"
              checked={settings.reducedMotion}
              onChange={() => setSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
            />

            <div className="pt-2">
              <button
                onClick={() => setSettings(DEFAULTS)}
                className="rounded-lg border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                reset to defaults
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Settings;
