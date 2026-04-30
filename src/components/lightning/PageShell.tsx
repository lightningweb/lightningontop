import { ReactNode } from "react";
import { Header } from "./Header";
import { getLiveConfig } from "@/lib/lightning";

export const PageShell = ({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
}) => {
  const config = getLiveConfig();
  return (
    <div className="min-h-screen bg-topo">
      <div className="mx-auto max-w-4xl px-6 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
        <main className="pt-16 md:pt-20">
          {kicker && (
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              ◆ {kicker}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance">
            <span className="bg-gradient-to-b from-primary to-primary/50 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <div className="mt-8 text-muted-foreground leading-relaxed space-y-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};