import { useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { Clock } from "@/components/lightning/Clock";
import { GameCard } from "@/components/lightning/GameCard";
import { QuoteRotator } from "@/components/lightning/QuoteRotator";

const Index = () => {
  const config = useMemo(() => getLiveConfig(), []);

  useEffect(() => {
    document.title = `${config.siteName} — personal hub`;
  }, [config.siteName]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  return (
    <div className="min-h-screen bg-topo">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main>
          {/* Hero */}
          <section className="pt-16 md:pt-20 pb-12 text-center">
            <Clock />
            <h1 className="mt-10 text-6xl md:text-8xl font-bold tracking-tighter text-balance">
              <span className="bg-gradient-to-b from-primary to-primary/50 bg-clip-text text-transparent">
                {config.siteName}
              </span>
            </h1>
            <div className="mt-5">
              <QuoteRotator quotes={config.quotes} variant="inline" />
            </div>
          </section>

          {/* Game grid */}
          <section className="pt-4">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                ◆ collection · {config.games.length} apps
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
                edit in lightning.config.ts
              </span>
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
          </section>

          {/* Tagline */}
          <section className="mt-16 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
              {config.tagline}
            </p>
          </section>
        </main>

        <footer className="mt-20 flex flex-col items-center gap-2 border-t border-border pt-8 pb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{config.version}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" /> online
            </span>
            {config.footerLink && (
              <>
                <span className="text-border">·</span>
                <a href={config.footerLink.url} target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  {config.footerLink.label}
                </a>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
