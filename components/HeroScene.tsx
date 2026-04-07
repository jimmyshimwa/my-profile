"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene Setup ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Color Palette ────────────────────────────────────────────
    const ACCENT = new THREE.Color("#c8f55a");
    const DIM    = new THREE.Color("#3a5010");

    // ── Node Positions on a Sphere ───────────────────────────────
    const NODE_COUNT = 180;
    const RADIUS     = 1.75;

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      // Fibonacci sphere distribution for even coverage
      const phi   = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      positions.push(
        new THREE.Vector3(
          RADIUS * Math.sin(phi) * Math.cos(theta),
          RADIUS * Math.sin(phi) * Math.sin(theta),
          RADIUS * Math.cos(phi)
        )
      );
    }

    // ── Node Dots ────────────────────────────────────────────────
    const dotGeo = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(NODE_COUNT * 3);
    const dotColors    = new Float32Array(NODE_COUNT * 3);

    positions.forEach((p, i) => {
      dotPositions[i * 3]     = p.x;
      dotPositions[i * 3 + 1] = p.y;
      dotPositions[i * 3 + 2] = p.z;
      dotColors[i * 3]     = ACCENT.r;
      dotColors[i * 3 + 1] = ACCENT.g;
      dotColors[i * 3 + 2] = ACCENT.b;
    });

    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute("color",    new THREE.BufferAttribute(dotColors,    3));

    const dotMat = new THREE.PointsMaterial({
      size:         0.035,
      vertexColors: true,
      transparent:  true,
      opacity:      0.9,
      sizeAttenuation: true,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    // ── Edges (connect nearby nodes) ─────────────────────────────
    const CONNECT_DIST = 0.85;
    const edgeVerts: number[] = [];
    const edgeColorVals: number[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (positions[i].distanceTo(positions[j]) < CONNECT_DIST) {
          edgeVerts.push(positions[i].x, positions[i].y, positions[i].z);
          edgeVerts.push(positions[j].x, positions[j].y, positions[j].z);
          // Vary edge opacity via color brightness
          const bright = 0.12 + Math.random() * 0.15;
          edgeColorVals.push(ACCENT.r * bright, ACCENT.g * bright, ACCENT.b * bright);
          edgeColorVals.push(ACCENT.r * bright, ACCENT.g * bright, ACCENT.b * bright);
        }
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edgeVerts), 3));
    edgeGeo.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(edgeColorVals), 3));

    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      opacity:      0.6,
    });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    scene.add(edges);

    // ── Outer Glow Ring ───────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(RADIUS * 1.08, 0.008, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color:       ACCENT,
      transparent: true,
      opacity:     0.12,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // ── Group for spring rotation ─────────────────────────────────
    const group = new THREE.Group();
    group.add(dots);
    group.add(edges);
    group.add(ring);
    scene.add(group);

    // ── Spring Physics State ──────────────────────────────────────
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let velX = 0;
    let velY = 0;

    const STIFFNESS = 0.045;
    const DAMPING   = 0.82;

    // ── Cursor Tracking ───────────────────────────────────────────
    const mouse = new THREE.Vector2(0, 0);

    const onMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1]
      mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;

      targetRotY = mouse.x * 0.5;
      targetRotX = mouse.y * 0.35;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Node Magnetic Displacement (CPU-side, per frame) ──────────
    // We'll track which nodes are perturbed
    const basePositions = positions.map(p => p.clone());
    const nodeVelocities = positions.map(() => new THREE.Vector3());
    const nodeCurrent    = positions.map(p => p.clone());

    // Raycaster for 3D cursor position on sphere surface
    const raycaster = new THREE.Raycaster();

    const updateMagneticNodes = () => {
      raycaster.setFromCamera(mouse, camera);

      const posAttr = dotGeo.attributes.position as THREE.BufferAttribute;
      const posEdge = edgeGeo.attributes.position as THREE.BufferAttribute;
      let edgeIdx = 0;

      for (let i = 0; i < NODE_COUNT; i++) {
        // Project node to world
        const worldPos = nodeCurrent[i].clone().applyEuler(group.rotation);

        // Distance from camera ray
        const ray    = raycaster.ray;
        const closest = ray.closestPointToPoint(worldPos, new THREE.Vector3());
        const dist   = worldPos.distanceTo(closest);

        const repelRadius = 0.55;
        if (dist < repelRadius) {
          const strength = (1 - dist / repelRadius) * 0.18;
          const dir = worldPos.sub(closest).normalize();
          nodeVelocities[i].addScaledVector(dir, strength);
        }

        // Spring back to base
        const spring = basePositions[i].clone().sub(nodeCurrent[i]);
        nodeVelocities[i].addScaledVector(spring, 0.18);
        nodeVelocities[i].multiplyScalar(0.75);
        nodeCurrent[i].add(nodeVelocities[i]);

        posAttr.setXYZ(i, nodeCurrent[i].x, nodeCurrent[i].y, nodeCurrent[i].z);
      }

      posAttr.needsUpdate = true;

      // Sync edge positions
      edgeIdx = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          if (basePositions[i].distanceTo(basePositions[j]) < CONNECT_DIST) {
            posEdge.setXYZ(edgeIdx,     nodeCurrent[i].x, nodeCurrent[i].y, nodeCurrent[i].z);
            posEdge.setXYZ(edgeIdx + 1, nodeCurrent[j].x, nodeCurrent[j].y, nodeCurrent[j].z);
            edgeIdx += 2;
          }
        }
      }
      posEdge.needsUpdate = true;
    };

    // ── Node Color Pulse ──────────────────────────────────────────
    const updateNodeColors = (time: number) => {
      const colAttr = dotGeo.attributes.color as THREE.BufferAttribute;
      for (let i = 0; i < NODE_COUNT; i++) {
        const wave = 0.6 + 0.4 * Math.sin(time * 0.8 + i * 0.25);
        colAttr.setXYZ(i, ACCENT.r * wave, ACCENT.g * wave, ACCENT.b * wave);
      }
      colAttr.needsUpdate = true;
    };

    // ── Animation Loop ────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow auto-rotation
      group.rotation.y += 0.0025;

      // Spring toward cursor
      const dX = targetRotX - currentRotX;
      const dY = targetRotY - currentRotY;
      velX = velX * DAMPING + dX * STIFFNESS;
      velY = velY * DAMPING + dY * STIFFNESS;
      currentRotX += velX;
      currentRotY += velY;

      // Apply delta on top of auto-rotation
      group.rotation.x = currentRotX;

      // Magnetic nodes & pulse
      updateMagneticNodes();
      updateNodeColors(t);

      // Ring shimmer
      ringMat.opacity = 0.08 + 0.06 * Math.sin(t * 1.2);

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position:      "absolute",
        top:           "-5%",
        right:         "-8%",
        width:         "clamp(340px, 50vw, 700px)",
        height:        "clamp(340px, 50vw, 700px)",
        pointerEvents: "none",
        zIndex:        0,
        // Subtle radial glow behind the sphere
        filter: "drop-shadow(0 0 60px rgba(200,245,90,0.08))",
      }}
    />
  );
}
