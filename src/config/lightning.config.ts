/**
 * ⚡ LIGHTNING — edit this file to customize your hub.
 * Add/remove games, change site info, toggle maintenance mode, edit quotes.
 * No build step required for content changes — just edit & save.
 */

export type Game = {
  id: string;
  name: string;
  description: string;
  /** Emoji or short text used as the card icon. */
  icon: string;
  /** Where the card links. Use any URL — relative (/games/snake/) or external. */
  url: string;
  /** Optional tag shown as a small chip. */
  tag?: string;
  /** Open in a new tab. Defaults to true for external URLs. */
  external?: boolean;
  /** Optional background color for the tile. Accepts any CSS color (hex, hsl, etc).
   *  If omitted, a color is auto-picked from the palette below. */
  color?: string;
  /** Optional background image URL for the tile. Overrides color when set. */
  image?: string;
  /** "game" or "app". Controls which page the card shows up on. */
  category?: "game" | "app";
};

export type LightningConfig = {
  siteName: string;
  tagline: string;
  version: string;
  /** Flip to true to show the maintenance page instead of the homepage. */
  maintenanceMode: boolean;
  /** Optional: link shown in the footer. */
  footerLink?: { label: string; url: string };
  /** Admin password — used only for the local admin panel.
   *  This is NOT real security; it's a soft gate for personal use. */
  adminPassword: string;
  games: Game[];
  quotes: { text: string; author?: string }[];
  /** Top nav links. Add/remove freely. */
  nav: { label: string; to: string }[];
};

export const config: LightningConfig = {
  siteName: "lightning",
  tagline: "",
  version: "",
  maintenanceMode: false,

  footerLink: { label: "github", url: "https://github.com" },
  adminPassword: "lightning",

  nav: [
    { label: "home", to: "/" },
    { label: "games", to: "/games" },
    { label: "apps", to: "/apps" },
    { label: "settings", to: "/settings" },
  ],

  games: [
    {
      id: "snake",
      name: "Snake",
      description: "Classic arcade. Eat. Grow. Don't bite yourself.",
      icon: "🐍",
      url: "#",
      tag: "arcade",
      color: "#86efac",
      image: "https://images.unsplash.com/photo-1606503153255-59d8b8b1cf69?w=600",
      category: "game",
    },
    {
      id: "2048",
      name: "2048",
      description: "Slide tiles, merge numbers, hit the magic number.",
      icon: "🔢",
      url: "#",
      tag: "puzzle",
      color: "#fca5a5",
      image: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600",
      category: "game",
    },
    {
      id: "tetris",
      name: "Tetris",
      description: "Stack the falling blocks. Clear the lines. Repeat.",
      icon: "🟦",
      url: "#",
      tag: "arcade",
      color: "#93c5fd",
      image: "https://images.unsplash.com/photo-1640955014216-75201056c829?w=600",
      category: "game",
    },
    {
      id: "minesweeper",
      name: "Minesweeper",
      description: "Logic puzzle on a hidden grid. Don't click the bomb.",
      icon: "💣",
      url: "#",
      tag: "puzzle",
      color: "#f9a8d4",
      image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600",
      category: "game",
    },
    {
      id: "pong",
      name: "Pong",
      description: "The original. Two paddles, one ball, infinite vibes.",
      icon: "🏓",
      url: "#",
      tag: "arcade",
      color: "#fcd34d",
      image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600",
      category: "game",
    },
    {
      id: "notes",
      name: "Quick Notes",
      description: "Tiny scratchpad that saves to local storage.",
      icon: "📝",
      url: "#",
      tag: "tool",
      color: "#c4b5fd",
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600",
      category: "app",
    },
  ],

  quotes: [
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
    { text: "Stay hungry, stay foolish.", author: "Stewart Brand" },
    { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
    { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Move fast and don't break things you can't fix.", author: "—" },
  ],
};

/** localStorage key — admin overrides persist here so you can tweak from /admin. */
export const STORAGE_KEY = "lightning.config.overrides.v1";