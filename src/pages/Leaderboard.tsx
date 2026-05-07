import { useEffect, useState } from "react";
import { Header } from "@/components/lightning/Header";
import { getLiveConfig } from "@/lib/lightning";
import { supabase } from "@/integrations/supabase/client";
import { levelForXp } from "@/lib/level";
import { UserName } from "@/components/lightning/UserBadge";
import { Trophy, Medal } from "lucide-react";

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  tag: string | null;
  xp: number;
};

const Leaderboard = () => {
  const config = getLiveConfig();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    document.title = `leaderboard · ${config.siteName}`;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,username,display_name,tag,xp")
        .order("xp", { ascending: false })
        .limit(100);
      setRows((data as Row[]) ?? []);
    })();
  }, [config.siteName]);

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
        <main className="pt-8">
          <div className="mb-8">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              ◆ top 100
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              <span className="bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                leaderboard
              </span>
            </h1>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur">
            {rows.map((r, i) => {
              const lvl = levelForXp(r.xp);
              const rank = i + 1;
              const medal =
                rank === 1
                  ? "text-yellow-400"
                  : rank === 2
                  ? "text-zinc-300"
                  : rank === 3
                  ? "text-amber-600"
                  : "text-muted-foreground";
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-b-0 hover:bg-secondary/30"
                >
                  <div className={`grid w-10 place-items-center font-mono text-sm ${medal}`}>
                    {rank <= 3 ? (
                      rank === 1 ? <Trophy className="h-4 w-4" /> : <Medal className="h-4 w-4" />
                    ) : (
                      `#${rank}`
                    )}
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary/60 text-primary">
                    {(r.display_name || r.username).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <UserName
                      id={r.id}
                      username={r.username}
                      displayName={r.display_name}
                      tag={r.tag}
                      className="text-sm font-medium"
                    />
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      @{r.username}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      level
                    </div>
                    <div className="text-sm font-semibold">{lvl}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      xp
                    </div>
                    <div className="text-sm font-semibold text-primary">{r.xp.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">
                no players yet — be the first!
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;