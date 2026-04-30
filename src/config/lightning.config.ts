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
  tagline: "a fast little hub for browser games & mini apps",
  version: "v1.0",
  maintenanceMode: false,

  footerLink: { label: "github", url: "https://github.com" },
  adminPassword: "lightning",

  nav: [
    { label: "home", to: "/" },
    { label: "about", to: "/about" },
    { label: "projects", to: "/projects" },
    { label: "contact", to: "/contact" },
    { label: "admin", to: "/admin" },
  ],

  games: [
    {
      id: "snake",
      name: "Snake",
      description: "Classic arcade. Eat. Grow. Don't bite yourself.",
      icon: "🐍",
      url: "#",
      tag: "arcade",
    },
    {
      id: "2048",
      name: "2048",
      description: "Slide tiles, merge numbers, hit the magic number.",
      icon: "🔢",
      url: "#",
      tag: "puzzle",
    },
    {
      id: "tetris",
      name: "Tetris",
      description: "Stack the falling blocks. Clear the lines. Repeat.",
      icon: "🟦",
      url: "#",
      tag: "arcade",
    },
    {
      id: "minesweeper",
      name: "Minesweeper",
      description: "Logic puzzle on a hidden grid. Don't click the bomb.",
      icon: "💣",
      url: "#",
      tag: "puzzle",
    },
    {
      id: "pong",
      name: "Pong",
      description: "The original. Two paddles, one ball, infinite vibes.",
      icon: "🏓",
      url: "#",
      tag: "arcade",
    },
    {
      id: "notes",
      name: "Quick Notes",
      description: "Tiny scratchpad that saves to local storage.",
      icon: "📝",
      url: "#",
      tag: "tool",
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