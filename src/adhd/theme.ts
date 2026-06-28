import { AppTheme, ThemeMode } from "./types";

export function resolveThemeMode(
  mode: ThemeMode,
  systemMode: "light" | "dark" | "unspecified" | null | undefined,
): "light" | "dark" {
  if (mode !== "system") {
    return mode;
  }

  return systemMode === "dark" ? "dark" : "light";
}

export function createAppTheme(
  mode: "light" | "dark",
  lowStimMode: boolean,
  reduceMotion: boolean,
): AppTheme {
  const light = {
    background: lowStimMode ? "#f5eff1" : "#f0e7eb",
    backgroundAlt: lowStimMode ? "#ece3e8" : "#e6d8e0",
    surface: "#faf5f7",
    surfaceMuted: lowStimMode ? "#f3eaee" : "#efe3e9",
    text: "#241a20",
    textMuted: "#756772",
    border: lowStimMode ? "#dccfd6" : "#d5c2cc",
    accent: lowStimMode ? "#9b7487" : "#b37b95",
    accentSoft: lowStimMode ? "#efe4e9" : "#f2dde6",
    success: "#6e8c78",
    caution: "#7d90af",
    warning: "#bf9a72",
    danger: "#bf808e",
    batteryPlenty: "#879f8b",
    batterySteady: "#8da0bf",
    batteryCare: "#cfb084",
    batteryCaution: "#d49597",
    batteryRecover: "#b08fb7",
    shadow: lowStimMode ? "rgba(38, 24, 32, 0.08)" : "rgba(38, 24, 32, 0.14)",
  };

  const dark = {
    background: lowStimMode ? "#131018" : "#110d16",
    backgroundAlt: lowStimMode ? "#1c1723" : "#1a1421",
    surface: "#1b1522",
    surfaceMuted: "#251c2d",
    text: "#f6edf2",
    textMuted: "#b7a7b2",
    border: "#3a2f41",
    accent: "#d5a0b7",
    accentSoft: "#342737",
    success: "#90ad97",
    caution: "#9eafd6",
    warning: "#d7ae82",
    danger: "#d79aa8",
    batteryPlenty: "#9fc4a3",
    batterySteady: "#a6b9e5",
    batteryCare: "#e1bf8a",
    batteryCaution: "#dfa2a4",
    batteryRecover: "#c2a0c9",
    shadow: "rgba(0, 0, 0, 0.42)",
  };

  const colors = mode === "dark" ? dark : light;

  return {
    isDark: mode === "dark",
    colors,
    spacing: {
      xxs: 4,
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    radius: {
      sm: 10,
      md: 16,
      lg: 22,
      xl: 28,
      pill: 999,
    },
    typeScale: {
      caption: 12,
      body: 15,
      bodyStrong: 16,
      section: 19,
      title: 30,
      hero: 48,
    },
    motion: {
      quick: reduceMotion ? 0 : 140,
      normal: reduceMotion ? 0 : 240,
    },
  };
}
