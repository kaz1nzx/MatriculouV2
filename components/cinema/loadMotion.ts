"use client";

import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

// Every GSAP effect on the site is scroll-driven, so the library is fetched on the first
// interaction (scroll, touch, pointer, key), or after the page settles if none comes.
// First paint, LCP and input readiness never pay for animation code.
let motion: Promise<
  [typeof import("gsap"), typeof import("gsap/ScrollTrigger")]
> | null = null;
const intents = [
  "scroll",
  "wheel",
  "touchstart",
  "pointerdown",
  "keydown",
] as const;

export function loadMotion() {
  if (!motion) {
    motion = new Promise<void>((resolve) => {
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        intents.forEach((type) => removeEventListener(type, go));
        resolve();
      };
      intents.forEach((type) =>
        addEventListener(type, go, { once: true, passive: true }),
      );
      // A visitor who only watches still gets the scenes: load once the page has settled.
      const idle = () =>
        "requestIdleCallback" in window
          ? requestIdleCallback(go, { timeout: 2000 })
          : go();
      const fallback = () => setTimeout(idle, 3000);
      if (document.readyState === "complete") fallback();
      else addEventListener("load", fallback, { once: true });
      // Slow images can hold `load` back indefinitely; never wait longer than this.
      setTimeout(idle, 6000);
    }).then(() => Promise.all([import("gsap"), import("gsap/ScrollTrigger")]));
  }
  return motion;
}

// Scenes mount independently; one shared refresh replaces a full-page layout pass per scene.
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
export function scheduleRefresh(ScrollTrigger: typeof ScrollTriggerType) {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
}
