import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/lightning/Header";
import { getLiveConfig } from "@/lib/lightning";
import { Send, UserPlus, X, Check, Inbox } from "lucide-react";
import { BoltIcon } from "@/components/lightning/BoltIcon";
import { toast } from "@/hooks/use-toast";
import { UserTag } from "@/components/lightning/UserBadge";
import { bumpQuest } from "@/lib/quests";
import { notify } from "@/lib/notifications";

const LIGHTNING_ID = "11111111-1111-1111-1111-111111111111";

type Friend = { id: string; username: string; display_name: string; tag?: string | null; avatar?: string | null };
type FriendRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  username: string;
  display_name: string;
  tag?: string | null;
};
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
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
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
        .select("id,username,display_name,tag,avatar")
        .in("id", ids);
      const list: Friend[] = (profs ?? []).map((p) => ({
        id: p.id,
        username: p.username,
        display_name: p.display_name ?? p.username,
        tag: p.tag,
        avatar: (p as any).avatar,
      }));
      // Lightning first
      list.sort((a, b) => (a.id === LIGHTNING_ID ? -1 : b.id === LIGHTNING_ID ? 1 : a.username.localeCompare(b.username)));
      setFriends(list);
      const initial = params.get("user") || list[0]?.id || null;
      setActive(initial);
      await loadRequests();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    const { data: rqs } = await supabase
      .from("friend_requests")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
    const ids = Array.from(
      new Set((rqs ?? []).flatMap((r) => [r.from_user_id, r.to_user_id]))
    );
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,username,display_name,tag")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    const enrich = (r: { id: string; from_user_id: string; to_user_id: string }, otherId: string): FriendRequest => {
      const p = map.get(otherId);
      return {
        id: r.id,
        from_user_id: r.from_user_id,
        to_user_id: r.to_user_id,
        username: p?.username ?? "unknown",
        display_name: p?.display_name ?? p?.username ?? "unknown",
        tag: p?.tag,
      };
    };
    setIncoming((rqs ?? []).filter((r) => r.to_user_id === user.id).map((r) => enrich(r, r.from_user_id)));
    setOutgoing((rqs ?? []).filter((r) => r.from_user_id === user.id).map((r) => enrich(r, r.to_user_id)));
  };

  // Realtime: friend requests
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`fr-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friend_requests" },
        () => {
          loadRequests();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    else {
      bumpQuest(user.id, "send_messages_3", 1);
      bumpQuest(user.id, "send_messages_15", 1);
      // Notify recipient (best-effort; recipient owns insert via own RLS — so we use a function-less self-insert: skip if not me)
      // We can't insert notifications for other users from client RLS; only the recipient's session can.
      // The recipient's realtime message subscription can drive their own notification — handled separately if desired.
    }
  };

  const sendFriendRequest = async () => {
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
    if (p.id === LIGHTNING_ID) {
      toast({ title: "you're already friends with @lightning" });
      return;
    }
    // Already friends?
    if (friends.some((f) => f.id === p.id)) {
      toast({ title: `already friends with @${p.username}` });
      return;
    }
    const { error } = await supabase
      .from("friend_requests")
      .insert({ from_user_id: user.id, to_user_id: p.id });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      toast({ title: "couldn't send request", description: error.message });
      return;
    }
    toast({ title: `request sent to @${p.username}` });
    setAddUsername("");
    setAddOpen(false);
    loadRequests();
  };

  const acceptRequest = async (req: FriendRequest) => {
    if (!user) return;
    const { error } = await supabase.rpc("accept_friend_request", { req_id: req.id });
    if (error) {
      toast({ title: "couldn't accept", description: error.message });
      return;
    }
    await notify(user.id, {
      kind: "friend_added",
      title: `You and @${req.username} are now friends`,
      link: `/messages?user=${req.from_user_id}`,
    });
    await bumpQuest(user.id, "friend_someone", 1);
    setFriends((prev) =>
      prev.some((f) => f.id === req.from_user_id)
        ? prev
        : [...prev, { id: req.from_user_id, username: req.username, display_name: req.display_name, tag: req.tag }]
    );
    loadRequests();
  };

  const declineRequest = async (req: FriendRequest) => {
    await supabase.from("friend_requests").delete().eq("id", req.id);
    loadRequests();
  };

  const cancelRequest = async (req: FriendRequest) => {
    await supabase.from("friend_requests").delete().eq("id", req.id);
    loadRequests();
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
                    onKeyDown={(e) => e.key === "Enter" && sendFriendRequest()}
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                  />
                  <button
                    onClick={sendFriendRequest}
                    className="rounded-md bg-primary px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground"
                  >
                    request
                  </button>
                </div>
              )}
              {(incoming.length > 0 || outgoing.length > 0) && (
                <div className="mt-3 rounded-lg border border-border bg-background/40 p-2">
                  <div className="mb-1 flex items-center gap-1 px-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    <Inbox className="h-3 w-3" /> requests
                  </div>
                  {incoming.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 rounded px-1 py-1 text-xs">
                      <span className="flex-1 min-w-0 truncate">
                        {r.display_name}
                        {r.tag && <span className="ml-1"><UserTag tag={r.tag} size="xs" /></span>}
                      </span>
                      <button onClick={() => acceptRequest(r)} className="grid h-6 w-6 place-items-center rounded bg-primary text-primary-foreground" aria-label="accept">
                        <Check className="h-3 w-3" />
                      </button>
                      <button onClick={() => declineRequest(r)} className="grid h-6 w-6 place-items-center rounded border border-border text-muted-foreground hover:text-destructive" aria-label="decline">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {outgoing.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 rounded px-1 py-1 text-xs opacity-70">
                      <span className="flex-1 min-w-0 truncate">
                        → {r.display_name}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">pending</span>
                      <button onClick={() => cancelRequest(r)} className="grid h-6 w-6 place-items-center rounded border border-border text-muted-foreground hover:text-destructive" aria-label="cancel">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
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
                    <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-secondary/60 text-primary text-sm">
                      {f.avatar ? (
                        f.avatar.startsWith("http") ? (
                          <img src={f.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{f.avatar}</span>
                        )
                      ) : f.id === LIGHTNING_ID ? (
                        <BoltIcon className="h-3.5 w-3.5" />
                      ) : (
                        f.display_name.charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                        <span className="truncate">{f.display_name}</span>
                        <UserTag tag={f.tag || (f.id === LIGHTNING_ID ? "STAFF" : null)} size="xs" />
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
                    <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-secondary/60 text-primary">
                      {activeFriend.avatar ? (
                        activeFriend.avatar.startsWith("http") ? (
                          <img src={activeFriend.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{activeFriend.avatar}</span>
                        )
                      ) : activeFriend.id === LIGHTNING_ID ? (
                        <BoltIcon className="h-4 w-4" />
                      ) : (
                        activeFriend.display_name.charAt(0).toUpperCase()
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        {activeFriend.display_name}
                        <UserTag tag={activeFriend.tag || (activeFriend.id === LIGHTNING_ID ? "STAFF" : null)} />
                      </div>
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