"use client";
import { useEffect, useRef, useState } from "react";
import { useCinema } from "./CinemaProvider";

export function useFilmCarousel(count: number) {
  const { enabled } = useCinema();
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [focused, setFocused] = useState(false),
    [visible, setVisible] = useState(true),
    [hidden, setHidden] = useState(false);
  const root = useRef<HTMLElement>(null),
    bar = useRef<HTMLSpanElement>(null),
    elapsed = useRef(0);
  const running = enabled && !paused && !focused && visible && !hidden;
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    elapsed.current = 0;
    if (bar.current) bar.current.style.transform = "scaleX(0)";
  }, [index]);
  useEffect(() => {
    if (!running) return;
    let raf = 0,
      previous = performance.now();
    const tick = (now: number) => {
      elapsed.current += Math.min(now - previous, 100);
      previous = now;
      if (bar.current)
        bar.current.style.transform = `scaleX(${elapsed.current / 6000})`;
      if (elapsed.current >= 6000) {
        elapsed.current = 0;
        setIndex((current) => (current + 1) % count);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, count]);
  const goTo = (next: number) => {
    elapsed.current = 0;
    if (bar.current) bar.current.style.transform = "scaleX(0)";
    setIndex((next + count) % count);
  };
  return { index, paused, setPaused, setFocused, goTo, root, bar, running };
}
