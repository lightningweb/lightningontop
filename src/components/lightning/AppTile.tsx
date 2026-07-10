import type { Game } from "@/config/lightning.config";

/** iOS-style rounded square tile matching the Canva design. */
export const AppTile = ({
  game,
  size = "md",
  onOpen,
  label,
}: {
  game: Game;
  size?: "sm" | "md" | "lg";
  onOpen?: (g: Game) => void;
  /** Overlay label ("Flappy Bird") like the Canva favourites row. */
  label?: string;
}) => {
  const dims =
    size === "lg"
      ? "h-28 w-28 rounded-[26px]"
      : size === "sm"
      ? "h-16 w-16 rounded-[18px]"
      : "h-24 w-24 rounded-[22px]";
  return (
    <button
      type="button"
      onClick={() => onOpen?.(game)}
      title={game.name}
      aria-label={game.name}
      className={`group relative shrink-0 overflow-hidden ${dims} bg-secondary shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:scale-[1.03]`}
      style={{
        backgroundImage: game.image ? `url(${game.image})` : undefined,
        backgroundColor: !game.image ? game.color ?? undefined : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {label && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute inset-x-0 bottom-1.5 px-2 text-center text-[11px] font-semibold leading-tight text-white drop-shadow">
            {label}
          </span>
        </>
      )}
    </button>
  );
};