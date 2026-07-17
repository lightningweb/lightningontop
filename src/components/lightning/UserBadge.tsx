import { BoltIcon } from "@/components/lightning/BoltIcon";

const LIGHTNING_ID = "11111111-1111-1111-1111-111111111111";

/** Renders a name + optional tag chip. Use this everywhere a user is displayed. */
export const UserTag = ({ tag, size = "sm" }: { tag?: string | null; size?: "xs" | "sm" }) => {
  if (!tag) return null;
  const cls =
    size === "xs"
      ? "rounded bg-primary/20 px-1 py-0.5 font-mono text-[8px] uppercase tracking-widest text-primary"
      : "rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary";
  return <span className={cls}>{tag}</span>;
};

export const UserName = ({
  id,
  username,
  displayName,
  tag,
  showAt = false,
  className = "",
}: {
  id?: string;
  username?: string;
  displayName?: string | null;
  tag?: string | null;
  showAt?: boolean;
  className?: string;
}) => {
  const name = displayName || username || "user";
  const isLightning = id === LIGHTNING_ID;
  const effectiveTag = tag || (isLightning ? "STAFF" : null);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {isLightning && <BoltIcon className="h-3 w-3 text-primary" />}
      <span className="truncate">{name}</span>
      <UserTag tag={effectiveTag} />
      {showAt && username && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          @{username}
        </span>
      )}
    </span>
  );
};