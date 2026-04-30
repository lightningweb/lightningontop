import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type Game, type LightningConfig } from "@/config/lightning.config";
import {
  clearOverrides,
  getLiveConfig,
  isAdminAuthed,
  saveConfigToCloud,
  setAdminAuthed,
  verifyAdminPassword,
  refreshConfigFromCloud,
} from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";

const blankGame = (): Game => ({
  id: `game-${Math.random().toString(36).slice(2, 7)}`,
  name: "New game",
  description: "Describe it here.",
  icon: "🎮",
  url: "#",
  tag: "",
  category: "game",
});

const PW_KEY = "lightning.admin.pw.v1";

const Admin = () => {
  const [authed, setAuthed] = useState(isAdminAuthed());
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [adminPw, setAdminPw] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(PW_KEY) ?? "" : ""
  );
  const [draft, setDraft] = useState<LightningConfig>(() => getLiveConfig());
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "admin · lightning"; }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(getLiveConfig()), [draft]);

  const tryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await verifyAdminPassword(pw);
    if (ok) {
      setAdminAuthed(true);
      setAuthed(true);
      setAdminPw(pw);
      sessionStorage.setItem(PW_KEY, pw);
      await refreshConfigFromCloud();
      setDraft(getLiveConfig());
    } else {
      setError("Wrong password.");
    }
  };

  const save = async () => {
    if (!adminPw) {
      setError("Session expired — please re-enter your password.");
      setAdminAuthed(false);
      setAuthed(false);
      return;
    }
    setSaving(true);
    const res = await saveConfigToCloud(adminPw, {
      siteName: draft.siteName,
      tagline: draft.tagline,
      version: draft.version,
      maintenanceMode: draft.maintenanceMode,
      games: draft.games,
      quotes: draft.quotes,
      footerLink: draft.footerLink,
      nav: draft.nav,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Save failed.");
      return;
    }
    setError("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const reset = () => {
    clearOverrides();
    setDraft(getLiveConfig());
  };

  /** Generate a fresh lightning.config.ts file from the current draft. */
  const exportConfig = () => {
    const cfgLiteral = JSON.stringify(
      {
        siteName: draft.siteName,
        tagline: draft.tagline,
        version: draft.version,
        maintenanceMode: draft.maintenanceMode,
        footerLink: draft.footerLink,
        nav: draft.nav,
        games: draft.games,
        quotes: draft.quotes,
      },
      null,
      2
    );

    const file = `/**
 * ⚡ LIGHTNING — edit this file to customize your hub.
 * Generated from /admin on ${new Date().toISOString()}.
 * Drop this into src/config/lightning.config.ts and commit to make changes permanent.
 */

export type Game = {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  tag?: string;
  external?: boolean;
};

export type LightningConfig = {
  siteName: string;
  tagline: string;
  version: string;
  maintenanceMode: boolean;
  footerLink?: { label: string; url: string };
  adminPassword: string;
  games: Game[];
  quotes: { text: string; author?: string }[];
  nav: { label: string; to: string }[];
};

export const config: LightningConfig = ${cfgLiteral};

export const STORAGE_KEY = "lightning.config.overrides.v1";
`;

    const blob = new Blob([file], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lightning.config.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateGame = (i: number, patch: Partial<Game>) =>
    setDraft((d) => ({ ...d, games: d.games.map((g, idx) => (idx === i ? { ...g, ...patch } : g)) }));
  const removeGame = (i: number) =>
    setDraft((d) => ({ ...d, games: d.games.filter((_, idx) => idx !== i) }));
  const addGame = () => setDraft((d) => ({ ...d, games: [...d.games, blankGame()] }));

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-topo px-6">
        <form onSubmit={tryLogin} className="w-full max-w-sm rounded-2xl border border-border bg-card/60 p-8 backdrop-blur shadow-soft">
          <div className="mb-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h1 className="text-2xl font-semibold tracking-tight">admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">enter password to continue</p>
          </div>
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="password"
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary/60"
          />
          {error && <p className="mt-2 font-mono text-xs text-destructive">{error}</p>}
          <button type="submit" className="mt-4 w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            unlock
          </button>
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            password is set in lovable cloud secrets
          </p>
          <Link to="/" className="mt-6 block text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">← back</Link>
        </form>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors";
  const labelCls = "block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5";
  const sectionCls = "rounded-2xl border border-border bg-card/40 p-6 backdrop-blur";

  return (
    <div className="min-h-screen bg-topo">
      <div className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <Header siteName={draft.siteName} version={draft.version} nav={draft.nav} />

        <div className="mt-10 mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">tweak settings, manage games, toggle maintenance.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="rounded-lg border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
              reset
            </button>
            <button onClick={exportConfig} className="rounded-lg border border-primary/40 px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-primary transition-colors hover:bg-primary/10">
              export config
            </button>
            <button onClick={() => { setAdminAuthed(false); setAuthed(false); }} className="rounded-lg border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
              lock
            </button>
            <button onClick={save} disabled={!dirty || saving} className="rounded-lg bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
              {saving ? "saving…" : savedFlash ? "saved ✓" : "save"}
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Settings */}
          <section className={sectionCls}>
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ settings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>site name</label>
                <input className={inputCls} value={draft.siteName} onChange={(e) => setDraft({ ...draft, siteName: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>version</label>
                <input className={inputCls} value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>tagline</label>
                <input className={inputCls} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
              </div>
            </div>

            <label className="mt-5 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
              <div>
                <div className="text-sm font-medium">maintenance mode</div>
                <div className="text-xs text-muted-foreground">show the offline page instead of the homepage</div>
              </div>
              <button
                onClick={() => setDraft({ ...draft, maintenanceMode: !draft.maintenanceMode })}
                className={`relative h-6 w-11 rounded-full transition-colors ${draft.maintenanceMode ? "bg-primary" : "bg-muted"}`}
                aria-pressed={draft.maintenanceMode}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${draft.maintenanceMode ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
          </section>

          {/* Games */}
          <section className={sectionCls}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ games · {draft.games.length}</h2>
              <button onClick={addGame} className="rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
                + add
              </button>
            </div>
            <div className="space-y-3">
              {draft.games.map((g, i) => (
                <div key={i} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="grid gap-3 md:grid-cols-[60px_1fr_1fr_120px_auto] md:items-end">
                    <div>
                      <label className={labelCls}>icon</label>
                      <input className={`${inputCls} text-center text-xl`} value={g.icon} onChange={(e) => updateGame(i, { icon: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>name</label>
                      <input className={inputCls} value={g.name} onChange={(e) => updateGame(i, { name: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>url</label>
                      <input className={inputCls} value={g.url} onChange={(e) => updateGame(i, { url: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>tag</label>
                      <input className={inputCls} value={g.tag ?? ""} onChange={(e) => updateGame(i, { tag: e.target.value })} />
                    </div>
                    <button onClick={() => removeGame(i)} className="h-9 rounded-lg border border-border px-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive">
                      remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_140px]">
                    <div>
                      <label className={labelCls}>description</label>
                      <input className={inputCls} value={g.description} onChange={(e) => updateGame(i, { description: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>image url</label>
                      <input className={inputCls} value={g.image ?? ""} onChange={(e) => updateGame(i, { image: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>category</label>
                      <select
                        className={inputCls}
                        value={g.category ?? "game"}
                        onChange={(e) => updateGame(i, { category: e.target.value as "game" | "app" })}
                      >
                        <option value="game">game</option>
                        <option value="app">app</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {draft.games.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">no games — click + add</div>
              )}
            </div>
          </section>

          {/* Quotes */}
          <section className={sectionCls}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ quotes · {draft.quotes.length}</h2>
              <button
                onClick={() => setDraft({ ...draft, quotes: [...draft.quotes, { text: "New quote", author: "" }] })}
                className="rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                + add
              </button>
            </div>
            <div className="space-y-3">
              {draft.quotes.map((q, i) => (
                <div key={i} className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end rounded-xl border border-border bg-background/40 p-4">
                  <div>
                    <label className={labelCls}>quote</label>
                    <input className={inputCls} value={q.text} onChange={(e) => setDraft({ ...draft, quotes: draft.quotes.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x) })} />
                  </div>
                  <div>
                    <label className={labelCls}>author</label>
                    <input className={inputCls} value={q.author ?? ""} onChange={(e) => setDraft({ ...draft, quotes: draft.quotes.map((x, idx) => idx === i ? { ...x, author: e.target.value } : x) })} />
                  </div>
                  <button onClick={() => setDraft({ ...draft, quotes: draft.quotes.filter((_, idx) => idx !== i) })} className="h-9 rounded-lg border border-border px-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive">
                    remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <p className="px-2 pb-12 font-mono text-[11px] leading-relaxed text-muted-foreground/70">
            note · saving writes directly to <span className="text-primary">lovable cloud</span>. all visitors see your changes immediately. no re-deploy needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;