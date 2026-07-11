import { useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { CategoryRow } from "@/components/lightning/CategoryRow";
import {
  Wrench, Calculator, Timer, StickyNote, Clock, Palette,
  Ruler, Globe, Calendar, ListTodo, Coins, Languages,
  QrCode, KeyRound, Music, PenTool, Camera, Book,
} from "lucide-react";

type Tool = { name: string; icon: any; topic: string };
const TOOLS: Tool[] = [
  { name: "Calculator", icon: Calculator, topic: "Productivity" },
  { name: "Timer", icon: Timer, topic: "Productivity" },
  { name: "Notes", icon: StickyNote, topic: "Productivity" },
  { name: "Clock", icon: Clock, topic: "Productivity" },
  { name: "Todo", icon: ListTodo, topic: "Productivity" },
  { name: "Calendar", icon: Calendar, topic: "Productivity" },
  { name: "Palette", icon: Palette, topic: "Creative" },
  { name: "Draw", icon: PenTool, topic: "Creative" },
  { name: "Camera", icon: Camera, topic: "Creative" },
  { name: "Music", icon: Music, topic: "Creative" },
  { name: "Ruler", icon: Ruler, topic: "Utility" },
  { name: "Globe", icon: Globe, topic: "Utility" },
  { name: "Coins", icon: Coins, topic: "Utility" },
  { name: "Translate", icon: Languages, topic: "Utility" },
  { name: "QR", icon: QrCode, topic: "Utility" },
  { name: "Password", icon: KeyRound, topic: "Utility" },
  { name: "Read", icon: Book, topic: "Utility" },
  { name: "Misc", icon: Wrench, topic: "Utility" },
];

const Tile = ({ label, Icon }: { label: string; Icon: any }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className="group relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[22px] bg-secondary shadow-soft transition-transform hover:-translate-y-0.5"
  >
    <Icon className="h-10 w-10 text-foreground transition-opacity group-hover:opacity-40" />
    <span className="pointer-events-none absolute inset-x-0 bottom-1.5 px-2 text-center text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
      {label}
    </span>
  </button>
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
            {TOOLS.slice(0, 6).map((t) => <Tile key={t.name} label={t.name} Icon={t.icon} />)}
          </CategoryRow>
          {["Productivity", "Creative", "Utility"].map((topic) => (
            <CategoryRow key={topic} title={topic}>
              {TOOLS.filter((t) => t.topic === topic).map((t) => (
                <Tile key={t.name} label={t.name} Icon={t.icon} />
              ))}
            </CategoryRow>
          ))}
          <CategoryRow title="All tools">
            {TOOLS.map((t) => <Tile key={t.name} label={t.name} Icon={t.icon} />)}
          </CategoryRow>
        </main>
      </div>
    </div>
  );
};

export default Tools;