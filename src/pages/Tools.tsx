import { useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { CategoryRow } from "@/components/lightning/CategoryRow";
import { Wrench, Calculator, Timer, StickyNote, Clock, Palette } from "lucide-react";

const TOOLS = [
  { name: "Calculator", icon: Calculator, color: "220 30% 30%" },
  { name: "Timer", icon: Timer, color: "220 30% 30%" },
  { name: "Notes", icon: StickyNote, color: "220 30% 30%" },
  { name: "Clock", icon: Clock, color: "220 30% 30%" },
  { name: "Palette", icon: Palette, color: "220 30% 30%" },
  { name: "Utility", icon: Wrench, color: "220 30% 30%" },
];

const Tile = ({ label, Icon }: { label: string; Icon: typeof Wrench }) => (
  <div
    title={label}
    className="grid h-24 w-24 shrink-0 place-items-center rounded-[22px] bg-secondary shadow-soft transition-transform hover:-translate-y-0.5"
  >
    <Icon className="h-10 w-10 text-foreground" />
  </div>
);

const Tools = () => {
  const config = useMemo(() => getLiveConfig(), []);
  useEffect(() => { document.title = `tools · ${config.siteName}`; }, [config.siteName]);
  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  return (
    <div className="min-h-screen bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
        <main className="pt-8 md:pt-12">
          <CategoryRow title="The team's favourites">
            {TOOLS.slice(0, 4).map((t) => <Tile key={t.name} label={t.name} Icon={t.icon} />)}
          </CategoryRow>
          <CategoryRow title="Trending">
            {TOOLS.map((t) => <Tile key={t.name} label={t.name} Icon={t.icon} />)}
          </CategoryRow>
          <CategoryRow title="New">
            {TOOLS.slice(-3).map((t) => <Tile key={t.name} label={t.name} Icon={t.icon} />)}
          </CategoryRow>
        </main>
      </div>
    </div>
  );
};

export default Tools;