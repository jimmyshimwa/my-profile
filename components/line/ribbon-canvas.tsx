"use client";
/* eslint-disable react-hooks/immutability -- R3F mutates uniforms and meshes
   inside the frame loop by design; none of it is React state. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { lineState, onLayoutChange } from "@/lib/line-store";
import { buildLines, ribbonWidth, showRatio, type LineSpec } from "@/lib/lines";
import { THEME_COLORS } from "@/lib/theme";
import type { Tier } from "@/lib/tier";
import { capFragment, capVertex, ribbonFragment, ribbonVertex } from "./ribbon-shaders";

type Props = { tier: Extract<Tier, "full" | "lite">; onReady?: () => void };

export default function RibbonCanvas({ tier, onReady }: Props) {
  return (
    <Canvas
      // Hex colours are sRGB and the shaders write them straight out.
      legacy
      linear
      flat
      orthographic
      camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
      dpr={tier === "full" ? [1, 1.5] : 1}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      <Lines tier={tier} />
    </Canvas>
  );
}

type Built = {
  spec: LineSpec;
  /** Section top in page px, cached at build time. */
  pageTop: number;
  pageBottom: number;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  cap: THREE.ShaderMaterial;
  /** Centre points (local space) and their ratios, for placing the tip. */
  centers: Float32Array;
  length: number;
  show: number;
};

function buildRibbon(spec: LineSpec, W: number, tier: Props["tier"]) {
  const curve = new THREE.CatmullRomCurve3(
    spec.points.map(([x, y]) => new THREE.Vector3(x - W / 2, -y, 0)),
    false,
    "centripetal",
  );
  const length = curve.getLength();
  const n = Math.min(tier === "full" ? 1400 : 600, Math.max(60, Math.round(length / (tier === "full" ? 3 : 6))));
  const pts = curve.getSpacedPoints(n);

  const centers = new Float32Array((n + 1) * 2);
  const aCenter = new Float32Array((n + 1) * 4);
  const aNormal = new Float32Array((n + 1) * 4);
  const aSide = new Float32Array((n + 1) * 2);
  const aRatio = new Float32Array((n + 1) * 2);
  const index: number[] = [];

  for (let i = 0; i <= n; i++) {
    const p = pts[i]!;
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(n, i + 1)]!;
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx;
    centers[i * 2] = p.x;
    centers[i * 2 + 1] = p.y;
    for (let k = 0; k < 2; k++) {
      const v = i * 2 + k;
      aCenter[v * 2] = p.x;
      aCenter[v * 2 + 1] = p.y;
      aNormal[v * 2] = nx;
      aNormal[v * 2 + 1] = ny;
      aSide[v] = k === 0 ? -1 : 1;
      aRatio[v] = i / n;
    }
    if (i < n) {
      const v = i * 2;
      index.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  // "position" is required by three; the shader builds positions itself.
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array((n + 1) * 6), 3));
  geometry.setAttribute("aCenter", new THREE.BufferAttribute(aCenter, 2));
  geometry.setAttribute("aNormal", new THREE.BufferAttribute(aNormal, 2));
  geometry.setAttribute("aSide", new THREE.BufferAttribute(aSide, 1));
  geometry.setAttribute("aRatio", new THREE.BufferAttribute(aRatio, 1));
  geometry.setIndex(index);
  return { geometry, centers, length };
}

