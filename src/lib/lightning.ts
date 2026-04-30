import { config as baseConfig, STORAGE_KEY, type LightningConfig } from "@/config/lightning.config";

/** Read live config: base config from file + any admin overrides from localStorage. */
export function getLiveConfig(): LightningConfig {
  if (typeof window === "undefined") return baseConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseConfig;
    const overrides = JSON.parse(raw) as Partial<LightningConfig>;
    return { ...baseConfig, ...overrides };
  } catch {
    return baseConfig;
  }
}

export function saveOverrides(overrides: Partial<LightningConfig>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function clearOverrides() {
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