import { Link } from "react-router-dom";
import { Clock } from "@/components/lightning/Clock";
import { getLiveConfig } from "@/lib/lightning";

const Maintenance = () => {
  const config = getLiveConfig();
  return (
    <div className="grid min-h-screen place-items-center bg-topo px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          system offline
        </div>
        <div className="mb-6 text-6xl">⚡</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">be right back</h1>
        <p className="mt-4 text-muted-foreground text-balance">
          {config.siteName} is undergoing a quick update. Check back in a few.
        </p>
        <div className="mt-8"><Clock /></div>
        <div className="mt-10 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
          <Link to="/admin" className="hover:text-foreground transition-colors">admin →</Link>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;