function Lines({ tier }: { tier: Props["tier"] }) {
  const size = useThree((s) => s.size);
  const [version, setVersion] = useState(0);
  useEffect(() => onLayoutChange(() => setVersion((v) => v + 1)), []);

  const built = useMemo<Built[]>(() => {
    if (typeof window === "undefined") return [];
    const W = size.width;
    const colors = THEME_COLORS[lineState.theme];
    return buildLines().map((spec) => {
      const el = document.querySelector<HTMLElement>(`[data-line="${spec.id}"]`)!;
      const r = el.getBoundingClientRect();
      const { geometry, centers, length } = buildRibbon(spec, W, tier);
      const width = ribbonWidth(W);
      const material = new THREE.ShaderMaterial({
        vertexShader: ribbonVertex,
        fragmentShader: ribbonFragment,
        transparent: true,
        depthTest: true,
        depthWrite: true,
        // The strip's winding flips with direction; draw both faces.
        side: THREE.DoubleSide,
        uniforms: {
          uShow: { value: 0 },
          uWidth: { value: width },
          uBorder: { value: Math.max(1.5, width * 0.16) },
          uLength: { value: length },
          uTime: { value: 0 },
          uVel: { value: 0 },
          uPointer: { value: new THREE.Vector2(-9999, -9999) },
          uPointerOn: { value: 0 },
          uInk: { value: new THREE.Color(colors.ink) },
          uBg: { value: new THREE.Color(colors.bg) },
          uPattern: { value: new THREE.Vector2(...(spec.pattern ?? [2, 2])) },
          uPatternOn: { value: spec.pattern ? 1 : 0 },
        },
      });
      const cap = new THREE.ShaderMaterial({
        vertexShader: capVertex,
        fragmentShader: capFragment,
        transparent: true,
        depthTest: false,
        side: THREE.DoubleSide,
        uniforms: { uInk: { value: new THREE.Color(colors.ink) } },
      });
      return {
        spec,
        pageTop: r.top + window.scrollY,
        pageBottom: r.bottom + window.scrollY,
        geometry,
        material,
        cap,
        centers,
        length,
        show: 0,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, size.width, size.height, tier]);

  // Carry the drawn amount across rebuilds so a resize doesn't redraw from zero.
  const lastShow = useRef(new Map<string, number>());
  useEffect(() => {
    const store = lastShow.current;
    for (const b of built) b.show = store.get(b.spec.id) ?? 0;
    return () => {
      for (const b of built) {
        store.set(b.spec.id, b.show);
        b.geometry.dispose();
        b.material.dispose();
        b.cap.dispose();
      }
    };
  }, [built]);

  const groups = useRef<(THREE.Group | null)[]>([]);
  const caps = useRef<(THREE.Mesh | null)[]>([]);
  const ink = useMemo(() => new THREE.Color(), []);
  const bg = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const W = size.width;
    const H = size.height;
    const scroll = window.scrollY;
    const k = 1 - Math.exp(-delta * 5.5);
    const colors = THEME_COLORS[lineState.theme];
    ink.set(colors.ink);
    bg.set(colors.bg);
    const ptr = lineState.pointer;

    built.forEach((b, i) => {
      const group = groups.current[i];
      const cap = caps.current[i];
      if (!group || !cap) return;
      const top = b.pageTop - scroll;
      const bottom = b.pageBottom - scroll;
      const onScreen = top < H * 1.25 && bottom > -H * 0.35;
      group.visible = onScreen;
      const target = showRatio(top, H, b.spec.f0, b.spec.f1);
      // Eased toward the scroll position: it follows you, a beat behind.
      b.show += (target - b.show) * k;
      if (!onScreen) return;

      group.position.set(0, H / 2 - top, 0);
      const u = b.material.uniforms;
      u.uShow!.value = b.show;
      u.uTime!.value = state.clock.elapsedTime;
      u.uVel!.value += (Math.max(-40, Math.min(40, lineState.velocity)) - u.uVel!.value) * 0.12;
      const px = ptr.x - W / 2;
      const py = H / 2 - ptr.y - group.position.y;
      (u.uPointer!.value as THREE.Vector2).set(px, py);
      u.uPointerOn!.value += ((ptr.active ? 1 : 0) - u.uPointerOn!.value) * 0.08;
      (u.uInk!.value as THREE.Color).lerp(ink, 0.12);
      (u.uBg!.value as THREE.Color).lerp(bg, 0.12);
      (b.cap.uniforms.uInk!.value as THREE.Color).lerp(ink, 0.12);

      // The round tip sits on the end of what is drawn, pushed by the
      // pointer exactly like the ribbon is.
      const n = b.centers.length / 2 - 1;
      const f = Math.min(n, Math.max(0, b.show * n));
      const i0 = Math.floor(f);
      const i1 = Math.min(n, i0 + 1);
      const t = f - i0;
      let cx = b.centers[i0 * 2]! * (1 - t) + b.centers[i1 * 2]! * t;
      let cy = b.centers[i0 * 2 + 1]! * (1 - t) + b.centers[i1 * 2 + 1]! * t;
      const dx = cx - px;
      const dy = cy - py;
      const dl = Math.max(1, Math.hypot(dx, dy));
      const push = (1 - THREE.MathUtils.smoothstep(dl, 0, 170)) * 38 * u.uPointerOn!.value;
      cx += (dx / dl) * push;
      cy += (dy / dl) * push;
      const d = u.uWidth!.value - u.uBorder!.value * 2;
      cap.position.set(cx, cy, 11);
      cap.scale.set(d, d, 1);
      cap.visible = b.show > 0.002;
    });
  });

  return (
    <>
      {built.map((b, i) => (
        <group key={`${b.spec.id}-${version}`} ref={(g) => void (groups.current[i] = g)}>
          <mesh geometry={b.geometry} material={b.material} frustumCulled={false} />
          <mesh ref={(m) => void (caps.current[i] = m)} material={b.cap} frustumCulled={false} renderOrder={2}>
            <planeGeometry args={[1, 1]} />
          </mesh>
        </group>
      ))}
    </>
  );
}
