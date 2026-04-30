import { useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { GameCard } from "@/components/lightning/GameCard";

const Games = () => {
  const config = useMemo(() => getLiveConfig(), []);

  useEffect(() => {
    document.title = `games · ${config.siteName}`;
  }, [config.siteName]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  return (
    <div className="min-h-screen bg-topo">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-12 md:pt-16">
          <div className="mb-10">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              ◆ collection · {config.games.length} apps
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
              <span className="bg-gradient-to-b from-primary to-primary/50 bg-clip-text text-transparent">
                games
              </span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              pick something to play. all self-hosted, all in the browser.
            </p>
          </div>

          {config.games.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No games yet. Add some in <code className="font-mono text-primary">src/config/lightning.config.ts</code>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {config.games.map((g, i) => (
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