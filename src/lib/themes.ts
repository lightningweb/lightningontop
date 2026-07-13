export type ColorTheme = {
  id: string;
  label: string;
  from: string;
  to: string;
  hue: number;
  sat: number;
  light: number;
};

export const COLOR_THEMES: ColorTheme[] = [
  { id: "slate",  label: "Slate",  from: "#5b6472", to: "#232830", hue: 220, sat: 15, light: 60 },
  { id: "sunset", label: "Sunset", from: "#ff6a3d", to: "#a3103c", hue: 12,  sat: 90, light: 60 },
  { id: "sand",   label: "Sand",   from: "#e0c9a6", to: "#7b6448", hue: 35,  sat: 55, light: 60 },
  { id: "mint",   label: "Mint",   from: "#4bd6a4", to: "#0e6b56", hue: 160, sat: 65, light: 50 },
  { id: "indigo", label: "Indigo", from: "#7aa5ff", to: "#312e81", hue: 232, sat: 85, light: 65 },
  { id: "ivory",  label: "Ivory",  from: "#f3f0eb", to: "#c9c4bd", hue: 40,  sat: 30, light: 70 },
  { id: "amber",  label: "Amber",  from: "#ffb84a", to: "#b1560c", hue: 32,  sat: 95, light: 58 },
  { id: "sea",    label: "Sea",    from: "#3fc0d0", to: "#0b4b70", hue: 190, sat: 70, light: 55 },
  { id: "violet", label: "Violet", from: "#c47bff", to: "#4a1a86", hue: 275, sat: 75, light: 65 },
];

export const THEME_KEY = "thunder.theme.v1";

export function loadColorTheme(): string {
  try { return localStorage.getItem(THEME_KEY) || "slate"; } catch { return "slate"; }
}

export function saveColorTheme(id: string) {
  try { localStorage.setItem(THEME_KEY, id); } catch {}
  applyColorTheme(id);
  window.dispatchEvent(new Event("thunder-theme-change"));
}

export function applyColorTheme(id: string) {
  if (typeof document === "undefined") return;
  const t = COLOR_THEMES.find((x) => x.id === id) ?? COLOR_THEMES[0];
  const root = document.documentElement;
  const hsl = `${t.hue} ${t.sat}% ${t.light}%`;
  root.style.setProperty("--accent", hsl);
  root.style.setProperty("--ring", hsl);
  root.dataset.colorTheme = t.id;
}