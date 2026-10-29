"use client";
import { useEffect, useRef } from "react";
import { useCinema } from "./CinemaProvider";

export default function FilmAtmosphere() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { enabled, lite } = useCinema();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !enabled || lite) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let width = 0,
      height = 0,
      raf = 0,
      inView = true,
      running = false,
      previous = 0;
    const particles = Array.from({ length: 28 }, (_, i) => ({
      x: ((i * 73 + 13) % 101) / 101,
      y: ((i * 37 + 21) % 103) / 103,
      r: 0.6 + (i % 3) * 0.45,
      speed: 0.002 + (i % 4) * 0.001,
      phase: i * 1.7,
    }));
    const resize = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    resize.observe(canvas);
    const frame = (time: number) => {
      if (!running) return;
      const delta = Math.min((time - previous) / 1000, 0.05);
      previous = time;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.y -= delta * particle.speed;
        if (particle.y < -0.02) particle.y = 1.02;
        const x =
          particle.x * width + Math.sin(time * 0.00014 + particle.phase) * 15;
        context.beginPath();
        context.arc(x, particle.y * height, particle.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(235,225,185,${0.12 + Math.sin(time * 0.0004 + particle.phase) * 0.08})`;
        context.fill();
      }
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const next = inView && !document.hidden;
      if (running === next) return;
      running = next;
      cancelAnimationFrame(raf);
      if (running) {
        previous = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      context.clearRect(0, 0, width, height);
    };
  }, [enabled, lite]);
  return (
    <>
      <div className="filmGrain" aria-hidden="true" />
      <div className="filmLightLeak" aria-hidden="true" />
      <canvas ref={ref} className="filmDust" aria-hidden="true" />
    </>
  );
}
