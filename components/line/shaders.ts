/*
 * The Line is one TubeGeometry built with radius 1, drawn twice: a solid
 * core and a soft glow sleeve. The vertex shader recovers the centreline
 * (position - normal) so it can bend, swell and react without rebuilding.
 */

export const tubeVertex = /* glsl */ `
  uniform float uTime;
  uniform float uHead;      // 0..1, reveal position along the route
  uniform float uLength;    // route length in px
  uniform float uRadius;    // px
  uniform float uVel;       // px per frame, smoothed
  uniform float uIdle;      // 0..1, how long the visitor has been still
  uniform vec2  uPointer;   // world px
  uniform float uPointerOn;
  uniform float uSway;      // Founder: slow, confident sway

  varying float vU;
  varying float vBehind;    // px behind the head (negative = not drawn yet)
  varying float vFacing;

  void main() {
    vec3 n = normal;
    vec3 center = position - n;
    float u = uv.x;
    float behind = (uHead - u) * uLength;
    float near = exp(-max(behind, 0.0) / 180.0);

    // Personality ----------------------------------------------------------
    center.x += sin(uTime * 0.55 + center.y * 0.0035) * uSway * 7.0;
    // Curious when still: the head looks around.
    center.x += sin(uTime * 6.0 + u * uLength * 0.045) * uIdle * near * 11.0;
    center.y += cos(uTime * 4.3 + u * uLength * 0.03) * uIdle * near * 7.0;
    // Stretches with speed: the head trails behind the scroll direction.
    center.y += uVel * near * 1.4;

    // Pointer and touch push the Line aside.
    vec2 d = center.xy - uPointer;
    float pd = length(d);
    center.xy += (d / max(pd, 1.0)) * smoothstep(150.0, 0.0, pd) * 30.0 * uPointerOn;

    // Thickness: swells at the head, thins when fast, tapers at the start.
    float speed = clamp(abs(uVel) / 45.0, 0.0, 1.0);
    float r = uRadius * (1.0 + 0.7 * exp(-max(behind, 0.0) / 36.0)) * mix(1.0, 0.6, speed);
    r *= smoothstep(0.0, 0.004, u);

    vec3 pos = center + n * r;
    vU = u;
    vBehind = behind;
    vFacing = abs((normalMatrix * n).z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform float uLength;
  uniform vec3 uColor;
  uniform vec3 uGlow;
  uniform vec3 uAccent;
  uniform float uTicks;   // Engineer: measured, precise
  uniform float uPulse;   // PM: rhythmic, organised

  varying float vU;
  varying float vBehind;
  varying float vFacing;

  void main() {
    if (vBehind < 0.0) discard;
    float lit = pow(vFacing, 5.0);
    vec3 col = mix(uColor, mix(uGlow, vec3(1.0), 0.55), lit * 0.75);
    col += uGlow * exp(-vBehind / 60.0) * 0.6;

    float px = vU * uLength;
    float tick = step(0.82, fract(px / 26.0)) * uTicks;
    col = mix(col, uAccent, tick * 0.85);

    float pulse = smoothstep(0.9, 1.0, fract(px / 240.0 - uTime * 0.7)) * uPulse;
    col = mix(col, uAccent, pulse * 0.9);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const glowFragment = /* glsl */ `
  uniform vec3 uGlow;
  uniform float uStrength;
  varying float vBehind;
  varying float vFacing;

  void main() {
    if (vBehind < 0.0) discard;
    float a = pow(vFacing, 2.4) * uStrength;
    a *= 1.0 + exp(-vBehind / 90.0) * 1.4;
    gl_FragColor = vec4(uGlow, a);
  }
`;

/* Topography: the thousand hills as contour lines, drawn in screen space. */
export const topoVertex = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const topoFragment = /* glsl */ `
  uniform vec2 uRes;        // CSS px
  uniform float uDpr;
  uniform float uScroll;
  uniform float uTime;
  uniform vec3 uBg;
  uniform vec3 uInk;
  uniform float uLineAlpha;
  uniform float uShade;     // hillshade strength, 0 on lite tier
  uniform vec2 uSun;        // light direction, from the Kigali time
  uniform float uOctaves;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float hills(vec2 p) {
    float h = 0.0, a = 0.55;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      if (float(i) >= uOctaves) break;
      h += a * noise(p);
      p = rot * p * 2.03;
      a *= 0.47;
    }
    return h;
  }

  void main() {
    vec2 px = gl_FragCoord.xy / uDpr;
    px.y = uRes.y - px.y;
    // The map scrolls slower than the page: it sits further away.
    vec2 p = (px + vec2(0.0, uScroll * 0.42)) / 430.0;
    p += vec2(uTime * 0.004, 0.0);
    float h = hills(p);

    float lv = h * 13.0;
    float fw = fwidth(lv);
    float d = abs(fract(lv - 0.5) - 0.5) / max(fw, 1e-4);
    float line = 1.0 - min(d, 1.0);
    // Every fifth contour is an index line, slightly heavier.
    float idx = step(abs(mod(floor(lv + 0.5), 5.0)), 0.5);
    line *= mix(0.75, 1.35, idx);

    vec3 col = uBg;
    if (uShade > 0.0) {
      float e = 1.5 / 430.0;
      float hx = hills(p + vec2(e, 0.0)) - h;
      float hy = hills(p + vec2(0.0, e)) - h;
      vec3 nrm = normalize(vec3(-hx * 160.0, -hy * 160.0, 1.0));
      float shade = dot(nrm, normalize(vec3(uSun, 0.9))) - 0.7;
      col += shade * uShade;
    }
    col = mix(col, uInk, line * uLineAlpha);
    gl_FragColor = vec4(col, 1.0);
  }
`;
