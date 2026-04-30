import { useEffect, useState } from "react";

export const Clock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const date = now.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const [hms, ampm] = time.toLowerCase().split(" ");
  const [h, m, s] = hms.split(":");

  return (
    <div className="flex items-center justify-center gap-6 font-mono text-sm md:text-base text-muted-foreground">
      <div className="tabular-nums">
        <span className="text-foreground">{h}</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-foreground">{m}</span>
        <span className="text-primary">:{s}</span>
        <span className="ml-1 text-muted-foreground">{ampm}</span>
      </div>
      <span className="text-border">|</span>
      <div className="text-foreground">{date}</div>
    </div>
  );
};