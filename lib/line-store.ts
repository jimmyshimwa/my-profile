import type { Theme } from "./theme";

/**
 * Shared, mutable state read every frame by the line and the scroll code.
 * Kept outside React on purpose: per-frame values must not re-render.
 */
export const lineState = {
  /** Signed scroll velocity in px per frame, smoothed. */
  velocity: 0,
  pointer: { x: -9999, y: -9999, active: false },
  theme: "light" as Theme,
};

type Listener = () => void;
const layoutListeners = new Set<Listener>();

/** Subscribe to layout changes (resize, fonts, hat switch). */
export function onLayoutChange(fn: Listener) {
  layoutListeners.add(fn);
  return () => {
    layoutListeners.delete(fn);
  };
}

export function notifyLayoutChange() {
  for (const fn of layoutListeners) fn();
}
