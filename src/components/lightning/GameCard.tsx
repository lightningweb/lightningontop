import type { Game } from "@/config/lightning.config";

const PALETTE = [
  "#fca5a5", "#fcd34d", "#86efac", "#93c5fd",
  "#f9a8d4", "#c4b5fd", "#fdba74", "#5eead4",
];

export const GameCard = ({ game, index }: { game: Game; index: number }) => {
  const isExternal = game.external ?? /^https?:\/\//.test(game.url);
  const bgColor = game.color ?? PALETTE[index % PALETTE.length];
  const hasImage = !!game.image;
  return (
    <a
      href={game.url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
      className="group relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow animate-fade-in-up"
      style={{
        animationDelay: `${index * 40}ms`,
        backgroundColor: bgColor,
        backgroundImage: hasImage ? `url(${game.image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-label={game.name}
    >
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />}
      <h3
        className={
          hasImage
            ? "relative text-2xl font-bold tracking-tight text-white drop-shadow-md"
            : "relative text-2xl font-bold tracking-tight text-black/85"
        }
      >
        {game.name}
      </h3>
      {game.tag && (
        <span
          className={
            hasImage
              ? "relative self-start rounded-full bg-black/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/90 backdrop-blur"
              : "relative self-start rounded-full bg-black/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-black/70"
          }
        >
          {game.tag}
        </span>
      )}
    </a>
  );
};