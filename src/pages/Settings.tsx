import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";

const SETTINGS_KEY = "lightning.user.settings.v1";

type UserSettings = {
  theme: "dark" | "light" | "system";
  reducedMotion: boolean;
  pauseQuotes: boolean;
  hideClock: boolean;
  compactCards: boolean;
};

const DEFAULTS: UserSettings = {
  theme: "dark",
  reducedMotion: false,
  pauseQuotes: false,
  hideClock: false,
  compactCards: false,
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
  const root = document.documentElement;
  const prefersLight =
    s.theme === "light" ||
    (s.theme === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
  root.classList.toggle("theme-light", prefersLight);
  root.style.setProperty("--motion-scale", s.reducedMotion ? "0" : "1");
  root.dataset.reducedMotion = s.reducedMotion ? "1" : "0";
}

const Settings = () => {
  const config = getLiveConfig();
  const [settings, setSettings] = useState<UserSettings>(loadSettings());

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
            <Toggle
              label="pause quotes"
              desc="stop the rotating quote under the logo"
              checked={settings.pauseQuotes}
              onChange={() => setSettings({ ...settings, pauseQuotes: !settings.pauseQuotes })}
            />
            <Toggle
              label="hide clock"
              desc="hide the clock on the homepage"
              checked={settings.hideClock}
              onChange={() => setSettings({ ...settings, hideClock: !settings.hideClock })}
            />
            <Toggle
              label="compact cards"
              desc="tighter grid for games & apps"
              checked={settings.compactCards}
              onChange={() => setSettings({ ...settings, compactCards: !settings.compactCards })}
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