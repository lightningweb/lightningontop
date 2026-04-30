import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="grid min-h-screen place-items-center bg-topo px-6">
      <div className="text-center">
        <div className="mb-4 text-5xl">⚡</div>
        <h1 className="text-7xl font-bold tracking-tighter">404</h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">signal lost · path not found</p>
        <a href="/" className="mt-8 inline-block rounded-lg border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
          ← back to hub
        </a>
      </div>
    </div>
  );
};

export default NotFound;
