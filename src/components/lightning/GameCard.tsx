import type { Game } from "@/config/lightning.config";

const PALETTE = [
  "#fca5a5", "#fcd34d", "#86efac", "#93c5fd",
  "#f9a8d4", "#c4b5fd", "#fdba74", "#5eead4",
];

export const GameCard = ({
  game,
  index,
  onOpen,
}: {
  game: Game;
  index: number;
  onOpen?: (game: Game) => void;
}) => {
  const bgColor = game.color ?? PALETTE[index % PALETTE.length];
  const hasImage = !!game.image;
  return (
    <button
      type="button"
      onClick={() => onOpen?.(game)}
      className="group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl text-left shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow animate-fade-in-up"
      style={{
        animationDelay: `${index * 40}ms`,
        backgroundColor: bgColor,
        backgroundImage: hasImage ? `url(${game.image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label={game.name}
    >
      {hasImage && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}
      <div className="relative flex items-end justify-between gap-2 p-4">
        <h3
          className={
            hasImage
              ? "text-xl font-bold tracking-tight text-white drop-shadow-md"
              : "text-xl font-bold tracking-tight text-black/85"
          }
        >
          {game.name}
        </h3>
        {game.tag && (
          <span
            className={
              hasImage
                ? "rounded-full bg-black/50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white/90 backdrop-blur"
                : "rounded-full bg-black/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-black/70"
            }
          >
            {game.tag}
          </span>
        )}
      </div>
    </button>
  );
};