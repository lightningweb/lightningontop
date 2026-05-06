import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Save, Ban, ShieldCheck } from "lucide-react";

type AdminUser = {
  id: string;
  username: string;
  display_name: string | null;
  tag: string | null;
  banned_until: string | null;
  ban_reason: string | null;
  created_at: string;
};

const PRESET_TAGS = ["", "STAFF", "MOD", "VIP", "BETA"];

export const AdminUsers = ({ password }: { password: string }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Partial<AdminUser>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const call = async (action: string, extra: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("lightning-admin", {
      body: { password, action, ...extra },
    });
    if (error) throw error;
    if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    return data;
  };

  const load = async () => {
    setLoading(true);
    try {
      const d = (await call("list_users")) as { users: AdminUser[] };
      setUsers(d.users);
      setDrafts({});
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const setDraft = (id: string, patch: Partial<AdminUser>) =>
    setDrafts((d) => ({ ...d, [id]: { ...users.find((u) => u.id === id), ...d[id], ...patch } }));

  const save = async (id: string) => {
    const d = drafts[id];
    if (!d) return;
    setSavingId(id);
    try {
      await call("update_user", {
        user_id: id,
        tag: d.tag ?? "",
        display_name: d.display_name ?? "",
        banned_until: d.banned_until ?? null,
        ban_reason: d.ban_reason ?? "",
      });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const banFor = (id: string, days: number | "perm") => {
    const until =
      days === "perm"
        ? "9999-12-31T23:59:59Z"
        : new Date(Date.now() + days * 86400_000).toISOString();
    setDraft(id, { banned_until: until });
  };

  const unban = (id: string) => setDraft(id, { banned_until: null, ban_reason: "" });

  const filtered = users.filter((u) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      (u.display_name ?? "").toLowerCase().includes(q) ||
      (u.tag ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="search username, name, tag…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
        />
        <button
          onClick={load}
          className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-primary"
          aria-label="refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="space-y-2">
        {filtered.map((u) => {
          const d = { ...u, ...(drafts[u.id] ?? {}) };
          const dirty = !!drafts[u.id];
          const banned = !!d.banned_until && new Date(d.banned_until) > new Date();
          const perm = d.banned_until?.startsWith("9999");
          return (
            <div key={u.id} className="rounded-xl border border-border bg-background/40 p-3">
              <div className="grid gap-2 md:grid-cols-[1fr_140px_180px_140px_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium">{d.display_name || u.username}</div>
                    {d.tag && (
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                        {d.tag}
                      </span>
                    )}
                    {banned && (
                      <span className="flex items-center gap-1 rounded bg-destructive/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-destructive">
                        <Ban className="h-2.5 w-2.5" /> {perm ? "permanent" : "until " + new Date(d.banned_until!).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">@{u.username}</div>
                </div>
                <input
                  value={d.display_name ?? ""}
                  onChange={(e) => setDraft(u.id, { display_name: e.target.value })}
                  placeholder="display name"
                  className="rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                />
                <div className="flex gap-1">
                  <input
                    value={d.tag ?? ""}
                    onChange={(e) => setDraft(u.id, { tag: e.target.value.toUpperCase() })}
                    placeholder="tag"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs uppercase outline-none focus:border-primary/60"
                  />
                  <select
                    value=""
                    onChange={(e) => e.target.value !== "" && setDraft(u.id, { tag: e.target.value })}
                    className="rounded-md border border-border bg-background px-1 text-xs"
                    aria-label="preset tag"
                  >
                    <option value="">…</option>
                    {PRESET_TAGS.map((t) => (
                      <option key={t || "none"} value={t}>{t || "none"}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-1">
                  {!banned ? (
                    <>
                      <button onClick={() => banFor(u.id, 1)} className="rounded border border-border px-1.5 py-1 font-mono text-[9px] uppercase tracking-wider hover:border-destructive/50 hover:text-destructive">1d</button>
                      <button onClick={() => banFor(u.id, 7)} className="rounded border border-border px-1.5 py-1 font-mono text-[9px] uppercase tracking-wider hover:border-destructive/50 hover:text-destructive">7d</button>
                      <button onClick={() => banFor(u.id, 30)} className="rounded border border-border px-1.5 py-1 font-mono text-[9px] uppercase tracking-wider hover:border-destructive/50 hover:text-destructive">30d</button>
                      <button onClick={() => banFor(u.id, "perm")} className="rounded border border-destructive/50 px-1.5 py-1 font-mono text-[9px] uppercase tracking-wider text-destructive hover:bg-destructive/10">perm</button>
                    </>
                  ) : (
                    <button onClick={() => unban(u.id)} className="flex items-center gap-1 rounded border border-primary/40 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-primary hover:bg-primary/10">
                      <ShieldCheck className="h-3 w-3" /> unban
                    </button>
                  )}
                </div>
                <button
                  disabled={!dirty || savingId === u.id}
                  onClick={() => save(u.id)}
                  className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-30"
                  aria-label="save"
                >
                  <Save className="h-3.5 w-3.5" />
                </button>
              </div>
              {banned && (
                <input
                  value={d.ban_reason ?? ""}
                  onChange={(e) => setDraft(u.id, { ban_reason: e.target.value })}
                  placeholder="ban reason (shown to user)"
                  className="mt-2 w-full rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 text-xs outline-none"
                />
              )}
            </div>
          );
        })}
        {filtered.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">no users.</div>
        )}
      </div>
    </div>
  );
};