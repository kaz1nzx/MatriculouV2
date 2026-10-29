"use client";

import { useEffect, useRef, useState } from "react";
import { loadMotion, scheduleRefresh } from "./loadMotion";
import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ScrollPlugin } from "gsap/ScrollTrigger";
import { useCinema } from "./CinemaProvider";

type SceneSetup<T extends HTMLElement> = (
  gsap: typeof GSAP,
  scroll: typeof ScrollPlugin,
  element: T,
) => void | (() => void);

/** Load motion on demand and restore every scene when the user pauses effects. */
export function useScrollScene<T extends HTMLElement>(setup: SceneSetup<T>) {
  const ref = useRef<T>(null);
  const callback = useRef(setup);
  callback.current = setup;
  const { enabled, lite } = useCinema();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled || lite) {
      setReady(false);
      return;
    }
    let cancelled = false,
      frame = 0;
    let cleanup = () => {};
    loadMotion()
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled || !ref.current) return;
        gsap.registerPlugin(ScrollTrigger);
        setReady(true);
        frame = requestAnimationFrame(() => {
          if (cancelled || !ref.current) return;
          const context = gsap.context(
            () => callback.current(gsap, ScrollTrigger, ref.current!),
            ref,
          );
          cleanup = () => context.revert();
          scheduleRefresh(ScrollTrigger);
        });
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [enabled, lite]);

  return { ref, motion: enabled && !lite && ready };
}
