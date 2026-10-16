import type { Hat, TimeOfDay } from "./content/types";

/**
 * Shared, mutable state read every frame by the Line and the scroll code.
 * Kept outside React on purpose: per-frame values must not re-render.
 */
export const lineState = {
  scroll: 0,
  /** Signed scroll velocity in px per frame, smoothed. */
  velocity: 0,
  lastScrollAt: 0,
  pointer: { x: -9999, y: -9999, active: false },
  /** Where the head of the Line is on screen, in CSS px. */
  head: { x: 0, y: 0, visible: false },
  /** 0–1: how far down the route the Line has travelled. */
  progress: 0,
  /** Set when the visitor picks a hat; the Line draws itself in from here. */
  startedAt: 0,
  hat: "founder" as Hat,
  time: "day" as TimeOfDay,
  /** Bumped when the page layout changes and the route must be rebuilt. */
  layoutVersion: 0,
};

type Listener = () => void;
const layoutListeners = new Set<Listener>();

export function onLayoutChange(fn: Listener) {
  layoutListeners.add(fn);
  return () => {
    layoutListeners.delete(fn);
  };
}

export function notifyLayoutChange() {
  lineState.layoutVersion++;
  for (const fn of layoutListeners) fn();
}
