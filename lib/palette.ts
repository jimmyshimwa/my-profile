import type { Hat, TimeOfDay } from "./content/types";

/** Mirrors the CSS tokens in app/globals.css, for the WebGL scene. */
export const PALETTE: Record<
  TimeOfDay,
  { bg: string; ink: string; line: string; glow: string; contour: number; shade: number; sun: [number, number]; dark: boolean }
> = {
  dawn: { bg: "#dce3ec", ink: "#0f1830", line: "#2f5bff", glow: "#86a6ff", contour: 0.12, shade: 0.05, sun: [-0.9, 0.2], dark: false },
  day: { bg: "#eef2f4", ink: "#0b1424", line: "#1f4fff", glow: "#6f97ff", contour: 0.1, shade: 0.04, sun: [0.1, 0.9], dark: false },
  dusk: { bg: "#1c1730", ink: "#f1ecf6", line: "#5a8cff", glow: "#a9c2ff", contour: 0.1, shade: 0.06, sun: [0.9, 0.15], dark: true },
  night: { bg: "#070b1c", ink: "#e7ecf7", line: "#4d7dff", glow: "#8db4ff", contour: 0.09, shade: 0.03, sun: [-0.3, 0.6], dark: true },
};

export const HAT_ACCENT: Record<Hat, string> = {
  founder: "#e8a33d",
  engineer: "#2fc5b5",
  pm: "#e2668a",
};
