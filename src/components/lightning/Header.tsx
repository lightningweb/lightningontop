import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, Home, Gamepad2, Boxes, Settings as SettingsIcon, ShieldCheck, Link as LinkIcon, User, LogOut, MessageCircle, Trophy, Target, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsBell } from "./NotificationsBell";
import { UserTag } from "./UserBadge";
import { levelForXp } from "@/lib/level";

type NavItem = { label: string; to: string };

function iconFor(item: NavItem) {
  const key = (item.label + " " + item.to).toLowerCase();
  if (key.includes("home") || item.to === "/") return Home;
  if (key.includes("game")) return Gamepad2;
  if (key.includes("app")) return Boxes;
  if (key.includes("quest")) return Target;
  if (key.includes("leader")) return Trophy;
  if (key.includes("friend")) return Users;
  if (key.includes("message") || key.includes("dm")) return MessageCircle;
  if (key.includes("setting")) return SettingsIcon;
  if (key.includes("admin")) return ShieldCheck;
  return LinkIcon;
}

export const Header = ({
  siteName,
  version,
  nav = [],
}: {
  siteName: string;
  version: string;
  nav?: NavItem[];
}) => {
  const { user, profile, signOut } = useAuth();
  const xp = profile?.xp ?? 0;
  const lvl = user ? levelForXp(xp) : 0;
  return (
  <header className="flex items-center justify-between gap-6">
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-secondary/60 text-primary transition-colors group-hover:border-primary/50">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"/></svg>
      </span>
      <span className="text-sm font-semibold tracking-tight text-primary">{siteName}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{version}</span>
    </Link>
    <div className="flex items-center gap-2">
      {user && <NotificationsBell />}
      {user ? (
        <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3">
          <User className="h-4 w-4 text-primary" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-foreground">
            {profile?.display_name || profile?.username || "you"}
          </span>
          <UserTag tag={profile?.tag} />
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
            lv {lvl}
          </span>
          <NavLink
            to="/messages"
            aria-label="messages"
            className="ml-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
          </NavLink>
          <button
            onClick={() => signOut()}
            aria-label="sign out"
            className="ml-1 text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Link
          to="/auth"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <User className="h-4 w-4" />
          sign in
        </Link>
      )}
      <div className="relative group">
      <button
        type="button"
        aria-label="open menu"
        className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Menu className="h-4 w-4" />
      </button>
      {/* Hover bridge so the menu doesn't close in the gap */}
      <div className="invisible absolute right-0 top-full z-40 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <nav className="min-w-[180px] rounded-xl border border-border bg-card/95 p-1.5 shadow-soft backdrop-blur">
          {nav.map((item) => {
            const Icon = iconFor(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-secondary/70 text-primary"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      </div>
    </div>
  </header>
);
};