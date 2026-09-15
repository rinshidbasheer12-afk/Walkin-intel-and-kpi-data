import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AccentIntensity = "soft" | "balanced" | "vivid";
export type UiDensity = "compact" | "comfortable" | "airy";
export type AppearanceMode = "light" | "dim" | "automatic";
export type AppearanceSettings = { accentIntensity: AccentIntensity; density: UiDensity; mode: AppearanceMode };

const STORAGE_KEY = "cycleintel-appearance-v1";
const DEFAULTS: AppearanceSettings = { accentIntensity: "balanced", density: "comfortable", mode: "automatic" };

type AppearanceContextValue = AppearanceSettings & {
  hydrated: boolean;
  setAccentIntensity: (value: AccentIntensity) => void;
  setDensity: (value: UiDensity) => void;
  setMode: (value: AppearanceMode) => void;
  resetAppearance: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value) {
        try { setSettings({ ...DEFAULTS, ...JSON.parse(value) }); } catch { setSettings(DEFAULTS); }
      }
      setHydrated(true);
    }).catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => undefined);
  }, [hydrated, settings]);

  const value = useMemo(() => ({
    ...settings,
    hydrated,
    setAccentIntensity: (accentIntensity: AccentIntensity) => setSettings((prev) => ({ ...prev, accentIntensity })),
    setDensity: (density: UiDensity) => setSettings((prev) => ({ ...prev, density })),
    setMode: (mode: AppearanceMode) => setSettings((prev) => ({ ...prev, mode })),
    resetAppearance: () => setSettings(DEFAULTS),
  }), [hydrated, settings]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be used inside AppearanceProvider");
  return context;
}

export const densityTokens = {
  compact: { cardPadding: 14, sectionGap: 8, controlPadding: 7, chartGap: 9 },
  comfortable: { cardPadding: 18, sectionGap: 12, controlPadding: 9, chartGap: 13 },
  airy: { cardPadding: 22, sectionGap: 16, controlPadding: 11, chartGap: 17 },
} as const;

export const appearanceLabels = {
  mode: { light: "Light", dim: "Dim", automatic: "Automatic" },
  accentIntensity: { soft: "Soft", balanced: "Balanced", vivid: "Vivid" },
  density: { compact: "Compact", comfortable: "Comfortable", airy: "Airy" },
} as const;

export function accentTone(hex: string, intensity: AccentIntensity) {
  const amount = intensity === "soft" ? 0.58 : intensity === "balanced" ? 0.28 : 0;
  if (!amount || !/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const channel = (offset: number) => Math.round(parseInt(hex.slice(offset, offset + 2), 16) + (255 - parseInt(hex.slice(offset, offset + 2), 16)) * amount).toString(16).padStart(2, "0");
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}
