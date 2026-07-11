import type { Game } from "@/config/lightning.config";

/** iOS-style rounded square tile matching the Canva design.
 *  By default the name is shown only on hover. Pass `label` to show it
 *  as a persistent overlay (e.g. the leading "Flappy Bird" favourites card). */
export const AppTile = ({
  game,
  size = "md",
  onOpen,
  label,
  showNameOnHover = true,
}: {
  game: Game;
  size?: "sm" | "md" | "lg";
  onOpen?: (g: Game) => void;
  label?: string;
  showNameOnHover?: boolean;
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
      {!label && showNameOnHover && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <span className="pointer-events-none absolute inset-x-0 bottom-1.5 px-2 text-center text-[11px] font-semibold leading-tight text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {game.name}
          </span>
        </>
      )}
    </button>
  );
};