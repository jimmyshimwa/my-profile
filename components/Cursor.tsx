"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`;
        dotRef.current.style.top = `${my}px`;
      }
    };

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${rx}px`;
        ringRef.current.style.top = `${ry}px`;
      }
      animId = requestAnimationFrame(animate);
    };

    const onMouseEnterLink = () => {
      dotRef.current?.classList.add("enlarged");
      ringRef.current?.classList.add("enlarged");
    };
    const onMouseLeaveLink = () => {
      dotRef.current?.classList.remove("enlarged");
      ringRef.current?.classList.remove("enlarged");
    };

    document.addEventListener("mousemove", onMouseMove);
    animId = requestAnimationFrame(animate);

    const links = document.querySelectorAll("a, button");
    links.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnterLink);
      el.addEventListener("mouseleave", onMouseLeaveLink);
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
      links.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterLink);
        el.removeEventListener("mouseleave", onMouseLeaveLink);
      });
    };
  }, []);

  return (
    <>
      <style>{`
        #js-cursor {
          position: fixed; width: 10px; height: 10px;
          background: #c8f55a; border-radius: 50%;
          pointer-events: none; z-index: 9999;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
          transition: width 0.25s, height 0.25s;
        }
        #js-cursor.enlarged { width: 24px; height: 24px; }
        #js-ring {
          position: fixed; width: 36px; height: 36px;
          border: 1px solid rgba(200,245,90,0.5); border-radius: 50%;
          pointer-events: none; z-index: 9998;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s, border-color 0.2s;
        }
        #js-ring.enlarged { width: 60px; height: 60px; border-color: rgba(200,245,90,0.25); }
      `}</style>
      <div id="js-cursor" ref={dotRef} />
      <div id="js-ring" ref={ringRef} />
    </>
  );
}
