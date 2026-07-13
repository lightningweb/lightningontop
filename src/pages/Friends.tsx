import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/lightning/Header";
import { getLiveConfig } from "@/lib/lightning";
import { UserTag } from "@/components/lightning/UserBadge";
import { Gamepad2, MessageCircle, UserPlus, Zap } from "lucide-react";

const LIGHTNING_ID = "11111111-1111-1111-1111-111111111111";

type Friend = {
  id: string;
  username: string;
  display_name: string;
  tag?: string | null;
  avatar?: string | null;
  current_game?: string | null;
  current_game_at?: string | null;
};

const Avatar = ({ src, fallback }: { src?: string | null; fallback: string }) => (
  <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-secondary/70 text-lg text-primary shrink-0">
    {src ? (
      src.startsWith("http") ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{src}</span>
      )
    ) : (
      <span>{fallback}</span>
    )}
  </span>
);

const Friends = () => {
  const config = getLiveConfig();
  const { user, loading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    document.title = `friends · ${config.siteName}`;
  }, [config.siteName]);

  const load = async () => {
    if (!user) return;
    const { data: fs } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", user.id);
    const ids = (fs ?? []).map((f) => f.friend_id);
    if (!ids.includes(LIGHTNING_ID)) ids.unshift(LIGHTNING_ID);
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,username,display_name,tag,avatar,current_game,current_game_at")
      .in("id", ids);
    const list: Friend[] = (profs ?? []).map((p: any) => ({
      id: p.id,
      username: p.username,
      display_name: p.display_name ?? p.username,
      tag: p.tag,
      avatar: p.avatar,
      current_game: p.current_game,
      current_game_at: p.current_game_at,
    }));
    // Playing first, then by name
    list.sort((a, b) => {
      const ap = isPlaying(a) ? 0 : 1;
      const bp = isPlaying(b) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.display_name.localeCompare(b.display_name);
    });
    setFriends(list);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("friends-presence")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const playing = friends.filter(isPlaying);
  const idle = friends.filter((f) => !isPlaying(f));

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">◆ friends</div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                <span className="bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                  who's around
                </span>
              </h1>
            </div>
            <Link
              to="/messages"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs font-semibold text-foreground/80 hover:border-primary/50 hover:text-primary"
            >
              <UserPlus className="h-4 w-4" /> Add / message
            </Link>
          </div>

          {playing.length > 0 && (
            <section className="mb-8">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                playing now · {playing.length}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {playing.map((f) => (
                  <FriendCard key={f.id} f={f} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              all friends · {friends.length}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {idle.map((f) => (
                <FriendCard key={f.id} f={f} />
              ))}
              {friends.length === 0 && (
                <div className="col-span-full rounded-2xl border border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
                  no friends yet — <Link to="/messages" className="text-primary hover:underline">add one</Link>.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

function isPlaying(f: Friend) {
  if (!f.current_game || !f.current_game_at) return false;
  return Date.now() - new Date(f.current_game_at).getTime() < 5 * 60 * 1000;
}

const FriendCard = ({ f }: { f: Friend }) => {
  const playing = isPlaying(f);
  const fallback = f.id === LIGHTNING_ID ? "⚡" : f.display_name.charAt(0).toUpperCase();
  return (
    <Link
      to={`/messages?user=${f.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-4 backdrop-blur transition-colors hover:border-primary/40 hover:bg-card/60"
    >
      <div className="relative">
        <Avatar src={f.avatar || (f.id === LIGHTNING_ID ? "⚡" : null)} fallback={fallback} />
        {playing && (
          <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-card bg-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-sm font-semibold">
          <span className="truncate">{f.display_name}</span>
          <UserTag tag={f.tag || (f.id === LIGHTNING_ID ? "STAFF" : null)} size="xs" />
        </div>
        <div className="truncate text-[11px] text-muted-foreground">@{f.username}</div>
        {playing ? (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <Gamepad2 className="h-3.5 w-3.5" /> Playing {f.current_game}
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" /> Not playing right now
          </div>
        )}
      </div>
    </Link>
  );
};

export default Friends;