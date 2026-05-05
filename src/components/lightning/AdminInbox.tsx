import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Zap, RefreshCw } from "lucide-react";

type Thread = {
  user_id: string;
  username: string;
  display_name: string;
  last_message: string;
  last_at: string;
};
type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
};

const LIGHTNING_ID = "11111111-1111-1111-1111-111111111111";

export const AdminInbox = ({ password }: { password: string }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const call = async (action: string, extra: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("lightning-admin", {
      body: { password, action, ...extra },
    });
    if (error) throw error;
    if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    return data;
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const data = (await call("list_threads")) as { threads: Thread[] };
      setThreads(data.threads);
      if (!active && data.threads[0]) setActive(data.threads[0]);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (uid: string) => {
    const data = (await call("get_thread", { user_id: uid })) as { messages: Message[] };
    setMessages(data.messages ?? []);
  };

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (active) loadThread(active.user_id);
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!active || !input.trim()) return;
    const content = input.trim();
    setInput("");
    try {
      await call("send", { user_id: active.user_id, content });
      await loadThread(active.user_id);
      await loadThreads();
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="grid gap-3 md:grid-cols-[260px_1fr] h-[60vh]">
      <aside className="rounded-xl border border-border bg-background/40 flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">inbox · {threads.length}</div>
          <button onClick={loadThreads} className="text-muted-foreground hover:text-primary" aria-label="refresh">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <button
              key={t.user_id}
              onClick={() => setActive(t)}
              className={`flex w-full flex-col items-start gap-0.5 border-b border-border px-3 py-2 text-left transition-colors ${
                active?.user_id === t.user_id ? "bg-secondary/60" : "hover:bg-secondary/30"
              }`}
            >
              <div className="text-sm font-medium">{t.display_name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">@{t.username}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{t.last_message}</div>
            </button>
          ))}
          {threads.length === 0 && !loading && (
            <div className="p-4 text-xs text-muted-foreground">no conversations yet.</div>
          )}
        </div>
      </aside>
      <section className="rounded-xl border border-border bg-background/40 flex flex-col">
        {active ? (
          <>
            <div className="border-b border-border px-3 py-2">
              <div className="text-sm font-medium">{active.display_name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">@{active.username}</div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m) => {
                const fromLightning = m.sender_id === LIGHTNING_ID;
                return (
                  <div key={m.id} className={`flex ${fromLightning ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        fromLightning ? "bg-primary text-primary-foreground" : "bg-secondary/70"
                      }`}
                    >
                      {!fromLightning && (
                        <div className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          @{active.username}
                        </div>
                      )}
                      {fromLightning && (
                        <div className="mb-0.5 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-primary-foreground/70">
                          <Zap className="h-2.5 w-2.5" /> lightning
                        </div>
                      )}
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2 border-t border-border p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="reply as @lightning..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            select a conversation
          </div>
        )}
      </section>
    </div>
  );
};