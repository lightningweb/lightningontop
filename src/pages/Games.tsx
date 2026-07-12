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
import { trending, fresh, favourites, seedFirstSeen } from "@/lib/tracking";

/** Loose topic tags inferred from game name/id. */
const TOPICS: { title: string; match: RegExp }[] = [
  { title: "Racing & Driving", match: /(drive|drift|race|road|slope|snow|tanuki|polytrack|tunnel|wave|eggy|traffic|highway|moto|bike|kart|parking|truck|taxi)/i },
  { title: "Action & Shooters", match: /(ultrakill|gun|shoot|sniper|zombie|iron lung|hollow|granny|crazy cattle|cluster|combat|war|strike|kill|hunter|bullet|assault)/i },
  { title: "Puzzle & Arcade", match: /(tomb|stacktris|geometry|idle|balatro|level devil|tag|monkey|puzzle|match|block|sudoku|tetris|2048|solitaire|mahjong|cube|hex)/i },
  { title: "Sports", match: /(bowl|gladi|soccer|football|basket|golf|tennis|pool|hockey|baseball|boxing|sport|goal|kick|dunk|wrestl)/i },
  { title: "Sandbox & Sim", match: /(minecraft|roblox|bitlife|tomodachi|gta|fnf|craft|sim|tycoon|city|farm|life|world|builder)/i },
  { title: "Adventure & RPG", match: /(zelda|pokemon|mario|adventure|quest|dungeon|knight|witch|hero|kingdom|rpg|fantasy|magic|dragon)/i },
  { title: "Platformer", match: /(mario|sonic|kirby|platform|jump|run|dash|hopper|climb|stick(?:man)?)/i },
  { title: "Retro & Classic", match: /(retro|classic|pac|atari|arcade|nes|snes|gba|gameboy|nintendo|wario|zelda|kong|castle)/i },
  { title: "Multiplayer & .io", match: /(\.io|multiplayer|battle|royale|agar|slither|krunker|shell shock|paper)/i },
  { title: "Horror & Scary", match: /(horror|scary|granny|slender|five nights|fnaf|zombie|dead|haunted|dark)/i },
  { title: "Casual & Idle", match: /(idle|clicker|cookie|casual|zen|relax|happy|cute|color|paint|draw)/i },
  { title: "Strategy & Card", match: /(strategy|chess|checkers|card|poker|balatro|solitaire|tower|defense|td)/i },
];

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
  const ids = games.map((g) => g.id);
  seedFirstSeen(ids);
  const byId = new Map(games.map((g) => [g.id, g]));
  const pick = (list: string[]) => list.map((id) => byId.get(id)).filter(Boolean) as Game[];

  const favIds = favourites(ids);
  const trendIds = trending(ids);
  const freshIds = fresh(ids);

  // Fall back if no play history yet — show a hand-picked slice.
  const favouritesRow = favIds.length ? pick(favIds).slice(0, 6) : games.slice(0, 6);
  const trendingRow = pick(trendIds).slice(0, 12); // real trending
  // Fallback so the row always shows something interesting.
  const trendingDisplay = trendingRow.length
    ? trendingRow
    : games.slice().sort(() => Math.random() - 0.5).slice(0, 12);
  const tagNew = games.filter((g) => g.tag === "new");
  const newRow = freshIds.length ? pick(freshIds) : tagNew;

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

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />

        <main className="pt-8 md:pt-12">
          <SearchBar value={query} onChange={setQuery} />

          <div className="mt-8">
            <CategoryRow title="The team's favourites">
              {favouritesRow.map((g) => (
                <AppTile key={g.id} game={g} size="lg" onOpen={open} />
              ))}
            </CategoryRow>

            <CategoryRow title="Trending">
              {trendingDisplay.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
            </CategoryRow>

            {newRow.length > 0 && (
              <CategoryRow title="New">
                {newRow.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
              </CategoryRow>
            )}

            {TOPICS.map((t) => {
              const list = games.filter((g) => t.match.test(g.name) || t.match.test(g.id));
              if (!list.length) return null;
              return (
                <CategoryRow key={t.title} title={t.title}>
                  {list.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
                </CategoryRow>
              );
            })}

            <CategoryRow title="All games">
              {games.map((g) => <AppTile key={g.id} game={g} size="lg" onOpen={open} />)}
            </CategoryRow>
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