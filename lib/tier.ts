/**
 * Device tiering for the Line.
 * - full:   WebGL, high segment count, hillshaded topography, DPR up to 1.75
 * - lite:   WebGL, fewer segments, flat contours, DPR 1
 * - svg:    no WebGL (or data saver / very slow network): an SVG route
 * - static: prefers-reduced-motion: the whole route drawn as a still map
 */
export type Tier = "full" | "lite" | "svg" | "static";

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function detectTier(): Tier {
  if (typeof window === "undefined") return "static";
  // ?tier=full|lite|svg|static forces a tier, for testing on real devices.
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "full" || forced === "lite" || forced === "svg" || forced === "static") {
    return forced;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";

  const nav = navigator as NavigatorExtras;
  const conn = nav.connection;
  if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
    return "svg";
  }

  if (!hasWebGL()) return "svg";

  const memory = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (memory <= 2 || cores <= 4 || (coarse && memory <= 4) || conn?.effectiveType === "3g") {
    return "lite";
  }
  return "full";
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    // Software renderers make WebGL a slideshow; treat them as no WebGL.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software/i.test(renderer);
  } catch {
    return false;
  }
}
