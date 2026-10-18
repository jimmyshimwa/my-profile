/*
 * A flat ribbon (no glow, no lighting), after Lusion's line: the strip is
 * revealed along its length, edges are antialiased with fwidth, and a thin
 * edge in the page colour makes crossings read as one ribbon passing over
 * another. Later parts of the ribbon sit in front (z follows the ratio).
 */

export const ribbonVertex = /* glsl */ `
  attribute vec2 aCenter;
  attribute vec2 aNormal;
  attribute float aSide;
  attribute float aRatio;

  uniform float uWidth;
  uniform float uLength;
  uniform float uTime;
  uniform float uVel;
  uniform vec2 uPointer;     // in this line's local space
  uniform float uPointerOn;

  varying float vRatio;
  varying float vSide;
  varying float vAlong;

  void main() {
    vec2 c = aCenter;

    // Bends away from the pointer or finger.
    vec2 d = c - uPointer;
    float l = length(d);
    c += (d / max(l, 1.0)) * smoothstep(170.0, 0.0, l) * 38.0 * uPointerOn;

    // A slight travelling wave while scrolling, so it moves with you.
    float along = aRatio * uLength;
    c += aNormal * sin(along * 0.009 - uTime * 2.4) * clamp(uVel / 40.0, -1.0, 1.0) * 7.0;

    vec2 p = c + aNormal * aSide * uWidth * 0.5;
    vRatio = aRatio;
    vSide = aSide;
    vAlong = along;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, aRatio * 10.0, 1.0);
  }
`;

export const ribbonFragment = /* glsl */ `
  uniform float uShow;
  uniform float uWidth;
  uniform float uBorder;     // px of page colour along each edge
  uniform vec3 uInk;
  uniform vec3 uBg;
  uniform vec2 uPattern;     // ratio range drawn with imigongo chevrons
  uniform float uPatternOn;

  varying float vRatio;
  varying float vSide;
  varying float vAlong;

  void main() {
    if (vRatio > uShow) discard;
    float s = abs(vSide);
    float fw = fwidth(s);
    float alpha = 1.0 - smoothstep(1.0 - fw * 1.5, 1.0, s);

    float halfW = uWidth * 0.5;
    float inner = 1.0 - uBorder / halfW;
    float edge = smoothstep(inner - fw, inner, s);

    vec3 col = uInk;
    // Imigongo: chevrons pointing along the ribbon, black and white.
    float inPattern = step(uPattern.x, vRatio) * step(vRatio, uPattern.y) * uPatternOn;
    if (inPattern > 0.5) {
      float k = fract((vAlong + s * halfW * 1.6) / (uWidth * 1.3));
      float stripe = smoothstep(0.48, 0.52, k) * (1.0 - smoothstep(0.98, 1.0, k));
      col = mix(uInk, uBg, stripe * step(s, inner - 0.12));
    }
    col = mix(col, uBg, edge);
    gl_FragColor = vec4(col, alpha);
  }
`;

/** The round tip, an antialiased disc. */
export const capFragment = /* glsl */ `
  uniform vec3 uInk;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = 1.0 - smoothstep(1.0 - fwidth(d) * 1.5, 1.0, d);
    gl_FragColor = vec4(uInk, a);
  }
`;

export const capVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
