import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { AppTile } from "@/components/lightning/AppTile";
import { CategoryRow } from "@/components/lightning/CategoryRow";
import { GameFrame } from "@/components/lightning/GameFrame";
import type { Game } from "@/config/lightning.config";
import { pushRecent } from "@/pages/Index";
import { trending, fresh, favourites, seedFirstSeen } from "@/lib/tracking";

const Apps = () => {
  const config = useMemo(() => getLiveConfig(), []);
  const [active, setActive] = useState<Game | null>(null);

  useEffect(() => {
    document.title = `apps · ${config.siteName}`;
  }, [config.siteName]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  if (config.lockdown) {
    return (
      <div className="min-h-screen bg-topo">
        <div className="w-full px-4 md:px-10 py-8 md:py-10">
          <Header siteName={config.siteName} version={config.version} nav={config.nav} />
          <main className="grid place-items-center pt-32">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground">
              Apps have moved.
            </h1>
          </main>
        </div>
      </div>
    );
  }

  const apps = config.games.filter((g) => g.category === "app");
  const open = (g: Game) => { pushRecent(g.id); setActive(g); };
  const ids = apps.map((a) => a.id);
  seedFirstSeen(ids);
  const byId = new Map(apps.map((a) => [a.id, a]));
  const pick = (l: string[]) => l.map((i) => byId.get(i)).filter(Boolean) as Game[];
  const favIds = favourites(ids);
  const trendIds = trending(ids);
  const freshIds = fresh(ids);
  const favouritesRow = favIds.length ? pick(favIds).slice(0, 6) : apps.slice(0, 6);
  const trendingRow = trendIds.length ? pick(trendIds).slice(0, 12) : apps.slice(0, 12);
  const newRow = freshIds.length ? pick(freshIds) : apps.filter((a) => a.tag === "new");

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-8 md:pt-12">
          {apps.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No apps yet. Add some in admin.
            </div>
          ) : (
            <>
              <CategoryRow title="The team's favourites">
                {favouritesRow.map((g, i) => (
                  <AppTile key={g.id} game={g} size="lg" onOpen={open} label={i === 0 ? g.name : undefined} />
                ))}
              </CategoryRow>
              {trendingRow.length > 0 && (
                <CategoryRow title="Trending">
                  {trendingRow.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
                </CategoryRow>
              )}
              {newRow.length > 0 && (
                <CategoryRow title="New">
                  {newRow.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
                </CategoryRow>
              )}
              <CategoryRow title="All apps">
                {apps.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
              </CategoryRow>
            </>
          )}
        </main>
      </div>
      {active && <GameFrame game={active} onClose={() => setActive(null)} />}
    </div>
  );
};

export default Apps;