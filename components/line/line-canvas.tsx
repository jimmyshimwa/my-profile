"use client";
/* eslint-disable react-hooks/immutability -- R3F mutates uniforms, materials
   and the camera inside the frame loop by design; none of it is React state. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Hat } from "@/lib/content/types";
import { lineState, onLayoutChange } from "@/lib/line-store";
import { HAT_ACCENT, PALETTE } from "@/lib/palette";
import { buildRoute } from "@/lib/route-path";
import type { Tier } from "@/lib/tier";
import { coreFragment, glowFragment, topoFragment, topoVertex, tubeVertex } from "./shaders";

type Props = { tier: Extract<Tier, "full" | "lite">; onReady?: () => void };

/** How each hat makes the Line behave. */
const HAT_BEHAVIOUR: Record<Hat, { sway: number; ticks: number; pulse: number; tension: number; type: "centripetal" | "catmullrom" }> = {
  founder: { sway: 1, ticks: 0, pulse: 0, tension: 0.5, type: "centripetal" },
  engineer: { sway: 0, ticks: 1, pulse: 0, tension: 0.08, type: "catmullrom" },
  pm: { sway: 0.25, ticks: 0, pulse: 1, tension: 0.5, type: "centripetal" },
};

export default function LineCanvas({ tier, onReady }: Props) {
  return (
    <Canvas
      // Palette hex values are sRGB and the shaders write them straight out:
      // no colour management (legacy), no output conversion (linear).
      legacy
      linear
      flat
      orthographic
      camera={{ position: [0, 0, 600], zoom: 1, near: 0.1, far: 2000 }}
      dpr={tier === "full" ? [1, 1.75] : 1}
      gl={{ antialias: tier === "full", alpha: false, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      <Topography tier={tier} />
      <Route tier={tier} />
    </Canvas>
  );
}

function useLayoutVersion() {
  const [v, setV] = useState(0);
  useEffect(() => onLayoutChange(() => setV(lineState.layoutVersion)), []);
  return v;
}

const tmpColor = new THREE.Color();
function lerpColor(target: THREE.Color, hex: string, k: number) {
  tmpColor.set(hex);
  target.lerp(tmpColor, k);
}

function Topography({ tier }: { tier: Props["tier"] }) {
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const material = useMemo(() => {
    const p = PALETTE[lineState.time];
    return new THREE.ShaderMaterial({
      vertexShader: topoVertex,
      fragmentShader: topoFragment,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uRes: { value: new THREE.Vector2() },
        uDpr: { value: 1 },
        uScroll: { value: 0 },
        uTime: { value: 0 },
        uBg: { value: new THREE.Color(p.bg) },
        uInk: { value: new THREE.Color(p.ink) },
        uLineAlpha: { value: p.contour },
        uShade: { value: tier === "full" ? p.shade : 0 },
        uSun: { value: new THREE.Vector2(...p.sun) },
        uOctaves: { value: tier === "full" ? 5 : 3 },
      },
    });
  }, [tier]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    const u = material.uniforms;
    const p = PALETTE[lineState.time];
    u.uRes!.value.set(size.width, size.height);
    u.uDpr!.value = dpr;
    u.uScroll!.value = window.scrollY;
    u.uTime!.value = state.clock.elapsedTime;
    lerpColor(u.uBg!.value, p.bg, 0.05);
    lerpColor(u.uInk!.value, p.ink, 0.05);
    u.uLineAlpha!.value += (p.contour - u.uLineAlpha!.value) * 0.05;
    if (tier === "full") u.uShade!.value += (p.shade - u.uShade!.value) * 0.05;
    (u.uSun!.value as THREE.Vector2).lerp(new THREE.Vector2(...p.sun), 0.03);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function Route({ tier }: { tier: Props["tier"] }) {
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  const layoutVersion = useLayoutVersion();
  const hat = lineState.hat;

  // Rebuild the route when layout, viewport or hat changes.
  const route = useMemo(() => {
    if (typeof window === "undefined") return null;
    const pts = buildRoute();
    if (pts.length < 2) return null;
    const b = HAT_BEHAVIOUR[lineState.hat];
    const W = size.width;
    const curve = new THREE.CatmullRomCurve3(
      pts.map(([x, y, z]) => new THREE.Vector3(x - W / 2, -y, z)),
      false,
      b.type,
      b.tension,
    );
    const length = curve.getLength();
    const segments = Math.min(
      tier === "full" ? 2400 : 1000,
      Math.max(200, Math.round(length / (tier === "full" ? 7 : 16))),
    );
    const geometry = new THREE.TubeGeometry(curve, segments, 1, tier === "full" ? 10 : 6, false);
    // Lookup table: page y for evenly spaced points, to map scroll to progress.
    const samples = 1600;
    const lut = curve.getSpacedPoints(samples - 1);
    return { geometry, length, lut, curve };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutVersion, size.width, size.height, tier, hat]);

  useEffect(() => () => route?.geometry.dispose(), [route]);

  const materials = useMemo(() => {
    const p = PALETTE[lineState.time];
    const shared = {
      uTime: { value: 0 },
      uHead: { value: 0 },
      uLength: { value: 1 },
      uVel: { value: 0 },
      uIdle: { value: 0 },
      uPointer: { value: new THREE.Vector2(-9999, -9999) },
      uPointerOn: { value: 0 },
      uSway: { value: 0 },
    };
    const core = new THREE.ShaderMaterial({
      vertexShader: tubeVertex,
      fragmentShader: coreFragment,
      uniforms: {
        ...shared,
        uRadius: { value: 2.4 },
        uColor: { value: new THREE.Color(p.line) },
        uGlow: { value: new THREE.Color(p.glow) },
        uAccent: { value: new THREE.Color(HAT_ACCENT[lineState.hat]) },
        uTicks: { value: 0 },
        uPulse: { value: 0 },
      },
    });
    const glow = new THREE.ShaderMaterial({
      vertexShader: tubeVertex,
      fragmentShader: glowFragment,
      transparent: true,
      depthWrite: false,
      blending: p.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: {
        ...shared,
        uRadius: { value: 15 },
        uGlow: { value: new THREE.Color(p.glow) },
        uStrength: { value: p.dark ? 0.55 : 0.32 },
      },
    });
    return { core, glow };
  }, []);

  useEffect(
    () => () => {
      materials.core.dispose();
      materials.glow.dispose();
    },
    [materials],
  );

  const progress = useRef(0);
  const lastIndex = useRef(0);

  useFrame((state, delta) => {
    const H = size.height;
    const W = size.width;
    const scroll = window.scrollY;
    camera.position.set(0, -(scroll + H / 2), 600);
    camera.updateMatrixWorld();

    if (!route) return;
    const now = performance.now();

    // Map the scroll position to how far along the route the head is.
    // Near the top the head runs further ahead, so the trailhead shows at once.
    const ahead = 0.58 + 0.3 * (1 - Math.min(1, scroll / H));
    const target = scroll + H * ahead;
    const { lut } = route;
    let idx = 0;
    for (let i = lut.length - 1; i >= 0; i--) {
      if (-lut[i]!.y <= target) {
        idx = i;
        break;
      }
    }
    // Before the visitor picks a hat the Line waits; then it draws itself in.
    const started = lineState.startedAt > 0;
    const intro = started ? Math.min(1, (now - lineState.startedAt) / 1400) : 0;
    const easedIntro = 1 - Math.pow(1 - intro, 3);
    const goal = (idx / (lut.length - 1)) * easedIntro;
    const k = 1 - Math.exp(-delta * 7);
    progress.current += (goal - progress.current) * k;
    lastIndex.current = idx;

    const vel = lineState.velocity;
    const lead = Math.max(0, Math.min(vel, 60)) * 5;
    const head = Math.min(1, progress.current + lead / route.length);
    lineState.progress = progress.current;

    // Where the head is on screen, for the Line's voice.
    const hp = route.curve.getPointAt(Math.min(1, Math.max(0, progress.current)));
    lineState.head.x = hp.x + W / 2;
    lineState.head.y = -hp.y - scroll;
    lineState.head.visible = started && progress.current > 0.002;

    const idleFor = now - lineState.lastScrollAt;
    const idle = THREE.MathUtils.smoothstep(idleFor, 2600, 3800);

    const b = HAT_BEHAVIOUR[lineState.hat];
    const p = PALETTE[lineState.time];
    const ptr = lineState.pointer;

    // Both materials share these uniform objects, so set them once.
    {
      const u = materials.core.uniforms;
      u.uTime!.value = state.clock.elapsedTime;
      u.uHead!.value = head;
      u.uLength!.value = route.length;
      const v = Math.max(-30, Math.min(30, vel));
      u.uVel!.value += (v - u.uVel!.value) * 0.15;
      u.uIdle!.value += (idle - u.uIdle!.value) * 0.05;
      (u.uPointer!.value as THREE.Vector2).set(ptr.x - W / 2, -(ptr.y + scroll));
      u.uPointerOn!.value += ((ptr.active ? 1 : 0) - u.uPointerOn!.value) * 0.1;
      u.uSway!.value += (b.sway - u.uSway!.value) * 0.05;
    }
    const cu = materials.core.uniforms;
    lerpColor(cu.uColor!.value, p.line, 0.05);
    lerpColor(cu.uGlow!.value, p.glow, 0.05);
    lerpColor(cu.uAccent!.value, HAT_ACCENT[lineState.hat], 0.08);
    cu.uTicks!.value += (b.ticks - cu.uTicks!.value) * 0.08;
    cu.uPulse!.value += (b.pulse - cu.uPulse!.value) * 0.08;
    const gu = materials.glow.uniforms;
    lerpColor(gu.uGlow!.value, p.glow, 0.05);
    gu.uStrength!.value += ((p.dark ? 0.55 : 0.32) - gu.uStrength!.value) * 0.05;
    const blending = p.dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    if (materials.glow.blending !== blending) {
      materials.glow.blending = blending;
      materials.glow.needsUpdate = true;
    }
  });

  if (!route) return null;
  return (
    <group>
      <mesh geometry={route.geometry} material={materials.glow} frustumCulled={false} renderOrder={1} />
      <mesh geometry={route.geometry} material={materials.core} frustumCulled={false} renderOrder={2} />
    </group>
  );
}
