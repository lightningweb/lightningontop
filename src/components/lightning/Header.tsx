import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, Home, Gamepad2, Boxes, Settings as SettingsIcon, ShieldCheck, Link as LinkIcon, User, LogOut, MessageCircle, Trophy, Target, Users, Wrench } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsBell } from "./NotificationsBell";
import { levelForXp } from "@/lib/level";
import { useEffect, useState } from "react";

type NavItem = { label: string; to: string };

function iconFor(item: NavItem) {
  const key = (item.label + " " + item.to).toLowerCase();
  if (key.includes("home") || item.to === "/") return Home;
  if (key.includes("game")) return Gamepad2;
  if (key.includes("app")) return Boxes;
  if (key.includes("tool")) return Wrench;
  if (key.includes("quest")) return Target;
  if (key.includes("leader")) return Trophy;
  if (key.includes("friend")) return Users;
  if (key.includes("message") || key.includes("dm")) return MessageCircle;
  if (key.includes("setting")) return SettingsIcon;
  if (key.includes("admin")) return ShieldCheck;
  return LinkIcon;
}

const AVATAR_KEY = "thunder.avatar.v1";
export function loadAvatar(): string {
  try { return localStorage.getItem(AVATAR_KEY) || "⚡"; } catch { return "⚡"; }
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
  const [avatar, setAvatar] = useState<string>("⚡");
  useEffect(() => {
    setAvatar(loadAvatar());
    const onStorage = () => setAvatar(loadAvatar());
    window.addEventListener("storage", onStorage);
    window.addEventListener("thunder-avatar-change", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("thunder-avatar-change", onStorage);
    };
  }, []);
  // Deduplicate nav (config may have duplicate "friends" -> /messages).
  const seen = new Set<string>();
  const primaryNav = nav.filter((n) => {
    if (seen.has(n.to)) return false;
    seen.add(n.to);
    return ["/", "/games", "/apps", "/tools", "/quests", "/leaderboard", "/messages", "/friends", "/settings"].includes(n.to);
  });
  return (
  <header className="flex items-center justify-between gap-6">
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center text-foreground transition-transform group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"/></svg>
      </span>
      <span className="hidden sm:inline text-sm font-bold tracking-tight text-foreground">{siteName}</span>
      {version && (
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{version}</span>
      )}
    </Link>
    <nav className="hidden md:flex items-center gap-1 rounded-full bg-secondary/40 p-1 backdrop-blur max-w-[62vw] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {primaryNav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-foreground/80 hover:text-foreground"
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="flex items-center gap-2">
      {user && <NotificationsBell />}
      {user ? (
        <div className="group relative">
          <Link
            to="/settings"
            aria-label="profile"
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-border bg-secondary/80 text-lg leading-none shadow-soft transition-transform hover:-translate-y-0.5"
          >
            {avatar.startsWith("http") ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{avatar}</span>
            )}
          </Link>
          <div className="invisible absolute right-0 top-full z-40 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <div className="min-w-[220px] rounded-xl border border-border bg-card/95 p-3 shadow-soft backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-secondary text-base">
                  {avatar.startsWith("http") ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : avatar}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{profile?.display_name || profile?.username || "you"}</div>
                  <div className="truncate text-[11px] text-muted-foreground">@{profile?.username}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-md bg-secondary/60 px-2 py-1.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Level</div>
                  <div className="text-sm font-bold text-foreground">{lvl}</div>
                </div>
                <div className="rounded-md bg-secondary/60 px-2 py-1.5">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</div>
                  <div className="text-sm font-bold text-foreground">{xp}</div>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                <Link to="/quests" className="rounded-md px-2 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground">Quests →</Link>
                <Link to="/messages" className="rounded-md px-2 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground">Messages →</Link>
                <Link to="/settings" className="rounded-md px-2 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary/60 hover:text-foreground">Settings →</Link>
                <button onClick={() => signOut()} className="mt-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[12px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
          </div>
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
      <div className="relative group md:hidden">
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