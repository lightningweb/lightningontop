import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    <nav className="flex items-center gap-0.5 font-mono text-[11px] uppercase tracking-widest overflow-x-auto">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-1.5 transition-colors whitespace-nowrap",
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
  </header>
);