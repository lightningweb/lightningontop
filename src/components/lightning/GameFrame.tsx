import { useEffect, useRef, useState } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import type { Game } from "@/config/lightning.config";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export const GameFrame = ({ game, onClose }: { game: Game; onClose: () => void }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);
  useActivityTracker(game.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.fullscreenElement && onClose();
    document.addEventListener("keydown", onKey);
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [onClose]);

  const toggleFs = () => {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col backdrop-blur-md animate-fade-in-up"
      style={{ backgroundColor: "hsl(var(--game-frame-bg) / 0.97)" }}
    >
      <div
        className="flex items-center justify-between border-b border-border px-4 py-2.5"
        style={{ backgroundColor: "hsl(var(--game-frame-bar))" }}
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {game.name}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFs}
            aria-label="toggle fullscreen"
            className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {isFs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            aria-label="close"
            className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={wrapRef} className="flex-1" style={{ backgroundColor: "hsl(var(--game-frame-bg))" }}>
        <iframe
          src={game.url}
          title={game.name}
          className="h-full w-full border-0"
          allow="fullscreen; gamepad; autoplay; clipboard-write"
        />
      </div>
    </div>
  );
};