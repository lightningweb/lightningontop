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

/** All colors are HSL strings like "222 39% 6%" (no hsl() wrapper, no commas).
 *  These map 1:1 to the CSS variables defined in src/index.css. */
export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  /** Color of the bar at the top of the in-app game player. */
  gameFrameBar: string;
  /** Background behind the game iframe (letterboxing). */
  gameFrameBackground: string;
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
  /** Site-wide theme colors. Edit from /admin. */
  theme?: Partial<ThemeColors>;
};

export const DEFAULT_THEME: ThemeColors = {
  background: "222 39% 6%",
  foreground: "210 30% 96%",
  card: "222 30% 9%",
  cardForeground: "210 30% 96%",
  primary: "45 95% 58%",
  primaryForeground: "45 60% 8%",
  secondary: "222 24% 14%",
  secondaryForeground: "210 30% 96%",
  muted: "222 22% 12%",
  mutedForeground: "218 14% 60%",
  accent: "45 95% 58%",
  accentForeground: "45 60% 8%",
  destructive: "0 72% 55%",
  destructiveForeground: "210 40% 98%",
  border: "222 20% 16%",
  input: "222 20% 16%",
  ring: "45 95% 58%",
  gameFrameBar: "222 30% 9%",
  gameFrameBackground: "0 0% 0%",
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
    { label: "quests", to: "/quests" },
    { label: "leaderboard", to: "/leaderboard" },
    { label: "messages", to: "/messages" },
    { label: "friends", to: "/messages" },
    { label: "settings", to: "/settings" },
  ],

  games:
  [
    {
      id: "drive-mad",
      name: "Drive Mad",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/drive-mad/index.html",
      image: "https://lightningweb.github.io/games/thumbs/drive-mad.jpg",
      category: "game"
    },
    {
      id: "granny",
      name: "Granny",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/granny.html",
      image: "https://lightningweb.github.io/games/thumbs/90.png",
      category: "game"
    },
    {
      id: "geoguessr",
      name: "GeoGuessr",
      description: "",
      icon: "🎮",
      url: "https://www.worldguessr.com/",
      image: "https://lightningweb.github.io/games/thumbs/geog.jpg",
      category: "game",
      external: true
    },
    {
      id: "gta-vice-city",
      name: "GTA Vice City",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/vicecity/index.html",
      image: "https://lightningweb.github.io/games/thumbs/vicecity.jpg",
      category: "game"
    },
    {
      id: "idle-breakout",
      name: "Idle Breakout",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/idle-breakout/index.html",
      image: "https://lightningweb.github.io/games/thumbs/idle-breakout.jpg",
      category: "game"
    },
    {
      id: "level-devil",
      name: "Level Devil",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/level-devil/index.html",
      image: "https://lightningweb.github.io/games/thumbs/level-devil.jpg",
      category: "game"
    },
    {
      id: "retro-bowl",
      name: "Retro Bowl",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/retrobowl/index.html",
      image: "https://lightningweb.github.io/games/thumbs/retrobowl.jpg",
      category: "game"
    },
    {
      id: "retro-bowl-college",
      name: "Retro Bowl College",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/retrobowlcollege/index.html",
      image: "https://lightningweb.github.io/games/thumbs/retrobowlcollege.jpg",
      category: "game"
    },
    {
      id: "slope",
      name: "Slope",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/slope/index.html",
      image: "https://lightningweb.github.io/games/thumbs/slope.jpg",
      category: "game"
    },
    {
      id: "tanuki-sunset",
      name: "Tanuki Sunset",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/tanuki-sunset/index.html",
      image: "https://lightningweb.github.io/games/thumbs/tanuki-sunset.jpg",
      category: "game"
    },
    {
      id: "space-wave",
      name: "Space Wave",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/space-wave/index.html",
      image: "https://lightningweb.github.io/games/thumbs/space-wave.jpg",
      category: "game"
    },
    {
      id: "tunnel-rush",
      name: "Tunnel Rush",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/tunnel-rush/index.html",
      image: "https://lightningweb.github.io/games/thumbs/tunnel-rush.jpg",
      category: "game"
    },
    {
      id: "monkey-mart",
      name: "Monkey Mart",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/monkey-mart/index.html",
      image: "https://lightningweb.github.io/games/thumbs/monkey-mart.jpg",
      category: "game"
    },
    {
      id: "snow-rider",
      name: "Snow Rider 3D",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/snow-rider/index.html",
      image: "https://lightningweb.github.io/games/thumbs/snow-rider.jpg",
      category: "game"
    },
    {
      id: "tag",
      name: "TAG",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/tag/index.html",
      image: "https://lightningweb.github.io/games/thumbs/tag.jpg",
      category: "game"
    },
    {
      id: "polytrack",
      name: "Polytrack",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/polytrack/index.html",
      image: "https://lightningweb.github.io/games/thumbs/polytrack.jpg",
      category: "game"
    },
    {
      id: "eggy-car",
      name: "Eggy Car",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/eggy-car/index.html",
      image: "https://lightningweb.github.io/games/thumbs/eggy-car.jpg",
      category: "game"
    },
    {
      id: "geometry-dash",
      name: "Geometry Dash",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/geometrydash/index.html",
      image: "https://lightningweb.github.io/games/thumbs/geometry-dash.jpg",
      category: "game"
    },
    {
      id: "cluster-rush",
      name: "Cluster Rush",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/cluster-rush/index.html",
      image: "https://lightningweb.github.io/games/thumbs/cluster-rush.jpg",
      category: "game"
    },
    {
      id: "stacktris",
      name: "Stacktris",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/stacktris/index.html",
      image: "https://lightningweb.github.io/games/thumbs/stacktris.jpg",
      category: "game"
    },
    {
      id: "drift-boss",
      name: "Drift Boss",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/drift-boss/index.html",
      image: "https://lightningweb.github.io/games/thumbs/drift-boss.jpg",
      category: "game"
    },
    {
      id: "iron-lung",
      name: "Iron Lung",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/iron-lung.html",
      image: "https://lightningweb.github.io/games/thumbs/iron-lung.jpg",
      category: "game"
    },
    {
      id: "tomb-of-the-mask",
      name: "Tomb of the Mask",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/tomb_of_the_mask.html",
      image: "https://lightningweb.github.io/games/thumbs/totm.jpg",
      category: "game"
    },
    {
      id: "gun-spin",
      name: "Gun Spin",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/gun_spin.html",
      image: "https://lightningweb.github.io/games/thumbs/gunspin.jpg",
      category: "game"
    },
    {
      id: "crazy-cattle-3d",
      name: "Crazy Cattle 3D",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/crazy_cattle_3d.html",
      image: "https://lightningweb.github.io/games/thumbs/cc3d.png",
      category: "game"
    },
    {
      id: "bitlife",
      name: "Bitlife",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/bitlife.html",
      image: "https://lightningweb.github.io/games/thumbs/bitlife.jpg",
      category: "game"
    },
    {
      id: "hollow-knight",
      name: "Hollow Knight",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/hollow-knight.html",
      image: "https://lightningweb.github.io/games/thumbs/hollowknight.jpg",
      category: "game",
      tag: "new"
    },
    {
      id: "fnf",
      name: "Friday Night Funkin'",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/fnf.html",
      image: "https://lightningweb.github.io/games/thumbs/fnf.png",
      category: "game",
      tag: "new"
    },
    {
      id: "balatro",
      name: "Balatro",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/balatro.html",
      image: "https://lightningweb.github.io/games/thumbs/balatro.jpg",
      category: "game"
    },
    {
      id: "gladihoppers",
      name: "Gladihoppers",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/gladdihoppers.html",
      image: "https://lightningweb.github.io/games/thumbs/gladihoppers.jpg",
      category: "game"
    },
    {
      id: "ultrakill",
      name: "ULTRAKILL",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/ultrakill/index.html",
      image: "https://lightningweb.github.io/games/thumbs/ultrakill.jpg",
      category: "game",
      tag: "new"
    },
    {
      id: "minecraft",
      name: "Minecraft",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/wasm-gc%201.20.html",
      image: "https://lightningweb.github.io/games/thumbs/minecraft.png",
      category: "game",
      tag: "new"
    },
    {
      id: "roblox",
      name: "Roblox",
      description: "",
      icon: "🎮",
      url: "https://nowgg.fun/apps/a/19900/b.html",
      image: "https://lightningweb.github.io/games/thumbs/IMG_0376.png",
      category: "game",
      tag: "new",
      external: true
    },
    {
      id: "tomodachi-collection",
      name: "Tomodachi Collection",
      description: "",
      icon: "🎮",
      url: "https://lightningweb.github.io/games/files/non-folder/tomodachi-collection.html",
      image: "https://lightningweb.github.io/games/thumbs/tomodachi-collection.webp",
      category: "game",
      tag: "new"
    }
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
