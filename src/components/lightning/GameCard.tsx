import type { Game } from "@/config/lightning.config";

export const GameCard = ({ game, index }: { game: Game; index: number }) => {
  const isExternal = game.external ?? /^https?:\/\//.test(game.url);
  return (
    <a
      href={game.url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow animate-fade-in-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-secondary/60 text-3xl transition-transform group-hover:scale-105">
          {game.icon}
        </div>
        {game.tag && (
          <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {game.tag}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{game.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{game.description}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          /{game.id}
        </span>
        <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">→</span>
      </div>
    </a>
  );
};