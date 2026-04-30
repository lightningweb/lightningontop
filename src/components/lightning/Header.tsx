import { Link } from "react-router-dom";

export const Header = ({ siteName, version }: { siteName: string; version: string }) => (
  <header className="flex items-center justify-between">
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-secondary/60 text-primary transition-colors group-hover:border-primary/50">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"/></svg>
      </span>
      <span className="text-sm font-semibold tracking-tight">{siteName}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{version}</span>
    </Link>
    <nav className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest">
      <Link to="/" className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">home</Link>
      <Link to="/admin" className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">admin</Link>
    </nav>
  </header>
);