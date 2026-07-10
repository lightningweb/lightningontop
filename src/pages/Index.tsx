import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { AppTile } from "@/components/lightning/AppTile";
import { GameFrame } from "@/components/lightning/GameFrame";
import { useAuth } from "@/hooks/useAuth";
import type { Game } from "@/config/lightning.config";

const RECENTS_KEY = "thunder.recents.v1";
function loadRecents(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]"); } catch { return []; }
}
export function pushRecent(id: string) {
  const cur = loadRecents().filter((x) => x !== id);
  cur.unshift(id);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(cur.slice(0, 12)));
}

const Index = () => {
  const config = useMemo(() => getLiveConfig(), []);
  const { profile } = useAuth();
  const [active, setActive] = useState<Game | null>(null);

  useEffect(() => {
    document.title = config.siteName;
  }, [config.siteName]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  const name = profile?.display_name || profile?.username;
  const recentIds = loadRecents();
  const byId = new Map(config.games.map((g) => [g.id, g]));
  const recents = recentIds.map((id) => byId.get(id)).filter(Boolean) as Game[];
  const fallback = config.games.slice(0, 6);
  const showList = recents.length ? recents : fallback;

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-14 md:pt-20">
          <p className="text-xl md:text-3xl font-medium tracking-tight text-foreground/80">
            Welcome to
          </p>
          <h1 className="mt-1 text-6xl md:text-8xl font-extrabold tracking-tighter text-foreground">
            {config.siteName}!
          </h1>

          {name && (
            <p className="mt-8 text-2xl md:text-3xl font-bold text-foreground">
              What's up, {name}?
            </p>
          )}

          <p className="mt-6 text-lg md:text-xl font-medium text-foreground/85">
            Pick up where you left off:
          </p>
          <div className="mt-4 flex gap-3 md:gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {showList.map((g) => (
              <AppTile key={g.id} game={g} size="lg" onOpen={setActive} />
            ))}
          </div>
        </main>
      </div>
      {active && <GameFrame game={active} onClose={() => setActive(null)} />}
    </div>
  );
};

export default Index;
