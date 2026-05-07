import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/lightning/Header";
import { getLiveConfig } from "@/lib/lightning";
import { ensureQuests, type Quest } from "@/lib/quests";
import { CheckCircle2, Sparkles, Calendar, CalendarDays } from "lucide-react";
import { levelProgress } from "@/lib/level";
import { supabase } from "@/integrations/supabase/client";

const Quests = () => {
  const config = getLiveConfig();
  const { user, loading } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    document.title = `quests · ${config.siteName}`;
  }, [config.siteName]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const q = await ensureQuests(user.id);
      setQuests(q);
      const { data: prof } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .maybeSingle();
      setXp(prof?.xp ?? 0);
    })();
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const lp = levelProgress(xp);
  const daily = quests.filter((q) => q.kind === "daily");
  const weekly = quests.filter((q) => q.kind === "weekly");

  const Card = ({ q }: { q: Quest }) => {
    const done = !!q.completed_at;
    const pct = Math.min(100, (q.progress / q.target) * 100);
    return (
      <div
        className={`rounded-2xl border p-4 transition-colors ${
          done ? "border-primary/40 bg-primary/5" : "border-border bg-card/40"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">{q.title}</div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {q.progress}/{q.target} · resets {new Date(q.expires_at).toLocaleString()}
            </div>
          </div>
          <div
            className={`flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
              done ? "bg-primary text-primary-foreground" : "border border-border text-primary"
            }`}
          >
            {done ? <CheckCircle2 className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            +{q.xp_reward} xp
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/60">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
        <main className="pt-8 space-y-8">
          <div>
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              ◆ progress
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              <span className="bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                quests
              </span>
            </h1>
          </div>

          <section className="rounded-2xl border border-border bg-card/40 p-6 backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  level
                </div>
                <div className="font-bold text-4xl">{lp.level}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  total xp
                </div>
                <div className="font-bold text-2xl">{xp}</div>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-secondary/60">
              <div className="h-full bg-primary transition-all" style={{ width: `${lp.pct}%` }} />
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {lp.current}/{lp.needed} xp to level {lp.level + 1}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <Calendar className="h-3.5 w-3.5" /> daily quests
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {daily.map((q) => (
                <Card key={q.id} q={q} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <CalendarDays className="h-3.5 w-3.5" /> weekly quests
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {weekly.map((q) => (
                <Card key={q.id} q={q} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Quests;