export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

/** Line and page colours per theme, mirrored from app/globals.css for WebGL. */
export const THEME_COLORS: Record<Theme, { bg: string; ink: string }> = {
  light: { bg: "#f0f1f4", ink: "#0b0b0f" },
  dark: { bg: "#0c0d10", ink: "#eeeff3" },
};

/**
 * Inline script for <head>: applies the saved theme (light by default)
 * before first paint, and marks that JavaScript runs.
 */
export const themeScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("${THEME_KEY}");d.dataset.theme=t==="dark"?"dark":"light"}catch(e){d.dataset.theme="light"}})();`;
