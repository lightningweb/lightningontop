import { useEffect, useState } from "react";

type Quote = { text: string; author?: string };

export const QuoteRotator = ({
  quotes,
  intervalMs = 8000,
  variant = "card",
}: {
  quotes: Quote[];
  intervalMs?: number;
  variant?: "card" | "inline";
}) => {
  const [i, setI] = useState(() => Math.floor(Math.random() * Math.max(quotes.length, 1)));
  useEffect(() => {
    if (quotes.length < 2) return;
    const id = setInterval(() => {
      setI((prev) => {
        let next = prev;
        while (next === prev) next = Math.floor(Math.random() * quotes.length);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [quotes.length, intervalMs]);

  if (!quotes.length) return null;
  const q = quotes[i];

  if (variant === "inline") {
    return (
      <div key={i} className="animate-quote mx-auto max-w-2xl">
        <p className="text-balance text-2xl md:text-3xl italic leading-snug text-foreground">
          “{q.text}”
          {q.author && (
            <span className="ml-2 not-italic font-mono text-xs uppercase tracking-widest text-foreground/70">
              — {q.author}
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card/40 p-8 md:p-10 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
        signal · daily quote
      </div>
      <blockquote key={i} className="animate-quote">
        <p className="text-balance text-xl md:text-2xl font-medium leading-snug text-foreground">
          “{q.text}”
        </p>
        {q.author && (
          <footer className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            — {q.author}
          </footer>
        )}
      </blockquote>
    </section>
  );
};