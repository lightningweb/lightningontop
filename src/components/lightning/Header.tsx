import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

type NavItem = { label: string; to: string };

export const Header = ({
  siteName,
  version,
  nav = [],
}: {
  siteName: string;
  version: string;
  nav?: NavItem[];
}) => (
  <header className="flex items-center justify-between gap-6">
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-secondary/60 text-primary transition-colors group-hover:border-primary/50">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"/></svg>
      </span>
      <span className="text-sm font-semibold tracking-tight text-primary">{siteName}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{version}</span>
    </Link>
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
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-secondary/70 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  </header>
);