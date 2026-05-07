import { useEffect, useState } from "react";
import { Ban } from "lucide-react";

function fmt(ms: number) {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  const parts = [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean);
  return parts.join(" ");
}

export const BanScreen = ({
  until,
  reason,
}: {
  until: string;
  reason?: string | null;
}) => {
  const isPerm = until.startsWith("9999");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = new Date(until).getTime() - now;
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-background px-6"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="w-full max-w-lg rounded-3xl border border-destructive/50 bg-card/80 p-10 text-center shadow-soft backdrop-blur">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive">
          <Ban className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-destructive">
          {isPerm ? "Permanently banned" : "Account suspended"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You can't use lightning while this account is banned.
        </p>
        {reason && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-left">
            <div className="font-mono text-[10px] uppercase tracking-widest text-destructive/80">
              reason
            </div>
            <div className="mt-1 text-sm">{reason}</div>
          </div>
        )}
        {!isPerm && (
          <div className="mt-6 rounded-xl border border-border bg-background/60 px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              unban in
            </div>
            <div className="mt-1 font-mono text-2xl text-foreground">{fmt(remaining)}</div>
          </div>
        )}
        {isPerm && (
          <div className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            this ban will not expire
          </div>
        )}
      </div>
    </div>
  );
};