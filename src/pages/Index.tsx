import { useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { getLiveConfig } from "@/lib/lightning";
import { Header } from "@/components/lightning/Header";
import { Clock } from "@/components/lightning/Clock";
import { QuoteRotator } from "@/components/lightning/QuoteRotator";
import { loadSettings } from "@/pages/Settings";

const Index = () => {
  const config = useMemo(() => getLiveConfig(), []);
  const settings = loadSettings();

  useEffect(() => {
    document.title = config.siteName;
  }, [config.siteName]);

  if (config.maintenanceMode) return <Navigate to="/maintenance" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-topo">
      <div className="w-full px-4 md:px-10 py-8 md:py-10">
        <Header siteName={config.siteName} version={config.version} nav={config.nav} />
      </div>

      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <section className="-mt-16 flex flex-col items-center text-center">
          {!settings.hideClock && <Clock />}
          <h1 className="mt-10 text-6xl md:text-8xl font-bold tracking-tighter text-balance">
            <span className="bg-gradient-to-b from-primary to-primary/50 bg-clip-text text-transparent">
              {config.siteName}
            </span>
          </h1>
          {!settings.pauseQuotes && (
            <div className="mt-5">
              <QuoteRotator quotes={config.quotes} variant="inline" />
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
