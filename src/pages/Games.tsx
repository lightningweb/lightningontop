import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { GameCard } from "@/components/lightning/GameCard";
import { Search } from "lucide-react";

const Games = () => {
  const config = useMemo(() => getLiveConfig(), []);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.title = `games · ${config.siteName}`;
  }, [config.siteName]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  const filtered = config.games.filter((g) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      (g.tag ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-topo">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-10 md:pt-14">
          <div className="mb-8 flex flex-col gap-5">
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                ◆ {filtered.length} of {config.games.length}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
                <span className="bg-gradient-to-b from-primary to-primary/60 bg-clip-text text-transparent">
                  games
                </span>
              </h1>
            </div>
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search games..."
                className="w-full rounded-full border border-border bg-card/60 py-2.5 pl-10 pr-4 text-sm outline-none backdrop-blur transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {config.games.length === 0
                ? <>No games yet. Add some in <code className="font-mono text-primary">src/config/lightning.config.ts</code></>
                : <>No games match "<span className="text-foreground">{query}</span>".</>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((g, i) => (
                <GameCard key={g.id} game={g} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Games;