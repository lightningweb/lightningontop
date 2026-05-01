import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Game, type LightningConfig } from "@/config/lightning.config";

type ChatMsg = { role: "user" | "assistant"; content: string; applied?: string[] };

type ToolCall = { name: string; args: Record<string, unknown> };

function applyToolCalls(draft: LightningConfig, calls: ToolCall[]): { next: LightningConfig; summary: string[] } {
  let next: LightningConfig = { ...draft, games: [...draft.games], quotes: [...draft.quotes] };
  const summary: string[] = [];

  for (const call of calls) {
    const a = call.args as Record<string, unknown>;
    switch (call.name) {
      case "set_settings": {
        const patch: Partial<LightningConfig> = {};
        if (typeof a.siteName === "string") patch.siteName = a.siteName;
        if (typeof a.tagline === "string") patch.tagline = a.tagline;
        if (typeof a.version === "string") patch.version = a.version;
        if (typeof a.maintenanceMode === "boolean") patch.maintenanceMode = a.maintenanceMode;
        next = { ...next, ...patch };
        summary.push(`updated settings (${Object.keys(patch).join(", ")})`);
        break;
      }
      case "add_game": {
        const id = `game-${Math.random().toString(36).slice(2, 7)}`;
        const g: Game = {
          id,
          name: String(a.name ?? "New game"),
          description: String(a.description ?? ""),
          icon: String(a.icon ?? "🎮"),
          url: String(a.url ?? "#"),
          ...(typeof a.image === "string" ? { image: a.image } : {}),
          ...(typeof a.tag === "string" ? { tag: a.tag } : {}),
          ...(typeof a.external === "boolean" ? { external: a.external } : {}),
          category: a.category === "app" ? "app" : "game",
        };
        next.games = [...next.games, g];
        summary.push(`added "${g.name}"`);
        break;
      }
      case "update_game": {
        const id = String(a.id ?? "");
        const idx = next.games.findIndex((g) => g.id === id);
        if (idx === -1) { summary.push(`couldn't find game "${id}"`); break; }
        const cur = next.games[idx];
        const patched: Game = { ...cur };
        for (const k of ["name", "url", "icon", "description", "image", "tag"] as const) {
          if (typeof a[k] === "string") (patched as Record<string, unknown>)[k] = a[k];
        }
        if (a.category === "game" || a.category === "app") patched.category = a.category;
        if (typeof a.external === "boolean") patched.external = a.external;
        next.games = next.games.map((g, i) => (i === idx ? patched : g));
        summary.push(`updated "${patched.name}"`);
        break;
      }
      case "remove_game": {
        const id = String(a.id ?? "");
        const target = next.games.find((g) => g.id === id);
        next.games = next.games.filter((g) => g.id !== id);
        summary.push(target ? `removed "${target.name}"` : `removed game "${id}"`);
        break;
      }
      case "add_quote": {
        next.quotes = [...next.quotes, { text: String(a.text ?? ""), author: typeof a.author === "string" ? a.author : undefined }];
        summary.push(`added quote`);
        break;
      }
      case "remove_quote": {
        const i = Number(a.index ?? -1);
        if (i >= 0 && i < next.quotes.length) {
          next.quotes = next.quotes.filter((_, idx) => idx !== i);
          summary.push(`removed quote #${i}`);
        }
        break;
      }
    }
  }

  return { next, summary };
}

export function AdminChat({
  draft,
  setDraft,
  password,
}: {
  draft: LightningConfig;
  setDraft: (next: LightningConfig) => void;
  password: string;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "hi — tell me what to change. e.g. \"add a game called Cookie Clicker at https://orteil.dashnet.org/cookieclicker/\" or \"turn on maintenance mode\"." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!password) {
      setError("Session expired — please re-enter your password.");
      return;
    }
    setError("");
    setInput("");
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-chat", {
        body: {
          password,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          config: draftRef.current,
        },
      });
      if (fnError) throw new Error(fnError.message);
      const res = data as { reply?: string; toolCalls?: ToolCall[]; error?: string };
      if (res.error) throw new Error(res.error);

      let applied: string[] | undefined;
      if (res.toolCalls && res.toolCalls.length > 0) {
        const { next, summary } = applyToolCalls(draftRef.current, res.toolCalls);
        setDraft(next);
        applied = summary;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply || (applied ? "done." : "(no reply)"), applied }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "request failed";
      setError(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: `error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ ai assistant</h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">proposes → you save</span>
      </div>

      <div className="mb-3 max-h-80 space-y-3 overflow-y-auto rounded-xl border border-border bg-background/40 p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-foreground"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.applied && m.applied.length > 0 && (
                <ul className="mt-2 space-y-0.5 border-t border-border/60 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.applied.map((s, j) => (
                    <li key={j}>· {s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-secondary/60 px-3 py-2 font-mono text-xs text-muted-foreground">thinking…</div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); void send(); }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask the assistant to change something…"
          className="flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/60"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          send
        </button>
      </form>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
        changes appear in the form above — click save when you're happy.
      </p>
    </div>
  );
}