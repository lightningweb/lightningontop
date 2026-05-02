import { config as baseConfig, DEFAULT_THEME, STORAGE_KEY, type LightningConfig, type ThemeColors } from "@/config/lightning.config";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "lightning.config.cache.v2";

/** Synchronous read. Returns the freshest cached config (cloud-loaded if available),
 *  falling back to the bundled file. Pages render with this immediately. */
export function getLiveConfig(): LightningConfig {
  if (typeof window === "undefined") return baseConfig;
  try {
    const raw = localStorage.getItem(CACHE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseConfig;
    const overrides = JSON.parse(raw) as Partial<LightningConfig>;
    return { ...baseConfig, ...overrides };
  } catch {
    return baseConfig;
  }
}

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  gameFrameBar: "--game-frame-bar",
  gameFrameBackground: "--game-frame-bg",
};

export function resolveTheme(cfg: LightningConfig): ThemeColors {
  return { ...DEFAULT_THEME, ...(cfg.theme ?? {}) };
}

/** Write the resolved theme into CSS variables on :root. */
export function applyTheme(cfg: LightningConfig) {
  if (typeof document === "undefined") return;
  const theme = resolveTheme(cfg);
  const root = document.documentElement;
  (Object.keys(CSS_VAR_MAP) as Array<keyof ThemeColors>).forEach((k) => {
    root.style.setProperty(CSS_VAR_MAP[k], theme[k]);
  });
}

/** Fetch the latest config from the cloud and update the local cache.
 *  Returns true if the cached value changed (caller may want to reload). */
export async function refreshConfigFromCloud(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("data")
      .eq("id", "main")
      .maybeSingle();
    if (error || !data?.data) return false;
    const next = JSON.stringify(data.data);
    const prev = localStorage.getItem(CACHE_KEY);
    localStorage.setItem(CACHE_KEY, next);
    return prev !== next;
  } catch {
    return false;
  }
}

/** Save the full config to the cloud via the admin edge function. */
export async function saveConfigToCloud(
  password: string,
  data: Partial<LightningConfig>
): Promise<{ ok: boolean; error?: string }> {
  const { data: res, error } = await supabase.functions.invoke("save-config", {
    body: { password, data },
  });
  if (error) return { ok: false, error: error.message };
  if ((res as { error?: string })?.error) return { ok: false, error: (res as { error: string }).error };
  // refresh cache
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  return { ok: true };
}

/** Verify the admin password against the server. */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("verify-admin", {
    body: { password },
  });
  if (error) return false;
  return !!(data as { ok?: boolean })?.ok;
}

export function clearOverrides() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

const ADMIN_AUTH_KEY = "lightning.admin.auth.v1";
export function isAdminAuthed() {
  return typeof window !== "undefined" && sessionStorage.getItem(ADMIN_AUTH_KEY) === "1";
}
export function setAdminAuthed(v: boolean) {
  if (v) sessionStorage.setItem(ADMIN_AUTH_KEY, "1");
  else sessionStorage.removeItem(ADMIN_AUTH_KEY);
}