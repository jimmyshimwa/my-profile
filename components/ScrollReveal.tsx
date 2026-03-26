"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    // Scroll reveal
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));

    // Infinite scroll loop
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const atBottom = scrollTop + winHeight >= docHeight - 2;
      const atTop = scrollTop <= 2;

      if (atBottom) {
        // Jump silently to top
        window.scrollTo({ top: 1, behavior: "instant" });
      }

      if (atTop && scrollTop === 0) {
        // Jump silently to bottom when at very top (for reverse loop if needed)
        // Leave this empty — top is the natural start
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}