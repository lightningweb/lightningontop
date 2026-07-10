import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { AppTile } from "@/components/lightning/AppTile";
import { CategoryRow } from "@/components/lightning/CategoryRow";
import { GameFrame } from "@/components/lightning/GameFrame";
import { Search } from "lucide-react";
import type { Game } from "@/config/lightning.config";
import { pushRecent } from "@/pages/Index";

const Games = () => {
  const config = useMemo(() => getLiveConfig(), []);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Game | null>(null);

  useEffect(() => {
    document.title = `games · ${config.siteName}`;
  }, [config.siteName]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  if (config.lockdown) {
    return (
      <div className="min-h-screen bg-topo">
        <div className="w-full px-4 md:px-10 py-8 md:py-10">
          <Header siteName={config.siteName} version={config.version} nav={config.nav} />
          <main className="grid place-items-center pt-32">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
              Games have moved.
            </h1>
          </main>
        </div>
      </div>
    );
  }

  const games = config.games.filter((g) => g.category !== "app");
  const open = (g: Game) => { pushRecent(g.id); setActive(g); };

  const q = query.trim().toLowerCase();
  if (q) {
    const filtered = games.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.tag ?? "").toLowerCase().includes(q)
    );
    return (
      <div className="min-h-screen bg-topo">
        <div className="w-full px-4 md:px-10 py-8 md:py-10">
          <Header siteName={config.siteName} version={config.version} nav={config.nav} />
          <main className="pt-8 md:pt-12">
            <SearchBar value={query} onChange={setQuery} />
            <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3 md:gap-4">
              {filtered.map((g) => <AppTile key={g.id} game={g} onOpen={open} />)}
            </div>
          </main>
        </div>
        {active && <GameFrame game={active} onClose={() => setActive(null)} />}
      </div>
    );
  }

  const favourites = games.slice(0, 6);
  const trending = games.slice(0, Math.min(12, games.length));
  const newer = games.filter((g) => g.tag === "new");

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-8 md:pt-12">
          <SearchBar value={query} onChange={setQuery} />

          <div className="mt-8">
            <CategoryRow title="The team's favourites">
              {favourites.map((g, i) => (
                <AppTile key={g.id} game={g} size="lg" onOpen={open} label={i === 0 ? g.name : undefined} />
              ))}
            </CategoryRow>

            <CategoryRow title="Trending">
              {trending.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
            </CategoryRow>

            {newer.length > 0 && (
              <CategoryRow title="New">
                {newer.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
              </CategoryRow>
            )}
          </div>
        </main>
      </div>
      {active && <GameFrame game={active} onClose={() => setActive(null)} />}
    </div>
  );
};

const SearchBar = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="relative max-w-md">
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search…"
      className="w-full rounded-full border border-border bg-secondary/50 py-3 pl-11 pr-4 text-sm outline-none backdrop-blur placeholder:text-muted-foreground focus:border-primary/50"
    />
  </div>
);

export default Games;