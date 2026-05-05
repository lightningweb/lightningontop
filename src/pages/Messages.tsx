import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/lightning/Header";
import { getLiveConfig } from "@/lib/lightning";
import { Send, UserPlus, X, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LIGHTNING_ID = "11111111-1111-1111-1111-111111111111";

type Friend = { id: string; username: string; display_name: string };
type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
};

const Messages = () => {
  const config = getLiveConfig();
  const { user, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `messages · ${config.siteName}`;
  }, [config.siteName]);

  // Load friend list
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: fs } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user.id);
      const ids = (fs ?? []).map((f) => f.friend_id);
      if (!ids.includes(LIGHTNING_ID)) ids.unshift(LIGHTNING_ID);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,username,display_name")
        .in("id", ids);
      const list: Friend[] = (profs ?? []).map((p) => ({
        id: p.id,
        username: p.username,
        display_name: p.display_name ?? p.username,
      }));
      // Lightning first
      list.sort((a, b) => (a.id === LIGHTNING_ID ? -1 : b.id === LIGHTNING_ID ? 1 : a.username.localeCompare(b.username)));
      setFriends(list);
      const initial = params.get("user") || list[0]?.id || null;
      setActive(initial);
    })();
  }, [user]);

  // Load thread + subscribe
  useEffect(() => {
    if (!user || !active) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${active}),and(sender_id.eq.${active},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      if (!cancelled) setMessages((data as Message[]) ?? []);
    })();

    const channel = supabase
      .channel(`dm-${user.id}-${active}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          const involves =
            (m.sender_id === user.id && m.recipient_id === active) ||
            (m.sender_id === active && m.recipient_id === user.id);
          if (involves) setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        }
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const activeFriend = useMemo(() => friends.find((f) => f.id === active) ?? null, [friends, active]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const send = async () => {
    if (!user || !active || !input.trim()) return;
    const content = input.trim();
    setInput("");
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, recipient_id: active, content });
    if (error) toast({ title: "send failed", description: error.message });
  };

  const addFriend = async () => {
    if (!user) return;
    const u = addUsername.trim().replace(/^@/, "");
    if (!u) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("id,username,display_name")
      .eq("username", u)
      .maybeSingle();
    if (!p) {
      toast({ title: "user not found" });
      return;
    }
    if (p.id === user.id) {
      toast({ title: "that's you :)" });
      return;
    }
    const { error } = await supabase
      .from("friendships")
      .insert({ user_id: user.id, friend_id: p.id });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      toast({ title: "couldn't add", description: error.message });
      return;
    }
    toast({ title: `added @${p.username}` });
    setAddUsername("");
    setAddOpen(false);
    setFriends((prev) =>
      prev.some((f) => f.id === p.id)
        ? prev
        : [...prev, { id: p.id, username: p.username, display_name: p.display_name ?? p.username }]
    );
    setActive(p.id);
    setParams({ user: p.id });
  };

  const removeFriend = async (id: string) => {
    if (!user || id === LIGHTNING_ID) return;
    await supabase.from("friendships").delete().eq("user_id", user.id).eq("friend_id", id);
    setFriends((prev) => prev.filter((f) => f.id !== id));
    if (active === id) setActive(LIGHTNING_ID);
  };

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
        <main className="pt-8">
          <div className="mb-6">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ messages</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              <span className="bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                friends &amp; dms
              </span>
            </h1>
          </div>

          <div className="grid gap-4 md:grid-cols-[280px_1fr] h-[70vh]">
            {/* Friend list */}
            <aside className="rounded-2xl border border-border bg-card/40 p-3 backdrop-blur flex flex-col">
              <div className="flex items-center justify-between px-2 py-1">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">friends</div>
                <button
                  onClick={() => setAddOpen((v) => !v)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary/60 hover:text-primary"
                  aria-label="add friend"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
              {addOpen && (
                <div className="mt-2 flex gap-1.5 px-1">
                  <input
                    placeholder="username"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addFriend()}
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={addFriend}
                    className="rounded-md bg-primary px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground"
                  >
                    add
                  </button>
                </div>
              )}
              <div className="mt-2 flex-1 overflow-y-auto">
                {friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActive(f.id);
                      setParams({ user: f.id });
                    }}
                    className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                      active === f.id ? "bg-secondary/70" : "hover:bg-secondary/40"
                    }`}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary/60 text-primary">
                      {f.id === LIGHTNING_ID ? <Zap className="h-3.5 w-3.5" /> : f.display_name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">
                        {f.display_name}
                        {f.id === LIGHTNING_ID && (
                          <span className="ml-1.5 rounded bg-primary/20 px-1 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                            staff
                          </span>
                        )}
                      </div>
                      <div className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">@{f.username}</div>
                    </span>
                    {f.id !== LIGHTNING_ID && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFriend(f.id);
                        }}
                        className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </aside>

            {/* Chat */}
            <section className="flex flex-col rounded-2xl border border-border bg-card/40 backdrop-blur">
              {activeFriend ? (
                <>
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary/60 text-primary">
                      {activeFriend.id === LIGHTNING_ID ? <Zap className="h-4 w-4" /> : activeFriend.display_name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{activeFriend.display_name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">@{activeFriend.username}</div>
                    </div>
                  </div>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((m) => {
                      const mine = m.sender_id === user!.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                              mine
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary/70 text-foreground"
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                    {messages.length === 0 && (
                      <div className="grid h-full place-items-center text-sm text-muted-foreground">
                        no messages yet — say hi 👋
                      </div>
                    )}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                    className="flex gap-2 border-t border-border p-3"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="message..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
                    />
                    <button
                      type="submit"
                      className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  pick a friend to chat
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;